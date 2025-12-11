import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Car, Plus, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import VehicleCard from '@/components/VehicleCard';
import AddVehicleModal from '@/components/AddVehicleModal';

export default function Vehicles() {
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const queryClient = useQueryClient();

  const { data: vehicles = [], isLoading } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => base44.entities.Vehicle.list()
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

  const handleSetPrimary = async (vehicleId) => {
    for (const v of vehicles) {
      if (v.is_primary) {
        await base44.entities.Vehicle.update(v.id, { is_primary: false });
      }
    }
    await updateVehicle.mutateAsync({ id: vehicleId, data: { is_primary: true } });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to={createPageUrl('Home')}>
              <Button variant="ghost" size="icon" className="rounded-xl">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">My Vehicles</h1>
              <p className="text-slate-500">Manage your saved vehicles for faster payments</p>
            </div>
          </div>
          <Button
            onClick={() => setShowAddVehicle(true)}
            className="rounded-xl bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Vehicle
          </Button>
        </div>

        {/* Vehicles Grid */}
        {isLoading ? (
          <div className="grid sm:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-white rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : vehicles.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl border border-slate-100 p-12 text-center"
          >
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Car className="w-10 h-10 text-slate-400" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">No vehicles yet</h2>
            <p className="text-slate-500 mb-6 max-w-sm mx-auto">
              Add your vehicles to quickly select them when paying tolls
            </p>
            <Button
              onClick={() => setShowAddVehicle(true)}
              className="rounded-xl bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Vehicle
            </Button>
          </motion.div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {vehicles.map((vehicle, idx) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                onDelete={(id) => deleteVehicle.mutate(id)}
                onSetPrimary={handleSetPrimary}
                delay={idx * 0.1}
              />
            ))}
          </div>
        )}
      </div>

      <AddVehicleModal
        isOpen={showAddVehicle}
        onClose={() => setShowAddVehicle(false)}
        onSubmit={createVehicle.mutateAsync}
      />
    </div>
  );
}