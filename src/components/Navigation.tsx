'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  TrendingUp,
  ShoppingBag,
  Activity,
  Settings,
  Menu,
  X,
} from 'lucide-react';

export function Navigation() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navItems = [
    {
      href: '/',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      href: '/products',
      label: 'Products',
      icon: Package,
    },
    {
      href: '/channels',
      label: 'Sales Channels',
      icon: ShoppingBag,
    },
    {
      href: '/movements',
      label: 'Stock Movements',
      icon: Activity,
    },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="bg-gray-900 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="bg-blue-600 p-2 rounded-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <span className="text-white font-bold text-xl">InventoryPro</span>
            </Link>

            <div className="hidden md:block ml-10">
              <div className="flex items-center gap-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        active
                          ? 'bg-gray-800 text-white'
                          : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <button className="text-gray-400 hover:text-white transition-colors">
              <Settings className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-gray-800">
              <div className="text-right">
                <div className="text-sm font-medium text-white">Admin User</div>
                <div className="text-xs text-gray-400">admin@inventory.com</div>
              </div>
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                A
              </div>
            </div>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-800">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-base font-medium transition-colors ${
                    active
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="border-t border-gray-800 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                A
              </div>
              <div>
                <div className="text-sm font-medium text-white">Admin User</div>
                <div className="text-xs text-gray-400">admin@inventory.com</div>
              </div>
            </div>
            <button className="mt-3 w-full flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors">
              <Settings className="w-5 h-5" />
              <span className="text-sm font-medium">Settings</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}