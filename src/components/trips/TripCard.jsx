import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, CreditCard, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

const statusConfig = {
  paid: {
    icon: CheckCircle2,
    color: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'Paid'
  },
  pending: {
    icon: Clock,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'Pending'
  },
  disputed: {
    icon: AlertCircle,
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'Disputed'
  }
};

export default function TripCard({ trip, index }) {
  const status = statusConfig[trip.status] || statusConfig.paid;
  const StatusIcon = status.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card className="border-slate-200 hover:shadow-lg transition-all duration-300 hover:border-cyan-300">
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h3 className="font-bold text-lg text-slate-900 mb-1">{trip.toll_road}</h3>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <MapPin className="w-4 h-4" />
                <span>{trip.toll_location}</span>
              </div>
            </div>
            <Badge className={`${status.bg} ${status.color} ${status.border} border flex items-center gap-1.5 px-3 py-1`}>
              <StatusIcon className="w-3.5 h-3.5" />
              {status.text}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs text-slate-500 mb-1">License Plate</p>
              <p className="font-mono font-medium text-slate-900 bg-slate-50 px-2 py-1 rounded inline-block">
                {trip.license_plate}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Amount</p>
              <p className="font-bold text-xl text-slate-900">${trip.amount.toFixed(2)}</p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <CreditCard className="w-4 h-4" />
              <span>•••• {trip.payment_method}</span>
            </div>
            <div className="text-xs text-slate-500">
              {format(new Date(trip.entry_time), 'MMM d, yyyy h:mm a')}
            </div>
          </div>

          {trip.confirmation_number && (
            <div className="mt-3 pt-3 border-t border-slate-100">
              <p className="text-xs text-slate-500 mb-1">Confirmation Number</p>
              <p className="font-mono text-sm text-slate-700 font-medium">{trip.confirmation_number}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}