import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Star, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

const cardColors = {
  visa: 'from-blue-500 to-blue-700',
  mastercard: 'from-red-500 to-orange-600',
  amex: 'from-slate-600 to-slate-800',
  discover: 'from-orange-500 to-amber-600'
};

export default function PaymentMethodCard({ paymentMethod, onDelete, onSetDefault, index }) {
  const cardColor = cardColors[paymentMethod.card_type] || 'from-slate-500 to-slate-700';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card className="border-slate-200 hover:shadow-lg transition-all duration-300 hover:border-cyan-300 relative overflow-hidden">
        {paymentMethod.is_default && (
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-400/10 to-blue-600/10 rounded-bl-full" />
        )}
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg text-slate-900 capitalize">
                {paymentMethod.card_type}
              </h3>
              {paymentMethod.is_default && (
                <Badge className="bg-cyan-100 text-cyan-700 border-cyan-200 border">
                  <Star className="w-3 h-3 mr-1 fill-cyan-700" />
                  Default
                </Badge>
              )}
            </div>
          </div>

          <div className={`bg-gradient-to-br ${cardColor} rounded-2xl p-6 mb-4 text-white shadow-lg`}>
            <div className="flex justify-between items-start mb-8">
              <CreditCard className="w-10 h-10 opacity-80" />
              <p className="text-xs opacity-80 uppercase tracking-wider">
                {paymentMethod.card_type}
              </p>
            </div>
            <p className="font-mono text-2xl tracking-wider mb-4">
              •••• •••• •••• {paymentMethod.last_four}
            </p>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-xs opacity-70 mb-1">Cardholder</p>
                <p className="font-medium text-sm">{paymentMethod.cardholder_name}</p>
              </div>
              <div className="text-right">
                <p className="text-xs opacity-70 mb-1">Expires</p>
                <p className="font-medium text-sm">
                  {String(paymentMethod.expiry_month).padStart(2, '0')}/{String(paymentMethod.expiry_year).slice(-2)}
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            {!paymentMethod.is_default && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSetDefault(paymentMethod.id)}
                className="flex-1 border-cyan-200 text-cyan-700 hover:bg-cyan-50"
              >
                <Star className="w-4 h-4 mr-2" />
                Set as Default
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(paymentMethod.id)}
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