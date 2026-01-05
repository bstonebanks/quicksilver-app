
import { base44 } from "@/api/base44Client";

// Using Base44's built-in database instead of AWS DynamoDB
export const dynamodb = {
  vehicles: {
    list: () => base44.entities.Vehicle.list(),
    create: (data) => base44.entities.Vehicle.create(data),
    update: (id, data) => base44.entities.Vehicle.update(id, data),
    delete: (id) => base44.entities.Vehicle.delete(id),
    get: (id) => base44.entities.Vehicle.filter({ id }),
  },
  paymentMethods: {
    list: () => base44.entities.PaymentMethod.list(),
    create: (data) => base44.entities.PaymentMethod.create(data),
    update: (id, data) => base44.entities.PaymentMethod.update(id, data),
    delete: (id) => base44.entities.PaymentMethod.delete(id),
    get: (id) => base44.entities.PaymentMethod.filter({ id }),
  },
  trips: {
    list: () => base44.entities.Trip.list(),
    create: (data) => base44.entities.Trip.create(data),
    update: (id, data) => base44.entities.Trip.update(id, data),
    delete: (id) => base44.entities.Trip.delete(id),
    get: (id) => base44.entities.Trip.filter({ id }),
    filter: (filterData) => base44.entities.Trip.filter(filterData),
  },
  tollPasses: {
    list: () => base44.entities.TollPass.list(),
    create: (data) => base44.entities.TollPass.create(data),
    update: (id, data) => base44.entities.TollPass.update(id, data),
    delete: (id) => base44.entities.TollPass.delete(id),
    get: (id) => base44.entities.TollPass.filter({ id }),
  },
  notifications: {
    list: () => base44.entities.Notification.list(),
    create: (data) => base44.entities.Notification.create(data),
    update: (id, data) => base44.entities.Notification.update(id, data),
    delete: (id) => base44.entities.Notification.delete(id),
    get: (id) => base44.entities.Notification.filter({ id }),
  },
};
