import { useEffect, useRef } from 'react';
import { dynamodb } from "../utils/dynamodbClient";
import { base44 } from "@/api/base44Client";

const TOLL_LOCATIONS = [
  { id: 'golden-gate', name: 'Golden Gate Bridge', road: 'US-101', lat: 37.8199, lng: -122.4783, amount: 8.75, radius: 500 },
  { id: 'bay-bridge', name: 'Bay Bridge', road: 'I-80', lat: 37.7983, lng: -122.3778, amount: 7.00, radius: 500 },
  { id: 'hwy73-macarthur', name: 'MacArthur Blvd', road: 'Highway 73', lat: 33.6595, lng: -117.8443, amount: 6.50, radius: 400 },
  { id: 'hwy73-bonita', name: 'Bonita Canyon', road: 'Highway 73', lat: 33.6446, lng: -117.8253, amount: 5.25, radius: 400 },
  { id: 'dulles-toll', name: 'Dulles Toll Road', road: 'VA-267', lat: 38.9587, lng: -77.3579, amount: 4.25, radius: 400 },
  { id: 'chesapeake-bridge', name: 'Chesapeake Bay Bridge', road: 'US-50/301', lat: 38.9898, lng: -76.3775, amount: 6.00, radius: 500 },
  { id: 'i95-express', name: 'I-95 Express Lanes', road: 'I-95', lat: 38.7893, lng: -77.2011, amount: 5.50, radius: 400 },
  { id: 'gw-bridge', name: 'George Washington Bridge', road: 'I-95', lat: 40.8517, lng: -73.9527, amount: 16.00, radius: 500 },
  { id: 'nj-turnpike', name: 'New Jersey Turnpike', road: 'I-95', lat: 40.6895, lng: -74.2424, amount: 3.50, radius: 400 },
  { id: 'garden-state', name: 'Garden State Parkway', road: 'GSP', lat: 40.9234, lng: -74.0682, amount: 1.50, radius: 400 },
  { id: 'lincoln-tunnel', name: 'Lincoln Tunnel', road: 'NJ-495', lat: 40.7614, lng: -74.0055, amount: 17.00, radius: 400 },
];

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export default function LocationTracker({ enabled, onTollDetected }) {
  const lastAlertedRef = useRef({});
  const lastProximityAlertRef = useRef({});
  const watchIdRef = useRef(null);

  useEffect(() => {
    if (!enabled) {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      return;
    }

    if (!navigator.geolocation) {
      console.error('Geolocation not supported');
      return;
    }

    const checkTollProximity = async (position) => {
      const { latitude, longitude } = position.coords;
      const now = Date.now();

      // Send position to AWS Location Service for geofencing
      try {
        await base44.functions.invoke('updateDevicePosition', {
          latitude,
          longitude,
        });
      } catch (error) {
        console.error('Failed to update AWS position:', error);
      }

      // Fetch active geofence rules
      let rules = [];
      try {
        rules = await base44.entities.GeofenceRule.filter({ is_active: true });
      } catch (error) {
        console.error('Failed to fetch rules:', error);
      }

      // Check if current time matches any rule
      const currentDay = new Date().getDay();
      const currentTime = new Date().toTimeString().slice(0, 5); // HH:MM

      const matchingRule = rules.find(rule => {
        if (rule.days_of_week && rule.days_of_week.length > 0 && !rule.days_of_week.includes(currentDay)) {
          return false;
        }
        if (rule.time_start && rule.time_end) {
          return currentTime >= rule.time_start && currentTime <= rule.time_end;
        }
        return true;
      });

      const defaultAction = matchingRule?.action || 'notify_with_confirm';

      // Also check locally as fallback
      for (const toll of TOLL_LOCATIONS) {
        const distance = calculateDistance(latitude, longitude, toll.lat, toll.lng);

        // Predictive alert: 1-2 miles (1600-3200 meters) before toll
        if (distance > toll.radius && distance <= 3200 && distance >= 1600) {
          const lastProximityAlert = lastProximityAlertRef.current[toll.id];
          
          if (!lastProximityAlert || (now - lastProximityAlert) > 3600000) {
            lastProximityAlertRef.current[toll.id] = now;
            
            try {
              const user = await base44.auth.me();
              const distanceInMiles = (distance * 0.000621371).toFixed(1);
              
              await dynamodb.notifications.create(user.email, {
                type: 'toll_detected',
                title: '📍 Toll Ahead',
                message: `Approaching ${toll.name} on ${toll.road} in ${distanceInMiles} miles. Toll: $${toll.amount.toFixed(2)}. Prepare payment or consider alternate route.`,
                priority: 'medium',
                is_read: false,
                metadata: {
                  toll_location: toll.name,
                  toll_road: toll.road,
                  amount: toll.amount,
                  distance_miles: distanceInMiles,
                  alert_type: 'proximity'
                }
              });

              if (onTollDetected) {
                onTollDetected({ ...toll, alert_type: 'proximity', distance: distanceInMiles });
              }
            } catch (error) {
              console.error('Failed to create proximity alert:', error);
            }
          }
        }
        
        // If within geofence radius
        if (distance <= toll.radius) {
          const lastAlerted = lastAlertedRef.current[toll.id];
          
          // Only alert once per hour for same toll
          if (!lastAlerted || (now - lastAlerted) > 3600000) {
            lastAlertedRef.current[toll.id] = now;
            
            try {
              const { base44 } = await import("@/api/base44Client");
              const user = await base44.auth.me();
              
              // Get primary vehicle if available
              const vehicles = await dynamodb.vehicles.list(user.email);
              const primaryVehicle = vehicles.find(v => v.is_primary) || vehicles[0];
              
              // Create geofence event based on rule action
              const eventStatus = defaultAction === 'auto_pay' ? 'confirmed' : 'pending';
              
              await base44.entities.GeofenceEvent.create({
                toll_location: toll.name,
                toll_road: toll.road,
                amount: toll.amount,
                detected_at: new Date().toISOString(),
                status: eventStatus,
                latitude,
                longitude,
                geofence_id: toll.id,
                license_plate: primaryVehicle?.license_plate
              });

              // If auto-pay, immediately create trip
              if (defaultAction === 'auto_pay') {
                const paymentMethods = await dynamodb.paymentMethods.list(user.email);
                const defaultPayment = paymentMethods.find(pm => pm.is_default) || paymentMethods[0];
                
                if (defaultPayment) {
                  await dynamodb.trips.create(user.email, {
                    toll_location: toll.name,
                    toll_road: toll.road,
                    entry_time: new Date().toISOString(),
                    license_plate: primaryVehicle?.license_plate || 'Unknown',
                    amount: toll.amount,
                    status: 'paid',
                    payment_method: defaultPayment.last_four,
                    confirmation_number: `QS-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
                  });
                }
              }
              
              // Create notification based on action
              if (defaultAction !== 'silent') {
                const notificationMessage = defaultAction === 'auto_pay'
                  ? `Auto-paid ${toll.name} toll: $${toll.amount.toFixed(2)}. Payment processed automatically.`
                  : `You just passed through ${toll.name} on ${toll.road}. Amount: $${toll.amount.toFixed(2)}. Please confirm this toll in the Pending Tolls section.`;
                
                await dynamodb.notifications.create(user.email, {
                  type: 'toll_detected',
                  title: defaultAction === 'auto_pay' ? '✅ Toll Auto-Paid' : '🚨 Toll Detected',
                  message: notificationMessage,
                  priority: defaultAction === 'auto_pay' ? 'medium' : 'urgent',
                  is_read: false,
                  metadata: {
                    toll_location: toll.name,
                    toll_road: toll.road,
                    amount: toll.amount,
                    detected_at: new Date().toISOString(),
                    latitude,
                    longitude,
                    action_taken: defaultAction
                  }
                });
              }

              if (onTollDetected) {
                onTollDetected(toll);
              }
            } catch (error) {
              console.error('Failed to create toll alert:', error);
            }
          }
        }
      }
    };

    watchIdRef.current = navigator.geolocation.watchPosition(
      checkTollProximity,
      (error) => console.error('Location error:', error),
      {
        enableHighAccuracy: true,
        timeout: 27000,
        maximumAge: 30000
      }
    );

    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [enabled, onTollDetected]);

  return null;
}