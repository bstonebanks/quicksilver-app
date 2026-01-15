import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Car, X } from "lucide-react";
import { motion } from "framer-motion";

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
];

export default function VehicleForm({ onSubmit, onCancel, loading }) {
  const [formData, setFormData] = useState({
    license_plate: '',
    state: '',
    nickname: '',
    make: '',
    model: '',
    color: '',
    is_primary: false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.license_plate || !formData.state) {
      alert('Please fill in required fields: License Plate and State');
      return;
    }
    onSubmit(formData);
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
              <Car className="w-5 h-5 text-cyan-600" />
              Add New Vehicle
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
                <Label htmlFor="license_plate" className="text-slate-700 font-medium">
                  License Plate *
                </Label>
                <Input
                  id="license_plate"
                  value={formData.license_plate}
                  onChange={(e) => setFormData({ ...formData, license_plate: e.target.value.toUpperCase() })}
                  placeholder="ABC1234"
                  className="font-mono h-11 border-slate-200 focus:border-cyan-400"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state" className="text-slate-700 font-medium">State *</Label>
                <Select
                  value={formData.state}
                  onValueChange={(value) => setFormData({ ...formData, state: value })}
                  required
                >
                  <SelectTrigger className="h-11 border-slate-200 focus:border-cyan-400">
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {US_STATES.map((state) => (
                      <SelectItem key={state} value={state}>{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nickname" className="text-slate-700 font-medium">
                Nickname (Optional)
              </Label>
              <Input
                id="nickname"
                value={formData.nickname}
                onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                placeholder="e.g., My Sedan, Work Car"
                className="h-11 border-slate-200 focus:border-cyan-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="make" className="text-slate-700 font-medium">Make</Label>
                <Input
                  id="make"
                  value={formData.make}
                  onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                  placeholder="Toyota"
                  className="h-11 border-slate-200 focus:border-cyan-400"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model" className="text-slate-700 font-medium">Model</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  placeholder="Camry"
                  className="h-11 border-slate-200 focus:border-cyan-400"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="color" className="text-slate-700 font-medium">Color</Label>
              <Input
                id="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                placeholder="Silver"
                className="h-11 border-slate-200 focus:border-cyan-400"
              />
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
                {loading ? 'Adding...' : 'Add Vehicle'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}