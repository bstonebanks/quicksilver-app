// AWS Lambda Function for Processing Toll Crossings
// Deploy this to AWS Lambda Console

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';

const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const snsClient = new SNSClient({ region: process.env.AWS_REGION });

export const handler = async (event) => {
  console.log('Received event:', JSON.stringify(event, null, 2));

  try {
    // Parse EventBridge geofence event
    const { detail } = event;
    const {
      EventType,
      GeofenceId,
      DeviceId,
      Position,
      GeofenceProperties,
    } = detail;

    // Only process ENTER events
    if (EventType !== 'ENTER') {
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Ignored EXIT event' }),
      };
    }

    // Extract toll information from geofence properties
    const tollAmount = parseFloat(GeofenceProperties.toll_amount || 0);
    const tollName = GeofenceProperties.name || 'Unknown Toll';
    const tollRoad = GeofenceProperties.toll_road || 'Unknown Road';

    // Get user's primary vehicle (deviceId should be userID)
    const userID = DeviceId;
    
    // Query for user's primary vehicle
    const vehiclesResult = await docClient.send(new GetCommand({
      TableName: 'QuickSilver-Vehicles',
      Key: { userID, id: 'primary' }, // Simplified - adjust based on your schema
    }));

    const primaryVehicle = vehiclesResult.Item;
    const licensePlate = primaryVehicle?.license_plate || 'Unknown';

    // Create pending trip record
    const tripId = `trip-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const trip = {
      id: tripId,
      userID,
      toll_location: tollName,
      toll_road: tollRoad,
      entry_time: new Date().toISOString(),
      license_plate: licensePlate,
      amount: tollAmount,
      status: 'pending',
      payment_method: null,
      confirmation_number: null,
      position: Position,
      geofence_id: GeofenceId,
      created_date: new Date().toISOString(),
      updated_date: new Date().toISOString(),
      created_by: userID,
    };

    await docClient.send(new PutCommand({
      TableName: 'QuickSilver-Trips',
      Item: trip,
    }));

    // Create notification record
    const notificationId = `notif-${Date.now()}`;
    await docClient.send(new PutCommand({
      TableName: 'QuickSilver-Notifications',
      Item: {
        id: notificationId,
        userID,
        type: 'toll_detected',
        title: 'Toll Detected',
        message: `${tollName} toll detected - $${tollAmount.toFixed(2)}. Tap to pay.`,
        is_read: false,
        priority: 'high',
        metadata: {
          trip_id: tripId,
          toll_location: tollName,
          amount: tollAmount,
        },
        trip_id: tripId,
        created_date: new Date().toISOString(),
        updated_date: new Date().toISOString(),
      },
    }));

    // Send push notification via SNS (optional - requires SNS topic setup)
    try {
      await snsClient.send(new PublishCommand({
        TopicArn: process.env.SNS_TOPIC_ARN,
        Message: JSON.stringify({
          title: 'Toll Detected',
          body: `${tollName} - $${tollAmount.toFixed(2)}`,
          data: {
            trip_id: tripId,
            type: 'toll_detected',
          },
        }),
        MessageAttributes: {
          userId: { DataType: 'String', StringValue: userID },
        },
      }));
    } catch (snsError) {
      console.error('SNS Error (non-critical):', snsError);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Toll crossing processed successfully',
        tripId,
        tollAmount,
      }),
    };
  } catch (error) {
    console.error('Error processing toll crossing:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};