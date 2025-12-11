import React from 'react';
import { motion } from 'framer-motion';
import { Car, Star, MoreVertical, Trash2, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function VehicleCard({ vehicle, onDelete, onSetPrimary, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-lg hover:border-slate-200 transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
          vehicle.is_primary ? 'bg-blue-100' : 'bg-slate-100'
        }`}>
          <Car className={`w-6 h-6 ${vehicle.is_primary ? 'text-blue-600' : 'text-slate-500'}`} />
        </div>
        <div className="flex items-center gap-2">
          {vehicle.is_primary && (
            <span className="px-2.5 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded-full flex items-center gap-1">
              <Star className="w-3 h-3" />
              Primary
            </span>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="w-4 h-4 text-slate-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {!vehicle.is_primary && (
                <DropdownMenuItem onClick={() => onSetPrimary(vehicle.id)}>
                  <Star className="w-4 h-4 mr-2" />
                  Set as Primary
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => onDelete(vehicle.id)} className="text-red-600">
                <Trash2 className="w-4 h-4 mr-2" />
                Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="space-y-1">
        <h4 className="font-semibold text-slate-900">
          {vehicle.nickname || `${vehicle.make || ''} ${vehicle.model || ''}`.trim() || 'My Vehicle'}
        </h4>
        <div className="flex items-center gap-3">
          <span className="font-mono text-lg font-bold text-slate-900 tracking-wider">
            {vehicle.license_plate}
          </span>
          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-medium rounded">
            {vehicle.state}
          </span>
        </div>
        {vehicle.color && (
          <p className="text-sm text-slate-500">{vehicle.color}</p>
        )}
      </div>
    </motion.div>
  );
}