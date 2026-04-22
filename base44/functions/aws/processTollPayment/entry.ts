import { base44 } from "@/api/base44Client";

/**
 * Process toll payment after ALPR detection
 * This would be called by toll authority API when camera detects license plate
 * 
 * Expected payload:
 * {
 *   license_plate: "ABC123",
 *   state: "CA",
 *   toll_location: "Golden Gate Bridge",
 *   toll_road: "US-101",
 *   amount: 8.50,
 *   timestamp: "2024-01-01T12:00:00Z"
 * }
 */
export default async function processTollPayment(payload) {
  const { license_plate, state, toll_location, toll_road, amount, timestamp } = payload;

  try {
    // Find vehicle by license plate
    const vehicles = await base44.asServiceRole.entities.Vehicle.filter({
      license_plate: license_plate.toUpperCase(),
      state: state
    });

    if (vehicles.length === 0) {
      return { 
        status: 'not_found', 
        message: 'Vehicle not registered with QuickSilver',
        action: 'send_violation_notice'
      };
    }

    const vehicle = vehicles[0];
    const userEmail = vehicle.created_by;

    // Get payment method (prefer auto-pay enabled, or default)
    const paymentMethods = await base44.asServiceRole.entities.PaymentMethod.filter({
      created_by: userEmail
    });

    let paymentMethod = paymentMethods.find(pm => pm.auto_pay_enabled);
    if (!paymentMethod) {
      paymentMethod = paymentMethods.find(pm => pm.is_default);
    }
    if (!paymentMethod) {
      paymentMethod = paymentMethods[0];
    }

    if (!paymentMethod) {
      return {
        status: 'no_payment_method',
        message: 'No payment method on file',
        action: 'send_violation_notice'
      };
    }

    // Generate confirmation number
    const confirmationNumber = `QS-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create trip record
    const trip = await base44.asServiceRole.entities.Trip.create({
      created_by: userEmail,
      toll_location,
      toll_road,
      entry_time: timestamp || new Date().toISOString(),
      license_plate,
      amount,
      status: 'paid',
      payment_method: paymentMethod.last_four,
      confirmation_number: confirmationNumber
    });

    // Create success notification
    await base44.asServiceRole.entities.Notification.create({
      created_by: userEmail,
      type: 'payment_success',
      title: 'Toll Paid Successfully',
      message: `$${amount.toFixed(2)} charged for ${toll_location}`,
      priority: 'low',
      trip_id: trip.id,
      metadata: {
        toll_location,
        amount,
        confirmation_number: confirmationNumber
      }
    });

    // Send email confirmation
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: userEmail,
      subject: `Toll Receipt - ${toll_location}`,
      body: `
        Toll Payment Confirmation
        
        Location: ${toll_location} (${toll_road})
        Amount: $${amount.toFixed(2)}
        Vehicle: ${license_plate}
        Payment: •••• ${paymentMethod.last_four}
        Confirmation: ${confirmationNumber}
        Date: ${new Date(timestamp).toLocaleString()}
        
        Thank you for using QuickSilver Instant Pay.
      `
    });

    return {
      status: 'paid',
      trip_id: trip.id,
      confirmation_number: confirmationNumber,
      amount,
      message: 'Payment processed successfully'
    };

  } catch (error) {
    console.error('Error processing toll payment:', error);
    
    // Create failure notification if we have user info
    if (error.userEmail) {
      await base44.asServiceRole.entities.Notification.create({
        created_by: error.userEmail,
        type: 'payment_failed',
        title: 'Toll Payment Failed',
        message: `Failed to process payment for ${toll_location}`,
        priority: 'high',
        metadata: { error: error.message }
      });
    }

    return { 
      status: 'error', 
      message: error.message,
      action: 'retry_or_send_violation'
    };
  }
}