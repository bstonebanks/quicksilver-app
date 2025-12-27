import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Cloud, MapPin, Bell, CreditCard, ArrowRight, ExternalLink } from 'lucide-react';
import { motion } from "framer-motion";

export default function AWSIntegration() {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  // Check if secrets are configured (in production, you'd query backend)
  const secretsConfigured = {
    AWS_ACCESS_KEY_ID: false,
    AWS_SECRET_ACCESS_KEY: false,
    AWS_REGION: false,
    AWS_GEOFENCE_COLLECTION: false
  };

  const allSecretsConfigured = Object.values(secretsConfigured).every(v => v);

  const setupSteps = [
    {
      title: 'Configure AWS Credentials',
      status: allSecretsConfigured ? 'complete' : 'pending',
      description: 'Add your AWS credentials in Base44 Dashboard',
      instructions: [
        'Go to Base44 Dashboard (base44.com - not this app)',
        'Click on your app → Settings',
        'Look for "Environment Variables" or "Secrets" section',
        'If you don\'t see it, backend functions may not be fully activated',
        'Add these secrets:',
        '• AWS_ACCESS_KEY_ID',
        '• AWS_SECRET_ACCESS_KEY',
        '• AWS_REGION (e.g., us-east-1)',
        '• AWS_GEOFENCE_COLLECTION (e.g., quicksilver-toll-plazas)'
      ],
      link: '/dashboard/settings/secrets'
    },
    {
      title: 'Create Amazon Location Service Resources',
      status: 'pending',
      description: 'Set up geofence collection in AWS Console',
      instructions: [
        'Open AWS Console → Amazon Location Service',
        'Create a Geofence Collection',
        'Name: "quicksilver-toll-plazas"',
        'Enable event notifications',
        'Configure EventBridge rules to trigger your functions'
      ],
      link: 'https://console.aws.amazon.com/location'
    },
    {
      title: 'Set Up DynamoDB Tables (Optional)',
      status: 'pending',
      description: 'For high-performance toll data storage',
      instructions: [
        'Create DynamoDB table for real-time toll tracking',
        'Configure TTL for automatic data cleanup',
        'Set up streams for event processing',
        'Note: Base44 entities work great for most use cases'
      ],
      link: 'https://console.aws.amazon.com/dynamodb'
    },
    {
      title: 'Configure SNS Topics',
      status: 'pending',
      description: 'Set up notification routing',
      instructions: [
        'Create SNS topics for toll alerts',
        'Configure topic policies',
        'Subscribe endpoints (email, SMS, Lambda)',
        'Note: Base44 email integration already works'
      ],
      link: 'https://console.aws.amazon.com/sns'
    }
  ];

  const testIntegration = async () => {
    setTesting(true);
    // In production, this would call your backend function
    setTimeout(() => {
      setTestResult({
        status: 'warning',
        message: 'AWS credentials not configured yet. Complete Step 1 to test integration.'
      });
      setTesting(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50 py-12">
      <div className="max-w-5xl mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2 flex items-center gap-3">
            <Cloud className="w-10 h-10 text-orange-500" />
            AWS Integration
          </h1>
          <p className="text-slate-600">Connect QuickSilver to your AWS services for real-time toll detection</p>
        </div>

        {/* Important Note */}
        <Alert className="mb-6 border-blue-200 bg-blue-50">
          <AlertDescription className="text-blue-800">
            <strong>Can't find Secrets?</strong> Go to <strong>base44.com</strong> → Your App → Settings → Environment Variables (or Secrets tab). 
            If backend functions are enabled, you should see a place to add key-value pairs for secrets.
          </AlertDescription>
        </Alert>

        {/* Status Overview */}
        <Card className="mb-8 border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-orange-600" />
              Integration Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
                <span className="font-medium text-slate-700">AWS Credentials</span>
                {allSecretsConfigured ? (
                  <Badge className="bg-green-100 text-green-700 border-green-200">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Configured
                  </Badge>
                ) : (
                  <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                    <XCircle className="w-3 h-3 mr-1" />
                    Pending
                  </Badge>
                )}
              </div>
              <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
                <span className="font-medium text-slate-700">Location Service</span>
                <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                  <XCircle className="w-3 h-3 mr-1" />
                  Not Set Up
                </Badge>
              </div>
            </div>
            <Button 
              onClick={testIntegration} 
              disabled={testing}
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
            >
              {testing ? 'Testing...' : 'Test Integration'}
            </Button>
            {testResult && (
              <Alert className="mt-4 border-amber-200 bg-amber-50">
                <AlertDescription>{testResult.message}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Setup Steps */}
        <div className="space-y-4 mb-8">
          {setupSteps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-slate-200 hover:shadow-lg transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white font-bold ${
                        step.status === 'complete' ? 'bg-green-500' : 'bg-slate-400'
                      }`}>
                        {step.status === 'complete' ? <CheckCircle2 className="w-5 h-5" /> : index + 1}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{step.title}</CardTitle>
                        <p className="text-sm text-slate-600 mt-1">{step.description}</p>
                      </div>
                    </div>
                    {step.status === 'complete' && (
                      <Badge className="bg-green-100 text-green-700 border-green-200">Complete</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-slate-50 rounded-lg p-4 mb-3">
                    <ul className="space-y-2 text-sm text-slate-700">
                      {step.instructions.map((instruction, i) => (
                        <li key={i} className="flex items-start gap-2">
                          {instruction.startsWith('•') ? (
                            <span className="ml-4">{instruction}</span>
                          ) : (
                            <>
                              <span className="text-orange-500 mt-0.5">→</span>
                              <span>{instruction}</span>
                            </>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-orange-600 border-orange-200 hover:bg-orange-50"
                    onClick={() => window.open(step.link, '_blank')}
                  >
                    {step.link.includes('dashboard') ? 'Go to Settings' : 'Open AWS Console'}
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Integration Flow Diagram */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-cyan-600" />
              How It Works
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                <div className="h-10 w-10 rounded-full bg-cyan-500 text-white flex items-center justify-center font-bold">1</div>
                <div>
                  <p className="font-semibold text-slate-900">Device Tracking</p>
                  <p className="text-sm text-slate-600">User's location sent to Amazon Location Service geofences</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                <div className="h-10 w-10 rounded-full bg-cyan-500 text-white flex items-center justify-center font-bold">2</div>
                <div>
                  <p className="font-semibold text-slate-900">Geofence Trigger</p>
                  <p className="text-sm text-slate-600">EventBridge fires when entering toll plaza geofence</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                <div className="h-10 w-10 rounded-full bg-cyan-500 text-white flex items-center justify-center font-bold">3</div>
                <div>
                  <p className="font-semibold text-slate-900">Function Execution</p>
                  <p className="text-sm text-slate-600">detectTollCrossing function processes event and creates notification</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                <div className="h-10 w-10 rounded-full bg-cyan-500 text-white flex items-center justify-center font-bold">4</div>
                <div>
                  <p className="font-semibold text-slate-900">Payment Processing</p>
                  <p className="text-sm text-slate-600">Toll authority ALPR triggers processTollPayment via API</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Backend Functions Created */}
        <Card className="mt-8 border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <CheckCircle2 className="w-5 h-5" />
              Backend Functions Ready
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-green-700 mb-3">
              Your AWS integration functions have been created and are ready to use once you configure AWS credentials:
            </p>
            <ul className="space-y-2 text-sm text-green-700">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <code className="bg-green-100 px-2 py-1 rounded">functions/aws/detectTollCrossing.js</code>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <code className="bg-green-100 px-2 py-1 rounded">functions/aws/processTollPayment.js</code>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <code className="bg-green-100 px-2 py-1 rounded">functions/aws/syncGeofences.js</code>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}