import { DynamoDBClient } from 'npm:@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from 'npm:@aws-sdk/lib-dynamodb';
import { SNSClient, PublishCommand } from 'npm:@aws-sdk/client-sns';
import { LocationClient, BatchEvaluateGeofencesCommand } from 'npm:@aws-sdk/client-location';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Initialize AWS clients
const region = Deno.env.get('AWS_REGION') || 'us-east-2';
const credentials = {
  accessKeyId: Deno.env.get('AWS_ACCESS_KEY_ID'),
  secretAccessKey: Deno.env.get('AWS_SECRET_ACCESS_KEY'),
};

const dynamoClient = new DynamoDBClient({ region, credentials });
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const snsClient = new SNSClient({ region, credentials });
const locationClient = new LocationClient({ region, credentials });

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { service, action, params } = await req.json();
    console.log('AWS API Request:', { service, action, userEmail: user.email });

    let result;

    switch (service) {
      case 'sns': {
        if (action === 'publish') {
          const command = new PublishCommand(params);
          result = await snsClient.send(command);
        } else {
          return Response.json({ error: 'Invalid SNS action' }, { status: 400 });
        }
        break;
      }

      case 'location': {
        if (action === 'batchEvaluateGeofences') {
          const command = new BatchEvaluateGeofencesCommand(params);
          result = await locationClient.send(command);
        } else {
          return Response.json({ error: 'Invalid Location action' }, { status: 400 });
        }
        break;
      }

      case 'dynamodb': {
        // Forward to the existing dynamodb function
        const dynamoResult = await base44.functions.invoke('dynamodb', params);
        return Response.json(dynamoResult.data);
      }

      default:
        return Response.json({ error: 'Invalid AWS service' }, { status: 400 });
    }

    return Response.json({ success: true, data: result });
  } catch (error) {
    console.error('AWS API Error:', error);
    return Response.json({ 
      error: error.message,
      details: error.stack 
    }, { status: 500 });
  }
});