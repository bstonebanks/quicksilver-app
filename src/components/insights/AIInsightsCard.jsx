import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp, Lightbulb, DollarSign, Loader2, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

export default function AIInsightsCard() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['tollAIInsights'],
    queryFn: async () => {
      const response = await base44.functions.invoke('getTollAIInsights');
      return response.data;
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
  });

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6">
          <p className="text-red-700 text-sm">Failed to load AI insights</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="border-slate-200">
        <CardContent className="p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-600 mx-auto mb-3" />
          <p className="text-slate-600">Analyzing your toll data...</p>
        </CardContent>
      </Card>
    );
  }

  const { insights, stats } = data || {};

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-cyan-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-xl">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            AI-Powered Insights
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Payment Plan Recommendation */}
        {insights?.payment_plan && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-5 border-2 border-purple-200"
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="h-8 w-8 rounded-lg bg-purple-500 flex items-center justify-center flex-shrink-0">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-900 mb-1">Recommended Payment Plan</h3>
                <p className="text-lg font-semibold text-purple-700 mb-2">
                  {insights.payment_plan.recommendation}
                </p>
                <p className="text-sm text-slate-700 mb-2">
                  {insights.payment_plan.reasoning}
                </p>
                {insights.payment_plan.potential_savings && (
                  <Badge className="bg-green-100 text-green-700 border-green-200">
                    💰 {insights.payment_plan.potential_savings}
                  </Badge>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Cost Prediction */}
        {insights?.cost_prediction && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-5 border-2 border-cyan-200"
          >
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-lg bg-cyan-500 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-900 mb-2">Next Month Prediction</h3>
                <div className="flex items-baseline gap-2 mb-2">
                  <p className="text-3xl font-bold text-cyan-700">
                    ${insights.cost_prediction.next_month_estimate?.toFixed(2) || '0.00'}
                  </p>
                  <Badge variant="outline" className="text-xs">
                    {insights.cost_prediction.confidence}
                  </Badge>
                </div>
                {insights.cost_prediction.factors && (
                  <div className="space-y-1">
                    {insights.cost_prediction.factors.slice(0, 3).map((factor, idx) => (
                      <p key={idx} className="text-xs text-slate-600">• {factor}</p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Savings Tips */}
        {insights?.savings_tips && insights.savings_tips.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-5 border-2 border-amber-200"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-amber-500 flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-slate-900">Money-Saving Tips</h3>
            </div>
            <div className="space-y-3">
              {insights.savings_tips.map((tip, idx) => (
                <div key={idx} className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900 text-sm mb-1">{tip.title}</p>
                      <p className="text-xs text-slate-700">{tip.description}</p>
                    </div>
                    {tip.estimated_savings && (
                      <Badge className="bg-green-100 text-green-700 text-xs whitespace-nowrap">
                        {tip.estimated_savings}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Driving Patterns */}
        {insights?.driving_patterns && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-slate-100 rounded-xl p-4"
          >
            <p className="text-sm text-slate-700 mb-1">
              <strong>Your Pattern:</strong> {insights.driving_patterns.summary}
            </p>
            {insights.driving_patterns.peak_usage_times && (
              <p className="text-xs text-slate-600">
                {insights.driving_patterns.peak_usage_times}
              </p>
            )}
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}