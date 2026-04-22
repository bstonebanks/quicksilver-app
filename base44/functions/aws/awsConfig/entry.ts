import { LocationClient } from "@aws-sdk/client-location";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { SNSClient } from "@aws-sdk/client-sns";

// Initialize AWS clients with credentials from secrets
export function getAWSClients() {
  const config = {
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  };

  return {
    location: new LocationClient(config),
    dynamodb: new DynamoDBClient(config),
    sns: new SNSClient(config)
  };
}

export const GEOFENCE_COLLECTION = process.env.AWS_GEOFENCE_COLLECTION || 'quicksilver-toll-plazas';