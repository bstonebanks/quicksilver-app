import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, Receipt, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

const statusConfig = {
  paid: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', label: 'Paid' },
  pending: { icon: Loader2, color: 'text-amber-600', bg: 'bg-amber-50', label: 'Pending' },
  disputed: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50', label: 'Disputed' }
};

export default function TripHistoryItem({ trip, delay = 0 }) {
  const status = statusConfig[trip.status] || statusConfig.paid;
  const StatusIcon = status.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-md transition-all duration-300"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <MapPin className="w-5 h-5 text-slate-600" />
          </div>
          <div>
            <h4 className="font-semibold text-slate-900">{trip.toll_location}</h4>
            <p className="text-sm text-slate-500">{trip.toll_road}</p>
            <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {format(new Date(trip.entry_time), 'MMM d, yyyy • h:mm a')}
              </span>
              <span className="font-mono">{trip.license_plate}</span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <p className="text-xl font-bold text-slate-900">${trip.amount?.toFixed(2)}</p>
          <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${status.bg} ${status.color}`}>
            <StatusIcon className={`w-3 h-3 ${trip.status === 'pending' ? 'animate-spin' : ''}`} />
            {status.label}
          </div>
          {trip.confirmation_number && (
            <p className="text-xs text-slate-400 mt-1 font-mono">
              {trip.confirmation_number}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}