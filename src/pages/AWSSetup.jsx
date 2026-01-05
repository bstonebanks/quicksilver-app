import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, Loader2, Database, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

export default function AWSSetup() {
  const [loading, setLoading] = useState(false);
  const [listing, setListing] = useState(false);
  const [result, setResult] = useState(null);
  const [existingTables, setExistingTables] = useState(null);

  const handleListTables = async () => {
    setListing(true);
    try {
      const response = await base44.functions.invoke('setupDynamoDB', { action: 'list' });
      setExistingTables(response.data.tables);
    } catch (error) {
      alert('Error listing tables: ' + (error.response?.data?.error || error.message));
    } finally {
      setListing(false);
    }
  };

  const handleCreateTables = async () => {
    setLoading(true);
    setResult(null);
    try {
      const response = await base44.functions.invoke('setupDynamoDB', { action: 'create' });
      setResult(response.data);
      handleListTables();
    } catch (error) {
      alert('Error creating tables: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">AWS DynamoDB Setup</h1>
          <p className="text-slate-600">Create and manage DynamoDB tables for QuickSilver</p>
        </div>

        {/* Setup Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-cyan-600" />
              Table Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button
                onClick={handleListTables}
                disabled={listing}
                variant="outline"
                className="border-slate-300"
              >
                {listing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    List Existing Tables
                  </>
                )}
              </Button>

              <Button
                onClick={handleCreateTables}
                disabled={loading}
                className="bg-gradient-to-r from-slate-600 to-blue-900"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Tables...
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4 mr-2" />
                    Create All Tables
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Existing Tables */}
        {existingTables && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Existing Tables in AWS</CardTitle>
            </CardHeader>
            <CardContent>
              {existingTables.length === 0 ? (
                <p className="text-slate-600">No tables found. Click "Create All Tables" to set up.</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {existingTables.map((table) => (
                    <div key={table} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <CheckCircle2 className="w-4 h-4 text-green-600 inline mr-2" />
                      <span className="text-sm text-slate-900">{table}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {result && (
          <Card>
            <CardHeader>
              <CardTitle>Setup Results</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 mb-4">{result.message}</p>
              <div className="space-y-3">
                {result.results?.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"
                  >
                    <div className="flex items-center gap-3">
                      {item.status === 'created' ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : item.status === 'exists' ? (
                        <CheckCircle2 className="w-5 h-5 text-blue-600" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-600" />
                      )}
                      <div>
                        <p className="font-medium text-slate-900">{item.table}</p>
                        <p className="text-xs text-slate-600">{item.message}</p>
                      </div>
                    </div>
                    <Badge
                      className={
                        item.status === 'created'
                          ? 'bg-green-100 text-green-800'
                          : item.status === 'exists'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-red-100 text-red-800'
                      }
                    >
                      {item.status}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card className="mt-8 border-amber-200 bg-amber-50">
          <CardContent className="p-6">
            <h3 className="font-bold text-amber-900 mb-3">Setup Instructions</h3>
            <ol className="space-y-2 text-sm text-amber-800">
              <li><strong>1. Check AWS Credentials:</strong> Make sure AWS_REGION, AWS_ACCESS_KEY_ID, and AWS_SECRET_ACCESS_KEY are set in your environment variables.</li>
              <li><strong>2. List Tables:</strong> Click "List Existing Tables" to see what's already in your AWS account.</li>
              <li><strong>3. Create Tables:</strong> Click "Create All Tables" to set up the DynamoDB tables with proper schema.</li>
              <li><strong>4. Verify:</strong> All tables should show "created" or "exists" status.</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}