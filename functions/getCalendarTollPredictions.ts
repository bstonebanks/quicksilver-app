import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { calendar_events } = await req.json();
    
    if (!calendar_events || !Array.isArray(calendar_events)) {
      return Response.json({ error: 'calendar_events array required' }, { status: 400 });
    }

    // Fetch toll locations
    const tollLocations = [
      { name: 'Golden Gate Bridge', location: 'San Francisco', amount: 8.75 },
      { name: 'Bay Bridge', location: 'San Francisco Bay Area', amount: 7.00 },
      { name: 'Carquinez Bridge', location: 'Bay Area', amount: 7.00 },
      { name: 'San Mateo Bridge', location: 'San Francisco Bay Area', amount: 7.00 },
      { name: 'Dumbarton Bridge', location: 'Bay Area', amount: 7.00 },
    ];

    // Use AI to predict tolls based on calendar events
    const predictions = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a toll prediction expert. Analyze these calendar events and predict which toll roads the user might encounter.

Calendar Events:
${JSON.stringify(calendar_events, null, 2)}

Known Toll Locations in the area:
${JSON.stringify(tollLocations, null, 2)}

For each calendar event that involves travel, predict:
1. Whether tolls are likely on the route
2. Which specific toll(s) might be encountered
3. Estimated toll cost
4. Best departure time to avoid peak pricing (if applicable)

Be specific and practical. Only predict tolls if the event clearly involves driving through known toll areas.`,
      response_json_schema: {
        type: "object",
        properties: {
          predictions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                event_title: { type: "string" },
                event_date: { type: "string" },
                event_location: { type: "string" },
                toll_likely: { type: "boolean" },
                predicted_tolls: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      toll_name: { type: "string" },
                      estimated_cost: { type: "number" },
                      reasoning: { type: "string" }
                    }
                  }
                },
                total_estimated_cost: { type: "number" },
                suggestions: { type: "string" }
              }
            }
          },
          weekly_total: { type: "number" },
          summary: { type: "string" }
        }
      }
    });

    return Response.json({
      success: true,
      predictions: predictions.predictions,
      weekly_total: predictions.weekly_total,
      summary: predictions.summary
    });
  } catch (error) {
    console.error('Calendar Prediction Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});