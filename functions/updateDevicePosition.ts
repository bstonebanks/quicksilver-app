import { LocationClient, BatchUpdateDevicePositionCommand } from 'npm:@aws-sdk/client-location';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const { latitude, longitude, trackerName = 'QuickSilver-Tracker' } = await req.json();

    if (!latitude || !longitude) {
      return Response.json({ error: 'latitude and longitude are required' }, { status: 400 });
    }

    // Authenticate user
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const deviceId = user.email; // Use email as device ID

    const client = new LocationClient({
      region: Deno.env.get('AWS_REGION'),
      credentials: {
        accessKeyId: Deno.env.get('AWS_ACCESS_KEY_ID'),
        secretAccessKey: Deno.env.get('AWS_SECRET_ACCESS_KEY'),
      },
    });

    const command = new BatchUpdateDevicePositionCommand({
      TrackerName: trackerName,
      Updates: [
        {
          DeviceId: deviceId,
          Position: [longitude, latitude], // AWS expects [lng, lat]
          SampleTime: new Date().toISOString(),
        },
      ],
    });

    const response = await client.send(command);

    return Response.json({
      success: true,
      deviceId,
      position: { latitude, longitude },
      timestamp: new Date().toISOString(),
      awsResponse: response,
    });
  } catch (error) {
    console.error('Position Update Error:', error);
    return Response.json({ 
      error: error.message,
      hint: error.name === 'ResourceNotFoundException' 
        ? 'Tracker does not exist. Create it in AWS Location Service first.' 
        : null
    }, { status: 500 });
  }
});