import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, CreditCard, Wallet, Link as LinkIcon } from "lucide-react";
import { motion } from "framer-motion";

export default function LinkPaymentModal({ vehicle, paymentMethods, onLink, onClose, loading }) {
  const [selectedPayments, setSelectedPayments] = useState(vehicle.linked_payment_methods || []);
  const [defaultPayment, setDefaultPayment] = useState(vehicle.default_payment_method || '');

  const togglePayment = (paymentId) => {
    if (selectedPayments.includes(paymentId)) {
      setSelectedPayments(selectedPayments.filter(id => id !== paymentId));
      if (defaultPayment === paymentId) {
        setDefaultPayment('');
      }
    } else {
      setSelectedPayments([...selectedPayments, paymentId]);
    }
  };

  const handleSubmit = () => {
    onLink({
      linked_payment_methods: selectedPayments,
      default_payment_method: defaultPayment
    });
  };

  const getPaymentIcon = (payment) => {
    if (payment.payment_type === 'apple_pay' || payment.payment_type === 'google_pay') {
      return <Wallet className="w-5 h-5" />;
    }
    return <CreditCard className="w-5 h-5" />;
  };

  const getPaymentDisplay = (payment) => {
    const isWallet = payment.payment_type === 'apple_pay' || payment.payment_type === 'google_pay';
    const name = isWallet 
      ? (payment.payment_type === 'apple_pay' ? 'Apple Pay' : 'Google Pay')
      : payment.card_type;
    return `${name} ••${payment.last_four}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <Card 
        className="max-w-lg w-full max-h-[80vh] overflow-auto" 
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader className="border-b">
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <LinkIcon className="w-5 h-5 text-cyan-600" />
              Link Payment Methods
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
          <p className="text-sm text-slate-600 mt-2">
            {vehicle.nickname || vehicle.license_plate}
          </p>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Select payment methods to link to this vehicle:
            </p>
            
            {paymentMethods.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                No payment methods available. Add one first.
              </div>
            ) : (
              <div className="space-y-3">
                {paymentMethods.map((payment) => {
                  const isSelected = selectedPayments.includes(payment.id);
                  const isDefault = defaultPayment === payment.id;
                  
                  return (
                    <div
                      key={payment.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        isSelected 
                          ? 'border-cyan-500 bg-cyan-50' 
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                      onClick={() => togglePayment(payment.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getPaymentIcon(payment)}
                          <div>
                            <p className="font-medium text-slate-900">
                              {getPaymentDisplay(payment)}
                            </p>
                            <p className="text-xs text-slate-500">
                              {payment.cardholder_name}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {isDefault && (
                            <Badge className="bg-green-100 text-green-700 border-green-200 border text-xs">
                              Default
                            </Badge>
                          )}
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="h-5 w-5 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                          />
                        </div>
                      </div>
                      
                      {isSelected && (
                        <div className="mt-3 pt-3 border-t">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDefaultPayment(payment.id);
                            }}
                            disabled={isDefault}
                            className={`text-xs ${isDefault ? 'opacity-50' : ''}`}
                          >
                            {isDefault ? 'Default for Vehicle' : 'Set as Default'}
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-6 pt-4 border-t">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
              disabled={loading || selectedPayments.length === 0}
            >
              {loading ? 'Linking...' : 'Link Selected'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}