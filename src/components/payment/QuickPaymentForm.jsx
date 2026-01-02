import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, CreditCard, MapPin } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";

const TOLL_LOCATIONS = [
  { road: "Golden Gate Bridge", location: "San Francisco Toll Plaza", amount: 8.75 },
  { road: "Bay Bridge", location: "Eastbound Toll Plaza", amount: 7.00 },
  { road: "Highway 73", location: "MacArthur Blvd", amount: 6.50 },
  { road: "Highway 73", location: "Bonita Canyon", amount: 5.25 },
  { road: "Highway 133", location: "Laguna Canyon", amount: 4.50 },
  { road: "Highway 241", location: "Windy Ridge", amount: 6.00 },
  { road: "Highway 261", location: "Portola Hills", amount: 5.75 },
  { road: "Interstate 405", location: "Irvine Center", amount: 3.50 },
];

export default function QuickPaymentForm({ onSuccess }) {
  const [vehicles, setVehicles] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    vehicle_id: '',
    toll_location: '',
    payment_method_id: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { dynamodb } = await import("../utils/dynamodbClient");
    const [vehiclesData, paymentMethodsData] = await Promise.all([
      dynamodb.vehicles.list(),
      dynamodb.paymentMethods.list()
    ]);
    setVehicles(vehiclesData);
    setPaymentMethods(paymentMethodsData);
    
    // Auto-select primary/default options
    const primaryVehicle = vehiclesData.find(v => v.is_primary);
    const defaultPayment = paymentMethodsData.find(p => p.is_default);
    
    if (primaryVehicle) setFormData(prev => ({ ...prev, vehicle_id: primaryVehicle.id }));
    if (defaultPayment) setFormData(prev => ({ ...prev, payment_method_id: defaultPayment.id }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const vehicle = vehicles.find(v => v.id === formData.vehicle_id);
      const paymentMethod = paymentMethods.find(p => p.id === formData.payment_method_id);
      const tollInfo = TOLL_LOCATIONS.find(t => 
        `${t.road} - ${t.location}` === formData.toll_location
      );

      const confirmationNumber = `QS${Date.now().toString().slice(-8)}`;

      const { dynamodb } = await import("../utils/dynamodbClient");
      await dynamodb.trips.create({
        toll_location: tollInfo.location,
        toll_road: tollInfo.road,
        entry_time: new Date().toISOString(),
        license_plate: vehicle.license_plate,
        amount: tollInfo.amount,
        status: 'paid',
        payment_method: paymentMethod.last_four,
        confirmation_number: confirmationNumber
      });

      onSuccess && onSuccess();
      setFormData({ vehicle_id: '', toll_location: '', payment_method_id: '' });
      
      // Reset to defaults
      const primaryVehicle = vehicles.find(v => v.is_primary);
      const defaultPayment = paymentMethods.find(p => p.is_default);
      if (primaryVehicle) setFormData(prev => ({ ...prev, vehicle_id: primaryVehicle.id }));
      if (defaultPayment) setFormData(prev => ({ ...prev, payment_method_id: defaultPayment.id }));
    } finally {
      setLoading(false);
    }
  };

  const selectedToll = TOLL_LOCATIONS.find(t => 
    `${t.road} - ${t.location}` === formData.toll_location
  );

  const canSubmit = formData.vehicle_id && formData.toll_location && formData.payment_method_id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="border-0 shadow-2xl bg-gradient-to-br from-white to-slate-50">
        <CardContent className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Instant Payment</h2>
              <p className="text-sm text-slate-500">Pay your toll in seconds</p>
            </div>
          </div>

          {paymentMethods.some(pm => pm.auto_pay_enabled) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl"
            >
              <div className="flex items-center gap-2 text-green-800">
                <Zap className="w-4 h-4" />
                <p className="text-sm font-medium">
                  Auto-Pay is enabled on your {paymentMethods.find(pm => pm.auto_pay_enabled)?.card_type} card
                </p>
              </div>
              <p className="text-xs text-green-700 mt-1 ml-6">
                Tolls will be automatically charged when detected via geofencing
              </p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="vehicle" className="text-slate-700 font-medium flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400" />
                Vehicle
              </Label>
              <Select
                value={formData.vehicle_id}
                onValueChange={(value) => setFormData({ ...formData, vehicle_id: value })}
                required
              >
                <SelectTrigger className="h-12 border-slate-200 focus:border-cyan-400 focus:ring-cyan-400/20">
                  <SelectValue placeholder="Select your vehicle" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.length === 0 ? (
                    <div className="p-4 text-sm text-slate-500 text-center">
                      No vehicles saved. Add one in Vehicles page.
                    </div>
                  ) : (
                    vehicles.map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-sm bg-slate-100 px-2 py-1 rounded">
                            {vehicle.license_plate}
                          </span>
                          {vehicle.nickname && (
                            <span className="text-slate-600">• {vehicle.nickname}</span>
                          )}
                          {vehicle.is_primary && (
                            <span className="text-xs bg-cyan-100 text-cyan-700 px-2 py-0.5 rounded-full">
                              Primary
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="toll" className="text-slate-700 font-medium flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400" />
                Toll Location
              </Label>
              <Select
                value={formData.toll_location}
                onValueChange={(value) => setFormData({ ...formData, toll_location: value })}
                required
              >
                <SelectTrigger className="h-12 border-slate-200 focus:border-cyan-400 focus:ring-cyan-400/20">
                  <SelectValue placeholder="Where did you pass through?" />
                </SelectTrigger>
                <SelectContent>
                  {TOLL_LOCATIONS.map((toll, idx) => (
                    <SelectItem key={idx} value={`${toll.road} - ${toll.location}`}>
                      <div className="flex justify-between items-center w-full pr-4">
                        <div>
                          <div className="font-medium text-slate-900">{toll.road}</div>
                          <div className="text-xs text-slate-500">{toll.location}</div>
                        </div>
                        <div className="font-bold text-slate-900">${toll.amount.toFixed(2)}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment" className="text-slate-700 font-medium flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-slate-400" />
                Payment Method
              </Label>
              <Select
                value={formData.payment_method_id}
                onValueChange={(value) => setFormData({ ...formData, payment_method_id: value })}
                required
              >
                <SelectTrigger className="h-12 border-slate-200 focus:border-cyan-400 focus:ring-cyan-400/20">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.length === 0 ? (
                    <div className="p-4 text-sm text-slate-500 text-center">
                      No payment methods saved. Add one in Payments page.
                    </div>
                  ) : (
                    paymentMethods.map((pm) => (
                      <SelectItem key={pm.id} value={pm.id}>
                        <div className="flex items-center gap-3">
                          <span className="capitalize">{pm.card_type}</span>
                          <span className="font-mono">•••• {pm.last_four}</span>
                          {pm.is_default && (
                            <span className="text-xs bg-cyan-100 text-cyan-700 px-2 py-0.5 rounded-full">
                              Default
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {selectedToll && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-6 border border-cyan-100"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Amount Due</p>
                    <p className="text-4xl font-bold text-slate-900">
                      ${selectedToll.amount.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-600">No penalties</p>
                    <p className="text-sm text-slate-600">Instant confirmation</p>
                  </div>
                </div>
              </motion.div>
            )}

            <Button
              type="submit"
              disabled={!canSubmit || loading}
              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Pay Now
                </span>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}