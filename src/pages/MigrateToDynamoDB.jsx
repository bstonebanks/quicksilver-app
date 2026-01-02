import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, CheckCircle2, AlertCircle, Loader2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function MigrateToDynamoDB() {
  const [migrating, setMigrating] = useState(false);
  const [result, setResult] = useState(null);

  const handleMigrate = async () => {
    setMigrating(true);
    setResult(null);
    
    try {
      const response = await base44.functions.invoke('migrateToDynamoDB');
      setResult(response.data);
    } catch (error) {
      setResult({ 
        success: false, 
        error: error.message || 'Migration failed' 
      });
    } finally {
      setMigrating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Migrate to DynamoDB</h1>
          <p className="text-slate-600">Transfer your existing Base44 data to AWS DynamoDB</p>
        </div>

        <Card className="border-slate-200 shadow-lg mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-cyan-600" />
              Migration Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-900 font-medium mb-2">What will be migrated:</p>
                <ul className="text-sm text-blue-800 space-y-1 ml-4">
                  <li>• Vehicles → QuickSilver-Vehicles table</li>
                  <li>• Payment Methods → QuickSilver-PaymentMethods table</li>
                  <li>• Trips → QuickSilver-Trips table</li>
                  <li>• Toll Passes → QuickSilver-TollPasses table</li>
                  <li>• Notifications → QuickSilver-Notifications table</li>
                </ul>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-sm text-amber-900 font-medium mb-2">⚠️ Important:</p>
                <ul className="text-sm text-amber-800 space-y-1 ml-4">
                  <li>• Make sure DynamoDB tables are created first</li>
                  <li>• Ensure AWS credentials are set in secrets</li>
                  <li>• This will copy data, not move it (Base44 data stays)</li>
                  <li>• You can run this multiple times safely</li>
                </ul>
              </div>

              <Button
                onClick={handleMigrate}
                disabled={migrating}
                className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
              >
                {migrating ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Migrating Data...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <ArrowRight className="w-5 h-5" />
                    Start Migration
                  </span>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className={`border-2 shadow-lg ${
              result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
            }`}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    result.success ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {result.success ? (
                      <CheckCircle2 className="w-6 h-6 text-green-600" />
                    ) : (
                      <AlertCircle className="w-6 h-6 text-red-600" />
                    )}
                  </div>

                  <div className="flex-1">
                    <h3 className={`text-xl font-bold mb-2 ${
                      result.success ? 'text-green-900' : 'text-red-900'
                    }`}>
                      {result.success ? 'Migration Successful!' : 'Migration Failed'}
                    </h3>
                    
                    <p className={`mb-4 ${
                      result.success ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {result.message || result.error}
                    </p>

                    {result.results && (
                      <div className="space-y-2">
                        {result.results.map((item, idx) => (
                          <div key={idx} className="bg-white rounded-lg p-3 border border-slate-200">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {item.status === 'success' ? (
                                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                                ) : item.status === 'error' ? (
                                  <AlertCircle className="w-4 h-4 text-red-600" />
                                ) : (
                                  <div className="w-4 h-4 rounded-full bg-slate-300" />
                                )}
                                <span className="font-medium text-slate-900">{item.entity}</span>
                              </div>
                              <div className="text-sm text-slate-600">
                                {item.status === 'success' ? (
                                  <span className="text-green-700 font-semibold">
                                    {item.count} records migrated
                                  </span>
                                ) : item.status === 'no data' ? (
                                  <span className="text-slate-500">No data to migrate</span>
                                ) : (
                                  <span className="text-red-700">{item.error}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {result.totalMigrated !== undefined && (
                      <div className="mt-4 p-4 bg-white rounded-lg border border-slate-200">
                        <p className="text-center text-slate-900">
                          <span className="text-3xl font-bold text-cyan-600">
                            {result.totalMigrated}
                          </span>
                          <span className="text-sm text-slate-600 ml-2">
                            total records migrated
                          </span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}