import { DynamoDBClient } from 'npm:@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand, ScanCommand, UpdateCommand, DeleteCommand } from 'npm:@aws-sdk/lib-dynamodb';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const client = new DynamoDBClient({
  region: Deno.env.get('AWS_REGION'),
  credentials: {
    accessKeyId: Deno.env.get('AWS_ACCESS_KEY_ID'),
    secretAccessKey: Deno.env.get('AWS_SECRET_ACCESS_KEY'),
  },
});

const docClient = DynamoDBDocumentClient.from(client);

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { operation, tableName, data, key, filterExpression, expressionAttributeValues } = await req.json();

    // Ensure all items are associated with the current user
    const userId = user.email;

    switch (operation) {
      case 'create': {
        const item = {
          ...data,
          id: crypto.randomUUID(),
          userId,
          created_date: new Date().toISOString(),
          updated_date: new Date().toISOString(),
          created_by: userId,
        };
        await docClient.send(new PutCommand({
          TableName: tableName,
          Item: item,
        }));
        return Response.json(item);
      }

      case 'get': {
        const result = await docClient.send(new GetCommand({
          TableName: tableName,
          Key: { id: key, userId },
        }));
        return Response.json(result.Item || null);
      }

      case 'list': {
        const result = await docClient.send(new QueryCommand({
          TableName: tableName,
          KeyConditionExpression: 'userId = :userId',
          ExpressionAttributeValues: { ':userId': userId },
        }));
        return Response.json(result.Items || []);
      }

      case 'filter': {
        const result = await docClient.send(new QueryCommand({
          TableName: tableName,
          KeyConditionExpression: 'userId = :userId',
          FilterExpression: filterExpression,
          ExpressionAttributeValues: {
            ':userId': userId,
            ...expressionAttributeValues,
          },
        }));
        return Response.json(result.Items || []);
      }

      case 'update': {
        const updateData = {
          ...data,
          updated_date: new Date().toISOString(),
        };
        
        const updateExpression = 'SET ' + Object.keys(updateData).map((k, i) => `#${k} = :val${i}`).join(', ');
        const expressionAttributeNames = Object.keys(updateData).reduce((acc, k) => ({ ...acc, [`#${k}`]: k }), {});
        const expressionAttributeValues = Object.keys(updateData).reduce((acc, k, i) => ({ ...acc, [`:val${i}`]: updateData[k] }), {});

        await docClient.send(new UpdateCommand({
          TableName: tableName,
          Key: { id: key, userId },
          UpdateExpression: updateExpression,
          ExpressionAttributeNames: expressionAttributeNames,
          ExpressionAttributeValues: expressionAttributeValues,
        }));

        return Response.json({ ...updateData, id: key, userId });
      }

      case 'delete': {
        await docClient.send(new DeleteCommand({
          TableName: tableName,
          Key: { id: key, userId },
        }));
        return Response.json({ success: true });
      }

      default:
        return Response.json({ error: 'Invalid operation' }, { status: 400 });
    }
  } catch (error) {
    console.error('DynamoDB Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});