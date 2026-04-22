import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user's toll history from DynamoDB
    const DynamoDBClient = await import('npm:@aws-sdk/client-dynamodb');
    const LibDynamoDB = await import('npm:@aws-sdk/lib-dynamodb');
    
    const client = new DynamoDBClient.DynamoDBClient({
      region: Deno.env.get('AWS_REGION'),
      credentials: {
        accessKeyId: Deno.env.get('AWS_ACCESS_KEY_ID'),
        secretAccessKey: Deno.env.get('AWS_SECRET_ACCESS_KEY'),
      },
    });
    
    const docClient = LibDynamoDB.DynamoDBDocumentClient.from(client);
    
    // Fetch trips
    const tripsResult = await docClient.send(new LibDynamoDB.ScanCommand({
      TableName: 'QuickSilver-Trips',
      FilterExpression: 'userID = :userID',
      ExpressionAttributeValues: { ':userID': user.email },
    }));
    const trips = tripsResult.Items || [];
    
    // Fetch payment methods
    const paymentsResult = await docClient.send(new LibDynamoDB.ScanCommand({
      TableName: 'QuickSilver-PaymentMethods',
      FilterExpression: 'userID = :userID',
      ExpressionAttributeValues: { ':userID': user.email },
    }));
    const paymentMethods = paymentsResult.Items || [];
    
    // Fetch vehicles
    const vehiclesResult = await docClient.send(new LibDynamoDB.ScanCommand({
      TableName: 'QuickSilver-Vehicles',
      FilterExpression: 'userID = :userID',
      ExpressionAttributeValues: { ':userID': user.email },
    }));
    const vehicles = vehiclesResult.Items || [];

    // Calculate statistics
    const totalSpent = trips.reduce((sum, trip) => sum + (trip.amount || 0), 0);
    const avgPerTrip = trips.length > 0 ? totalSpent / trips.length : 0;
    const monthlyAvg = totalSpent / Math.max(1, Math.ceil(trips.length / 30));

    // Group by toll location
    const locationStats = {};
    trips.forEach(trip => {
      if (!locationStats[trip.toll_location]) {
        locationStats[trip.toll_location] = { count: 0, total: 0 };
      }
      locationStats[trip.toll_location].count++;
      locationStats[trip.toll_location].total += trip.amount || 0;
    });

    // Prepare context for LLM
    const context = {
      user_email: user.email,
      total_trips: trips.length,
      total_spent: totalSpent,
      average_per_trip: avgPerTrip,
      estimated_monthly_spend: monthlyAvg,
      most_used_locations: Object.entries(locationStats)
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 5)
        .map(([location, stats]) => ({
          location,
          trips: stats.count,
          total: stats.total
        })),
      has_auto_pay: paymentMethods.some(pm => pm.auto_pay_enabled),
      payment_methods_count: paymentMethods.length,
      vehicles_count: vehicles.length,
      recent_trips: trips.slice(0, 10).map(t => ({
        location: t.toll_location,
        road: t.toll_road,
        amount: t.amount,
        date: t.entry_time
      }))
    };

    // Use AI to generate insights
    const aiResponse = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a toll payment optimization expert. Analyze this user's toll usage data and provide actionable insights.

User Data:
${JSON.stringify(context, null, 2)}

Provide a comprehensive analysis with:
1. **Payment Plan Recommendation**: Suggest the best payment strategy (pay-per-use, prepaid pass, monthly subscription) based on their usage patterns.
2. **Cost Prediction**: Predict their next month's toll expenses with reasoning.
3. **Savings Tips**: Give 3-5 specific, actionable tips to reduce toll costs (alternate routes, time-of-day pricing, toll passes, etc.).

Be specific, data-driven, and practical. Use dollar amounts and percentages where applicable.`,
      response_json_schema: {
        type: "object",
        properties: {
          payment_plan: {
            type: "object",
            properties: {
              recommendation: { type: "string" },
              reasoning: { type: "string" },
              potential_savings: { type: "string" }
            }
          },
          cost_prediction: {
            type: "object",
            properties: {
              next_month_estimate: { type: "number" },
              confidence: { type: "string" },
              factors: { type: "array", items: { type: "string" } }
            }
          },
          savings_tips: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                estimated_savings: { type: "string" }
              }
            }
          },
          driving_patterns: {
            type: "object",
            properties: {
              summary: { type: "string" },
              peak_usage_times: { type: "string" }
            }
          }
        }
      }
    });

    return Response.json({
      success: true,
      insights: aiResponse,
      stats: {
        total_trips: trips.length,
        total_spent: totalSpent,
        average_per_trip: avgPerTrip,
        estimated_monthly: monthlyAvg
      }
    });
  } catch (error) {
    console.error('AI Insights Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});