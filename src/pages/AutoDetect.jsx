import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, MapPin, Bell, Battery, Shield, Radio, 
  Info, Navigation
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function AutoDetect() {
  const [autoDetectEnabled, setAutoDetectEnabled] = useState(false);
  const [locationPermission, setLocationPermission] = useState('prompt');
  const [backgroundTracking, setBackgroundTracking] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [trackingActive, setTrackingActive] = useState(false);
  const [geofenceCount, setGeofenceCount] = useState(5);

  useEffect(() => {
    checkLocationPermission();
  }, []);

  const checkLocationPermission = async () => {
    if ('permissions' in navigator) {
      try {
        const result = await navigator.permissions.query({ name: 'geolocation' });
        setLocationPermission(result.state);
      } catch (e) {
        console.log('Permissions API not supported');
      }
    }
  };

  const requestLocationPermission = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        () => {
          setLocationPermission('granted');
          alert('Location access granted! You can now enable auto-detection.');
        },
        () => {
          setLocationPermission('denied');
          alert('Location access denied. Please enable it in your browser settings.');
        }
      );
    }
  };

  const handleAutoDetectToggle = (enabled) => {
    if (enabled && locationPermission !== 'granted') {
      requestLocationPermission();
      return;
    }
    setAutoDetectEnabled(enabled);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Auto-Detection</h1>
          <p className="text-slate-600">Configure automatic toll detection with AWS geofencing</p>
        </div>



        {/* Main Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-slate-200 mb-6">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`h-16 w-16 rounded-2xl flex items-center justify-center ${
                    autoDetectEnabled 
                      ? 'bg-gradient-to-br from-green-400 to-emerald-600' 
                      : 'bg-slate-100'
                  }`}>
                    <Zap className={`w-8 h-8 ${autoDetectEnabled ? 'text-white' : 'text-slate-400'}`} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-1">Auto-Detection</h2>
                    <p className="text-slate-600">
                      {autoDetectEnabled ? 'Currently monitoring for toll zones' : 'Enable to start monitoring'}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={autoDetectEnabled}
                  onCheckedChange={handleAutoDetectToggle}
                  className="scale-150"
                />
              </div>

              {autoDetectEnabled && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-6 pt-6 border-t border-slate-200"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-50 rounded-xl p-4 text-center">
                      <p className="text-sm text-green-600 mb-1">Status</p>
                      <p className="font-bold text-green-700">Active</p>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-4 text-center">
                      <p className="text-sm text-blue-600 mb-1">Geofences</p>
                      <p className="font-bold text-blue-700">{geofenceCount} Monitored</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Permissions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-slate-200 mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-cyan-600" />
                Permissions & Setup
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-slate-600" />
                  <div>
                    <p className="font-semibold text-slate-900">Location Access</p>
                    <p className="text-sm text-slate-600">Required for auto-detection</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={`${
                    locationPermission === 'granted' 
                      ? 'bg-green-100 text-green-700 border-green-200' 
                      : locationPermission === 'denied'
                      ? 'bg-red-100 text-red-700 border-red-200'
                      : 'bg-amber-100 text-amber-700 border-amber-200'
                  } border`}>
                    {locationPermission === 'granted' ? '✓ Granted' : 
                     locationPermission === 'denied' ? '✗ Denied' : 
                     '! Not Set'}
                  </Badge>
                  {locationPermission !== 'granted' && (
                    <Button
                      size="sm"
                      onClick={requestLocationPermission}
                      className="bg-cyan-600 hover:bg-cyan-700"
                    >
                      Enable
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Navigation className="w-5 h-5 text-slate-600" />
                  <div>
                    <p className="font-semibold text-slate-900">Background Tracking</p>
                    <p className="text-sm text-slate-600">Track when app is closed</p>
                  </div>
                </div>
                <Switch
                  checked={backgroundTracking}
                  onCheckedChange={setBackgroundTracking}
                  disabled={!autoDetectEnabled}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-slate-600" />
                  <div>
                    <p className="font-semibold text-slate-900">Push Notifications</p>
                    <p className="text-sm text-slate-600">Get alerts when tolls detected</p>
                  </div>
                </div>
                <Switch
                  checked={pushNotifications}
                  onCheckedChange={setPushNotifications}
                  disabled={!autoDetectEnabled}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Battery & Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-slate-200 mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Battery className="w-5 h-5 text-cyan-600" />
                Battery & Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-blue-900 mb-2">Optimized for Efficiency</p>
                    <ul className="space-y-2 text-sm text-blue-800">
                      <li>• Geofence-based detection uses minimal battery</li>
                      <li>• Location checked only when near toll zones</li>
                      <li>• Background tracking optimized for low power</li>
                      <li>• Typical battery impact: ~2-5% per day</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>


      </div>
    </div>
  );
}