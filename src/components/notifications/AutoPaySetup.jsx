import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Zap, CreditCard, Info } from "lucide-react";
import { dynamodb } from "../utils/dynamodbClient";
import { toast } from "sonner";

export default function AutoPaySetup() {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedCard, setSelectedCard] = useState('');
  const [autoPayEnabled, setAutoPayEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    const methods = await dynamodb.paymentMethods.list();
    setPaymentMethods(methods);
    
    const autoPayMethod = methods.find(m => m.auto_pay_enabled);
    if (autoPayMethod) {
      setSelectedCard(autoPayMethod.id);
      setAutoPayEnabled(true);
    }
  };

  const handleToggleAutoPay = async (enabled) => {
    if (enabled && !selectedCard) {
      toast.error('Please select a payment method first');
      return;
    }

    setLoading(true);
    try {
      // Disable auto-pay on all cards first
      await Promise.all(
        paymentMethods.map(pm => 
          dynamodb.paymentMethods.update(pm.id, { auto_pay_enabled: false })
        )
      );

      // Enable on selected card if turning on
      if (enabled && selectedCard) {
        await dynamodb.paymentMethods.update(selectedCard, { auto_pay_enabled: true });
        toast.success('Auto-Pay enabled! Tolls will be charged automatically.');
      } else {
        toast.info('Auto-Pay disabled');
      }

      setAutoPayEnabled(enabled);
      await loadPaymentMethods();
    } catch (error) {
      console.error('Auto-pay error:', error);
      toast.error('Failed to update auto-pay settings');
    } finally {
      setLoading(false);
    }
  };

  const handleCardChange = async (cardId) => {
    setSelectedCard(cardId);
    if (autoPayEnabled) {
      setLoading(true);
      try {
        // Disable on all cards
        await Promise.all(
          paymentMethods.map(pm => 
            dynamodb.paymentMethods.update(pm.id, { auto_pay_enabled: false })
          )
        );
        // Enable on new card
        await dynamodb.paymentMethods.update(cardId, { auto_pay_enabled: true });
        await loadPaymentMethods();
        toast.success('Auto-Pay card updated');
      } catch (error) {
        toast.error('Failed to update card');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Card className="border-slate-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-cyan-600" />
          Auto-Pay
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="bg-blue-50 border-blue-200">
          <Info className="w-4 h-4 text-blue-600" />
          <AlertDescription className="text-blue-800 text-sm">
            When enabled, tolls will be automatically charged to your selected card when detected via geofencing. You'll receive a confirmation notification.
          </AlertDescription>
        </Alert>

        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
          <div>
            <p className="font-semibold text-slate-900">Enable Auto-Pay</p>
            <p className="text-sm text-slate-600">Automatically pay detected tolls</p>
          </div>
          <Switch
            checked={autoPayEnabled}
            onCheckedChange={handleToggleAutoPay}
            disabled={loading || paymentMethods.length === 0}
          />
        </div>

        {autoPayEnabled && (
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Auto-Pay Card
            </Label>
            <Select value={selectedCard} onValueChange={handleCardChange} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder="Select card for auto-pay" />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((pm) => (
                  <SelectItem key={pm.id} value={pm.id}>
                    <div className="flex items-center gap-2">
                      <span className="capitalize">{pm.card_type}</span>
                      <span className="font-mono">•••• {pm.last_four}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {paymentMethods.length === 0 && (
          <Alert>
            <AlertDescription className="text-sm">
              Add a payment method first to enable auto-pay.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}