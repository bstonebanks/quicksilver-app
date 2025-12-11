import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Car, Star, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

export default function VehicleCard({ vehicle, onDelete, onSetPrimary, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card className="border-slate-200 hover:shadow-lg transition-all duration-300 hover:border-cyan-300 relative overflow-hidden">
        {vehicle.is_primary && (
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-400/10 to-blue-600/10 rounded-bl-full" />
        )}
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                <Car className="w-6 h-6 text-slate-600" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-lg text-slate-900">
                    {vehicle.nickname || 'My Vehicle'}
                  </h3>
                  {vehicle.is_primary && (
                    <Badge className="bg-cyan-100 text-cyan-700 border-cyan-200 border">
                      <Star className="w-3 h-3 mr-1 fill-cyan-700" />
                      Primary
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-slate-600">
                  {vehicle.make} {vehicle.model}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 mb-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-slate-500 mb-1">License Plate</p>
                <p className="font-mono font-bold text-2xl text-slate-900">
                  {vehicle.license_plate}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500 mb-1">State</p>
                <p className="font-bold text-lg text-slate-700">{vehicle.state}</p>
              </div>
            </div>
          </div>

          {vehicle.color && (
            <p className="text-sm text-slate-600 mb-4">
              <span className="text-slate-500">Color:</span> {vehicle.color}
            </p>
          )}

          <div className="flex gap-2">
            {!vehicle.is_primary && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSetPrimary(vehicle.id)}
                className="flex-1 border-cyan-200 text-cyan-700 hover:bg-cyan-50"
              >
                <Star className="w-4 h-4 mr-2" />
                Set as Primary
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(vehicle.id)}
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}