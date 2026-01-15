import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { dynamodb } from "../components/utils/dynamodbClient";
import { Button } from "@/components/ui/button";
import { Plus, Car as CarIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import VehicleCard from "../components/vehicles/VehicleCard";
import VehicleForm from "../components/vehicles/VehicleForm";

export default function Vehicles() {
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: vehicles = [], isLoading } = useQuery({
    queryKey: ['vehicles'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const allVehicles = await dynamodb.vehicles.list(user.email);
      return allVehicles.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      try {
        const user = await base44.auth.me();
        console.log('Creating vehicle with data:', data);
        const result = await dynamodb.vehicles.create(user.email, data);
        console.log('Vehicle created successfully:', result);
        return result;
      } catch (error) {
        console.error('Detailed error:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          fullError: error
        });
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      setShowForm(false);
    },
    onError: (error) => {
      const errorMsg = error.response?.data?.error || error.message || 'Unknown error';
      const hint = error.response?.data?.hint || '';
      console.error('Failed to create vehicle:', errorMsg, hint);
      alert(`Failed to add vehicle: ${errorMsg}${hint ? '\n\n' + hint : ''}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const user = await base44.auth.me();
      return dynamodb.vehicles.delete(user.email, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });

  const setPrimaryMutation = useMutation({
    mutationFn: async (id) => {
      const user = await base44.auth.me();
      // First, unset all primaries
      await Promise.all(
        vehicles.filter(v => v.is_primary).map(v => 
          dynamodb.vehicles.update(user.email, v.id, { is_primary: false })
        )
      );
      // Then set the new primary
      await dynamodb.vehicles.update(user.email, id, { is_primary: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">My Vehicles</h1>
            <p className="text-slate-600">Manage your vehicles for quick toll payments</p>
          </div>
          {!showForm && (
            <Button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-lg h-12 px-6"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Vehicle
            </Button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {showForm && (
            <div className="mb-8">
              <VehicleForm
                onSubmit={(data) => createMutation.mutate(data)}
                onCancel={() => setShowForm(false)}
                loading={createMutation.isPending}
              />
            </div>
          )}
        </AnimatePresence>

        {isLoading ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-600">Loading vehicles...</p>
          </div>
        ) : vehicles.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-16 text-center border border-slate-200 shadow-lg"
          >
            <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-6">
              <CarIcon className="w-12 h-12 text-slate-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">No vehicles yet</h3>
            <p className="text-slate-600 mb-6 max-w-md mx-auto">
              Add your first vehicle to start making instant toll payments
            </p>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 h-12 px-8"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Your First Vehicle
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((vehicle, index) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                index={index}
                onDelete={(id) => {
                  if (confirm('Are you sure you want to delete this vehicle?')) {
                    deleteMutation.mutate(id);
                  }
                }}
                onSetPrimary={(id) => setPrimaryMutation.mutate(id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}