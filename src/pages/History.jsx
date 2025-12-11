import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { History as HistoryIcon, ArrowLeft, Filter, Download, Search, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import TripHistoryItem from '@/components/TripHistoryItem';
import { format } from 'date-fns';

export default function History() {
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: trips = [], isLoading } = useQuery({
    queryKey: ['trips'],
    queryFn: () => base44.entities.Trip.list('-entry_time')
  });

  const filteredTrips = trips.filter(trip => {
    const matchesFilter = filter === 'all' || trip.status === filter;
    const matchesSearch = !searchQuery || 
      trip.toll_location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.toll_road?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.license_plate?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.confirmation_number?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const totalAmount = filteredTrips.reduce((acc, t) => acc + (t.amount || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to={createPageUrl('Home')}>
              <Button variant="ghost" size="icon" className="rounded-xl">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Payment History</h1>
              <p className="text-slate-500">View all your toll payments</p>
            </div>
          </div>
        </div>

        {/* Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 mb-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Paid</p>
              <p className="text-4xl font-bold mt-1">${totalAmount.toFixed(2)}</p>
              <p className="text-slate-400 text-sm mt-2">{filteredTrips.length} transactions</p>
            </div>
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center">
              <HistoryIcon className="w-8 h-8 text-blue-400" />
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search by location, plate, or confirmation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 rounded-xl border-slate-200 bg-white"
            />
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-full sm:w-40 h-12 rounded-xl border-slate-200 bg-white">
              <Filter className="w-4 h-4 mr-2 text-slate-400" />
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="disputed">Disputed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Trips List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-24 bg-white rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filteredTrips.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl border border-slate-100 p-12 text-center"
          >
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-10 h-10 text-slate-400" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">No payments found</h2>
            <p className="text-slate-500 max-w-sm mx-auto">
              {searchQuery || filter !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Your toll payment history will appear here'}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {filteredTrips.map((trip, idx) => (
              <TripHistoryItem key={trip.id} trip={trip} delay={idx * 0.05} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}