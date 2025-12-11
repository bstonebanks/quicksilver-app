import React, { useState, useEffect } from 'react';
import { base44 } from "@/api/base44Client";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Zap, ArrowRight, DollarSign, Car, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import QuickPaymentForm from "../components/payment/QuickPaymentForm";
import TripCard from "../components/trips/TripCard";

export default function Home() {
  const [showSuccess, setShowSuccess] = useState(false);
  const queryClient = useQueryClient();

  const { data: trips = [], isLoading } = useQuery({
    queryKey: ['trips'],
    queryFn: () => base44.entities.Trip.list('-created_date', 5),
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => base44.entities.Vehicle.list(),
  });

  const { data: paymentMethods = [] } = useQuery({
    queryKey: ['paymentMethods'],
    queryFn: () => base44.entities.PaymentMethod.list(),
  });

  const handlePaymentSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['trips'] });
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const totalPaid = trips.reduce((sum, trip) => sum + (trip.amount || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-900 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDE2djhoLThWMTZoOHptMCAwVjhoOHY4aC04ek0yMCA0OHY4aC04di04aDh6bTAtMTZ2OGgtOHYtOGg4em0xNi0xNnY4aC04di04aDh6bTE2IDB2OGgtOHYtOGg4eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        <div className="relative max-w-7xl mx-auto px-6 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-block mb-6">
              <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-2xl mx-auto">
                <Zap className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">
              QuickSilver Instant Pay
            </h1>
            <p className="text-xl md:text-2xl text-cyan-100 mb-4 max-w-3xl mx-auto leading-relaxed">
              Forgot your toll pass? No problem.
            </p>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
              Pay your tolls instantly and avoid penalties — no pass required.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Success Message */}
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-8 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6 text-center shadow-lg"
          >
            <p className="text-green-800 font-semibold text-lg">✓ Payment successful! No penalties applied.</p>
          </motion.div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200"
          >
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center">
                <DollarSign className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Total Paid</p>
                <p className="text-3xl font-bold text-slate-900">${totalPaid.toFixed(2)}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200"
          >
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center">
                <Car className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Vehicles</p>
                <p className="text-3xl font-bold text-slate-900">{vehicles.length}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200"
          >
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center">
                <CreditCard className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Payment Methods</p>
                <p className="text-3xl font-bold text-slate-900">{paymentMethods.length}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment Form */}
          <div>
            <QuickPaymentForm onSuccess={handlePaymentSuccess} />
          </div>

          {/* Recent Trips */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Recent Trips</h2>
              <Link to={createPageUrl('History')}>
                <Button variant="ghost" className="text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50">
                  View All
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>

            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-slate-600 mt-4">Loading trips...</p>
                </div>
              ) : trips.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No trips yet</h3>
                  <p className="text-slate-600">Make your first instant payment to get started</p>
                </div>
              ) : (
                trips.map((trip, index) => (
                  <TripCard key={trip.id} trip={trip} index={index} />
                ))
              )}
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="mt-20 bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-12 text-white shadow-2xl">
          <h2 className="text-3xl font-bold mb-8 text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="h-16 w-16 rounded-2xl bg-cyan-500 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold">1</span>
              </div>
              <h3 className="font-semibold text-xl mb-2">Select Your Vehicle</h3>
              <p className="text-slate-300">Choose from your saved vehicles or add a new one</p>
            </div>
            <div className="text-center">
              <div className="h-16 w-16 rounded-2xl bg-cyan-500 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold">2</span>
              </div>
              <h3 className="font-semibold text-xl mb-2">Choose Toll Location</h3>
              <p className="text-slate-300">Pick the toll road you just passed through</p>
            </div>
            <div className="text-center">
              <div className="h-16 w-16 rounded-2xl bg-cyan-500 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold">3</span>
              </div>
              <h3 className="font-semibold text-xl mb-2">Pay Instantly</h3>
              <p className="text-slate-300">Complete payment and avoid penalties</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}