import { base44 } from "@/api/base44Client";

/**
 * DynamoDB table names
 */
const TABLE_NAMES = {
  Vehicle: "QuickSilver-Vehicles",
  PaymentMethod: "QuickSilver-PaymentMethods",
  Trip: "QuickSilver-Trips",
  TollPass: "QuickSilver-TollPasses",
  Notification: "QuickSilver-Notifications",
};

/**
 * Generic request wrapper to Base44 dynamodb function
 */
async function dynamoRequest(operation, tableName, options = {}) {
  const response = await base44.functions.invoke("dynamodb", {
    operation,
    tableName,
    ...options,
  });

  return response?.data;
}

/**
 * DynamoDB client with composite-key awareness
 */
export const dynamodb = {
  vehicles: {
    list: (userID) =>
      dynamoRequest("filter", TABLE_NAMES.Vehicle, {
        filterExpression: "userID = :uid",
        expressionAttributeValues: {
          ":uid": userID,
        },
      }),

    create: (userID, data) =>
      dynamoRequest("create", TABLE_NAMES.Vehicle, {
        data: {
          userID,
          id: data?.id ?? crypto.randomUUID(),
          ...data,
        },
      }),

    get: (userID, id) =>
      dynamoRequest("get", TABLE_NAMES.Vehicle, {
        key: { userID, id },
      }),

    update: (userID, id, data) =>
      dynamoRequest("update", TABLE_NAMES.Vehicle, {
        key: { userID, id },
        data,
      }),

    delete: (userID, id) =>
      dynamoRequest("delete", TABLE_NAMES.Vehicle, {
        key: { userID, id },
      }),
  },

  paymentMethods: {
    create: (userID, data) =>
      dynamoRequest("create", TABLE_NAMES.PaymentMethod, {
        data: {
          userID,
          id: data?.id ?? crypto.randomUUID(),
          ...data,
        },
      }),

    get: (userID, id) =>
      dynamoRequest("get", TABLE_NAMES.PaymentMethod, {
        key: { userID, id },
      }),

    update: (userID, id, data) =>
      dynamoRequest("update", TABLE_NAMES.PaymentMethod, {
        key: { userID, id },
        data,
      }),

    delete: (userID, id) =>
      dynamoRequest("delete", TABLE_NAMES.PaymentMethod, {
        key: { userID, id },
      }),
  },

  trips: {
    create: (userID, data) =>
      dynamoRequest("create", TABLE_NAMES.Trip, {
        data: {
          userID,
          id: data?.id ?? crypto.randomUUID(),
          ...data,
        },
      }),

    get: (userID, id) =>
      dynamoRequest("get", TABLE_NAMES.Trip, {
        key: { userID, id },
      }),

    list: (userID) =>
      dynamoRequest("filter", TABLE_NAMES.Trip, {
        filterExpression: "userID = :uid",
        expressionAttributeValues: {
          ":uid": userID,
        },
      }),
  },

  tollPasses: {
    create: (userID, data) =>
      dynamoRequest("create", TABLE_NAMES.TollPass, {
        data: {
          userID,
          id: data?.id ?? crypto.randomUUID(),
          ...data,
        },
      }),

    get: (userID, id) =>
      dynamoRequest("get", TABLE_NAMES.TollPass, {
        key: { userID, id },
      }),
  },

  notifications: {
    create: (userID, data) =>
      dynamoRequest("create", TABLE_NAMES.Notification, {
        data: {
          userID,
          id: data?.id ?? crypto.randomUUID(),
          ...data,
        },
      }),

    list: (userID) =>
      dynamoRequest("filter", TABLE_NAMES.Notification, {
        filterExpression: "userID = :uid",
        expressionAttributeValues: {
          ":uid": userID,
        },
      }),
  },
};
