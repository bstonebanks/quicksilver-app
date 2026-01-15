import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Navigation, Zap, DollarSign, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const TOLL_LOCATIONS = [
  {
    id: 1,
    name: 'Golden Gate Bridge',
    location: 'San Francisco Toll Plaza',
    coordinates: [37.8199, -122.4783],
    amount: 8.75,
    geofenceRadius: 200,
    description: 'Southbound tolls only'
  },
  {
    id: 2,
    name: 'Bay Bridge',
    location: 'Eastbound Toll Plaza',
    coordinates: [37.8088, -122.3755],
    amount: 7.00,
    geofenceRadius: 150,
    description: 'Westbound tolls only'
  },
  {
    id: 3,
    name: 'Highway 73',
    location: 'MacArthur Blvd',
    coordinates: [33.6189, -117.7298],
    amount: 6.50,
    geofenceRadius: 180,
    description: 'Electronic toll collection'
  },
  {
    id: 4,
    name: 'Highway 73',
    location: 'Bonita Canyon',
    coordinates: [33.6545, -117.7891],
    amount: 5.25,
    geofenceRadius: 180,
    description: 'All electronic tolling'
  },
  {
    id: 5,
    name: 'Highway 241',
    location: 'Windy Ridge',
    coordinates: [33.6234, -117.6789],
    amount: 6.00,
    geofenceRadius: 170,
    description: 'Express lanes'
  },
];

function LocationMarker({ position, onLocationFound }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.flyTo(position, 13);
      onLocationFound && onLocationFound(position);
    }
  }, [position, map, onLocationFound]);

  if (!position) return null;

  const userIcon = L.divIcon({
    className: 'custom-user-marker',
    html: '<div style="background: #3b82f6; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>',
    iconSize: [20, 20],
  });

  return (
    <Marker position={position} icon={userIcon}>
      <Popup>
        <div className="text-center">
          <p className="font-semibold">Your Location</p>
          <p className="text-xs text-slate-600">Currently tracking</p>
        </div>
      </Popup>
    </Marker>
  );
}

export default function Map() {
  const [userLocation, setUserLocation] = useState(null);
  const [selectedToll, setSelectedToll] = useState(null);
  const [trackingEnabled, setTrackingEnabled] = useState(false);
  const [nearbyTolls, setNearbyTolls] = useState([]);

  useEffect(() => {
    if (trackingEnabled && 'geolocation' in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const coords = [position.coords.latitude, position.coords.longitude];
          setUserLocation(coords);
          checkNearbyTolls(coords);
        },
        (error) => console.error('Location error:', error),
        { enableHighAccuracy: true, maximumAge: 10000 }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [trackingEnabled]);

  const checkNearbyTolls = (coords) => {
    const nearby = TOLL_LOCATIONS.filter(toll => {
      const distance = calculateDistance(coords, toll.coordinates);
      return distance <= toll.geofenceRadius;
    });
    setNearbyTolls(nearby);
  };

  const calculateDistance = (coord1, coord2) => {
    const R = 6371e3; // Earth radius in meters
    const φ1 = coord1[0] * Math.PI / 180;
    const φ2 = coord2[0] * Math.PI / 180;
    const Δφ = (coord2[0] - coord1[0]) * Math.PI / 180;
    const Δλ = (coord2[1] - coord1[1]) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  const handleLocateMe = () => {
    setTrackingEnabled(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => alert('Unable to get location. Please enable location services.')
      );
    }
  };

  const defaultCenter = [37.7749, -122.4194]; // San Francisco

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Toll Locations</h1>
          <p className="text-slate-600">Interactive map with geofencing and auto-detection</p>
        </div>



        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="border-slate-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Your Location</p>
                  <p className="font-semibold text-slate-900">
                    {trackingEnabled ? 'Tracking Active' : 'Not Tracking'}
                  </p>
                </div>
                <Button
                  onClick={handleLocateMe}
                  size="sm"
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                >
                  <Navigation className="w-4 h-4 mr-2" />
                  Locate Me
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Toll Locations</p>
                  <p className="font-bold text-2xl text-slate-900">{TOLL_LOCATIONS.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Nearby Tolls</p>
                  <p className="font-bold text-2xl text-slate-900">{nearbyTolls.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Nearby Tolls Alert */}
        {nearbyTolls.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <Zap className="w-6 h-6 text-amber-600" />
              <h3 className="font-bold text-amber-900">Geofence Alert!</h3>
            </div>
            <p className="text-amber-800 mb-3">
              You're near {nearbyTolls.length} toll {nearbyTolls.length === 1 ? 'location' : 'locations'}:
            </p>
            <div className="space-y-2">
              {nearbyTolls.map(toll => (
                <div key={toll.id} className="bg-white rounded-lg p-3 flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-slate-900">{toll.name}</p>
                    <p className="text-sm text-slate-600">{toll.location}</p>
                  </div>
                  <Badge className="bg-cyan-100 text-cyan-700 border-cyan-200 border">
                    ${toll.amount.toFixed(2)}
                  </Badge>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Map */}
        <Card className="border-slate-200 overflow-hidden">
          <CardContent className="p-0">
            <div style={{ height: '600px', width: '100%' }}>
              <MapContainer
                center={userLocation || defaultCenter}
                zoom={10}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Toll Markers with Geofences */}
                {TOLL_LOCATIONS.map((toll) => {
                  const tollIcon = L.divIcon({
                    className: 'custom-toll-marker',
                    html: `<div style="background: linear-gradient(135deg, #06b6d4 0%, #2563eb 100%); width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.2); font-size: 16px; color: white;">$</div>`,
                    iconSize: [32, 32],
                  });

                  return (
                    <React.Fragment key={toll.id}>
                      {/* Geofence Circle */}
                      <Circle
                        center={toll.coordinates}
                        radius={toll.geofenceRadius}
                        pathOptions={{
                          color: '#06b6d4',
                          fillColor: '#06b6d4',
                          fillOpacity: 0.1,
                          weight: 2,
                          dashArray: '5, 5'
                        }}
                      />
                      
                      {/* Toll Marker */}
                      <Marker
                        position={toll.coordinates}
                        icon={tollIcon}
                        eventHandlers={{
                          click: () => setSelectedToll(toll)
                        }}
                      >
                        <Popup>
                          <div className="p-2">
                            <h3 className="font-bold text-lg mb-2">{toll.name}</h3>
                            <p className="text-sm text-slate-600 mb-2">{toll.location}</p>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-slate-600">Amount:</span>
                              <span className="font-bold text-lg text-cyan-600">${toll.amount.toFixed(2)}</span>
                            </div>
                            <p className="text-xs text-slate-500 mb-3">{toll.description}</p>
                            <div className="bg-slate-50 rounded p-2 text-xs text-slate-600">
                              <strong>Geofence Radius:</strong> {toll.geofenceRadius}m
                            </div>
                          </div>
                        </Popup>
                      </Marker>
                    </React.Fragment>
                  );
                })}

                {/* User Location */}
                {userLocation && (
                  <LocationMarker position={userLocation} onLocationFound={checkNearbyTolls} />
                )}
              </MapContainer>
            </div>
          </CardContent>
        </Card>

        {/* Selected Toll Details */}
        {selectedToll && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6"
          >
            <Card className="border-slate-200">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-1">{selectedToll.name}</h3>
                    <p className="text-slate-600">{selectedToll.location}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-600 mb-1">Toll Amount</p>
                    <p className="text-3xl font-bold text-cyan-600">${selectedToll.amount.toFixed(2)}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-sm text-slate-600 mb-1">Geofence Radius</p>
                    <p className="font-semibold text-slate-900">{selectedToll.geofenceRadius} meters</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-sm text-slate-600 mb-1">Auto-Detection</p>
                    <p className="font-semibold text-green-600">✓ Active</p>
                  </div>
                </div>
                <p className="text-sm text-slate-600 mt-4">{selectedToll.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Legend */}
        <Card className="border-slate-200 mt-6">
          <CardContent className="p-6">
            <h3 className="font-bold text-slate-900 mb-4">Map Legend</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white font-bold">$</div>
                <div>
                  <p className="font-semibold text-sm">Toll Plaza</p>
                  <p className="text-xs text-slate-600">Click for details</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-dashed border-cyan-500 bg-cyan-50"></div>
                <div>
                  <p className="font-semibold text-sm">Geofence Zone</p>
                  <p className="text-xs text-slate-600">Auto-detection area</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-600 border-4 border-white shadow-md"></div>
                <div>
                  <p className="font-semibold text-sm">Your Location</p>
                  <p className="text-xs text-slate-600">Real-time tracking</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}