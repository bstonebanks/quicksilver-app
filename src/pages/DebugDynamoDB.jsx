import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle } from "lucide-react";

export default function DebugDynamoDB() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testCreate = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const response = await base44.functions.invoke('dynamodb', {
        operation: 'create',
        tableName: 'QuickSilver-Vehicles',
        data: {
          license_plate: 'TEST' + Date.now(),
          state: 'CA',
          nickname: 'Debug Test Car',
          make: 'Toyota',
          model: 'Camry',
          color: 'Silver',
          is_primary: false
        }
      });
      
      setResult({
        success: true,
        data: response.data,
        status: response.status,
        fullResponse: response
      });
    } catch (error) {
      setResult({
        success: false,
        error: error.message,
        response: error.response?.data,
        fullError: error
      });
    }
    
    setLoading(false);
  };

  const testList = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const response = await base44.functions.invoke('dynamodb', {
        operation: 'list',
        tableName: 'QuickSilver-Vehicles'
      });
      
      setResult({
        success: true,
        data: response.data,
        status: response.status,
        count: Array.isArray(response.data) ? response.data.length : 0,
        fullResponse: response
      });
    } catch (error) {
      setResult({
        success: false,
        error: error.message,
        response: error.response?.data,
        fullError: error
      });
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-6">DynamoDB Debug Console</h1>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Button onClick={testCreate} disabled={loading}>
            Test Create Vehicle
          </Button>
          <Button onClick={testList} disabled={loading} variant="outline">
            Test List Vehicles
          </Button>
        </div>

        {loading && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span>Processing...</span>
              </div>
            </CardContent>
          </Card>
        )}

        {result && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {result.success ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Success
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    Error
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {result.success ? (
                <>
                  <div>
                    <div className="text-sm font-semibold text-slate-600 mb-2">Response Data:</div>
                    <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-auto text-xs">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-600 mb-2">Status: {result.status}</div>
                    {result.count !== undefined && (
                      <div className="text-sm font-semibold text-slate-600">Items Count: {result.count}</div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <div className="text-sm font-semibold text-red-600 mb-2">Error Message:</div>
                    <pre className="bg-red-50 text-red-900 p-4 rounded-lg overflow-auto text-xs border border-red-200">
                      {result.error}
                    </pre>
                  </div>
                  {result.response && (
                    <div>
                      <div className="text-sm font-semibold text-red-600 mb-2">Response Details:</div>
                      <pre className="bg-red-50 text-red-900 p-4 rounded-lg overflow-auto text-xs border border-red-200">
                        {JSON.stringify(result.response, null, 2)}
                      </pre>
                    </div>
                  )}
                </>
              )}
              
              <details className="mt-4">
                <summary className="cursor-pointer text-sm text-slate-600 hover:text-slate-900">
                  Full Response Object
                </summary>
                <pre className="mt-2 bg-slate-100 p-4 rounded-lg overflow-auto text-xs">
                  {JSON.stringify(result.success ? result.fullResponse : result.fullError, null, 2)}
                </pre>
              </details>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Expected AWS DynamoDB Schema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div><strong>Table Name:</strong> QuickSilver-Vehicles</div>
              <div><strong>Partition Key:</strong> userID (String)</div>
              <div><strong>Sort Key:</strong> id (String)</div>
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="font-semibold text-yellow-800 mb-1">⚠️ Check Your AWS Console:</div>
                <ul className="text-yellow-700 text-xs space-y-1 ml-4 list-disc">
                  <li>Verify table exists: QuickSilver-Vehicles</li>
                  <li>Confirm Partition Key is "userID" (not "id")</li>
                  <li>Confirm Sort Key is "id"</li>
                  <li>Check the correct AWS region: {'{AWS_REGION}'}</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}