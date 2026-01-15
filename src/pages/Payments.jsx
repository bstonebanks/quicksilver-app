import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { dynamodb } from "../components/utils/dynamodbClient";
import { Button } from "@/components/ui/button";
import { Plus, CreditCard as CreditCardIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PaymentMethodCard from "../components/payments/PaymentMethodCard";
import PaymentMethodForm from "../components/payments/PaymentMethodForm";

export default function Payments() {
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: paymentMethods = [], isLoading } = useQuery({
    queryKey: ['paymentMethods'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const allMethods = await dynamodb.paymentMethods.list(user.email);
      return allMethods.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const user = await base44.auth.me();
      const result = await dynamodb.paymentMethods.create(user.email, data);
      return { result, user };
    },
    onSuccess: async ({ result, user }) => {
      queryClient.invalidateQueries({ queryKey: ['paymentMethods'] });
      setShowForm(false);
      
      // Send SMS notification if phone number is available
      if (user.phone_number) {
        try {
          await base44.functions.invoke('sendSNSNotification', {
            phoneNumber: user.phone_number,
            message: `QuickSilver: New payment method added - ${result.card_type.toUpperCase()} ending in ${result.last_four}`,
            subject: 'Payment Method Added'
          });
        } catch (error) {
          console.error('Failed to send SMS notification:', error);
        }
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const user = await base44.auth.me();
      return dynamodb.paymentMethods.delete(user.email, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentMethods'] });
    },
  });

  const setDefaultMutation = useMutation({
    mutationFn: async (id) => {
      const user = await base44.auth.me();
      // First, unset all defaults
      await Promise.all(
        paymentMethods.filter(pm => pm.is_default).map(pm => 
          dynamodb.paymentMethods.update(user.email, pm.id, { is_default: false })
        )
      );
      // Then set the new default
      await dynamodb.paymentMethods.update(user.email, id, { is_default: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentMethods'] });
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Payment Methods</h1>
            <p className="text-slate-600">Securely manage your payment methods</p>
          </div>
          {!showForm && (
            <Button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-lg h-12 px-6"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Card
            </Button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {showForm && (
            <div className="mb-8 max-w-2xl">
              <PaymentMethodForm
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
            <p className="text-slate-600">Loading payment methods...</p>
          </div>
        ) : paymentMethods.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-16 text-center border border-slate-200 shadow-lg"
          >
            <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-6">
              <CreditCardIcon className="w-12 h-12 text-slate-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">No payment methods yet</h3>
            <p className="text-slate-600 mb-6 max-w-md mx-auto">
              Add a payment method to enable quick toll payments
            </p>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 h-12 px-8"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Your First Card
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paymentMethods.map((pm, index) => (
              <PaymentMethodCard
                key={pm.id}
                paymentMethod={pm}
                index={index}
                onDelete={(id) => {
                  if (confirm('Are you sure you want to delete this payment method?')) {
                    deleteMutation.mutate(id);
                  }
                }}
                onSetDefault={(id) => setDefaultMutation.mutate(id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}