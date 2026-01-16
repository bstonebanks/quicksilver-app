import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Zap, Home, Car, CreditCard, Receipt, MapPin, Radio, Cloud, Bell, Ticket, LogOut, Clock, Menu } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    } catch (error) {
      console.log('Not authenticated');
    }
  };

  const handleLogout = () => {
    base44.auth.logout();
  };

  const navItems = [
    { name: 'Home', icon: Home, path: createPageUrl('Home') },
    { name: 'Pending', icon: Clock, path: createPageUrl('PendingTolls') },
    { name: 'Map', icon: MapPin, path: createPageUrl('Map') },
    { name: 'Auto-Detect', icon: Radio, path: createPageUrl('AutoDetect') },
    { name: 'Vehicles', icon: Car, path: createPageUrl('Vehicles') },
    { name: 'Toll Passes', icon: Ticket, path: createPageUrl('TollPasses') },
    { name: 'Payments', icon: CreditCard, path: createPageUrl('Payments') },
    { name: 'Recurring', icon: Zap, path: createPageUrl('RecurringPayments') },
    { name: 'History', icon: Receipt, path: createPageUrl('History') },
    { name: 'Alerts', icon: Bell, path: createPageUrl('Notifications') },
  ];

  const mobileNavItems = [
    { name: 'Home', icon: Home, path: createPageUrl('Home') },
    { name: 'Vehicles', icon: Car, path: createPageUrl('Vehicles') },
    { name: 'Map', icon: MapPin, path: createPageUrl('Map') },
    { name: 'Payment', icon: CreditCard, path: createPageUrl('Payments') },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-lg border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center h-20">
            {/* Mobile Menu Button */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72">
                <SheetHeader>
                  <SheetTitle className="text-left">Menu</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-2 mt-6">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);
                    return (
                      <Link
                        key={item.name}
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                          active
                            ? 'bg-gradient-to-r from-slate-500 to-blue-900 text-white'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </SheetContent>
            </Sheet>

            {/* Logo */}
            <Link to={createPageUrl('Home')} className="flex items-center gap-3 group">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-slate-400 to-blue-900 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 overflow-hidden">
                <img 
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693b33d51f81e96e437bf0bf/0742d052d_Quicksilverlogosimple.png" 
                  alt="QuickSilver" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-slate-900">QuickSilver</h1>
                <p className="text-xs text-slate-600">Instant Toll Payment</p>
              </div>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-300 ${
                      active
                        ? 'bg-gradient-to-r from-slate-500 to-blue-900 text-white shadow-lg'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-3">
              {user && (
                <div className="hidden md:flex flex-col items-end">
                  <p className="text-sm font-medium text-slate-900">{user.full_name || user.email}</p>
                  <p className="text-xs text-slate-500">QuickSilver</p>
                </div>
              )}
              <Button
                variant="outline"
                onClick={handleLogout}
                className="flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 shadow-lg">
        <div className="grid grid-cols-4 gap-1 p-2">
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex flex-col items-center gap-1 py-3 rounded-lg transition-all duration-300 ${
                  active
                    ? 'bg-gradient-to-r from-slate-500 to-blue-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <main className="pb-20 md:pb-0">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 mt-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-slate-400 to-blue-900 flex items-center justify-center overflow-hidden">
                <img 
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693b33d51f81e96e437bf0bf/0742d052d_Quicksilverlogosimple.png" 
                  alt="QuickSilver" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="font-bold">QuickSilver Instant Pay</p>
                <p className="text-sm text-slate-400">Never pay toll penalties again</p>
              </div>
            </div>
            <p className="text-sm text-slate-400">
              © 2024 QuickSilver. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}