import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { MapPin, Plus, Settings, Trash2, Calendar, Clock, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function GeofenceSettings() {
  const queryClient = useQueryClient();
  const [showRuleForm, setShowRuleForm] = useState(false);
  const [showZoneForm, setShowZoneForm] = useState(false);
  const [calendarEvents, setCalendarEvents] = useState('');
  const [predictions, setPredictions] = useState(null);

  const { data: rules = [] } = useQuery({
    queryKey: ['geofenceRules'],
    queryFn: () => base44.entities.GeofenceRule.list(),
  });

  const { data: customZones = [] } = useQuery({
    queryKey: ['customGeofences'],
    queryFn: () => base44.entities.CustomGeofence.list(),
  });

  const createRuleMutation = useMutation({
    mutationFn: (data) => base44.entities.GeofenceRule.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['geofenceRules'] });
      setShowRuleForm(false);
      toast.success('Rule created');
    },
  });

  const deleteRuleMutation = useMutation({
    mutationFn: (id) => base44.entities.GeofenceRule.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['geofenceRules'] });
      toast.success('Rule deleted');
    },
  });

  const toggleRuleMutation = useMutation({
    mutationFn: ({ id, is_active }) => base44.entities.GeofenceRule.update(id, { is_active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['geofenceRules'] });
    },
  });

  const createZoneMutation = useMutation({
    mutationFn: (data) => base44.entities.CustomGeofence.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customGeofences'] });
      setShowZoneForm(false);
      toast.success('Custom zone created');
    },
  });

  const predictTollsMutation = useMutation({
    mutationFn: async () => {
      const events = JSON.parse(calendarEvents);
      const response = await base44.functions.invoke('getCalendarTollPredictions', {
        calendar_events: events
      });
      return response.data;
    },
    onSuccess: (data) => {
      setPredictions(data);
      toast.success('Predictions generated');
    },
    onError: () => {
      toast.error('Failed to generate predictions');
    },
  });

  const [ruleForm, setRuleForm] = useState({
    rule_name: '',
    geofence_id: 'all',
    action: 'notify_with_confirm',
    days_of_week: [],
    time_start: '',
    time_end: '',
  });

  const [zoneForm, setZoneForm] = useState({
    name: '',
    zone_type: 'custom',
    latitude: '',
    longitude: '',
    radius: 500,
  });

  const handleCreateRule = () => {
    createRuleMutation.mutate(ruleForm);
  };

  const handleCreateZone = () => {
    createZoneMutation.mutate({
      ...zoneForm,
      latitude: parseFloat(zoneForm.latitude),
      longitude: parseFloat(zoneForm.longitude),
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Geofence Settings</h1>
          <p className="text-slate-600">Configure advanced geofence rules and custom zones</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Geofence Rules */}
          <div>
            <Card className="border-slate-200 mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-cyan-600" />
                    Automatic Rules
                  </CardTitle>
                  <Button onClick={() => setShowRuleForm(!showRuleForm)} size="sm">
                    <Plus className="w-4 h-4 mr-1" />
                    Add Rule
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <AnimatePresence>
                  {showRuleForm && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-slate-50 rounded-xl p-4 mb-4 space-y-3"
                    >
                      <div>
                        <Label>Rule Name</Label>
                        <Input
                          value={ruleForm.rule_name}
                          onChange={(e) => setRuleForm({ ...ruleForm, rule_name: e.target.value })}
                          placeholder="Weekday Commute"
                        />
                      </div>
                      <div>
                        <Label>Action</Label>
                        <Select value={ruleForm.action} onValueChange={(v) => setRuleForm({ ...ruleForm, action: v })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="auto_pay">Auto-Pay</SelectItem>
                            <SelectItem value="notify_with_confirm">Notify & Confirm</SelectItem>
                            <SelectItem value="notify_only">Notify Only</SelectItem>
                            <SelectItem value="silent">Silent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Start Time</Label>
                          <Input
                            type="time"
                            value={ruleForm.time_start}
                            onChange={(e) => setRuleForm({ ...ruleForm, time_start: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>End Time</Label>
                          <Input
                            type="time"
                            value={ruleForm.time_end}
                            onChange={(e) => setRuleForm({ ...ruleForm, time_end: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleCreateRule} size="sm" disabled={createRuleMutation.isPending}>
                          Create Rule
                        </Button>
                        <Button onClick={() => setShowRuleForm(false)} size="sm" variant="outline">
                          Cancel
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-3">
                  {rules.map((rule) => (
                    <div key={rule.id} className="bg-white rounded-lg p-4 border">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900">{rule.rule_name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className="bg-cyan-100 text-cyan-700 text-xs">
                              {rule.action.replace('_', ' ')}
                            </Badge>
                            {rule.time_start && (
                              <Badge variant="outline" className="text-xs">
                                <Clock className="w-3 h-3 mr-1" />
                                {rule.time_start} - {rule.time_end}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={rule.is_active}
                            onCheckedChange={(checked) =>
                              toggleRuleMutation.mutate({ id: rule.id, is_active: checked })
                            }
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteRuleMutation.mutate(rule.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {rules.length === 0 && (
                    <p className="text-sm text-slate-500 text-center py-8">
                      No rules yet. Create one to automate toll handling.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Custom Zones */}
            <Card className="border-slate-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-purple-600" />
                    Custom Zones
                  </CardTitle>
                  <Button onClick={() => setShowZoneForm(!showZoneForm)} size="sm" variant="outline">
                    <Plus className="w-4 h-4 mr-1" />
                    Add Zone
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <AnimatePresence>
                  {showZoneForm && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-purple-50 rounded-xl p-4 mb-4 space-y-3"
                    >
                      <div>
                        <Label>Zone Name</Label>
                        <Input
                          value={zoneForm.name}
                          onChange={(e) => setZoneForm({ ...zoneForm, name: e.target.value })}
                          placeholder="Home, Work, etc."
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Latitude</Label>
                          <Input
                            type="number"
                            step="0.000001"
                            value={zoneForm.latitude}
                            onChange={(e) => setZoneForm({ ...zoneForm, latitude: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Longitude</Label>
                          <Input
                            type="number"
                            step="0.000001"
                            value={zoneForm.longitude}
                            onChange={(e) => setZoneForm({ ...zoneForm, longitude: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleCreateZone} size="sm" disabled={createZoneMutation.isPending}>
                          Create Zone
                        </Button>
                        <Button onClick={() => setShowZoneForm(false)} size="sm" variant="outline">
                          Cancel
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-3">
                  {customZones.map((zone) => (
                    <div key={zone.id} className="bg-white rounded-lg p-3 border">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-slate-900">{zone.name}</h3>
                          <p className="text-xs text-slate-600">
                            {zone.latitude.toFixed(4)}, {zone.longitude.toFixed(4)}
                          </p>
                        </div>
                        <Badge className="bg-purple-100 text-purple-700">{zone.zone_type}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Calendar Integration */}
          <div>
            <Card className="border-amber-200 bg-amber-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-amber-600" />
                  Calendar Toll Predictions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Paste Calendar Events (JSON)</Label>
                  <textarea
                    className="w-full h-48 p-3 rounded-lg border font-mono text-xs"
                    placeholder='[{"title": "Meeting in SF", "date": "2026-01-20T09:00:00", "location": "San Francisco"}]'
                    value={calendarEvents}
                    onChange={(e) => setCalendarEvents(e.target.value)}
                  />
                </div>
                <Button
                  onClick={() => predictTollsMutation.mutate()}
                  disabled={predictTollsMutation.isPending || !calendarEvents}
                  className="w-full bg-amber-600 hover:bg-amber-700"
                >
                  {predictTollsMutation.isPending ? 'Analyzing...' : 'Predict Tolls'}
                </Button>

                {predictions && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-lg p-4 border-2 border-amber-200"
                  >
                    <h3 className="font-bold text-amber-900 mb-3">Predictions</h3>
                    <p className="text-sm text-slate-700 mb-4">{predictions.summary}</p>
                    <div className="bg-amber-100 rounded-lg p-3 mb-3">
                      <p className="text-lg font-bold text-amber-900">
                        Weekly Total: ${predictions.weekly_total?.toFixed(2)}
                      </p>
                    </div>
                    <div className="space-y-2">
                      {predictions.predictions?.map((pred, idx) => (
                        <div key={idx} className="bg-slate-50 rounded p-3 text-xs">
                          <p className="font-semibold text-slate-900">{pred.event_title}</p>
                          <p className="text-slate-600">{pred.event_location}</p>
                          {pred.toll_likely && (
                            <p className="text-amber-700 mt-1">
                              Est. ${pred.total_estimated_cost?.toFixed(2)} in tolls
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}