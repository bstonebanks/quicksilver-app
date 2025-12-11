import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Car, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

const STATES = ['FL', 'GA', 'AL', 'SC', 'NC', 'TX', 'CA', 'NY', 'NJ', 'PA', 'VA', 'MD'];

export default function AddVehicleModal({ isOpen, onClose, onSubmit }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    license_plate: '',
    state: 'FL',
    nickname: '',
    make: '',
    model: '',
    color: '',
    is_primary: false
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onSubmit(formData);
    setIsSubmitting(false);
    setFormData({
      license_plate: '',
      state: 'FL',
      nickname: '',
      make: '',
      model: '',
      color: '',
      is_primary: false
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50"
          >
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden m-4">
              <div className="flex items-center justify-between p-6 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Car className="w-5 h-5 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">Add Vehicle</h2>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <Label className="text-slate-700 font-medium">License Plate *</Label>
                    <Input
                      required
                      value={formData.license_plate}
                      onChange={(e) => setFormData({ ...formData, license_plate: e.target.value.toUpperCase() })}
                      placeholder="ABC1234"
                      className="mt-1.5 h-12 rounded-xl border-slate-200 uppercase font-mono text-lg tracking-wider"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-700 font-medium">State *</Label>
                    <Select value={formData.state} onValueChange={(v) => setFormData({ ...formData, state: v })}>
                      <SelectTrigger className="mt-1.5 h-12 rounded-xl border-slate-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATES.map(s => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-slate-700 font-medium">Nickname</Label>
                  <Input
                    value={formData.nickname}
                    onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                    placeholder="e.g., My Daily Driver"
                    className="mt-1.5 h-12 rounded-xl border-slate-200"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-slate-700 font-medium">Make</Label>
                    <Input
                      value={formData.make}
                      onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                      placeholder="Toyota"
                      className="mt-1.5 h-12 rounded-xl border-slate-200"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-700 font-medium">Model</Label>
                    <Input
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      placeholder="Camry"
                      className="mt-1.5 h-12 rounded-xl border-slate-200"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-slate-700 font-medium">Color</Label>
                  <Input
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    placeholder="Silver"
                    className="mt-1.5 h-12 rounded-xl border-slate-200"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div>
                    <p className="font-medium text-slate-900">Set as primary vehicle</p>
                    <p className="text-sm text-slate-500">Auto-fill this plate for quick payments</p>
                  </div>
                  <Switch
                    checked={formData.is_primary}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_primary: checked })}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={!formData.license_plate || isSubmitting}
                  className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    'Add Vehicle'
                  )}
                </Button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}