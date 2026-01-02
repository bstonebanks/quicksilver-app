import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { dynamodb } from "../components/utils/dynamodbClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, CreditCard, Trash2, DollarSign, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import TollPassForm from "../components/tollpasses/TollPassForm";

const passTypeNames = {
  ezpass: 'E-ZPass',
  fastrak: 'FasTrak',
  sunpass: 'SunPass',
  ipass: 'I-PASS',
  txtag: 'TxTag',
  peachpass: 'Peach Pass',
  other: 'Other'
};

const passTypeColors = {
  ezpass: 'from-purple-500 to-indigo-600',
  fastrak: 'from-blue-500 to-cyan-600',
  sunpass: 'from-yellow-500 to-orange-600',
  ipass: 'from-red-500 to-pink-600',
  txtag: 'from-green-500 to-emerald-600',
  peachpass: 'from-pink-500 to-rose-600',
  other: 'from-slate-500 to-slate-700'
};

export default function TollPasses() {
  const [showForm, setShowForm] = useState(false);
  const [editingPass, setEditingPass] = useState(null);
  const queryClient = useQueryClient();

  const { data: tollPasses = [], isLoading } = useQuery({
    queryKey: ['tollPasses'],
    queryFn: async () => {
      const allPasses = await dynamodb.tollPasses.list();
      return allPasses.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    },
  });

  const createMutation = useMutation({
    mutationFn: (data) => dynamodb.tollPasses.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tollPasses'] });
      setShowForm(false);
      setEditingPass(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => dynamodb.tollPasses.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tollPasses'] });
      setEditingPass(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => dynamodb.tollPasses.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tollPasses'] });
    },
  });

  const handleSubmit = (data) => {
    if (editingPass) {
      updateMutation.mutate({ id: editingPass.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const totalBalance = tollPasses.reduce((sum, pass) => sum + (pass.balance || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Toll Passes</h1>
            <p className="text-slate-600">Manage your existing toll pass accounts</p>
          </div>
          {!showForm && (
            <Button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-lg h-12 px-6"
            >
              <Plus className="w-5 h-5 mr-2" />
              Link Toll Pass
            </Button>
          )}
        </div>

        {/* Balance Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="border-slate-200 shadow-lg bg-gradient-to-br from-white to-slate-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Total Balance Across All Passes</p>
                  <p className="text-4xl font-bold text-slate-900">${totalBalance.toFixed(2)}</p>
                </div>
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg">
                  <DollarSign className="w-8 h-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <AnimatePresence mode="wait">
          {showForm && (
            <div className="mb-8 max-w-2xl">
              <TollPassForm
                tollPass={editingPass}
                onSubmit={handleSubmit}
                onCancel={() => {
                  setShowForm(false);
                  setEditingPass(null);
                }}
                loading={createMutation.isPending || updateMutation.isPending}
              />
            </div>
          )}
        </AnimatePresence>

        {isLoading ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-600">Loading toll passes...</p>
          </div>
        ) : tollPasses.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-16 text-center border border-slate-200 shadow-lg"
          >
            <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-6">
              <CreditCard className="w-12 h-12 text-slate-400" />
            </div>
            <h3 className="text-2xl font-semibold text-slate-900 mb-3">No toll passes linked</h3>
            <p className="text-slate-600 mb-6 max-w-md mx-auto">
              Link your existing E-ZPass, FasTrak, or other toll accounts to manage them here
            </p>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 h-12 px-8"
            >
              <Plus className="w-5 h-5 mr-2" />
              Link Your First Pass
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tollPasses.map((pass, index) => {
              const colorGradient = passTypeColors[pass.pass_type] || passTypeColors.other;
              return (
                <motion.div
                  key={pass.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="border-slate-200 hover:shadow-lg transition-all duration-300 hover:border-cyan-300">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-lg text-slate-900">
                            {passTypeNames[pass.pass_type]}
                          </h3>
                          {pass.is_active && (
                            <Badge className="bg-green-100 text-green-700 border-green-200 border">
                              Active
                            </Badge>
                          )}
                          {pass.auto_replenish && (
                            <Badge className="bg-blue-100 text-blue-700 border-blue-200 border">
                              <RefreshCw className="w-3 h-3 mr-1" />
                              Auto-Replenish
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className={`bg-gradient-to-br ${colorGradient} rounded-2xl p-5 mb-4 text-white shadow-lg`}>
                        <p className="text-xs opacity-80 uppercase tracking-wider mb-3">
                          {pass.state || 'Account'}
                        </p>
                        <p className="font-mono text-xl tracking-wider mb-4">
                          {pass.account_number}
                        </p>
                        <div className="flex justify-between items-end">
                          <div>
                            <p className="text-xs opacity-70 mb-1">Balance</p>
                            <p className="font-bold text-2xl">${(pass.balance || 0).toFixed(2)}</p>
                          </div>
                          {pass.nickname && (
                            <div className="text-right">
                              <p className="text-xs opacity-70 mb-1">Nickname</p>
                              <p className="font-medium text-sm">{pass.nickname}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {pass.auto_replenish && (
                        <div className="bg-blue-50 rounded-lg p-3 mb-3 text-sm">
                          <p className="text-blue-900">
                            Replenish <span className="font-semibold">${pass.replenish_amount}</span> when 
                            balance drops below <span className="font-semibold">${pass.replenish_threshold}</span>
                          </p>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingPass(pass);
                            setShowForm(true);
                          }}
                          className="flex-1 border-cyan-200 text-cyan-700 hover:bg-cyan-50"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (confirm('Delete this toll pass?')) {
                              deleteMutation.mutate(pass.id);
                            }
                          }}
                          className="text-red-600 hover:bg-red-50 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}