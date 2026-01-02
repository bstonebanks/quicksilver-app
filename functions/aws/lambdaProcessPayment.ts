// AWS Lambda Function for Processing Toll Payments
// Deploy this to AWS Lambda Console

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const sesClient = new SESClient({ region: process.env.AWS_REGION });

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

    // Send email receipt via SES
    try {
      await sesClient.send(new SendEmailCommand({
        Source: process.env.SES_FROM_EMAIL,
        Destination: { ToAddresses: [userID] },
        Message: {
          Subject: { Data: 'QuickSilver Payment Receipt' },
          Body: {
            Html: {
              Data: `
                <h2>Payment Confirmation</h2>
                <p>Your toll payment has been processed successfully.</p>
                <ul>
                  <li><strong>Location:</strong> ${trip.toll_location}</li>
                  <li><strong>Amount:</strong> $${trip.amount.toFixed(2)}</li>
                  <li><strong>Confirmation:</strong> ${confirmationNumber}</li>
                  <li><strong>Date:</strong> ${new Date().toLocaleString()}</li>
                </ul>
                <p>Thank you for using QuickSilver!</p>
              `,
            },
          },
        },
      }));
    } catch (sesError) {
      console.error('SES Error (non-critical):', sesError);
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