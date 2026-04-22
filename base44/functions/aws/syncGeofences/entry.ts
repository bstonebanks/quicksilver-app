import { getAWSClients, GEOFENCE_COLLECTION } from "./awsConfig";
import { 
  BatchPutGeofenceCommand, 
  ListGeofencesCommand 
} from "@aws-sdk/client-location";

/**
 * Sync toll plaza geofences to Amazon Location Service
 * Creates geofences around major toll locations for auto-detection
 */
export default async function syncGeofences() {
  const { location } = getAWSClients();

  // Toll plaza locations with coordinates
  const tollPlazas = [
    {
      geofenceId: 'golden-gate-bridge',
      coordinates: [[-122.4783, 37.8199]],
      radius: 500, // meters
      metadata: {
        name: 'Golden Gate Bridge Toll Plaza',
        road: 'US-101',
        amount: 8.50
      }
    },
    {
      geofenceId: 'bay-bridge-toll',
      coordinates: [[-122.3736, 37.7983]],
      radius: 500,
      metadata: {
        name: 'Bay Bridge Toll Plaza',
        road: 'I-80',
        amount: 7.00
      }
    },
    {
      geofenceId: 'nj-turnpike-exit-14',
      coordinates: [[-74.1581, 40.7178]],
      radius: 400,
      metadata: {
        name: 'NJ Turnpike Exit 14',
        road: 'I-95',
        amount: 3.50
      }
    }
    // Add more toll plazas as needed
  ];

  try {
    // Batch put geofences
    const command = new BatchPutGeofenceCommand({
      CollectionName: GEOFENCE_COLLECTION,
      Entries: tollPlazas.map(plaza => ({
        GeofenceId: plaza.geofenceId,
        Geometry: {
          Circle: {
            Center: plaza.coordinates[0],
            Radius: plaza.radius
          }
        },
        GeofenceProperties: plaza.metadata
      }))
    });

    const response = await location.send(command);

    return {
      status: 'success',
      synced: tollPlazas.length,
      errors: response.Errors || [],
      message: `Synced ${tollPlazas.length} geofences to ${GEOFENCE_COLLECTION}`
    };

  } catch (error) {
    console.error('Error syncing geofences:', error);
    return {
      status: 'error',
      message: error.message
    };
  }
}