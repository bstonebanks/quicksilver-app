import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { dynamodb } from "../components/utils/dynamodbClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Bell, BellOff, Check, Trash2, AlertCircle, CheckCircle2, 
  MapPin, DollarSign, TrendingUp, Mail, Smartphone, Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

const notificationIcons = {
  toll_detected: MapPin,
  payment_success: CheckCircle2,
  payment_failed: AlertCircle,
  geofence_entry: MapPin,
  geofence_exit: MapPin,
  weekly_summary: TrendingUp,
};

const priorityColors = {
  low: 'bg-slate-100 text-slate-700 border-slate-200',
  medium: 'bg-blue-100 text-blue-700 border-blue-200',
  high: 'bg-amber-100 text-amber-700 border-amber-200',
  urgent: 'bg-red-100 text-red-700 border-red-200',
};

export default function Notifications() {
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [tollAlerts, setTollAlerts] = useState(true);
  const [weeklySummary, setWeeklySummary] = useState(true);

  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => base44.entities.Notification.list('-created_date'),
  });

  const markReadMutation = useMutation({
    mutationFn: (id) => base44.entities.Notification.update(id, { is_read: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const unreadNotifs = notifications.filter(n => !n.is_read);
      await Promise.all(unreadNotifs.map(n => 
        base44.entities.Notification.update(n.id, { is_read: true })
      ));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Notification.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.is_read;
    if (filter === 'read') return n.is_read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Notifications</h1>
            <p className="text-slate-600">Powered by Amazon SNS & AWS Lambda</p>
          </div>
          {unreadCount > 0 && (
            <Button
              onClick={() => markAllReadMutation.mutate()}
              variant="outline"
              className="border-slate-300 hover:bg-slate-50"
            >
              <Check className="w-4 h-4 mr-2" />
              Mark All Read
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Notifications List */}
          <div className="lg:col-span-2 space-y-4">
            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                onClick={() => setFilter('all')}
                className={filter === 'all' ? 'bg-gradient-to-r from-cyan-500 to-blue-600' : ''}
              >
                All ({notifications.length})
              </Button>
              <Button
                variant={filter === 'unread' ? 'default' : 'outline'}
                onClick={() => setFilter('unread')}
                className={filter === 'unread' ? 'bg-gradient-to-r from-cyan-500 to-blue-600' : ''}
              >
                Unread ({unreadCount})
              </Button>
              <Button
                variant={filter === 'read' ? 'default' : 'outline'}
                onClick={() => setFilter('read')}
                className={filter === 'read' ? 'bg-gradient-to-r from-cyan-500 to-blue-600' : ''}
              >
                Read ({notifications.length - unreadCount})
              </Button>
            </div>

            {/* Notifications */}
            {isLoading ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-slate-600">Loading notifications...</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <Card className="border-slate-200">
                <CardContent className="p-16 text-center">
                  <Bell className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">
                    {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                  </h3>
                  <p className="text-slate-600">
                    {filter === 'unread' 
                      ? "You're all caught up!" 
                      : "You'll see notifications here when events occur"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <AnimatePresence>
                {filteredNotifications.map((notif, index) => {
                  const Icon = notificationIcons[notif.type] || Bell;
                  return (
                    <motion.div
                      key={notif.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className={`border-slate-200 hover:shadow-lg transition-all ${
                        !notif.is_read ? 'bg-blue-50 border-blue-200' : 'bg-white'
                      }`}>
                        <CardContent className="p-6">
                          <div className="flex gap-4">
                            <div className={`h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                              notif.priority === 'urgent' ? 'bg-red-100' :
                              notif.priority === 'high' ? 'bg-amber-100' :
                              notif.priority === 'medium' ? 'bg-blue-100' : 'bg-slate-100'
                            }`}>
                              <Icon className={`w-6 h-6 ${
                                notif.priority === 'urgent' ? 'text-red-600' :
                                notif.priority === 'high' ? 'text-amber-600' :
                                notif.priority === 'medium' ? 'text-blue-600' : 'text-slate-600'
                              }`} />
                            </div>

                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h3 className="font-semibold text-slate-900 mb-1">{notif.title}</h3>
                                  <Badge className={`${priorityColors[notif.priority]} border text-xs`}>
                                    {notif.priority}
                                  </Badge>
                                </div>
                                {!notif.is_read && (
                                  <div className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0 ml-2 mt-2" />
                                )}
                              </div>
                              
                              <p className="text-slate-600 text-sm mb-3">{notif.message}</p>
                              
                              <div className="flex items-center justify-between">
                                <p className="text-xs text-slate-500">
                                  {format(new Date(notif.created_date), 'MMM d, yyyy h:mm a')}
                                </p>
                                <div className="flex gap-2">
                                  {!notif.is_read && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => markReadMutation.mutate(notif.id)}
                                      className="text-blue-600 hover:bg-blue-50"
                                    >
                                      <Check className="w-4 h-4 mr-1" />
                                      Mark Read
                                    </Button>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                      if (confirm('Delete this notification?')) {
                                        deleteMutation.mutate(notif.id);
                                      }
                                    }}
                                    className="text-red-600 hover:bg-red-50"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>

          {/* Settings Sidebar */}
          <div className="space-y-6">
            <Card className="border-slate-200 shadow-lg sticky top-24">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg text-slate-900 mb-4 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-cyan-600" />
                  Notification Preferences
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-slate-600" />
                      <div>
                        <p className="font-medium text-slate-900 text-sm">Email Notifications</p>
                        <p className="text-xs text-slate-600">Via Amazon SES</p>
                      </div>
                    </div>
                    <Switch checked={emailNotifs} onCheckedChange={setEmailNotifs} />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-5 h-5 text-slate-600" />
                      <div>
                        <p className="font-medium text-slate-900 text-sm">Push Notifications</p>
                        <p className="text-xs text-slate-600">Via Amazon SNS</p>
                      </div>
                    </div>
                    <Switch checked={pushNotifs} onCheckedChange={setPushNotifs} />
                  </div>

                  <div className="border-t border-slate-200 pt-4 mt-4">
                    <p className="text-xs font-semibold text-slate-700 mb-3">Alert Types</p>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-slate-600" />
                          <p className="text-sm text-slate-900">Toll Detection</p>
                        </div>
                        <Switch checked={tollAlerts} onCheckedChange={setTollAlerts} />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-slate-600" />
                          <p className="text-sm text-slate-900">Weekly Summary</p>
                        </div>
                        <Switch checked={weeklySummary} onCheckedChange={setWeeklySummary} />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AWS Info Card */}
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-blue-900 mb-2 text-sm">AWS-Powered Notifications</p>
                    <p className="text-xs text-blue-800">
                      Real-time alerts delivered via <strong>Amazon SNS</strong> for push notifications 
                      and <strong>Amazon SES</strong> for email. <strong>AWS Lambda</strong> triggers 
                      notifications based on events from <strong>DynamoDB Streams</strong>.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}