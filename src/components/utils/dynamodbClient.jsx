import { base44 } from "@/api/base44Client";

const TABLE_NAMES = {
  Vehicle: 'QuickSilver-Vehicles',
  PaymentMethod: 'QuickSilver-PaymentMethods',
  Trip: 'QuickSilver-Trips',
  TollPass: 'QuickSilver-TollPasses',
  Notification: 'QuickSilver-Notifications',
};

async function dynamoRequest(operation, tableName, options = {}) {
  const response = await base44.functions.invoke('dynamodb', {
    operation,
    tableName,
    ...options,
  });
  return response.data;
}

export const dynamodb = {
  vehicles: {
    list: () => dynamoRequest('list', TABLE_NAMES.Vehicle),
    create: async (data) => {
      console.log('Creating vehicle with data:', data);
      const result = await dynamoRequest('create', TABLE_NAMES.Vehicle, { data });
      console.log('Create result:', result);
      return result;
    },
    update: (id, data) => dynamoRequest('update', TABLE_NAMES.Vehicle, { key: id, data }),
    delete: (id) => dynamoRequest('delete', TABLE_NAMES.Vehicle, { key: id }),
    get: (id) => dynamoRequest('get', TABLE_NAMES.Vehicle, { key: id }),
  },
  paymentMethods: {
    list: () => dynamoRequest('list', TABLE_NAMES.PaymentMethod),
    create: (data) => dynamoRequest('create', TABLE_NAMES.PaymentMethod, { data }),
    update: (id, data) => dynamoRequest('update', TABLE_NAMES.PaymentMethod, { key: id, data }),
    delete: (id) => dynamoRequest('delete', TABLE_NAMES.PaymentMethod, { key: id }),
    get: (id) => dynamoRequest('get', TABLE_NAMES.PaymentMethod, { key: id }),
  },
  trips: {
    list: () => dynamoRequest('list', TABLE_NAMES.Trip),
    create: (data) => dynamoRequest('create', TABLE_NAMES.Trip, { data }),
    update: (id, data) => dynamoRequest('update', TABLE_NAMES.Trip, { key: id, data }),
    delete: (id) => dynamoRequest('delete', TABLE_NAMES.Trip, { key: id }),
    get: (id) => dynamoRequest('get', TABLE_NAMES.Trip, { key: id }),
    filter: (filterData) => {
      const filterExpressions = [];
      const expressionAttributeValues = {};
      
      Object.entries(filterData).forEach(([key, value], index) => {
        filterExpressions.push(`#${key} = :filterVal${index}`);
        expressionAttributeValues[`:filterVal${index}`] = value;
      });

      return dynamoRequest('filter', TABLE_NAMES.Trip, {
        filterExpression: filterExpressions.join(' AND '),
        expressionAttributeValues,
      });
    },
  },
  tollPasses: {
    list: () => dynamoRequest('list', TABLE_NAMES.TollPass),
    create: (data) => dynamoRequest('create', TABLE_NAMES.TollPass, { data }),
    update: (id, data) => dynamoRequest('update', TABLE_NAMES.TollPass, { key: id, data }),
    delete: (id) => dynamoRequest('delete', TABLE_NAMES.TollPass, { key: id }),
    get: (id) => dynamoRequest('get', TABLE_NAMES.TollPass, { key: id }),
  },
  notifications: {
    list: () => dynamoRequest('list', TABLE_NAMES.Notification),
    create: (data) => dynamoRequest('create', TABLE_NAMES.Notification, { data }),
    update: (id, data) => dynamoRequest('update', TABLE_NAMES.Notification, { key: id, data }),
    delete: (id) => dynamoRequest('delete', TABLE_NAMES.Notification, { key: id }),
    get: (id) => dynamoRequest('get', TABLE_NAMES.Notification, { key: id }),
  },
};