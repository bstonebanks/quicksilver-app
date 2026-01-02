import { LocationClient, PutGeofenceCommand, BatchPutGeofenceCommand } from 'npm:@aws-sdk/client-location';

const client = new LocationClient({
  region: Deno.env.get('AWS_REGION'),
  credentials: {
    accessKeyId: Deno.env.get('AWS_ACCESS_KEY_ID'),
    secretAccessKey: Deno.env.get('AWS_SECRET_ACCESS_KEY'),
  },
});

const TOLL_LOCATIONS = [
  {
    geofenceId: 'golden-gate-bridge',
    geometry: {
      Circle: {
        Center: [-122.4783, 37.8199],
        Radius: 500, // meters
      },
    },
    properties: {
      name: 'Golden Gate Bridge',
      toll_amount: 8.75,
      toll_road: 'US-101',
    },
  },
  {
    geofenceId: 'bay-bridge',
    geometry: {
      Circle: {
        Center: [-122.3732, 37.7983],
        Radius: 500,
      },
    },
    properties: {
      name: 'Bay Bridge',
      toll_amount: 7.00,
      toll_road: 'I-80',
    },
  },
  {
    geofenceId: 'carquinez-bridge',
    geometry: {
      Circle: {
        Center: [-122.2347, 38.0583],
        Radius: 500,
      },
    },
    properties: {
      name: 'Carquinez Bridge',
      toll_amount: 7.00,
      toll_road: 'I-80',
    },
  },
  {
    geofenceId: 'san-mateo-bridge',
    geometry: {
      Circle: {
        Center: [-122.2531, 37.5831],
        Radius: 500,
      },
    },
    properties: {
      name: 'San Mateo Bridge',
      toll_amount: 7.00,
      toll_road: 'CA-92',
    },
  },
  {
    geofenceId: 'dumbarton-bridge',
    geometry: {
      Circle: {
        Center: [-122.1158, 37.5074],
        Radius: 500,
      },
    },
    properties: {
      name: 'Dumbarton Bridge',
      toll_amount: 7.00,
      toll_road: 'CA-84',
    },
  },
];

Deno.serve(async (req) => {
  try {
    const { collectionName } = await req.json();
    
    if (!collectionName) {
      return Response.json({ error: 'collectionName is required' }, { status: 400 });
    }

    const results = [];

    for (const location of TOLL_LOCATIONS) {
      try {
        await client.send(new PutGeofenceCommand({
          CollectionName: collectionName,
          GeofenceId: location.geofenceId,
          Geometry: location.geometry,
          GeofenceProperties: location.properties,
        }));

        results.push({
          geofenceId: location.geofenceId,
          status: 'created',
        });
      } catch (error) {
        results.push({
          geofenceId: location.geofenceId,
          status: 'error',
          error: error.message,
        });
      }
    }

    return Response.json({
      success: true,
      message: `Created ${results.filter(r => r.status === 'created').length} geofences`,
      results,
    });
  } catch (error) {
    console.error('Geofence Creation Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});