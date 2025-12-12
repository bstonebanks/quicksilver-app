import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Smartphone, Radio, Zap, Database, Bell, Shield, 
  Cloud, ArrowRight, MapPin, CreditCard, Server
} from 'lucide-react';
import { motion } from 'framer-motion';

const ServiceBox = ({ icon: Icon, name, description, color, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay }}
    className={`${color} rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all`}
  >
    <Icon className="w-8 h-8 mb-3" />
    <h3 className="font-bold text-lg mb-2">{name}</h3>
    <p className="text-sm opacity-90">{description}</p>
  </motion.div>
);

const Arrow = ({ vertical = false, dashed = false }) => (
  <div className={`flex items-center justify-center ${vertical ? 'flex-col' : ''}`}>
    <ArrowRight className={`w-6 h-6 text-slate-400 ${vertical ? 'rotate-90' : ''} ${dashed ? 'opacity-50' : ''}`} />
  </div>
);

export default function Architecture() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">AWS Architecture</h1>
          <p className="text-slate-600">Complete system design for QuickSilver Instant Pay</p>
        </div>

        {/* Architecture Diagram */}
        <Card className="border-slate-200 mb-8 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-slate-900 to-slate-800 text-white">
            <CardTitle className="flex items-center gap-2">
              <Cloud className="w-6 h-6" />
              System Architecture Diagram
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 bg-white">
            
            {/* Layer 1: Client Layer */}
            <div className="mb-8">
              <Badge className="mb-4 bg-blue-100 text-blue-700 border-blue-200 border text-sm px-3 py-1">
                Client Layer
              </Badge>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ServiceBox
                  icon={Smartphone}
                  name="Mobile/Web App"
                  description="React frontend with location tracking"
                  color="bg-gradient-to-br from-blue-500 to-blue-700"
                  delay={0.1}
                />
                <ServiceBox
                  icon={MapPin}
                  name="GPS Module"
                  description="Browser geolocation API"
                  color="bg-gradient-to-br from-purple-500 to-purple-700"
                  delay={0.2}
                />
              </div>
            </div>

            <Arrow vertical />

            {/* Layer 2: AWS Frontend Services */}
            <div className="my-8">
              <Badge className="mb-4 bg-cyan-100 text-cyan-700 border-cyan-200 border text-sm px-3 py-1">
                AWS Frontend & CDN
              </Badge>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ServiceBox
                  icon={Cloud}
                  name="AWS Amplify"
                  description="Hosting + CI/CD pipeline"
                  color="bg-gradient-to-br from-orange-500 to-red-600"
                  delay={0.1}
                />
                <ServiceBox
                  icon={Cloud}
                  name="CloudFront CDN"
                  description="Global content delivery"
                  color="bg-gradient-to-br from-orange-500 to-red-600"
                  delay={0.2}
                />
                <ServiceBox
                  icon={Shield}
                  name="Route 53"
                  description="DNS management"
                  color="bg-gradient-to-br from-orange-500 to-red-600"
                  delay={0.3}
                />
              </div>
            </div>

            <Arrow vertical />

            {/* Layer 3: Location Services */}
            <div className="my-8">
              <Badge className="mb-4 bg-green-100 text-green-700 border-green-200 border text-sm px-3 py-1">
                Location & Geofencing Layer
              </Badge>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ServiceBox
                  icon={Radio}
                  name="Amazon Location Service"
                  description="GPS tracking + geofence management"
                  color="bg-gradient-to-br from-green-500 to-emerald-700"
                  delay={0.1}
                />
                <ServiceBox
                  icon={MapPin}
                  name="Geofence Collection"
                  description="5+ toll plaza boundaries"
                  color="bg-gradient-to-br from-teal-500 to-cyan-700"
                  delay={0.2}
                />
              </div>
            </div>

            <Arrow vertical />

            {/* Layer 4: Event Processing */}
            <div className="my-8">
              <Badge className="mb-4 bg-purple-100 text-purple-700 border-purple-200 border text-sm px-3 py-1">
                Event Processing Layer
              </Badge>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ServiceBox
                  icon={Zap}
                  name="EventBridge"
                  description="Route geofence ENTER/EXIT events"
                  color="bg-gradient-to-br from-purple-500 to-purple-700"
                  delay={0.1}
                />
                <ServiceBox
                  icon={Server}
                  name="AWS Lambda"
                  description="Process events + business logic"
                  color="bg-gradient-to-br from-indigo-500 to-indigo-700"
                  delay={0.2}
                />
                <ServiceBox
                  icon={Database}
                  name="SQS Queue"
                  description="Reliable message processing"
                  color="bg-gradient-to-br from-pink-500 to-rose-700"
                  delay={0.3}
                />
              </div>
            </div>

            <Arrow vertical />

            {/* Layer 5: Data & Storage */}
            <div className="my-8">
              <Badge className="mb-4 bg-amber-100 text-amber-700 border-amber-200 border text-sm px-3 py-1">
                Data Layer
              </Badge>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ServiceBox
                  icon={Database}
                  name="DynamoDB"
                  description="Trips, vehicles, payment methods"
                  color="bg-gradient-to-br from-blue-600 to-blue-800"
                  delay={0.1}
                />
                <ServiceBox
                  icon={Shield}
                  name="Cognito"
                  description="User authentication & management"
                  color="bg-gradient-to-br from-red-500 to-rose-700"
                  delay={0.2}
                />
                <ServiceBox
                  icon={Database}
                  name="S3 Storage"
                  description="Receipts & documents"
                  color="bg-gradient-to-br from-green-600 to-green-800"
                  delay={0.3}
                />
              </div>
            </div>

            <Arrow vertical />

            {/* Layer 6: Notifications */}
            <div className="my-8">
              <Badge className="mb-4 bg-red-100 text-red-700 border-red-200 border text-sm px-3 py-1">
                Notification Layer
              </Badge>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ServiceBox
                  icon={Bell}
                  name="Amazon SNS"
                  description="Push notifications to mobile"
                  color="bg-gradient-to-br from-red-500 to-pink-600"
                  delay={0.1}
                />
                <ServiceBox
                  icon={Bell}
                  name="Amazon SES"
                  description="Email receipts & confirmations"
                  color="bg-gradient-to-br from-orange-500 to-amber-600"
                  delay={0.2}
                />
              </div>
            </div>

            <Arrow vertical />

            {/* Layer 7: Payment Processing */}
            <div className="my-8">
              <Badge className="mb-4 bg-slate-100 text-slate-700 border-slate-200 border text-sm px-3 py-1">
                Payment Layer
              </Badge>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ServiceBox
                  icon={CreditCard}
                  name="Stripe API"
                  description="Payment processing"
                  color="bg-gradient-to-br from-indigo-600 to-purple-700"
                  delay={0.1}
                />
                <ServiceBox
                  icon={Shield}
                  name="AWS KMS"
                  description="Encrypt sensitive payment data"
                  color="bg-gradient-to-br from-slate-600 to-slate-800"
                  delay={0.2}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Flow */}
        <Card className="border-slate-200 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-cyan-600" />
              Auto-Detection Flow
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-cyan-500 text-white flex items-center justify-center font-bold flex-shrink-0">1</div>
                <div>
                  <p className="font-semibold text-slate-900">User Location Update</p>
                  <p className="text-sm text-slate-600">Mobile app sends GPS coordinates to Amazon Location Service every 30 seconds</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-cyan-500 text-white flex items-center justify-center font-bold flex-shrink-0">2</div>
                <div>
                  <p className="font-semibold text-slate-900">Geofence Detection</p>
                  <p className="text-sm text-slate-600">Location Service checks if coordinates intersect with any toll plaza geofence</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-cyan-500 text-white flex items-center justify-center font-bold flex-shrink-0">3</div>
                <div>
                  <p className="font-semibold text-slate-900">EventBridge Trigger</p>
                  <p className="text-sm text-slate-600">ENTER event published to EventBridge with toll location details</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-cyan-500 text-white flex items-center justify-center font-bold flex-shrink-0">4</div>
                <div>
                  <p className="font-semibold text-slate-900">Lambda Processing</p>
                  <p className="text-sm text-slate-600">Lambda function creates pending trip record in DynamoDB with toll amount</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-cyan-500 text-white flex items-center justify-center font-bold flex-shrink-0">5</div>
                <div>
                  <p className="font-semibold text-slate-900">Push Notification</p>
                  <p className="text-sm text-slate-600">SNS sends notification: "Golden Gate Bridge toll detected - $8.75. Tap to pay."</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-cyan-500 text-white flex items-center justify-center font-bold flex-shrink-0">6</div>
                <div>
                  <p className="font-semibold text-slate-900">User Confirms Payment</p>
                  <p className="text-sm text-slate-600">User taps notification → Lambda processes payment via Stripe → updates trip status to "paid"</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-cyan-500 text-white flex items-center justify-center font-bold flex-shrink-0">7</div>
                <div>
                  <p className="font-semibold text-slate-900">Confirmation</p>
                  <p className="text-sm text-slate-600">SES sends email receipt with confirmation number</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Service Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle>AWS Services Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <span className="font-medium text-slate-900">Amazon Location Service</span>
                  <Badge className="bg-green-100 text-green-700">Core</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <span className="font-medium text-slate-900">AWS Lambda</span>
                  <Badge className="bg-green-100 text-green-700">Core</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <span className="font-medium text-slate-900">Amazon DynamoDB</span>
                  <Badge className="bg-green-100 text-green-700">Core</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <span className="font-medium text-slate-900">Amazon SNS</span>
                  <Badge className="bg-blue-100 text-blue-700">Notifications</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <span className="font-medium text-slate-900">EventBridge</span>
                  <Badge className="bg-purple-100 text-purple-700">Events</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <span className="font-medium text-slate-900">AWS Amplify</span>
                  <Badge className="bg-orange-100 text-orange-700">Hosting</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <span className="font-medium text-slate-900">Amazon Cognito</span>
                  <Badge className="bg-red-100 text-red-700">Auth</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <span className="font-medium text-slate-900">CloudFront CDN</span>
                  <Badge className="bg-slate-100 text-slate-700">CDN</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle>Estimated Monthly Costs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-700">Amazon Location Service</span>
                  <span className="font-bold text-slate-900">$10-30</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-700">Lambda Executions</span>
                  <span className="font-bold text-slate-900">$5-15</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-700">DynamoDB</span>
                  <span className="font-bold text-slate-900">$10-25</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-700">SNS + SES</span>
                  <span className="font-bold text-slate-900">$5-10</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-700">Amplify Hosting</span>
                  <span className="font-bold text-slate-900">$0-15</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-700">Cognito (Free tier)</span>
                  <span className="font-bold text-slate-900">$0</span>
                </div>
                <div className="border-t-2 border-slate-300 pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900">Total (10K users)</span>
                    <span className="font-bold text-2xl text-cyan-600">$50-120</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Implementation Note */}
        <Card className="border-amber-200 bg-amber-50 mt-8">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center flex-shrink-0">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-amber-900 mb-2">Implementation Status</h3>
                <p className="text-amber-800 text-sm leading-relaxed mb-3">
                  The current frontend demonstrates the UI/UX for AWS Location Service integration. To enable full functionality, you'll need to:
                </p>
                <ul className="space-y-1 text-sm text-amber-800">
                  <li>✓ Frontend UI (complete)</li>
                  <li>• Set up Amazon Location Service tracker and geofences</li>
                  <li>• Configure EventBridge rules for geofence events</li>
                  <li>• Deploy Lambda functions for event processing</li>
                  <li>• Set up SNS topics for push notifications</li>
                  <li>• Configure Cognito user pools</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}