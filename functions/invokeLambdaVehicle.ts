import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { LambdaClient, InvokeCommand } from 'npm:@aws-sdk/client-lambda';

const lambdaClient = new LambdaClient({
  region: Deno.env.get('AWS_REGION'),
  credentials: {
    accessKeyId: Deno.env.get('AWS_ACCESS_KEY_ID'),
    secretAccessKey: Deno.env.get('AWS_SECRET_ACCESS_KEY'),
  },
});

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { vehicleData } = await req.json();

    const command = new InvokeCommand({
      FunctionName: 'CreateVehicles_Lambda',
      Payload: JSON.stringify({
        userId: user.id,
        userEmail: user.email,
        ...vehicleData,
      }),
    });

    const response = await lambdaClient.send(command);
    const payload = JSON.parse(new TextDecoder().decode(response.Payload));

    return Response.json({ 
      success: true, 
      lambdaResponse: payload 
    });
  } catch (error) {
    console.error('Lambda invocation error:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});