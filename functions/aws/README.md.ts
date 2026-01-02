# AWS Lambda & Geofencing Setup Guide

## Overview
This guide will help you set up AWS Lambda functions and Amazon Location Service for automatic toll detection.

## Prerequisites
- AWS Account with administrative access
- AWS CLI installed and configured
- DynamoDB tables already created (QuickSilver-*)

## Step 1: Amazon Location Service Setup

### 1.1 Create Location Tracker
```bash
aws location create-tracker \
  --tracker-name QuickSilver-Tracker \
  --position-filtering TimeBased \
  --pricing-plan RequestBasedUsage
```

### 1.2 Create Geofence Collection
```bash
aws location create-geofence-collection \
  --collection-name QuickSilver-TollGeofences \
  --pricing-plan RequestBasedUsage
```

### 1.3 Create Geofences
Run the Base44 function `createGeofences` with:
```json
{
  "collectionName": "QuickSilver-TollGeofences"
}
```

Or use AWS CLI:
```bash
aws location put-geofence \
  --collection-name QuickSilver-TollGeofences \
  --geofence-id golden-gate-bridge \
  --geometry '{
    "Circle": {
      "Center": [-122.4783, 37.8199],
      "Radius": 500
    }
  }'
```

### 1.4 Link Tracker to Geofence Collection
```bash
aws location associate-tracker-consumer \
  --tracker-name QuickSilver-Tracker \
  --consumer-arn arn:aws:geo:REGION:ACCOUNT_ID:geofence-collection/QuickSilver-TollGeofences
```

## Step 2: Create IAM Role for Lambda

### 2.1 Create Trust Policy (trust-policy.json)
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

### 2.2 Create Role
```bash
aws iam create-role \
  --role-name QuickSilver-Lambda-Role \
  --assume-role-policy-document file://trust-policy.json
```

### 2.3 Attach Policies
```bash
# Basic Lambda execution
aws iam attach-role-policy \
  --role-name QuickSilver-Lambda-Role \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole

# DynamoDB access
aws iam attach-role-policy \
  --role-name QuickSilver-Lambda-Role \
  --policy-arn arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess

# SNS access
aws iam attach-role-policy \
  --role-name QuickSilver-Lambda-Role \
  --policy-arn arn:aws:iam::aws:policy/AmazonSNSFullAccess

# SES access
aws iam attach-role-policy \
  --role-name QuickSilver-Lambda-Role \
  --policy-arn arn:aws:iam::aws:policy/AmazonSESFullAccess
```

## Step 3: Deploy Lambda Functions

### 3.1 Process Toll Crossing Lambda
```bash
# Package function
cd functions/aws
zip -r lambdaProcessTollCrossing.zip lambdaProcessTollCrossing.js node_modules/

# Create Lambda function
aws lambda create-function \
  --function-name QuickSilver-ProcessTollCrossing \
  --runtime nodejs18.x \
  --role arn:aws:iam::ACCOUNT_ID:role/QuickSilver-Lambda-Role \
  --handler lambdaProcessTollCrossing.handler \
  --zip-file fileb://lambdaProcessTollCrossing.zip \
  --environment Variables="{
    AWS_REGION=us-east-1,
    SNS_TOPIC_ARN=arn:aws:sns:REGION:ACCOUNT_ID:QuickSilver-Notifications
  }" \
  --timeout 30 \
  --memory-size 256
```

### 3.2 Process Payment Lambda
```bash
# Package function
zip -r lambdaProcessPayment.zip lambdaProcessPayment.js node_modules/

# Create Lambda function
aws lambda create-function \
  --function-name QuickSilver-ProcessPayment \
  --runtime nodejs18.x \
  --role arn:aws:iam::ACCOUNT_ID:role/QuickSilver-Lambda-Role \
  --handler lambdaProcessPayment.handler \
  --zip-file fileb://lambdaProcessPayment.zip \
  --environment Variables="{
    AWS_REGION=us-east-1,
    SES_FROM_EMAIL=noreply@quicksilver.com,
    STRIPE_SECRET_KEY=sk_test_...
  }" \
  --timeout 30 \
  --memory-size 256
```

## Step 4: Set Up EventBridge Rule

### 4.1 Create Rule
```bash
aws events put-rule \
  --name QuickSilver-GeofenceEnter \
  --event-pattern '{
    "source": ["aws.geo"],
    "detail-type": ["Location Geofence Event"],
    "detail": {
      "EventType": ["ENTER"]
    }
  }' \
  --state ENABLED
```

### 4.2 Add Lambda as Target
```bash
aws events put-targets \
  --rule QuickSilver-GeofenceEnter \
  --targets "Id"="1","Arn"="arn:aws:lambda:REGION:ACCOUNT_ID:function:QuickSilver-ProcessTollCrossing"
```

### 4.3 Grant EventBridge Permission
```bash
aws lambda add-permission \
  --function-name QuickSilver-ProcessTollCrossing \
  --statement-id EventBridgeInvoke \
  --action lambda:InvokeFunction \
  --principal events.amazonaws.com \
  --source-arn arn:aws:events:REGION:ACCOUNT_ID:rule/QuickSilver-GeofenceEnter
```

## Step 5: Set Up SNS Topic (Optional)

```bash
# Create topic
aws sns create-topic --name QuickSilver-Notifications

# Subscribe endpoints (SMS, email, etc.)
aws sns subscribe \
  --topic-arn arn:aws:sns:REGION:ACCOUNT_ID:QuickSilver-Notifications \
  --protocol email \
  --notification-endpoint user@example.com
```

## Step 6: Configure Location Tracking in App

Update your Base44 app to send location updates:

```javascript
// In AutoDetect page or background service
const updateLocation = async (latitude, longitude) => {
  await fetch('https://tracking.geo.REGION.amazonaws.com/tracking/v0/trackers/QuickSilver-Tracker/devices/USER_ID/positions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Amz-Date': new Date().toISOString(),
      // Add AWS Signature V4 authentication
    },
    body: JSON.stringify({
      Position: [longitude, latitude],
      SampleTime: new Date().toISOString(),
    }),
  });
};
```

## Testing

### Test Geofence Detection
```bash
# Simulate location update
aws location batch-update-device-position \
  --tracker-name QuickSilver-Tracker \
  --updates DeviceId=test-user,Position=[-122.4783,37.8199],SampleTime="2024-01-01T12:00:00Z"
```

### Test Lambda Directly
```bash
aws lambda invoke \
  --function-name QuickSilver-ProcessTollCrossing \
  --payload file://test-event.json \
  response.json
```

## Monitoring

- **CloudWatch Logs**: Check Lambda execution logs
- **DynamoDB Console**: Verify trip records are created
- **Location Service Console**: Monitor geofence events

## Cost Optimization

- Use Location Service time-based position filtering
- Set SNS topic to only essential notifications
- Use DynamoDB on-demand pricing for variable traffic

## Troubleshooting

1. **Geofence not triggering**: Check tracker-consumer association
2. **Lambda not executing**: Verify EventBridge permissions
3. **DynamoDB errors**: Ensure IAM role has correct permissions
4. **No notifications**: Check SNS topic subscriptions

## Next Steps

- Add Stripe payment processing
- Configure push notifications via SNS
- Set up CloudWatch alarms for errors
- Implement auto-pay logic