import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { DynamoDBClient } from 'npm:@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand } from 'npm:@aws-sdk/lib-dynamodb';

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
    const { email, full_name, sub } = await req.json();

    if (!email || !sub) {
      return Response.json({ error: 'Email and sub are required' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await docClient.send(new GetCommand({
      TableName: 'QuickSilver-Users',
      Key: { userID: email, id: sub }
    }));

    if (existingUser.Item) {
      return Response.json({ message: 'User already synced', user: existingUser.Item });
    }

    // Create user record in DynamoDB
    const user = {
      id: sub,
      userID: email,
      email,
      full_name,
      role: 'user',
      created_date: new Date().toISOString(),
      updated_date: new Date().toISOString(),
      created_by: email,
    };

    await docClient.send(new PutCommand({
      TableName: 'QuickSilver-Users',
      Item: user,
    }));

    return Response.json({ 
      message: 'User synced successfully', 
      user 
    });
  } catch (error) {
    console.error('Error syncing Cognito user:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});