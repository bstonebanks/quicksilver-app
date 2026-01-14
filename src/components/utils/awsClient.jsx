import { base44 } from "@/api/base44Client";

/**
 * AWS Client SDK for Base44
 * Provides easy access to AWS services through Base44 backend functions
 */

class AWSClient {
  /**
   * Send SNS notification
   */
  async sendSNS({ topicArn, message, subject, phoneNumber }) {
    const params = {
      Message: message,
      ...(topicArn && { TopicArn: topicArn }),
      ...(subject && { Subject: subject }),
      ...(phoneNumber && { PhoneNumber: phoneNumber }),
    };

    const response = await base44.functions.invoke("awsApi", {
      service: "sns",
      action: "publish",
      params,
    });

    return response.data;
  }

  /**
   * Evaluate geofences for location tracking
   */
  async evaluateGeofences({ collectionName, deviceId, position }) {
    const params = {
      CollectionName: collectionName,
      DevicePositionUpdates: [
        {
          DeviceId: deviceId,
          Position: position, // [longitude, latitude]
          SampleTime: new Date().toISOString(),
        },
      ],
    };

    const response = await base44.functions.invoke("awsApi", {
      service: "location",
      action: "batchEvaluateGeofences",
      params,
    });

    return response.data;
  }

  /**
   * Direct DynamoDB access (uses existing function)
   */
  async dynamodb(operation, tableName, options = {}) {
    const response = await base44.functions.invoke("dynamodb", {
      operation,
      tableName,
      ...options,
    });

    return response.data;
  }

  /**
   * Generic AWS service call
   */
  async call(service, action, params) {
    const response = await base44.functions.invoke("awsApi", {
      service,
      action,
      params,
    });

    return response.data;
  }
}

// Export singleton instance
export const awsClient = new AWSClient();

// Export class for custom instances if needed
export default AWSClient;