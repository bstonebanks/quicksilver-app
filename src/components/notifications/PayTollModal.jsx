import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { CreditCard, Car, Zap } from "lucide-react";
import { dynamodb } from "../utils/dynamodbClient";
import { toast } from "sonner";

export default function PayTollModal({ notification, open, onClose, onSuccess }) {
  const [vehicles, setVehicles] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [selectedPayment, setSelectedPayment] = useState('');

  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open]);

  const loadData = async () => {
    const [vehiclesData, paymentMethodsData] = await Promise.all([
      dynamodb.vehicles.list(),
      dynamodb.paymentMethods.list()
    ]);
    setVehicles(vehiclesData);
    setPaymentMethods(paymentMethodsData);

    // Auto-select primary/default
    const primaryVehicle = vehiclesData.find(v => v.is_primary);
    const defaultPayment = paymentMethodsData.find(p => p.is_default);
    
    if (primaryVehicle) setSelectedVehicle(primaryVehicle.id);
    if (defaultPayment) setSelectedPayment(defaultPayment.id);
  };

  const handlePayment = async () => {
    if (!selectedVehicle || !selectedPayment) {
      toast.error('Please select a vehicle and payment method');
      return;
    }

    setLoading(true);
    try {
      const vehicle = vehicles.find(v => v.id === selectedVehicle);
      const paymentMethod = paymentMethods.find(p => p.id === selectedPayment);
      const metadata = notification.metadata || {};
      
      const confirmationNumber = `QS${Date.now().toString().slice(-8)}`;

      // Create trip record
      await dynamodb.trips.create({
        toll_location: metadata.toll_location || 'Unknown',
        toll_road: metadata.toll_road || 'Unknown',
        entry_time: metadata.detected_at || new Date().toISOString(),
        license_plate: vehicle.license_plate,
        amount: metadata.amount || 0,
        status: 'paid',
        payment_method: paymentMethod.last_four,
        confirmation_number: confirmationNumber
      });

      // Mark notification as read
      await dynamodb.notifications.update(notification.id, {
        is_read: true
      });

      // Create success notification
      await dynamodb.notifications.create({
        type: 'payment_success',
        title: 'Payment Successful',
        message: `Your $${metadata.amount?.toFixed(2)} toll payment for ${metadata.toll_road} has been processed. Confirmation: ${confirmationNumber}`,
        priority: 'medium',
        is_read: false
      });

      toast.success('Payment successful!');
      onSuccess && onSuccess();
      onClose();
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const metadata = notification?.metadata || {};
  const amount = metadata.amount || 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">Pay Toll</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Amount Due */}
          <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-6 border border-cyan-200 text-center">
            <p className="text-sm text-slate-600 mb-2">Amount Due</p>
            <p className="text-4xl font-bold text-slate-900">${amount.toFixed(2)}</p>
            <p className="text-sm text-slate-600 mt-2">{metadata.toll_road}</p>
            <p className="text-xs text-slate-500">{metadata.toll_location}</p>
          </div>

          {/* Vehicle Selection */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Car className="w-4 h-4" />
              Vehicle
            </Label>
            <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
              <SelectTrigger>
                <SelectValue placeholder="Select vehicle" />
              </SelectTrigger>
              <SelectContent>
                {vehicles.map((vehicle) => (
                  <SelectItem key={vehicle.id} value={vehicle.id}>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">{vehicle.license_plate}</span>
                      {vehicle.nickname && <span>• {vehicle.nickname}</span>}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Payment Method Selection */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Payment Method
            </Label>
            <Select value={selectedPayment} onValueChange={setSelectedPayment}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((pm) => (
                  <SelectItem key={pm.id} value={pm.id}>
                    <div className="flex items-center gap-2">
                      <span className="capitalize">{pm.card_type}</span>
                      <span className="font-mono">•••• {pm.last_four}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePayment}
              disabled={!selectedVehicle || !selectedPayment || loading}
              className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Pay ${amount.toFixed(2)}
                </span>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}