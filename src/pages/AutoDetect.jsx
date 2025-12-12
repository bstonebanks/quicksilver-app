import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, MapPin, Bell, Battery, Shield, Radio, 
  CheckCircle, Info, Settings, Navigation
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function AutoDetect() {
  const [autoDetectEnabled, setAutoDetectEnabled] = useState(false);
  const [locationPermission, setLocationPermission] = useState('prompt');
  const [backgroundTracking, setBackgroundTracking] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);
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

        {/* AWS Architecture Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-8"
        >
          <div className="flex items-start gap-4 mb-6">
            <div className="h-14 w-14 rounded-xl bg-cyan-500 flex items-center justify-center flex-shrink-0">
              <Radio className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">AWS Location Service Architecture</h2>
              <p className="text-slate-300 leading-relaxed">
                Auto-detection uses Amazon Location Service with geofencing to track your position and automatically 
                detect when you enter toll zones.
              </p>
            </div>
          </div>

          <div className="space-y-3 bg-white/5 rounded-2xl p-6 backdrop-blur-sm">
            <h3 className="font-semibold text-cyan-300 mb-3">How It Works:</h3>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Amazon Location Tracker</p>
                <p className="text-sm text-slate-400">Tracks device position in real-time</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Geofence Collection</p>
                <p className="text-sm text-slate-400">Virtual boundaries around {geofenceCount} toll plazas</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">EventBridge + Lambda</p>
                <p className="text-sm text-slate-400">Triggered on ENTER events → creates trip records</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">SNS Push Notifications</p>
                <p className="text-sm text-slate-400">Instant alerts with one-tap payment</p>
              </div>
            </div>
          </div>
        </motion.div>

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

        {/* AWS Services Used */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-cyan-600" />
                AWS Services Used
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="font-semibold text-slate-900 mb-1">Amazon Location Service</p>
                  <p className="text-sm text-slate-600">GPS tracking + geofencing</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="font-semibold text-slate-900 mb-1">AWS EventBridge</p>
                  <p className="text-sm text-slate-600">Geofence event routing</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="font-semibold text-slate-900 mb-1">AWS Lambda</p>
                  <p className="text-sm text-slate-600">Event processing & logic</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="font-semibold text-slate-900 mb-1">Amazon SNS</p>
                  <p className="text-sm text-slate-600">Push notifications</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="font-semibold text-slate-900 mb-1">DynamoDB</p>
                  <p className="text-sm text-slate-600">Trip data storage</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="font-semibold text-slate-900 mb-1">Amazon Cognito</p>
                  <p className="text-sm text-slate-600">User authentication</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}