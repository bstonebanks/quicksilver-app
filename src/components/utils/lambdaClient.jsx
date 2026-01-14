import { base44 } from "@/api/base44Client";

/**
 * Lambda Client for invoking AWS Lambda functions from Base44
 */

export const lambdaClient = {
  /**
   * Invoke a Lambda function
   * @param {string} functionName - AWS Lambda function name
   * @param {object} payload - Payload to send to the function
   * @returns {Promise<any>} Lambda function response
   */
  async invoke(functionName, payload = {}) {
    try {
      console.log('Invoking Lambda:', functionName);
      
      const response = await base44.functions.invoke('invokeLambda', {
        functionName,
        payload,
      });

      return response.data;
    } catch (error) {
      console.error('Lambda invocation failed:', error);
      throw error;
    }
  },

  /**
   * Process toll crossing (lambdaProcessTollCrossing)
   */
  async processTollCrossing(data) {
    return this.invoke('lambdaProcessTollCrossing', data);
  },

  /**
   * Process payment (lambdaProcessPayment)
   */
  async processPayment(data) {
    return this.invoke('lambdaProcessPayment', data);
  },
};

export default lambdaClient;