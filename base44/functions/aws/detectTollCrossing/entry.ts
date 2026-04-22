import { base44 } from "@/api/base44Client";
import { getAWSClients } from "./awsConfig";
import { PublishCommand } from "@aws-sdk/client-sns";

/**
 * Handle geofence events from Amazon Location Service
 * Triggered when a device enters/exits a toll plaza geofence
 * 
 * Expected event format from Location Service:
 * {
 *   deviceId: "user_email",
 *   geofenceId: "toll_plaza_123",
 *   eventType: "ENTER" | "EXIT",
 *   timestamp: "2024-01-01T12:00:00Z"
 * }
 */
export default async function detectTollCrossing(event) {
  const { deviceId, geofenceId, eventType, timestamp } = event;

  // Only process ENTER events
  if (eventType !== 'ENTER') {
    return { status: 'ignored', reason: 'Not an ENTER event' };
  }

  try {
    // Find vehicles for this user (deviceId should be user email)
    const vehicles = await base44.asServiceRole.entities.Vehicle.filter({
      created_by: deviceId
    });

    if (vehicles.length === 0) {
      return { status: 'error', message: 'No vehicles found for user' };
    }

    // Get primary vehicle or first vehicle
    const vehicle = vehicles.find(v => v.is_primary) || vehicles[0];

    // Find payment method with auto-pay enabled
    const paymentMethods = await base44.asServiceRole.entities.PaymentMethod.filter({
      created_by: deviceId,
      auto_pay_enabled: true
    });

    if (paymentMethods.length === 0) {
      // Send notification: no auto-pay enabled
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: deviceId,
        subject: 'Toll Detected - Auto-Pay Not Enabled',
        body: `You passed through ${geofenceId}. Enable auto-pay to automatically process tolls.`
      });
      
      return { status: 'no_autopay', message: 'Auto-pay not enabled' };
    }

    const paymentMethod = paymentMethods[0];

    // Create notification
    await base44.asServiceRole.entities.Notification.create({
      created_by: deviceId,
      type: 'toll_detected',
      title: 'Toll Detected',
      message: `Your vehicle ${vehicle.license_plate} crossed ${geofenceId}. Auto-pay processing...`,
      priority: 'medium',
      metadata: {
        geofenceId,
        vehicleId: vehicle.id,
        timestamp
      }
    });

    // NOTE: In production, this would trigger actual toll payment processing
    // For now, we're just detecting and notifying
    
    return {
      status: 'detected',
      vehicle: vehicle.license_plate,
      geofence: geofenceId,
      timestamp
    };

  } catch (error) {
    console.error('Error detecting toll crossing:', error);
    return { status: 'error', message: error.message };
  }
}