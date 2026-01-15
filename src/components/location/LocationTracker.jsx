import { useEffect, useRef } from 'react';
import { dynamodb } from "../utils/dynamodbClient";

const TOLL_LOCATIONS = [
  { id: 'golden-gate', name: 'Golden Gate Bridge', road: 'US-101', lat: 37.8199, lng: -122.4783, amount: 8.75, radius: 500 },
  { id: 'bay-bridge', name: 'Bay Bridge', road: 'I-80', lat: 37.7983, lng: -122.3778, amount: 7.00, radius: 500 },
  { id: 'hwy73-macarthur', name: 'MacArthur Blvd', road: 'Highway 73', lat: 33.6595, lng: -117.8443, amount: 6.50, radius: 400 },
  { id: 'hwy73-bonita', name: 'Bonita Canyon', road: 'Highway 73', lat: 33.6446, lng: -117.8253, amount: 5.25, radius: 400 },
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

      for (const toll of TOLL_LOCATIONS) {
        const distance = calculateDistance(latitude, longitude, toll.lat, toll.lng);
        
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
              
              // Create geofence event (pending confirmation)
              await base44.entities.GeofenceEvent.create({
                toll_location: toll.name,
                toll_road: toll.road,
                amount: toll.amount,
                detected_at: new Date().toISOString(),
                status: 'pending',
                latitude,
                longitude,
                geofence_id: toll.id,
                license_plate: primaryVehicle?.license_plate
              });
              
              // Create notification
              await dynamodb.notifications.create(user.email, {
                type: 'toll_detected',
                title: '🚨 Toll Detected',
                message: `You just passed through ${toll.name} on ${toll.road}. Amount: $${toll.amount.toFixed(2)}. Please confirm this toll in the Pending Tolls section.`,
                priority: 'urgent',
                is_read: false,
                metadata: {
                  toll_location: toll.name,
                  toll_road: toll.road,
                  amount: toll.amount,
                  detected_at: new Date().toISOString(),
                  latitude,
                  longitude
                }
              });

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
        timeout: 5000,
        maximumAge: 0
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