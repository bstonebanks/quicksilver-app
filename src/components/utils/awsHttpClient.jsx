import { base44 } from "@/api/base44Client";

/**
 * AWS HTTP REST Client
 * Makes direct HTTP requests to AWS API Gateway endpoints
 */

class AWSHttpClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl; // Your AWS API Gateway endpoint
  }

  /**
   * Make authenticated request to AWS API
   */
  async request(method, path, data = null) {
    try {
      // Get user token for authentication
      const user = await base44.auth.me();
      
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.email || ''}`,
        },
      };

      if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        options.body = JSON.stringify(data);
      }

      const url = `${this.baseUrl}${path}`;
      console.log('AWS HTTP Request:', { method, url });

      const response = await fetch(url, options);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Request failed');
      }

      return await response.json();
    } catch (error) {
      console.error('AWS HTTP Error:', error);
      throw error;
    }
  }

  // Convenience methods
  get(path) {
    return this.request('GET', path);
  }

  post(path, data) {
    return this.request('POST', path, data);
  }

  put(path, data) {
    return this.request('PUT', path, data);
  }

  delete(path) {
    return this.request('DELETE', path);
  }
}

// Usage example:
// const awsHttp = new AWSHttpClient('https://your-api-gateway.execute-api.us-east-2.amazonaws.com/prod');
// const result = await awsHttp.post('/toll-crossing', { latitude, longitude });

export default AWSHttpClient;