import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  Zap, Car, History, CreditCard, Plus, ChevronRight, 
  DollarSign, MapPin, Shield, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import QuickPayForm from '@/components/QuickPayForm';
import VehicleCard from '@/components/VehicleCard';
import TripHistoryItem from '@/components/TripHistoryItem';
import AddVehicleModal from '@/components/AddVehicleModal';
import StatsCard from '@/components/StatsCard';

export default function Home() {
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const queryClient = useQueryClient();

  const { data: vehicles = [], isLoading: loadingVehicles } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => base44.entities.Vehicle.list()
  });

  const { data: trips = [], isLoading: loadingTrips } = useQuery({
    queryKey: ['trips'],
    queryFn: () => base44.entities.Trip.list('-entry_time', 5)
  });

  const createVehicle = useMutation({
    mutationFn: (data) => base44.entities.Vehicle.create(data),
    onSuccess: () => queryClient.invalidateQueries(['vehicles'])
  });

  const deleteVehicle = useMutation({
    mutationFn: (id) => base44.entities.Vehicle.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['vehicles'])
  });

  const updateVehicle = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Vehicle.update(id, data),
    onSuccess: () => queryClient.invalidateQueries(['vehicles'])
  });

  const createTrip = useMutation({
    mutationFn: (data) => base44.entities.Trip.create(data),
    onSuccess: () => queryClient.invalidateQueries(['trips'])
  });

  const handleSetPrimary = async (vehicleId) => {
    // First, unset all other vehicles
    for (const v of vehicles) {
      if (v.is_primary) {
        await base44.entities.Vehicle.update(v.id, { is_primary: false });
      }
    }
    // Set the selected one as primary
    await updateVehicle.mutateAsync({ id: vehicleId, data: { is_primary: true } });
  };

  const handlePaymentComplete = async (paymentData) => {
    await createTrip.mutateAsync({
      toll_location: paymentData.tollLocation,
      toll_road: paymentData.tollRoad || 'Florida Turnpike',
      entry_time: paymentData.dateTime,
      license_plate: paymentData.licensePlate,
      amount: paymentData.amount,
      status: 'paid',
      confirmation_number: paymentData.confirmationNumber
    });
  };

  // Calculate stats
  const totalSaved = trips.reduce((acc, t) => acc + (t.amount * 0.3), 0); // Assume 30% penalty avoided
  const totalPaid = trips.reduce((acc, t) => acc + t.amount, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full text-sm mb-6 backdrop-blur-sm">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-white/90">Instant toll payments, zero penalties</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight">
              Pay tolls instantly.
              <br />
              <span className="text-blue-400">Skip the fees.</span>
            </h1>
            <p className="text-lg text-slate-300 mb-8 max-w-lg">
              Forgot your QuickSilver pass? No problem. Pay any toll in seconds and avoid costly penalties.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8"
          >
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
              <DollarSign className="w-5 h-5 text-green-400 mb-2" />
              <p className="text-2xl font-bold">${totalSaved.toFixed(2)}</p>
              <p className="text-sm text-slate-400">Penalties avoided</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
              <MapPin className="w-5 h-5 text-blue-400 mb-2" />
              <p className="text-2xl font-bold">{trips.length}</p>
              <p className="text-sm text-slate-400">Tolls paid</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
              <Car className="w-5 h-5 text-purple-400 mb-2" />
              <p className="text-2xl font-bold">{vehicles.length}</p>
              <p className="text-sm text-slate-400">Vehicles saved</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
              <Shield className="w-5 h-5 text-amber-400 mb-2" />
              <p className="text-2xl font-bold">100%</p>
              <p className="text-sm text-slate-400">Fee-free payments</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-8 sm:-mt-12 relative z-10 pb-20">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Quick Pay Form - Left side */}
          <div className="lg:col-span-3">
            <QuickPayForm 
              vehicles={vehicles} 
              onPaymentComplete={handlePaymentComplete}
            />
          </div>

          {/* Right sidebar */}
          <div className="lg:col-span-2 space-y-6">
            {/* My Vehicles */}
            <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                    <Car className="w-5 h-5 text-slate-600" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">My Vehicles</h2>
                </div>
                <Button
                  onClick={() => setShowAddVehicle(true)}
                  size="sm"
                  className="rounded-xl bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </div>

              {loadingVehicles ? (
                <div className="space-y-3">
                  {[1, 2].map(i => (
                    <div key={i} className="h-24 bg-slate-100 rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : vehicles.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Car className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-slate-500 mb-4">No vehicles saved yet</p>
                  <Button
                    onClick={() => setShowAddVehicle(true)}
                    variant="outline"
                    className="rounded-xl"
                  >
                    Add your first vehicle
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {vehicles.slice(0, 3).map((vehicle, idx) => (
                    <VehicleCard
                      key={vehicle.id}
                      vehicle={vehicle}
                      onDelete={(id) => deleteVehicle.mutate(id)}
                      onSetPrimary={handleSetPrimary}
                      delay={idx * 0.1}
                    />
                  ))}
                  {vehicles.length > 3 && (
                    <Link to={createPageUrl('Vehicles')}>
                      <Button variant="ghost" className="w-full rounded-xl text-slate-600">
                        View all {vehicles.length} vehicles
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                    <History className="w-5 h-5 text-slate-600" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">Recent Activity</h2>
                </div>
                <Link to={createPageUrl('History')}>
                  <Button variant="ghost" size="sm" className="rounded-xl text-slate-600">
                    View all
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>

              {loadingTrips ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-20 bg-slate-100 rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : trips.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-slate-500">No toll payments yet</p>
                  <p className="text-sm text-slate-400 mt-1">Pay your first toll above</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {trips.map((trip, idx) => (
                    <TripHistoryItem key={trip.id} trip={trip} delay={idx * 0.1} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <AddVehicleModal
        isOpen={showAddVehicle}
        onClose={() => setShowAddVehicle(false)}
        onSubmit={createVehicle.mutateAsync}
      />
    </div>
  );
}