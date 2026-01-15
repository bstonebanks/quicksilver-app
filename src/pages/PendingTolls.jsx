import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Clock, DollarSign } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PendingTollCard from "../components/geofence/PendingTollCard";
import { dynamodb } from "../components/utils/dynamodbClient";
import { toast } from "sonner";

export default function PendingTolls() {
  const queryClient = useQueryClient();
  const [selectedEvents, setSelectedEvents] = useState([]);

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['geofenceEvents'],
    queryFn: async () => {
      const allEvents = await base44.entities.GeofenceEvent.filter({ status: 'pending' }, '-detected_at');
      return allEvents;
    },
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return dynamodb.vehicles.list(user.email);
    },
  });

  const { data: paymentMethods = [] } = useQuery({
    queryKey: ['paymentMethods'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return dynamodb.paymentMethods.list(user.email);
    },
  });

  const confirmMutation = useMutation({
    mutationFn: async (eventId) => {
      return base44.entities.GeofenceEvent.update(eventId, { status: 'confirmed' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['geofenceEvents'] });
      toast.success('Toll confirmed');
    },
  });

  const declineMutation = useMutation({
    mutationFn: async (eventId) => {
      return base44.entities.GeofenceEvent.update(eventId, { status: 'declined' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['geofenceEvents'] });
      toast.info('Toll declined');
    },
  });

  const payAllMutation = useMutation({
    mutationFn: async () => {
      const user = await base44.auth.me();
      const confirmedEvents = events.filter(e => e.status === 'confirmed' || selectedEvents.includes(e.id));
      
      if (confirmedEvents.length === 0) {
        throw new Error('No confirmed tolls to pay');
      }

      const defaultPayment = paymentMethods.find(pm => pm.is_default) || paymentMethods[0];
      const primaryVehicle = vehicles.find(v => v.is_primary) || vehicles[0];

      if (!defaultPayment) {
        throw new Error('No payment method available');
      }

      // Create trips and mark as paid
      for (const event of confirmedEvents) {
        await dynamodb.trips.create(user.email, {
          toll_location: event.toll_location,
          toll_road: event.toll_road,
          entry_time: event.detected_at,
          license_plate: event.license_plate || primaryVehicle?.license_plate || 'Unknown',
          amount: event.amount,
          status: 'paid',
          payment_method: defaultPayment.last_four,
          confirmation_number: `QS-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        });

        await base44.entities.GeofenceEvent.update(event.id, { status: 'paid' });
      }

      return confirmedEvents.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ['geofenceEvents'] });
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      setSelectedEvents([]);
      toast.success(`${count} toll${count > 1 ? 's' : ''} paid successfully!`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const pendingEvents = events.filter(e => e.status === 'pending');
  const confirmedEvents = events.filter(e => e.status === 'confirmed');
  const totalAmount = confirmedEvents.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Pending Tolls</h1>
          <p className="text-slate-600">Review and confirm automatically detected toll crossings</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-red-600 text-white">
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <Clock className="w-8 h-8 opacity-80" />
                  <p className="text-3xl font-bold">{pendingEvents.length}</p>
                </div>
                <p className="text-white/90 font-medium">Awaiting Confirmation</p>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-0 shadow-lg bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <CheckCircle2 className="w-8 h-8 opacity-80" />
                  <p className="text-3xl font-bold">{confirmedEvents.length}</p>
                </div>
                <p className="text-white/90 font-medium">Ready to Pay</p>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-emerald-600 text-white">
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <DollarSign className="w-8 h-8 opacity-80" />
                  <p className="text-3xl font-bold">${totalAmount.toFixed(2)}</p>
                </div>
                <p className="text-white/90 font-medium">Total Due</p>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Pay All Button */}
        {confirmedEvents.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card className="border-2 border-green-300 bg-green-50 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-green-900 mb-1">
                    {confirmedEvents.length} Toll{confirmedEvents.length > 1 ? 's' : ''} Confirmed
                  </h3>
                  <p className="text-sm text-green-700">
                    Total amount: ${totalAmount.toFixed(2)}
                  </p>
                </div>
                <Button
                  onClick={() => payAllMutation.mutate()}
                  disabled={payAllMutation.isPending || paymentMethods.length === 0}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 h-12 px-8"
                >
                  {payAllMutation.isPending ? 'Processing...' : 'Pay All Now'}
                </Button>
              </div>
              {paymentMethods.length === 0 && (
                <p className="text-xs text-red-600 mt-2">
                  Please add a payment method to pay tolls
                </p>
              )}
            </Card>
          </motion.div>
        )}

        {/* Pending Events */}
        {isLoading ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-600">Loading pending tolls...</p>
          </div>
        ) : events.length === 0 ? (
          <Card className="border-slate-200 p-16 text-center">
            <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-12 h-12 text-slate-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">All Clear!</h3>
            <p className="text-slate-600 mb-6">
              No pending tolls detected. When you pass through a toll, it will appear here for confirmation.
            </p>
          </Card>
        ) : (
          <div className="space-y-6">
            <AnimatePresence mode="popLayout">
              {events.map((event, index) => (
                <motion.div
                  key={event.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <PendingTollCard
                    event={event}
                    onConfirm={(id) => confirmMutation.mutate(id)}
                    onDecline={(id) => declineMutation.mutate(id)}
                    loading={confirmMutation.isPending || declineMutation.isPending}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}