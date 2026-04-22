import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { DynamoDBClient } from 'npm:@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from 'npm:@aws-sdk/lib-dynamodb';

const dynamoClient = new DynamoDBClient({
  region: Deno.env.get('AWS_REGION'),
  credentials: {
    accessKeyId: Deno.env.get('AWS_ACCESS_KEY_ID'),
    secretAccessKey: Deno.env.get('AWS_SECRET_ACCESS_KEY'),
  },
});
const docClient = DynamoDBDocumentClient.from(dynamoClient);

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { toll_location, toll_road, amount, license_plate } = await req.json();

    // Create pending trip
    const tripId = `trip-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const trip = {
      id: tripId,
      created_by: user.email,
      toll_location,
      toll_road,
      entry_time: new Date().toISOString(),
      license_plate,
      amount,
      status: 'pending',
      payment_method: null,
      confirmation_number: null,
      created_date: new Date().toISOString(),
      updated_date: new Date().toISOString(),
    };

    await docClient.send(new PutCommand({
      TableName: 'QuickSilver-Trips',
      Item: trip,
    }));

    // Create toll detection notification
    const notificationId = `notif-${Date.now()}`;
    await docClient.send(new PutCommand({
      TableName: 'QuickSilver-Notifications',
      Item: {
        id: notificationId,
        created_by: user.email,
        type: 'toll_detected',
        title: 'Toll Detected',
        message: `${toll_road} at ${toll_location} detected - $${amount.toFixed(2)}. Payment required within 48 hours to avoid penalties.`,
        is_read: false,
        priority: 'high',
        metadata: {
          trip_id: tripId,
          toll_location,
          toll_road,
          amount,
          license_plate,
        },
        trip_id: tripId,
        created_date: new Date().toISOString(),
        updated_date: new Date().toISOString(),
      },
    }));

    return Response.json({
      success: true,
      trip_id: tripId,
      notification_id: notificationId,
      message: 'Toll detection alert created',
    });
  } catch (error) {
    console.error('Error creating toll alert:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});