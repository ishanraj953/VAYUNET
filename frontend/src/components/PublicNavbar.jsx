import React from 'react';
import { Link } from 'react-router-dom';
import { Wind, Shield, ArrowRight, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function PublicNavbar() {
  const { isAuthenticated, user } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-[#FFFDF5]/90 backdrop-blur-md border-b border-[#F2E8D5] px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-xs">
            <Wind className="w-5 h-5 text-white stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-base font-black tracking-tight text-stone-900 uppercase">
              VAYUNET INDIA
            </h1>
            <p className="text-[10px] text-stone-500 font-medium">
              National Air Pollution & Health Risk Intelligence Platform
            </p>
          </div>
        </Link>

        {/* Public Nav Links */}
        <nav className="hidden md:flex items-center space-x-8 text-xs font-bold text-stone-600">
          <Link to="/" className="hover:text-amber-700 transition-colors">Overview</Link>
          <Link to="/about" className="hover:text-amber-700 transition-colors">About Platform</Link>
          <Link to="/contact" className="hover:text-amber-700 transition-colors">Emergency Contact</Link>
          <Link to="/privacy" className="hover:text-stone-900 transition-colors">Privacy</Link>
        </nav>

        {/* Auth CTA */}
        <div className="flex items-center space-x-3">
          {isAuthenticated ? (
            <Link
              to="/app/overview"
              className="flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs transition-all"
            >
              <span>Enter Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="px-3.5 py-2 text-xs font-bold text-stone-700 hover:text-amber-800 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="flex items-center space-x-1.5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs transition-all"
              >
                <span>Register</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
