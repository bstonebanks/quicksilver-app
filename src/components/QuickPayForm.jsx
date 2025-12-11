import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Car, CreditCard, CheckCircle, Loader2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const TOLL_ROADS = [
  { id: 'i-95', name: 'I-95 Express', locations: ['Miami Plaza', 'Fort Lauderdale', 'West Palm Beach'] },
  { id: 'turnpike', name: 'Florida Turnpike', locations: ['Homestead', 'Golden Glades', 'Wildwood'] },
  { id: 'sawgrass', name: 'Sawgrass Expressway', locations: ['Sunrise Blvd', 'Commercial Blvd', 'Sample Rd'] },
  { id: 'dolphin', name: 'Dolphin Expressway', locations: ['NW 87th Ave', 'NW 57th Ave', 'Downtown Miami'] },
];

const STATES = ['FL', 'GA', 'AL', 'SC', 'NC', 'TX', 'CA', 'NY', 'NJ'];

export default function QuickPayForm({ vehicles = [], onPaymentComplete }) {
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    tollRoad: '',
    tollLocation: '',
    licensePlate: '',
    state: 'FL',
    dateTime: new Date().toISOString().slice(0, 16),
    savedVehicle: ''
  });

  const selectedRoad = TOLL_ROADS.find(r => r.id === formData.tollRoad);
  const estimatedToll = formData.tollLocation ? (Math.random() * 3 + 1.5).toFixed(2) : '0.00';

  const handleVehicleSelect = (vehicleId) => {
    if (vehicleId === 'new') {
      setFormData({ ...formData, savedVehicle: '', licensePlate: '', state: 'FL' });
    } else {
      const vehicle = vehicles.find(v => v.id === vehicleId);
      if (vehicle) {
        setFormData({
          ...formData,
          savedVehicle: vehicleId,
          licensePlate: vehicle.license_plate,
          state: vehicle.state
        });
      }
    }
  };

  const handleSubmit = async () => {
    setIsProcessing(true);
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsProcessing(false);
    setStep(3);
    if (onPaymentComplete) {
      onPaymentComplete({
        ...formData,
        amount: parseFloat(estimatedToll),
        confirmationNumber: 'QS' + Math.random().toString(36).substr(2, 9).toUpperCase()
      });
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
      {/* Progress indicator */}
      <div className="flex items-center gap-2 p-6 border-b border-slate-100 bg-slate-50/50">
        {[1, 2, 3].map((s) => (
          <React.Fragment key={s}>
            <motion.div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                step >= s ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'
              }`}
              animate={{ scale: step === s ? 1.1 : 1 }}
            >
              {step > s ? <CheckCircle className="w-4 h-4" /> : s}
            </motion.div>
            {s < 3 && (
              <div className={`flex-1 h-0.5 transition-all duration-500 ${
                step > s ? 'bg-blue-600' : 'bg-slate-200'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="p-6 space-y-5"
          >
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-1">Toll Information</h3>
              <p className="text-sm text-slate-500">Where did you pass through without your pass?</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-slate-700 font-medium">Toll Road</Label>
                <Select value={formData.tollRoad} onValueChange={(v) => setFormData({ ...formData, tollRoad: v, tollLocation: '' })}>
                  <SelectTrigger className="mt-1.5 h-12 rounded-xl border-slate-200 focus:ring-blue-500">
                    <SelectValue placeholder="Select toll road" />
                  </SelectTrigger>
                  <SelectContent>
                    {TOLL_ROADS.map(road => (
                      <SelectItem key={road.id} value={road.id}>{road.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedRoad && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <Label className="text-slate-700 font-medium">Toll Plaza</Label>
                  <Select value={formData.tollLocation} onValueChange={(v) => setFormData({ ...formData, tollLocation: v })}>
                    <SelectTrigger className="mt-1.5 h-12 rounded-xl border-slate-200 focus:ring-blue-500">
                      <SelectValue placeholder="Select plaza" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedRoad.locations.map(loc => (
                        <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </motion.div>
              )}

              <div>
                <Label className="text-slate-700 font-medium">Date & Time of Passage</Label>
                <Input
                  type="datetime-local"
                  value={formData.dateTime}
                  onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })}
                  className="mt-1.5 h-12 rounded-xl border-slate-200 focus:ring-blue-500"
                />
              </div>
            </div>

            <Button
              onClick={() => setStep(2)}
              disabled={!formData.tollRoad || !formData.tollLocation}
              className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium mt-4"
            >
              Continue
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="p-6 space-y-5"
          >
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-1">Vehicle Details</h3>
              <p className="text-sm text-slate-500">Enter the license plate that passed through</p>
            </div>

            {vehicles.length > 0 && (
              <div>
                <Label className="text-slate-700 font-medium">Saved Vehicles</Label>
                <Select value={formData.savedVehicle} onValueChange={handleVehicleSelect}>
                  <SelectTrigger className="mt-1.5 h-12 rounded-xl border-slate-200 focus:ring-blue-500">
                    <SelectValue placeholder="Select a saved vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">Enter new plate</SelectItem>
                    {vehicles.map(v => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.nickname || v.license_plate} ({v.state})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <Label className="text-slate-700 font-medium">License Plate</Label>
                <Input
                  value={formData.licensePlate}
                  onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value.toUpperCase() })}
                  placeholder="ABC1234"
                  className="mt-1.5 h-12 rounded-xl border-slate-200 focus:ring-blue-500 uppercase font-mono text-lg tracking-wider"
                />
              </div>
              <div>
                <Label className="text-slate-700 font-medium">State</Label>
                <Select value={formData.state} onValueChange={(v) => setFormData({ ...formData, state: v })}>
                  <SelectTrigger className="mt-1.5 h-12 rounded-xl border-slate-200 focus:ring-blue-500">
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

            {/* Toll Summary */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-5 text-white">
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-400 text-sm">Toll Amount</span>
                <span className="text-3xl font-bold">${estimatedToll}</span>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between text-slate-400">
                  <span>{selectedRoad?.name}</span>
                  <span>{formData.tollLocation}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>No penalty fee</span>
                  <span className="text-green-400">$0.00</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="flex-1 h-12 rounded-xl border-slate-200"
              >
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!formData.licensePlate || isProcessing}
                className="flex-1 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Pay ${estimatedToll}
                    <CreditCard className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-8 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center"
            >
              <CheckCircle className="w-10 h-10 text-green-600" />
            </motion.div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Payment Successful!</h3>
            <p className="text-slate-500 mb-6">Your toll has been paid without any penalty fees</p>
            
            <div className="bg-slate-50 rounded-2xl p-4 mb-6 text-left">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-slate-500">Amount Paid</span>
                  <p className="font-semibold text-slate-900">${estimatedToll}</p>
                </div>
                <div>
                  <span className="text-slate-500">License Plate</span>
                  <p className="font-semibold text-slate-900 font-mono">{formData.licensePlate}</p>
                </div>
                <div>
                  <span className="text-slate-500">Location</span>
                  <p className="font-semibold text-slate-900">{formData.tollLocation}</p>
                </div>
                <div>
                  <span className="text-slate-500">Confirmation</span>
                  <p className="font-semibold text-blue-600 font-mono">QS{Math.random().toString(36).substr(2, 6).toUpperCase()}</p>
                </div>
              </div>
            </div>

            <Button
              onClick={() => {
                setStep(1);
                setFormData({
                  tollRoad: '',
                  tollLocation: '',
                  licensePlate: '',
                  state: 'FL',
                  dateTime: new Date().toISOString().slice(0, 16),
                  savedVehicle: ''
                });
              }}
              className="w-full h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium"
            >
              Pay Another Toll
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}