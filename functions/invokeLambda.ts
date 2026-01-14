import { LambdaClient, InvokeCommand } from 'npm:@aws-sdk/client-lambda@3.600.0';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const lambdaClient = new LambdaClient({
  region: Deno.env.get('AWS_REGION') || 'us-east-1',
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

    const { functionName, payload } = await req.json();
    
    if (!functionName) {
      return Response.json({ error: 'functionName is required' }, { status: 400 });
    }

    console.log('Invoking Lambda:', { functionName, userEmail: user.email });

    const command = new InvokeCommand({
      FunctionName: functionName,
      Payload: JSON.stringify({
        ...payload,
        userEmail: user.email,
      }),
    });

    const response = await lambdaClient.send(command);
    const result = JSON.parse(new TextDecoder().decode(response.Payload));

    if (response.FunctionError) {
      console.error('Lambda error:', result);
      return Response.json({ 
        error: 'Lambda function error',
        details: result 
      }, { status: 500 });
    }

    return Response.json(result);
  } catch (error) {
    console.error('Lambda invocation error:', error);
    return Response.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});