// AWS Lambda Function for Processing Toll Payments
// Deploy this to AWS Lambda Console

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, UpdateCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';

const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const snsClient = new SNSClient({ region: process.env.AWS_REGION });

export const handler = async (event) => {
  console.log('Received payment event:', JSON.stringify(event, null, 2));

  try {
    const { tripId, userID, paymentMethodId } = JSON.parse(event.body || event);

    // Get trip details
    const tripResult = await docClient.send(new GetCommand({
      TableName: 'QuickSilver-Trips',
      Key: { userID, id: tripId },
    }));

    const trip = tripResult.Item;
    if (!trip) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Trip not found' }),
      };
    }

    // Get payment method
    const paymentResult = await docClient.send(new GetCommand({
      TableName: 'QuickSilver-PaymentMethods',
      Key: { userID, id: paymentMethodId },
    }));

    const paymentMethod = paymentResult.Item;
    if (!paymentMethod) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Payment method not found' }),
      };
    }

    // Get user details for phone number
    const userResult = await docClient.send(new GetCommand({
      TableName: 'QuickSilver-Users',
      Key: { userID },
    }));

    const user = userResult.Item;
    const userPhoneNumber = user?.phone_number;

    // TODO: Process payment via Stripe
    // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    // const charge = await stripe.charges.create({...});

    // Generate confirmation number
    const confirmationNumber = `QS${Date.now().toString().slice(-8)}`;

    // Update trip status
    await docClient.send(new UpdateCommand({
      TableName: 'QuickSilver-Trips',
      Key: { userID, id: tripId },
      UpdateExpression: 'SET #status = :status, payment_method = :pm, confirmation_number = :cn, updated_date = :ud',
      ExpressionAttributeNames: {
        '#status': 'status',
      },
      ExpressionAttributeValues: {
        ':status': 'paid',
        ':pm': paymentMethod.last_four,
        ':cn': confirmationNumber,
        ':ud': new Date().toISOString(),
      },
    }));

    // Create success notification
    const notificationId = `notif-${Date.now()}`;
    await docClient.send(new PutCommand({
      TableName: 'QuickSilver-Notifications',
      Item: {
        id: notificationId,
        userID,
        type: 'payment_success',
        title: 'Payment Successful',
        message: `Your toll payment of $${trip.amount.toFixed(2)} was processed successfully.`,
        is_read: false,
        priority: 'medium',
        metadata: {
          trip_id: tripId,
          confirmation_number: confirmationNumber,
        },
        trip_id: tripId,
        created_date: new Date().toISOString(),
        updated_date: new Date().toISOString(),
      },
    }));

    // Send SMS receipt via SNS
    if (userPhoneNumber) {
      try {
        const smsMessage = `QuickSilver Payment Receipt\n` +
          `Location: ${trip.toll_location}\n` +
          `Amount: $${trip.amount.toFixed(2)}\n` +
          `Confirmation: ${confirmationNumber}\n` +
          `Date: ${new Date().toLocaleString()}\n` +
          `Thank you for using QuickSilver!`;

        await snsClient.send(new PublishCommand({
          PhoneNumber: userPhoneNumber,
          Message: smsMessage,
          MessageAttributes: {
            'AWS.SNS.SMS.SMSType': {
              DataType: 'String',
              StringValue: 'Transactional'
            }
          }
        }));
        console.log('SMS receipt sent successfully');
      } catch (snsError) {
        console.error('SNS Error (non-critical):', snsError);
      }
    } else {
      console.log('No phone number available for SMS receipt');
    }

    // Send push notification via SNS Topic (optional)
    const topicArn = process.env.SNS_TOPIC_ARN;
    if (topicArn) {
      try {
        await snsClient.send(new PublishCommand({
          TopicArn: topicArn,
          Subject: 'QuickSilver Payment Receipt',
          Message: JSON.stringify({
            default: `Payment of $${trip.amount.toFixed(2)} processed successfully. Confirmation: ${confirmationNumber}`,
            title: 'Payment Successful',
            body: `$${trip.amount.toFixed(2)} paid at ${trip.toll_location}`,
            data: {
              trip_id: tripId,
              confirmation_number: confirmationNumber,
            }
          }),
          MessageStructure: 'json'
        }));
        console.log('Push notification sent successfully');
      } catch (pushError) {
        console.error('Push notification error (non-critical):', pushError);
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Payment processed successfully',
        confirmationNumber,
        trip,
      }),
    };
  } catch (error) {
    console.error('Error processing payment:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};