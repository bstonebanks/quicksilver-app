import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, X } from "lucide-react";
import { motion } from "framer-motion";

export default function PaymentMethodForm({ onSubmit, onCancel, loading }) {
  const [formData, setFormData] = useState({
    card_type: '',
    last_four: '',
    expiry_month: '',
    expiry_year: '',
    cardholder_name: '',
    is_default: false,
    auto_pay_enabled: false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      expiry_month: parseInt(formData.expiry_month),
      expiry_year: parseInt(formData.expiry_year)
    });
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 15 }, (_, i) => currentYear + i);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="border-0 shadow-2xl">
        <CardHeader className="pb-4 border-b">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-cyan-600" />
              Add Payment Method
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="cardholder_name" className="text-slate-700 font-medium">
                Cardholder Name *
              </Label>
              <Input
                id="cardholder_name"
                value={formData.cardholder_name}
                onChange={(e) => setFormData({ ...formData, cardholder_name: e.target.value })}
                placeholder="John Doe"
                className="h-11 border-slate-200 focus:border-cyan-400"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="card_type" className="text-slate-700 font-medium">
                  Card Type *
                </Label>
                <Select
                  value={formData.card_type}
                  onValueChange={(value) => setFormData({ ...formData, card_type: value })}
                  required
                >
                  <SelectTrigger className="h-11 border-slate-200 focus:border-cyan-400">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="visa">Visa</SelectItem>
                    <SelectItem value="mastercard">Mastercard</SelectItem>
                    <SelectItem value="amex">American Express</SelectItem>
                    <SelectItem value="discover">Discover</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_four" className="text-slate-700 font-medium">
                  Last 4 Digits *
                </Label>
                <Input
                  id="last_four"
                  value={formData.last_four}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                    setFormData({ ...formData, last_four: value });
                  }}
                  placeholder="1234"
                  maxLength={4}
                  className="font-mono h-11 border-slate-200 focus:border-cyan-400"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiry_month" className="text-slate-700 font-medium">
                  Expiry Month *
                </Label>
                <Select
                  value={formData.expiry_month}
                  onValueChange={(value) => setFormData({ ...formData, expiry_month: value })}
                  required
                >
                  <SelectTrigger className="h-11 border-slate-200 focus:border-cyan-400">
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                      <SelectItem key={month} value={String(month)}>
                        {String(month).padStart(2, '0')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiry_year" className="text-slate-700 font-medium">
                  Expiry Year *
                </Label>
                <Select
                  value={formData.expiry_year}
                  onValueChange={(value) => setFormData({ ...formData, expiry_year: value })}
                  required
                >
                  <SelectTrigger className="h-11 border-slate-200 focus:border-cyan-400">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={String(year)}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_default"
                  checked={formData.is_default}
                  onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                />
                <Label htmlFor="is_default" className="text-sm text-slate-700 cursor-pointer">
                  Set as default payment method
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="auto_pay_enabled"
                  checked={formData.auto_pay_enabled}
                  onChange={(e) => setFormData({ ...formData, auto_pay_enabled: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-green-600 focus:ring-green-500"
                />
                <Label htmlFor="auto_pay_enabled" className="text-sm text-slate-700 cursor-pointer">
                  Enable Auto-Pay for toll detection
                </Label>
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-600">
              <p className="flex items-center gap-2">
                <span className="text-cyan-600">ℹ️</span>
                For security, we only store the last 4 digits. Full card details are processed securely.
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1 h-12"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                disabled={loading}
              >
                {loading ? 'Adding...' : 'Add Card'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}