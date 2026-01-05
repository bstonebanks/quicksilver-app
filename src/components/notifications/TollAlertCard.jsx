import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, MapPin, CreditCard, Clock } from 'lucide-react';
import { motion } from "framer-motion";
import { format } from "date-fns";

export default function TollAlertCard({ notification, onPayNow, onDismiss }) {
  const metadata = notification.metadata || {};

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      <Card className="border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50 shadow-lg">
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center flex-shrink-0 shadow-lg">
              <AlertCircle className="w-7 h-7 text-white animate-pulse" />
            </div>

            <div className="flex-1">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-lg text-slate-900 mb-1">
                    {notification.title}
                  </h3>
                  <Badge className="bg-red-100 text-red-700 border border-red-200 text-xs">
                    ACTION REQUIRED
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-slate-900">
                    ${metadata.amount?.toFixed(2) || '0.00'}
                  </p>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <MapPin className="w-4 h-4 text-slate-500" />
                  <span className="font-medium">{metadata.toll_road}</span>
                  <span className="text-slate-500">•</span>
                  <span>{metadata.toll_location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span>Detected {format(new Date(notification.created_date), 'MMM d, h:mm a')}</span>
                </div>
                {metadata.license_plate && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="font-mono bg-slate-200 px-2 py-0.5 rounded text-slate-800">
                      {metadata.license_plate}
                    </span>
                  </div>
                )}
              </div>

              <div className="bg-amber-100 border border-amber-200 rounded-lg p-3 mb-4">
                <p className="text-xs text-amber-900">
                  <strong>⚠️ Pay within 48 hours</strong> to avoid penalties and additional fees.
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => onPayNow(notification)}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Pay Now
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onDismiss(notification.id)}
                  className="border-slate-300 hover:bg-slate-50"
                >
                  Later
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}