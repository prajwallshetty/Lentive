'use client';

import React from 'react';
import { Compass, ShoppingBag, Plus, ClipboardList, Bell } from 'lucide-react';

interface BottomNavigationProps {
  currentView: 'browse' | 'dashboard';
  activeTab: 'overview' | 'listings' | 'requests' | 'rentals' | 'chats' | 'admin';
  onNavigate: (view: 'browse' | 'dashboard', tab?: 'overview' | 'listings' | 'requests' | 'rentals' | 'chats' | 'admin') => void;
  onPostClick: () => void;
  unreadNotifications: number;
  pendingRequests: number;
}

export default function BottomNavigation({
  currentView,
  activeTab,
  onNavigate,
  onPostClick,
  unreadNotifications,
  pendingRequests
}: BottomNavigationProps) {
  const isExplore = currentView === 'browse';
  const isRentals = currentView === 'dashboard' && activeTab === 'rentals';
  const isRequests = currentView === 'dashboard' && activeTab === 'requests';
  const isInbox = currentView === 'dashboard' && (activeTab === 'overview' || activeTab === 'chats');

  return (
    <div className="floating-bottom-nav md:hidden">
      <div className="flex justify-around items-center h-12 max-w-lg mx-auto px-1">
        
        {/* Explore Button */}
        <button
          onClick={() => onNavigate('browse')}
          className={`flex flex-col items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 active:scale-75 relative group ${
            isExplore 
              ? 'text-primary' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
          aria-label="Explore"
        >
          <Compass className={`h-5 w-5 transition-all duration-200 ${isExplore ? 'scale-110 stroke-[2.5px]' : ''}`} />
          {isExplore && (
            <span className="absolute bottom-[-2px] h-1 w-1 bg-primary rounded-full animate-scaleIn" />
          )}
        </button>

        {/* Rentals Button */}
        <button
          onClick={() => onNavigate('dashboard', 'rentals')}
          className={`flex flex-col items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 active:scale-75 relative group ${
            isRentals 
              ? 'text-primary' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
          aria-label="Rentals"
        >
          <ShoppingBag className={`h-5 w-5 transition-all duration-200 ${isRentals ? 'scale-110 stroke-[2.5px]' : ''}`} />
          {isRentals && (
            <span className="absolute bottom-[-2px] h-1 w-1 bg-primary rounded-full animate-scaleIn" />
          )}
        </button>

        {/* Central Post FAB Button */}
        <div className="relative -top-4">
          <button
            onClick={onPostClick}
            className="flex items-center justify-center w-11 h-11 rounded-full bg-gradient-to-tr from-primary to-accent hover:brightness-105 text-white shadow-md hover:shadow-lg active:scale-90 transition-all duration-200 border-2 border-background"
            aria-label="Post an item"
          >
            <Plus className="h-5 w-5 stroke-[3px]" />
          </button>
        </div>

        {/* Requests Button */}
        <button
          onClick={() => onNavigate('dashboard', 'requests')}
          className={`flex flex-col items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 active:scale-75 relative group ${
            isRequests 
              ? 'text-primary' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
          aria-label="Requests"
        >
          <ClipboardList className={`h-5 w-5 transition-all duration-200 ${isRequests ? 'scale-110 stroke-[2.5px]' : ''}`} />
          {pendingRequests > 0 && (
            <span className="absolute top-0 right-0 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-500 text-[7px] font-extrabold text-white animate-pulse">
              {pendingRequests}
            </span>
          )}
          {isRequests && (
            <span className="absolute bottom-[-2px] h-1 w-1 bg-primary rounded-full animate-scaleIn" />
          )}
        </button>

        {/* Inbox/Notifications Button */}
        <button
          onClick={() => onNavigate('dashboard', 'overview')}
          className={`flex flex-col items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 active:scale-75 relative group ${
            isInbox 
              ? 'text-primary' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
          aria-label="Inbox"
        >
          <Bell className={`h-5 w-5 transition-all duration-200 ${isInbox ? 'scale-110 stroke-[2.5px]' : ''}`} />
          {unreadNotifications > 0 && (
            <span className="absolute top-0 right-0 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-rose-500 text-[7px] font-extrabold text-white animate-pulse">
              {unreadNotifications}
            </span>
          )}
          {isInbox && (
            <span className="absolute bottom-[-2px] h-1 w-1 bg-primary rounded-full animate-scaleIn" />
          )}
        </button>

      </div>
    </div>
  );
}
