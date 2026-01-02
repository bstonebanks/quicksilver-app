import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MapPin, Radio, CheckCircle2, AlertCircle, Loader2, Plus, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

const TOLL_LOCATIONS = [
  {
    id: 'golden-gate-bridge',
    name: 'Golden Gate Bridge',
    road: 'US-101',
    coordinates: [-122.4783, 37.8199],
    amount: 8.75,
    radius: 500,
  },
  {
    id: 'bay-bridge',
    name: 'Bay Bridge',
    road: 'I-80',
    coordinates: [-122.3732, 37.7983],
    amount: 7.00,
    radius: 500,
  },
  {
    id: 'carquinez-bridge',
    name: 'Carquinez Bridge',
    road: 'I-80',
    coordinates: [-122.2347, 38.0583],
    amount: 7.00,
    radius: 500,
  },
  {
    id: 'san-mateo-bridge',
    name: 'San Mateo Bridge',
    road: 'CA-92',
    coordinates: [-122.2531, 37.5831],
    amount: 7.00,
    radius: 500,
  },
  {
    id: 'dumbarton-bridge',
    name: 'Dumbarton Bridge',
    road: 'CA-84',
    coordinates: [-122.1158, 37.5074],
    amount: 7.00,
    radius: 500,
  },
];

export default function Geofences() {
  const [collectionName, setCollectionName] = useState('QuickSilver-TollGeofences');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleCreateGeofences = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await base44.functions.invoke('createGeofences', {
        collectionName,
      });

      setResult(response.data);
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message;
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Geofence Management</h1>
          <p className="text-slate-600">Configure AWS Location Service geofences for automatic toll detection</p>
        </div>

        {/* Setup Card */}
        <Card className="border-slate-200 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Radio className="w-5 h-5 text-cyan-600" />
              Create Geofences in AWS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Geofence Collection Name
                </label>
                <Input
                  value={collectionName}
                  onChange={(e) => setCollectionName(e.target.value)}
                  placeholder="QuickSilver-TollGeofences"
                  className="max-w-md"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Must match the collection name created in AWS Location Service
                </p>
              </div>

              <Button
                onClick={handleCreateGeofences}
                disabled={loading || !collectionName}
                className="bg-gradient-to-r from-slate-600 to-blue-900"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Geofences...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Create All Geofences
                  </>
                )}
              </Button>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-900">Error Creating Geofences</p>
                    <p className="text-sm text-red-700 mb-2">{error}</p>
                    <p className="text-xs text-red-600">
                      Common issues: Collection doesn't exist in AWS, invalid credentials, or incorrect region.
                      Check <code className="bg-red-100 px-1 rounded">functions/aws/README.md</code> for setup instructions.
                    </p>
                  </div>
                </div>
              )}

              {result && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-green-900">{result.message}</p>
                      <p className="text-sm text-green-700">
                        Successfully created geofences in AWS Location Service
                      </p>
                    </div>
                  </div>

                  {result.results && (
                    <div className="space-y-2 mt-4">
                      {result.results.map((item) => (
                        <div
                          key={item.geofenceId}
                          className="flex items-center justify-between p-2 bg-white rounded-lg"
                        >
                          <span className="text-sm text-slate-700">{item.geofenceId}</span>
                          {item.status === 'created' ? (
                            <Badge className="bg-green-100 text-green-700">Created</Badge>
                          ) : (
                            <Badge variant="destructive">{item.error}</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Geofence List */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Toll Location Geofences</h2>
          <p className="text-slate-600 mb-6">
            These geofences will be created in your AWS Location Service collection
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {TOLL_LOCATIONS.map((location, index) => (
              <motion.div
                key={location.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-slate-200 hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-700 flex items-center justify-center">
                          <MapPin className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{location.name}</CardTitle>
                          <p className="text-sm text-slate-600">{location.road}</p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Geofence ID</span>
                        <code className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-800">
                          {location.id}
                        </code>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Toll Amount</span>
                        <span className="font-bold text-slate-900">${location.amount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Radius</span>
                        <span className="text-sm text-slate-700">{location.radius}m</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Coordinates</span>
                        <span className="text-xs text-slate-700">
                          {location.coordinates[1].toFixed(4)}, {location.coordinates[0].toFixed(4)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-amber-900 mb-2">Setup Instructions</h3>
                <ol className="space-y-2 text-sm text-amber-800">
                  <li><strong>1. Create AWS Resources:</strong> Follow the guide in <code>functions/aws/README.md</code></li>
                  <li><strong>2. Create Geofence Collection:</strong> Use AWS Console or CLI to create the collection</li>
                  <li><strong>3. Click "Create All Geofences":</strong> This will populate your collection with toll locations</li>
                  <li><strong>4. Set Up Lambda:</strong> Deploy the Lambda functions for event processing</li>
                  <li><strong>5. Configure EventBridge:</strong> Link geofence events to Lambda triggers</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}