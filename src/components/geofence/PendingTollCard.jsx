import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

export default function PendingTollCard({ event, onConfirm, onDecline, loading }) {
  const isRecent = new Date() - new Date(event.detected_at) < 600000; // 10 minutes

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      <Card className={`border-2 ${isRecent ? 'border-orange-300 bg-orange-50' : 'border-slate-200'}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                isRecent ? 'bg-orange-500' : 'bg-slate-500'
              }`}>
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">{event.toll_location}</h3>
                <p className="text-sm text-slate-600">{event.toll_road}</p>
              </div>
            </div>
            <Badge className={isRecent ? 'bg-orange-500 text-white' : 'bg-slate-500 text-white'}>
              {isRecent ? 'JUST NOW' : 'Pending'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-3 border">
              <p className="text-xs text-slate-600 mb-1">Amount</p>
              <p className="text-xl font-bold text-slate-900">${event.amount.toFixed(2)}</p>
            </div>
            <div className="bg-white rounded-lg p-3 border">
              <p className="text-xs text-slate-600 mb-1">Detected</p>
              <p className="text-sm font-semibold text-slate-900">
                {format(new Date(event.detected_at), 'MMM d, h:mm a')}
              </p>
            </div>
          </div>

          {event.license_plate && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Clock className="w-4 h-4" />
              <span>Vehicle: {event.license_plate}</span>
            </div>
          )}

          {isRecent && (
            <div className="bg-orange-100 border border-orange-300 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-orange-900">Confirm this toll?</p>
                <p className="text-xs text-orange-700">
                  We detected you passed through this toll. Confirm to add it to your payment queue.
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              onClick={() => onDecline(event.id)}
              variant="outline"
              className="flex-1"
              disabled={loading}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Not Me
            </Button>
            <Button
              onClick={() => onConfirm(event.id)}
              className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
              disabled={loading}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Confirm
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}