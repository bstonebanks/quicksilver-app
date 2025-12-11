import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Receipt } from "lucide-react";
import { motion } from "framer-motion";
import TripCard from "../components/trips/TripCard";

export default function History() {
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: trips = [], isLoading } = useQuery({
    queryKey: ['trips'],
    queryFn: () => base44.entities.Trip.list('-created_date'),
  });

  const filteredTrips = statusFilter === 'all' 
    ? trips 
    : trips.filter(trip => trip.status === statusFilter);

  const totalPaid = filteredTrips.reduce((sum, trip) => sum + (trip.amount || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Trip History</h1>
          <p className="text-slate-600">View all your toll payments and transactions</p>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200"
          >
            <p className="text-sm text-slate-600 mb-2">Total Trips</p>
            <p className="text-4xl font-bold text-slate-900">{filteredTrips.length}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200"
          >
            <p className="text-sm text-slate-600 mb-2">Total Amount</p>
            <p className="text-4xl font-bold text-slate-900">${totalPaid.toFixed(2)}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200"
          >
            <p className="text-sm text-slate-600 mb-2">Filter by Status</p>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-12 border-slate-200 focus:border-cyan-400">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Trips</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="disputed">Disputed</SelectItem>
              </SelectContent>
            </Select>
          </motion.div>
        </div>

        {/* Trips List */}
        {isLoading ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-600">Loading history...</p>
          </div>
        ) : filteredTrips.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-16 text-center border border-slate-200 shadow-lg"
          >
            <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-6">
              <Receipt className="w-12 h-12 text-slate-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">No trips found</h3>
            <p className="text-slate-600">
              {statusFilter === 'all' 
                ? 'Make your first payment to see trips here'
                : `No ${statusFilter} trips found`}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {filteredTrips.map((trip, index) => (
              <TripCard key={trip.id} trip={trip} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}