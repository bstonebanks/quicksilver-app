import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, X } from "lucide-react";
import { motion } from "framer-motion";

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

export default function TollPassForm({ tollPass, onSubmit, onCancel, loading }) {
  const [formData, setFormData] = useState({
    pass_type: '',
    account_number: '',
    state: '',
    nickname: '',
    balance: 0,
    auto_replenish: false,
    replenish_threshold: 10,
    replenish_amount: 25,
    is_active: true
  });

  useEffect(() => {
    if (tollPass) {
      setFormData(tollPass);
    }
  }, [tollPass]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      balance: parseFloat(formData.balance) || 0,
      replenish_threshold: parseFloat(formData.replenish_threshold) || 10,
      replenish_amount: parseFloat(formData.replenish_amount) || 25
    });
  };

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
              {tollPass ? 'Edit Toll Pass' : 'Link Toll Pass'}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pass_type" className="text-slate-700 font-medium">
                  Pass Type *
                </Label>
                <Select
                  value={formData.pass_type}
                  onValueChange={(value) => setFormData({ ...formData, pass_type: value })}
                  required
                >
                  <SelectTrigger className="h-11 border-slate-200 focus:border-cyan-400">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ezpass">E-ZPass</SelectItem>
                    <SelectItem value="fastrak">FasTrak</SelectItem>
                    <SelectItem value="sunpass">SunPass</SelectItem>
                    <SelectItem value="ipass">I-PASS</SelectItem>
                    <SelectItem value="txtag">TxTag</SelectItem>
                    <SelectItem value="peachpass">Peach Pass</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="state" className="text-slate-700 font-medium">
                  State
                </Label>
                <Select
                  value={formData.state}
                  onValueChange={(value) => setFormData({ ...formData, state: value })}
                >
                  <SelectTrigger className="h-11 border-slate-200 focus:border-cyan-400">
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {US_STATES.map(state => (
                      <SelectItem key={state} value={state}>{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="account_number" className="text-slate-700 font-medium">
                Account Number *
              </Label>
              <Input
                id="account_number"
                value={formData.account_number}
                onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                placeholder="Enter account number"
                className="h-11 border-slate-200 focus:border-cyan-400"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nickname" className="text-slate-700 font-medium">
                  Nickname
                </Label>
                <Input
                  id="nickname"
                  value={formData.nickname}
                  onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                  placeholder="My EZPass"
                  className="h-11 border-slate-200 focus:border-cyan-400"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="balance" className="text-slate-700 font-medium">
                  Current Balance
                </Label>
                <Input
                  id="balance"
                  type="number"
                  step="0.01"
                  value={formData.balance}
                  onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                  placeholder="0.00"
                  className="h-11 border-slate-200 focus:border-cyan-400"
                />
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="auto_replenish"
                  checked={formData.auto_replenish}
                  onChange={(e) => setFormData({ ...formData, auto_replenish: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                />
                <Label htmlFor="auto_replenish" className="text-sm text-slate-700 cursor-pointer">
                  Enable auto-replenish
                </Label>
              </div>

              {formData.auto_replenish && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="grid grid-cols-2 gap-4 pl-6"
                >
                  <div className="space-y-2">
                    <Label htmlFor="replenish_threshold" className="text-sm text-slate-700">
                      Threshold ($)
                    </Label>
                    <Input
                      id="replenish_threshold"
                      type="number"
                      step="0.01"
                      value={formData.replenish_threshold}
                      onChange={(e) => setFormData({ ...formData, replenish_threshold: e.target.value })}
                      className="h-10 border-slate-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="replenish_amount" className="text-sm text-slate-700">
                      Replenish Amount ($)
                    </Label>
                    <Input
                      id="replenish_amount"
                      type="number"
                      step="0.01"
                      value={formData.replenish_amount}
                      onChange={(e) => setFormData({ ...formData, replenish_amount: e.target.value })}
                      className="h-10 border-slate-200"
                    />
                  </div>
                </motion.div>
              )}

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                />
                <Label htmlFor="is_active" className="text-sm text-slate-700 cursor-pointer">
                  Mark as active
                </Label>
              </div>
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
                {loading ? 'Saving...' : tollPass ? 'Update Pass' : 'Link Pass'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}