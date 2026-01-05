import { DynamoDBClient } from 'npm:@aws-sdk/client-dynamodb';
import { CreateTableCommand, ListTablesCommand, DescribeTableCommand } from 'npm:@aws-sdk/client-dynamodb';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const client = new DynamoDBClient({
  region: Deno.env.get('AWS_REGION'),
  credentials: {
    accessKeyId: Deno.env.get('AWS_ACCESS_KEY_ID'),
    secretAccessKey: Deno.env.get('AWS_SECRET_ACCESS_KEY'),
  },
});

const TABLES = [
  {
    name: 'QuickSilver-Vehicles',
    attributes: [
      { name: 'userID', type: 'S' },
      { name: 'id', type: 'S' },
    ],
    keySchema: [
      { name: 'userID', type: 'HASH' },
      { name: 'id', type: 'RANGE' },
    ],
  },
  {
    name: 'QuickSilver-PaymentMethods',
    attributes: [
      { name: 'userID', type: 'S' },
      { name: 'id', type: 'S' },
    ],
    keySchema: [
      { name: 'userID', type: 'HASH' },
      { name: 'id', type: 'RANGE' },
    ],
  },
  {
    name: 'QuickSilver-Trips',
    attributes: [
      { name: 'userID', type: 'S' },
      { name: 'id', type: 'S' },
    ],
    keySchema: [
      { name: 'userID', type: 'HASH' },
      { name: 'id', type: 'RANGE' },
    ],
  },
  {
    name: 'QuickSilver-TollPasses',
    attributes: [
      { name: 'userID', type: 'S' },
      { name: 'id', type: 'S' },
    ],
    keySchema: [
      { name: 'userID', type: 'HASH' },
      { name: 'id', type: 'RANGE' },
    ],
  },
  {
    name: 'QuickSilver-Notifications',
    attributes: [
      { name: 'userID', type: 'S' },
      { name: 'id', type: 'S' },
    ],
    keySchema: [
      { name: 'userID', type: 'HASH' },
      { name: 'id', type: 'RANGE' },
    ],
  },
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized - Admin access required' }, { status: 403 });
    }

    const { action } = await req.json();

    if (action === 'list') {
      const result = await client.send(new ListTablesCommand({}));
      return Response.json({ tables: result.TableNames || [] });
    }

    if (action === 'create') {
      const results = [];

      for (const table of TABLES) {
        try {
          // Check if table exists
          try {
            await client.send(new DescribeTableCommand({ TableName: table.name }));
            results.push({ table: table.name, status: 'exists', message: 'Table already exists' });
            continue;
          } catch (err) {
            if (err.name !== 'ResourceNotFoundException') throw err;
          }

          // Create table
          await client.send(new CreateTableCommand({
            TableName: table.name,
            AttributeDefinitions: table.attributes.map(attr => ({
              AttributeName: attr.name,
              AttributeType: attr.type,
            })),
            KeySchema: table.keySchema.map(key => ({
              AttributeName: key.name,
              KeyType: key.type === 'HASH' ? 'HASH' : 'RANGE',
            })),
            BillingMode: 'PAY_PER_REQUEST',
          }));

          results.push({ table: table.name, status: 'created', message: 'Table created successfully' });
        } catch (error) {
          results.push({ table: table.name, status: 'error', message: error.message });
        }
      }

      return Response.json({
        message: 'DynamoDB setup completed',
        results,
      });
    }

    return Response.json({ error: 'Invalid action. Use "list" or "create"' }, { status: 400 });
  } catch (error) {
    console.error('Setup Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});