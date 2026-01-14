import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Proxy function to call external AWS API Gateway endpoints
 * Forwards requests from Base44 to your AWS infrastructure
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { endpoint, method = 'POST', path, data, headers = {} } = await req.json();
    
    // Your AWS API Gateway base URL
    const AWS_API_GATEWAY_URL = Deno.env.get('AWS_API_GATEWAY_URL');
    
    if (!AWS_API_GATEWAY_URL) {
      return Response.json({ 
        error: 'AWS_API_GATEWAY_URL not configured' 
      }, { status: 500 });
    }

    const url = `${AWS_API_GATEWAY_URL}${path}`;
    
    console.log('AWS Gateway Proxy:', { method, url, userEmail: user.email });

    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'x-user-email': user.email,
        ...headers,
      },
    };

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);
    const result = await response.json();

    if (!response.ok) {
      return Response.json({ 
        error: result.message || 'AWS API request failed',
        details: result 
      }, { status: response.status });
    }

    return Response.json(result);
  } catch (error) {
    console.error('AWS Gateway Proxy Error:', error);
    return Response.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});