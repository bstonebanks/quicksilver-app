import { DynamoDBClient } from 'npm:@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from 'npm:@aws-sdk/lib-dynamodb';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const client = new DynamoDBClient({
  region: Deno.env.get('AWS_REGION'),
  credentials: {
    accessKeyId: Deno.env.get('AWS_ACCESS_KEY_ID'),
    secretAccessKey: Deno.env.get('AWS_SECRET_ACCESS_KEY'),
  },
});

const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAMES = {
  Vehicle: 'QuickSilver-Vehicles',
  PaymentMethod: 'QuickSilver-PaymentMethods',
  Trip: 'QuickSilver-Trips',
  TollPass: 'QuickSilver-TollPasses',
  Notification: 'QuickSilver-Notifications',
};

async function migrateEntity(base44, userId, entityName, tableName) {
  try {
    const items = await base44.entities[entityName].list();
    
    if (items.length === 0) {
      return { entity: entityName, count: 0, status: 'no data' };
    }

    const migrated = [];
    for (const item of items) {
      const dynamoItem = {
        ...item,
        userId,
      };

      await docClient.send(new PutCommand({
        TableName: tableName,
        Item: dynamoItem,
      }));

      migrated.push(item.id);
    }

    return { entity: entityName, count: migrated.length, status: 'success', ids: migrated };
  } catch (error) {
    return { entity: entityName, status: 'error', error: error.message };
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.email;
    const results = [];

    // Migrate all entities
    for (const [entityName, tableName] of Object.entries(TABLE_NAMES)) {
      const result = await migrateEntity(base44, userID, entityName, tableName);
      results.push(result);
    }

    const totalMigrated = results.reduce((sum, r) => sum + (r.count || 0), 0);
    const errors = results.filter(r => r.status === 'error');

    return Response.json({
      success: errors.length === 0,
      totalMigrated,
      results,
      message: errors.length === 0 
        ? `Successfully migrated ${totalMigrated} records to DynamoDB`
        : `Migration completed with ${errors.length} errors`,
    });
  } catch (error) {
    console.error('Migration Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});