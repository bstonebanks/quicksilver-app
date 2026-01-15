import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, AlertCircle, Copy, ExternalLink, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";

export default function AWSSetupGuide() {
  const [updating, setUpdating] = useState(false);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const updateUserRoles = async () => {
    setUpdating(true);
    try {
      const response = await base44.functions.invoke('updateUserRoles');
      toast.success(response.data.message);
    } catch (error) {
      toast.error('Failed to update user roles: ' + error.message);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50 py-12">
      <div className="max-w-5xl mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-3">AWS Deployment Guide</h1>
          <p className="text-lg text-slate-600">Complete setup instructions for deploying QuickSilver to AWS</p>
        </div>

        <Alert className="mb-6 bg-blue-50 border-blue-200">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Prerequisites:</strong> You'll need an AWS account with appropriate permissions to create and manage resources.
          </AlertDescription>
        </Alert>

        <Card className="mb-6 border-purple-200 bg-purple-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-purple-600" />
                <div>
                  <h3 className="font-semibold text-purple-900">Admin Management</h3>
                  <p className="text-sm text-purple-700">Update user roles (keep Brooke, Hassan, Liselle as admins)</p>
                </div>
              </div>
              <Button 
                onClick={updateUserRoles}
                disabled={updating}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {updating ? 'Updating...' : 'Update User Roles'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-7 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="iam">IAM Setup</TabsTrigger>
            <TabsTrigger value="dynamodb">DynamoDB</TabsTrigger>
            <TabsTrigger value="location">Location</TabsTrigger>
            <TabsTrigger value="sns">SNS</TabsTrigger>
            <TabsTrigger value="lambda">Lambda</TabsTrigger>
            <TabsTrigger value="amplify">Amplify</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>AWS Services Overview</CardTitle>
                <CardDescription>QuickSilver uses the following AWS services</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-slate-900">DynamoDB</h3>
                    <p className="text-sm text-slate-600">NoSQL database for storing vehicles, trips, payments, and notifications</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-slate-900">Location Service</h3>
                    <p className="text-sm text-slate-600">Geofencing for automatic toll detection when vehicles enter toll zones</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-slate-900">Simple Notification Service (SNS)</h3>
                    <p className="text-sm text-slate-600">SMS and push notifications for payment receipts and toll alerts</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-slate-900">Lambda Functions</h3>
                    <p className="text-sm text-slate-600">Serverless functions for processing toll crossings and payments</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-slate-900">EventBridge</h3>
                    <p className="text-sm text-slate-600">Event routing for geofence alerts to trigger Lambda functions</p>
                  </div>
                </div>

                <Alert className="mt-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Estimated Monthly Cost:</strong> For typical usage (100-500 trips/month), expect $10-30/month based on AWS pricing.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* IAM Setup Tab */}
          <TabsContent value="iam">
            <Card>
              <CardHeader>
                <CardTitle>IAM User & Permissions Setup</CardTitle>
                <CardDescription>Create an IAM user with appropriate permissions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold text-slate-900 mb-3">Step 1: Create IAM User</h3>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-slate-700 ml-2">
                    <li>Go to AWS Console → IAM → Users</li>
                    <li>Click "Create user"</li>
                    <li>Name: <code className="bg-slate-100 px-2 py-0.5 rounded">quicksilver-app</code></li>
                    <li>Check "Provide user access to the AWS Management Console" (optional)</li>
                    <li>Click Next</li>
                  </ol>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900 mb-3">Step 2: Attach Policies</h3>
                  <p className="text-sm text-slate-600 mb-3">Attach the following AWS managed policies:</p>
                  <div className="space-y-2">
                    {[
                      'AmazonDynamoDBFullAccess',
                      'AmazonLocationFullAccess',
                      'AmazonSESFullAccess',
                      'AWSLambda_FullAccess',
                      'AmazonEventBridgeFullAccess'
                    ].map((policy) => (
                      <div key={policy} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <code className="text-sm">{policy}</code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(policy)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900 mb-3">Step 3: Create Access Keys</h3>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-slate-700 ml-2">
                    <li>Select the created user</li>
                    <li>Go to "Security credentials" tab</li>
                    <li>Click "Create access key"</li>
                    <li>Choose "Application running outside AWS"</li>
                    <li>Save the Access Key ID and Secret Access Key</li>
                  </ol>
                </div>

                <Alert className="bg-red-50 border-red-200 mb-4">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    <strong>⚠️ CRITICAL: Verify Policies Are Attached!</strong>
                    <div className="mt-2 text-sm">
                      After creating the IAM user, you MUST attach the policies listed above. Common issue: policies selected but not actually attached.
                      <div className="mt-2">
                        <strong>To verify:</strong>
                        <ol className="list-decimal list-inside ml-2 space-y-1">
                          <li>Go to IAM → Users → Select your user</li>
                          <li>Click "Permissions" tab</li>
                          <li>Confirm all 5 policies are listed under "Permissions policies"</li>
                          <li>If missing, click "Add permissions" → "Attach policies directly"</li>
                        </ol>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Store these credentials securely in Base44's environment variables (Settings → Environment Variables)
                  </AlertDescription>
                </Alert>

                <div>
                  <h3 className="font-semibold text-slate-900 mb-3">Environment Variables to Set</h3>
                  <div className="space-y-2">
                    <div className="p-3 bg-slate-900 text-slate-100 rounded-lg font-mono text-sm">
                      <div>AWS_ACCESS_KEY_ID=your_access_key_here</div>
                      <div>AWS_SECRET_ACCESS_KEY=your_secret_key_here</div>
                      <div>AWS_REGION=us-east-1</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* DynamoDB Tab */}
          <TabsContent value="dynamodb">
            <Card>
              <CardHeader>
                <CardTitle>DynamoDB Tables Setup</CardTitle>
                <CardDescription>Create the required database tables</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    <strong>Easy Setup:</strong> Use the built-in setup page at /migratetodynamodb to automatically create all tables!
                  </AlertDescription>
                </Alert>

                <div>
                  <h3 className="font-semibold text-slate-900 mb-3">Required Tables</h3>
                  <div className="space-y-4">
                    {[
                      { name: 'QuickSilver-Vehicles', desc: 'Store user vehicles and license plates' },
                      { name: 'QuickSilver-PaymentMethods', desc: 'Store payment cards and auto-pay settings' },
                      { name: 'QuickSilver-Trips', desc: 'Record toll crossings and payment history' },
                      { name: 'QuickSilver-TollPasses', desc: 'Manage toll pass accounts (E-ZPass, etc.)' },
                      { name: 'QuickSilver-Notifications', desc: 'User notifications and alerts' }
                    ].map((table) => (
                      <div key={table.name} className="p-4 bg-slate-50 rounded-lg">
                        <div className="font-mono text-sm font-semibold text-slate-900 mb-1">{table.name}</div>
                        <div className="text-sm text-slate-600">{table.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900 mb-3">Table Schema (All Tables)</h3>
                  <div className="p-4 bg-slate-900 text-slate-100 rounded-lg font-mono text-sm space-y-1">
                    <div><strong>Partition Key:</strong> userID (String)</div>
                    <div><strong>Sort Key:</strong> id (String)</div>
                    <div><strong>Billing Mode:</strong> On-Demand</div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900 mb-3">Manual Setup (if needed)</h3>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-slate-700 ml-2">
                    <li>Go to AWS Console → DynamoDB → Tables</li>
                    <li>Click "Create table"</li>
                    <li>Enter table name (e.g., QuickSilver-Vehicles)</li>
                    <li>Partition key: <code className="bg-slate-100 px-2 py-0.5 rounded">userID</code> (String)</li>
                    <li>Sort key: <code className="bg-slate-100 px-2 py-0.5 rounded">id</code> (String)</li>
                    <li>Keep default settings, select "On-demand" capacity mode</li>
                    <li>Click "Create table"</li>
                    <li>Repeat for all 5 tables</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Location Service Tab */}
          <TabsContent value="location">
            <Card>
              <CardHeader>
                <CardTitle>AWS Location Service Setup</CardTitle>
                <CardDescription>Configure geofencing for automatic toll detection</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold text-slate-900 mb-3">Step 1: Create Geofence Collection</h3>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-slate-700 ml-2">
                    <li>Go to AWS Console → Location Service → Geofence collections</li>
                    <li>Click "Create geofence collection"</li>
                    <li>Name: <code className="bg-slate-100 px-2 py-0.5 rounded">quicksilver-tolls</code></li>
                    <li>Keep default settings</li>
                    <li>Click "Create geofence collection"</li>
                  </ol>
                </div>

                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    <strong>Quick Setup:</strong> Use the /geofences page to automatically create all toll location geofences!
                  </AlertDescription>
                </Alert>

                <div>
                  <h3 className="font-semibold text-slate-900 mb-3">Step 2: Create Tracker</h3>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-slate-700 ml-2">
                    <li>Go to Location Service → Trackers</li>
                    <li>Click "Create tracker"</li>
                    <li>Name: <code className="bg-slate-100 px-2 py-0.5 rounded">quicksilver-tracker</code></li>
                    <li>Position filtering: "Time-based"</li>
                    <li>Click "Create tracker"</li>
                  </ol>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900 mb-3">Step 3: Link Tracker to Geofence Collection</h3>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-slate-700 ml-2">
                    <li>Open the tracker you created</li>
                    <li>Go to "Geofencing" tab</li>
                    <li>Click "Add geofence collection"</li>
                    <li>Select <code className="bg-slate-100 px-2 py-0.5 rounded">quicksilver-tolls</code></li>
                    <li>Click "Add"</li>
                  </ol>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900 mb-3">Step 4: Set Up EventBridge Rule</h3>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-slate-700 ml-2">
                    <li>Go to EventBridge → Rules</li>
                    <li>Click "Create rule"</li>
                    <li>Name: <code className="bg-slate-100 px-2 py-0.5 rounded">quicksilver-geofence-alerts</code></li>
                    <li>Event source: "AWS events or EventBridge partner events"</li>
                    <li>Event pattern:
                      <div className="mt-2 p-3 bg-slate-900 text-slate-100 rounded-lg font-mono text-xs">
                        {`{
  "source": ["aws.geo"],
  "detail-type": ["Location Geofence Event"]
}`}
                      </div>
                    </li>
                    <li>Target: Lambda function (lambdaProcessTollCrossing)</li>
                    <li>Click "Create"</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SNS Tab */}
          <TabsContent value="sns">
            <Card>
              <CardHeader>
                <CardTitle>Amazon SNS Setup</CardTitle>
                <CardDescription>Configure SMS and push notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert className="bg-blue-50 border-blue-200">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    <strong>SMS Pricing:</strong> SNS SMS charges vary by country. US SMS typically costs $0.00645 per message.
                  </AlertDescription>
                </Alert>

                <div>
                  <h3 className="font-semibold text-slate-900 mb-3">Step 1: Set Up SMS Messaging</h3>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-slate-700 ml-2">
                    <li>Go to AWS Console → Amazon SNS → Text messaging (SMS)</li>
                    <li>Click "Publish text message" to test SMS functionality</li>
                    <li>For production, go to "Mobile" → "Text messaging (SMS)"</li>
                    <li>Configure SMS settings:
                      <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                        <li>Default message type: Transactional</li>
                        <li>Account spend limit: Set appropriate limit</li>
                        <li>Default sender ID: QuickSilver (if supported in your region)</li>
                      </ul>
                    </li>
                  </ol>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900 mb-3">Step 2: Create SNS Topic (Optional - for Push)</h3>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-slate-700 ml-2">
                    <li>Go to SNS → Topics</li>
                    <li>Click "Create topic"</li>
                    <li>Type: Standard</li>
                    <li>Name: <code className="bg-slate-100 px-2 py-0.5 rounded">quicksilver-notifications</code></li>
                    <li>Click "Create topic"</li>
                  </ol>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900 mb-3">Step 3: Store User Phone Numbers</h3>
                  <p className="text-sm text-slate-600 mb-2">Update User entity to include phone numbers:</p>
                  <div className="p-3 bg-slate-900 text-slate-100 rounded-lg font-mono text-sm">
                    {`{
  "phone_number": {
    "type": "string",
    "description": "User phone number for SMS (E.164 format)"
  }
}`}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900 mb-3">Step 4: Request Production SMS Access</h3>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-slate-700 ml-2">
                    <li>Go to SNS → Text messaging (SMS)</li>
                    <li>Check if you're in SMS sandbox mode</li>
                    <li>If yes, click "Move to production"</li>
                    <li>Fill out the request form:
                      <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                        <li>Use case: Transactional toll payment receipts</li>
                        <li>Expected monthly volume</li>
                        <li>Opt-in process description</li>
                      </ul>
                    </li>
                    <li>Submit and wait for approval (usually 24-48 hours)</li>
                  </ol>
                </div>

                <Alert className="bg-yellow-50 border-yellow-200">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-800">
                    <strong>Phone Format:</strong> All phone numbers must be in E.164 format (e.g., +14155551234)
                  </AlertDescription>
                </Alert>

                <div>
                  <h3 className="font-semibold text-slate-900 mb-3">Update Lambda Function</h3>
                  <p className="text-sm text-slate-600 mb-2">Lambda will use SNS to send SMS receipts:</p>
                  <div className="p-3 bg-slate-900 text-slate-100 rounded-lg font-mono text-xs">
                    {`await sns.publish({
  PhoneNumber: userPhoneNumber,
  Message: "Payment receipt message"
});`}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Lambda Tab */}
          <TabsContent value="lambda">
            <Card>
              <CardHeader>
                <CardTitle>Lambda Functions Setup</CardTitle>
                <CardDescription>Deploy serverless functions for event processing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold text-slate-900 mb-3">Required Lambda Functions</h3>
                  <div className="space-y-3">
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <div className="font-semibold text-slate-900 mb-1">lambdaProcessTollCrossing</div>
                      <div className="text-sm text-slate-600 mb-2">Triggered by geofence ENTER events to create trip records</div>
                      <div className="text-xs text-slate-500">Trigger: EventBridge → Location Geofence Event</div>
                    </div>
                    
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <div className="font-semibold text-slate-900 mb-1">lambdaProcessPayment</div>
                      <div className="text-sm text-slate-600 mb-2">Processes payment completion and sends email receipts</div>
                      <div className="text-xs text-slate-500">Trigger: Manual invocation from app</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900 mb-3">Step 1: Create Lambda Function</h3>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-slate-700 ml-2">
                    <li>Go to AWS Console → Lambda → Functions</li>
                    <li>Click "Create function"</li>
                    <li>Choose "Author from scratch"</li>
                    <li>Function name: <code className="bg-slate-100 px-2 py-0.5 rounded">lambdaProcessTollCrossing</code></li>
                    <li>Runtime: Node.js 18.x (or latest)</li>
                    <li>Architecture: x86_64</li>
                    <li>Click "Create function"</li>
                  </ol>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900 mb-3">Step 2: Deploy Function Code</h3>
                  <p className="text-sm text-slate-600 mb-2">Copy the code from <code className="bg-slate-100 px-2 py-0.5 rounded">functions/aws/lambdaProcessTollCrossing.js</code></p>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-slate-700 ml-2">
                    <li>In the Lambda function page, go to "Code" tab</li>
                    <li>Paste your function code</li>
                    <li>Click "Deploy"</li>
                  </ol>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900 mb-3">Step 3: Configure Environment Variables</h3>
                  <p className="text-sm text-slate-600 mb-2">Add these to the Lambda function configuration:</p>
                  <div className="p-3 bg-slate-900 text-slate-100 rounded-lg font-mono text-sm space-y-1">
                    <div>AWS_REGION=us-east-1</div>
                    <div>DYNAMODB_TABLE_TRIPS=QuickSilver-Trips</div>
                    <div>DYNAMODB_TABLE_NOTIFICATIONS=QuickSilver-Notifications</div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900 mb-3">Step 4: Set IAM Role Permissions</h3>
                  <p className="text-sm text-slate-600 mb-2">Ensure the Lambda execution role has these policies:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-slate-700 ml-4">
                    <li>AmazonDynamoDBFullAccess</li>
                    <li>AmazonSNSFullAccess</li>
                    <li>AmazonSNSFullAccess (for notifications)</li>
                    <li>CloudWatchLogsFullAccess</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900 mb-3">Step 5: Repeat for Other Functions</h3>
                  <p className="text-sm text-slate-600">Follow the same steps to create and deploy <code className="bg-slate-100 px-2 py-0.5 rounded">lambdaProcessPayment</code></p>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Testing:</strong> Use the "Test" tab in Lambda console to create test events and verify your functions work correctly.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Amplify Mobile Tab */}
          <TabsContent value="amplify">
            <Card>
              <CardHeader>
                <CardTitle>AWS Amplify Mobile Integration</CardTitle>
                <CardDescription>Convert to mobile app with push notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert className="bg-blue-50 border-blue-200">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    <strong>Two Approaches:</strong> Use Amplify Hosting for PWA or build native with React Native + Amplify SDK
                  </AlertDescription>
                </Alert>

                <div>
                  <h3 className="font-semibold text-slate-900 mb-3">Option 1: Progressive Web App (PWA) - Easiest</h3>
                  <p className="text-sm text-slate-600 mb-3">Deploy your current web app to Amplify Hosting and add PWA features:</p>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-slate-700 ml-2">
                    <li>Go to AWS Amplify Console</li>
                    <li>Click "Host web app"</li>
                    <li>Connect your Git repository (GitHub, GitLab, etc.)</li>
                    <li>Configure build settings for React + Vite</li>
                    <li>Deploy automatically on every commit</li>
                    <li>Users can "Add to Home Screen" for app-like experience</li>
                  </ol>
                  <div className="mt-3 p-3 bg-slate-900 text-slate-100 rounded-lg font-mono text-xs overflow-x-auto">
{`# Build Settings for Amplify
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm install
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*`}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900 mb-3">Option 2: Native Mobile App - Full Featured</h3>
                  <p className="text-sm text-slate-600 mb-3">Convert to React Native for iOS/Android with full native capabilities:</p>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-slate-700 ml-2">
                    <li>Install Expo or React Native CLI</li>
                    <li>Install AWS Amplify libraries:
                      <div className="mt-2 p-2 bg-slate-100 rounded text-xs font-mono">
                        npm install @aws-amplify/core @aws-amplify/push-notifications
                      </div>
                    </li>
                    <li>Configure Amplify in your app:
                      <div className="mt-2 p-2 bg-slate-100 rounded text-xs font-mono overflow-x-auto">
{`import { Amplify } from '@aws-amplify/core';

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: 'your-pool-id',
      userPoolClientId: 'your-client-id'
    }
  }
});`}
                      </div>
                    </li>
                    <li>Set up Push Notifications with AWS Pinpoint</li>
                    <li>Use Geofencing APIs for toll detection</li>
                    <li>Build and publish to App Store/Play Store</li>
                  </ol>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900 mb-3">Push Notifications (Native Apps)</h3>
                  <p className="text-sm text-slate-600 mb-2">Set up AWS Pinpoint for mobile push notifications:</p>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-slate-700 ml-2">
                    <li>Go to AWS Pinpoint Console</li>
                    <li>Create a new project: "quicksilver-mobile"</li>
                    <li>Configure push notification channels:
                      <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                        <li><strong>iOS:</strong> Upload APNs certificate or key</li>
                        <li><strong>Android:</strong> Add Firebase Cloud Messaging (FCM) server key</li>
                      </ul>
                    </li>
                    <li>Integrate Amplify Push Notifications in your React Native app</li>
                    <li>Request notification permissions from users</li>
                    <li>Register device tokens with Pinpoint</li>
                  </ol>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900 mb-3">Background Location Tracking</h3>
                  <p className="text-sm text-slate-600 mb-2">For real-time toll detection while app is in background:</p>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-slate-700 ml-2">
                    <li>Use React Native Geolocation or Expo Location</li>
                    <li>Request "Always Allow" location permission</li>
                    <li>Configure background task for location updates</li>
                    <li>Send coordinates to AWS Location Service tracker</li>
                    <li>AWS EventBridge triggers Lambda when entering toll geofence</li>
                  </ol>
                </div>

                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    <strong>Recommended:</strong> Start with Option 1 (PWA) for quick deployment, then migrate to native if you need full background tracking and offline support.
                  </AlertDescription>
                </Alert>

                <div>
                  <h3 className="font-semibold text-slate-900 mb-3">Key Differences</h3>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="font-semibold text-sm text-blue-900 mb-2">PWA (Web App)</div>
                      <ul className="text-xs text-blue-700 space-y-1">
                        <li>✓ Fast deployment</li>
                        <li>✓ Same codebase</li>
                        <li>✓ Works on all platforms</li>
                        <li>✗ Limited background tracking</li>
                        <li>✗ No App Store presence</li>
                      </ul>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="font-semibold text-sm text-green-900 mb-2">Native App</div>
                      <ul className="text-xs text-green-700 space-y-1">
                        <li>✓ Full background tracking</li>
                        <li>✓ Native push notifications</li>
                        <li>✓ App Store distribution</li>
                        <li>✗ Requires React Native rewrite</li>
                        <li>✗ Longer development time</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h3 className="font-semibold text-slate-900 mb-2">Documentation Links</h3>
                  <ul className="space-y-1 text-sm">
                    <li>
                      <a href="https://docs.amplify.aws/react/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        AWS Amplify for React (Web) →
                      </a>
                    </li>
                    <li>
                      <a href="https://docs.amplify.aws/react-native/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        AWS Amplify for React Native →
                      </a>
                    </li>
                    <li>
                      <a href="https://docs.amplify.aws/react-native/build-a-backend/push-notifications/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        Push Notifications Setup →
                      </a>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Final Checklist */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Deployment Checklist</CardTitle>
            <CardDescription>Verify everything is configured correctly</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                'IAM user created with appropriate permissions',
                'AWS credentials added to Base44 environment variables',
                'All 5 DynamoDB tables created with correct schema',
                'Geofence collection created and populated with toll locations',
                'Tracker created and linked to geofence collection',
                'EventBridge rule created to route geofence events to Lambda',
                'SNS SMS messaging configured and production access requested',
                'User phone numbers added to User entity',
                'Lambda functions created and deployed',
                'Lambda environment variables configured',
                'Lambda IAM roles have necessary permissions',
                'Test geofence detection with sample coordinates',
                'Test SMS sending functionality',
                'Verify payment processing and SMS receipts work end-to-end'
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                  <input type="checkbox" className="w-5 h-5 rounded border-slate-300" />
                  <span className="text-sm text-slate-700">{item}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 p-6 bg-gradient-to-r from-slate-800 to-blue-900 rounded-2xl text-white">
          <h3 className="text-xl font-bold mb-2">Need Help?</h3>
          <p className="text-slate-200 mb-4">For detailed AWS documentation and troubleshooting:</p>
          <div className="flex flex-wrap gap-3">
            <a href="https://docs.aws.amazon.com/dynamodb/" target="_blank" rel="noopener noreferrer">
              <Button variant="secondary" className="gap-2">
                DynamoDB Docs <ExternalLink className="w-4 h-4" />
              </Button>
            </a>
            <a href="https://docs.aws.amazon.com/location/" target="_blank" rel="noopener noreferrer">
              <Button variant="secondary" className="gap-2">
                Location Service Docs <ExternalLink className="w-4 h-4" />
              </Button>
            </a>
            <a href="https://docs.aws.amazon.com/lambda/" target="_blank" rel="noopener noreferrer">
              <Button variant="secondary" className="gap-2">
                Lambda Docs <ExternalLink className="w-4 h-4" />
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}