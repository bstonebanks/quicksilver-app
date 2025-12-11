import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Zap, Home, Car, History, User } from 'lucide-react';

export default function Layout({ children, currentPageName }) {
  const navItems = [
    { name: 'Home', icon: Home, page: 'Home' },
    { name: 'Vehicles', icon: Car, page: 'Vehicles' },
    { name: 'History', icon: History, page: 'History' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navigation - Desktop */}
      <nav className="hidden sm:block fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to={createPageUrl('Home')} className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-slate-900">QuickSilver<span className="text-blue-600">Pay</span></span>
          </Link>

          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPageName === item.page;
              return (
                <Link key={item.page} to={createPageUrl(item.page)}>
                  <button className={`px-4 py-2 rounded-xl font-medium text-sm flex items-center gap-2 transition-all ${
                    isActive 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}>
                    <Icon className="w-4 h-4" />
                    {item.name}
                  </button>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="sm:pt-16 pb-24 sm:pb-0">
        {children}
      </main>

      {/* Bottom Navigation - Mobile */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-100 px-2 pb-safe">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPageName === item.page;
            return (
              <Link key={item.page} to={createPageUrl(item.page)}>
                <button className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
                  isActive ? 'text-blue-600' : 'text-slate-400'
                }`}>
                  <Icon className={`w-6 h-6 ${isActive ? 'scale-110' : ''} transition-transform`} />
                  <span className="text-xs font-medium">{item.name}</span>
                </button>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}