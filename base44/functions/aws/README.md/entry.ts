# QuickSilver AWS Integration Setup Guide

This guide will help you set up all the required AWS services for the QuickSilver automated toll detection system.

## Required AWS Services

1. **DynamoDB** - Store vehicle, payment, trip, and notification data
2. **AWS Location Service** - Geofencing for toll detection
3. **Amazon SNS** - Push notifications
4. **Amazon SES** - Email notifications
5. **AWS Lambda** - Event processing

## Prerequisites

- AWS Account
- AWS CLI installed (optional but recommended)
- AWS Access Key ID and Secret Access Key

## Step 1: Create AWS Credentials

1. Go to AWS Console → IAM → Users
2. Create a new user (e.g., `quicksilver-app`)
3. Attach these policies:
   - `AmazonDynamoDBFullAccess`
   - `AmazonLocationFullAccess`
   - `AmazonSNSFullAccess`
   - `AmazonSESFullAccess`
   - `AWSLambdaFullAccess`
4. Generate Access Keys and save them

## Step 2: Set Environment Variables in Base44

Go to your Base44 app dashboard and add these secrets:

```
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=<your-access-key>
AWS_SECRET_ACCESS_KEY=<your-secret-key>
AWS_GEOFENCE_COLLECTION=quicksilver-toll-plazas
```

## Step 3: Create DynamoDB Tables

Run the setup function to create required tables:
- Go to your app's Functions page
- Find and run `setupDynamoDB`
- Use the "create" action

This creates:
- Vehicles table
- PaymentMethods table
- Trips table
- TollPasses table
- Notifications table

## Step 4: Set Up AWS Location Service

1. Go to AWS Console → Amazon Location Service
2. Create a Geofence Collection named `quicksilver-toll-plazas`
3. Run the `createGeofences` function to populate toll locations

## Step 5: Configure Amazon SNS (Push Notifications)

1. Go to AWS Console → Amazon SNS
2. Create a new Topic (e.g., `quicksilver-toll-alerts`)
3. Note the Topic ARN
4. Add `AWS_SNS_TOPIC_ARN` to your Base44 secrets

## Step 6: Configure Amazon SES (Email)

1. Go to AWS Console → Amazon SES
2. Verify your sender email address
3. If in sandbox mode, also verify recipient emails
4. Request production access for unlimited sending

## Step 7: Deploy Lambda Functions

### Lambda: Process Toll Crossing
- Function: `lambdaProcessTollCrossing`
- Trigger: AWS Location Service (Geofence ENTER events)
- Processes toll detection and creates notifications

### Lambda: Process Payment
- Function: `lambdaProcessPayment`
- Trigger: DynamoDB Stream (Trips table)
- Sends payment confirmations via email

## Step 8: Testing

1. Test DynamoDB connection by adding a vehicle
2. Test geofence detection using the Map page
3. Test notifications by making a test toll payment

## Estimated Monthly Costs

- DynamoDB: ~$5-15 (depends on usage)
- AWS Location: ~$0.50-2 (based on tracking)
- SNS: ~$0.50 (first million requests free)
- SES: $0.10 per 1,000 emails
- Lambda: Free tier covers most usage

**Total: $6-20/month** for typical usage

## Troubleshooting

### "Access Denied" Errors
- Verify your IAM user has the correct permissions
- Check that your Access Keys are correct in Base44 secrets

### Geofence Not Triggering
- Ensure Location Service collection is created
- Verify geofences were created successfully
- Check Lambda trigger is configured

### Email Not Sending
- Verify email is verified in SES
- If in sandbox, verify recipient email too
- Check Lambda logs in CloudWatch

## Need Help?

Check the AWS CloudWatch logs for detailed error messages from your Lambda functions.