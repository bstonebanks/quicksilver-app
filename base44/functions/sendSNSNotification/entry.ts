import { SNSClient, PublishCommand } from 'npm:@aws-sdk/client-sns@3.600.0';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const snsClient = new SNSClient({
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

    const { phoneNumber, message, subject } = await req.json();

    if (!phoneNumber) {
      return Response.json({ error: 'Phone number is required' }, { status: 400 });
    }

    // Send SMS via SNS
    const command = new PublishCommand({
      PhoneNumber: phoneNumber,
      Message: message,
      Subject: subject || 'QuickSilver Notification'
    });

    const response = await snsClient.send(command);

    return Response.json({ 
      success: true, 
      messageId: response.MessageId 
    });
  } catch (error) {
    console.error('SNS Error:', error);
    return Response.json({ 
      error: error.message,
      hint: error.name === 'InvalidParameterException' ? 'Phone number must be in E.164 format (e.g., +14155551234)' : null
    }, { status: 500 });
  }
});