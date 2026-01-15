import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, RefreshCw, Trash2, MapPin, DollarSign, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { dynamodb } from "../components/utils/dynamodbClient";

export default function RecurringPayments() {
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: recurringPayments = [], isLoading } = useQuery({
    queryKey: ['recurringPayments'],
    queryFn: () => base44.entities.RecurringPayment.list(),
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

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.RecurringPayment.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurringPayments'] });
      setShowForm(false);
      toast.success('Recurring payment created successfully');
    },
    onError: () => toast.error('Failed to create recurring payment'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.RecurringPayment.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurringPayments'] });
      toast.success('Recurring payment deleted');
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, is_active }) => 
      base44.entities.RecurringPayment.update(id, { is_active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurringPayments'] });
      toast.success('Status updated');
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Recurring Payments</h1>
            <p className="text-slate-600">Set up automatic payments for frequent toll routes</p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Route
          </Button>
        </div>

        <AnimatePresence>
          {showForm && (
            <RecurringPaymentForm
              onSubmit={(data) => createMutation.mutate(data)}
              onCancel={() => setShowForm(false)}
              vehicles={vehicles}
              paymentMethods={paymentMethods}
              loading={createMutation.isPending}
            />
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {isLoading ? (
            <div className="col-span-full text-center py-12">
              <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : recurringPayments.length === 0 ? (
            <div className="col-span-full">
              <Card className="border-slate-200">
                <CardContent className="text-center py-16">
                  <RefreshCw className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">No Recurring Payments</h3>
                  <p className="text-slate-600 mb-6">Set up automatic payments for routes you use frequently</p>
                  <Button onClick={() => setShowForm(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Route
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            recurringPayments.map((payment, index) => (
              <RecurringPaymentCard
                key={payment.id}
                payment={payment}
                vehicles={vehicles}
                paymentMethods={paymentMethods}
                onToggle={() => toggleMutation.mutate({ id: payment.id, is_active: !payment.is_active })}
                onDelete={() => deleteMutation.mutate(payment.id)}
                index={index}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function RecurringPaymentForm({ onSubmit, onCancel, vehicles, paymentMethods, loading }) {
  const [formData, setFormData] = useState({
    route_name: '',
    frequency: 'weekly',
    days_of_week: [],
    estimated_monthly_cost: '',
    payment_method_id: '',
    vehicle_id: '',
    auto_recharge: false,
    recharge_amount: 50,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      estimated_monthly_cost: parseFloat(formData.estimated_monthly_cost),
      recharge_amount: parseFloat(formData.recharge_amount),
    });
  };

  const daysOfWeek = [
    { value: 1, label: 'Mon' },
    { value: 2, label: 'Tue' },
    { value: 3, label: 'Wed' },
    { value: 4, label: 'Thu' },
    { value: 5, label: 'Fri' },
    { value: 6, label: 'Sat' },
    { value: 0, label: 'Sun' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className="border-slate-200 mb-8">
        <CardHeader className="border-b">
          <CardTitle>New Recurring Payment</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Route Name *</Label>
                <Input
                  value={formData.route_name}
                  onChange={(e) => setFormData({ ...formData, route_name: e.target.value })}
                  placeholder="e.g., Daily Commute"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Frequency *</Label>
                <Select
                  value={formData.frequency}
                  onValueChange={(value) => setFormData({ ...formData, frequency: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.frequency === 'weekly' && (
              <div className="space-y-2">
                <Label>Days of Week</Label>
                <div className="flex gap-2 flex-wrap">
                  {daysOfWeek.map((day) => (
                    <Button
                      key={day.value}
                      type="button"
                      variant={formData.days_of_week.includes(day.value) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        const days = formData.days_of_week.includes(day.value)
                          ? formData.days_of_week.filter(d => d !== day.value)
                          : [...formData.days_of_week, day.value];
                        setFormData({ ...formData, days_of_week: days });
                      }}
                      className={formData.days_of_week.includes(day.value) ? 'bg-cyan-600' : ''}
                    >
                      {day.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Vehicle *</Label>
                <Select
                  value={formData.vehicle_id}
                  onValueChange={(value) => setFormData({ ...formData, vehicle_id: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.nickname || vehicle.license_plate}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Payment Method *</Label>
                <Select
                  value={formData.payment_method_id}
                  onValueChange={(value) => setFormData({ ...formData, payment_method_id: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map((pm) => (
                      <SelectItem key={pm.id} value={pm.id}>
                        {pm.card_type || pm.payment_type} ••{pm.last_four}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Estimated Monthly Cost *</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.estimated_monthly_cost}
                onChange={(e) => setFormData({ ...formData, estimated_monthly_cost: e.target.value })}
                placeholder="50.00"
                required
              />
            </div>

            <div className="space-y-3 border-t pt-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="auto_recharge"
                  checked={formData.auto_recharge}
                  onChange={(e) => setFormData({ ...formData, auto_recharge: e.target.checked })}
                  className="h-4 w-4 rounded"
                />
                <Label htmlFor="auto_recharge" className="cursor-pointer">
                  Enable Auto-Recharge
                </Label>
              </div>

              {formData.auto_recharge && (
                <div className="ml-6 space-y-2">
                  <Label>Recharge Amount</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.recharge_amount}
                    onChange={(e) => setFormData({ ...formData, recharge_amount: e.target.value })}
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1" disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600" disabled={loading}>
                {loading ? 'Creating...' : 'Create Route'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function RecurringPaymentCard({ payment, vehicles, paymentMethods, onToggle, onDelete, index }) {
  const vehicle = vehicles.find(v => v.id === payment.vehicle_id);
  const paymentMethod = paymentMethods.find(pm => pm.id === payment.payment_method_id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="border-slate-200 hover:shadow-lg transition-all">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg mb-2">{payment.route_name}</CardTitle>
              <Badge className={payment.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}>
                {payment.is_active ? 'Active' : 'Paused'}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2 text-slate-600">
              <Calendar className="w-4 h-4" />
              <span className="capitalize">{payment.frequency}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <MapPin className="w-4 h-4" />
              <span>{vehicle?.nickname || vehicle?.license_plate || 'Unknown Vehicle'}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <DollarSign className="w-4 h-4" />
              <span>${payment.estimated_monthly_cost?.toFixed(2)}/month</span>
            </div>
          </div>

          {payment.auto_recharge && (
            <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-3 text-sm">
              <p className="text-cyan-900">
                Auto-recharge: ${payment.recharge_amount}
              </p>
            </div>
          )}

          <div className="flex gap-2 pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={onToggle}
              className="flex-1"
            >
              {payment.is_active ? 'Pause' : 'Activate'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="text-red-600 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}