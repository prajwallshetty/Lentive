'use client';

import React from 'react';
import { CATEGORIES } from '../lib/constants';
import * as Icons from 'lucide-react';

interface CategoryBarProps {
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
}

export default function CategoryBar({ selectedCategory, setSelectedCategory }: CategoryBarProps) {
  return (
    <div className="w-full mt-24 sticky top-[76px] z-30 transition-all">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative">
          <div className="flex gap-2.5 overflow-x-auto py-3 px-1 hide-scrollbar items-center snap-x snap-mandatory scroll-px-4">
            {CATEGORIES.map((cat) => {
              const IconComponent = (Icons as any)[cat.icon] || Icons.HelpCircle;
              const isSelected = selectedCategory === cat.name;

              return (
                <button
                  key={cat.name}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full transition-all duration-300 shrink-0 text-xs font-bold border cursor-pointer active:scale-95 snap-start min-h-[38px] ${
                    isSelected
                      ? 'bg-gradient-to-r from-primary to-[#059669] text-white border-transparent shadow-sm shadow-primary/20 scale-[1.02]'
                      : 'bg-white/80 dark:bg-[#0d1210]/85 text-muted-foreground border-border/40 hover:bg-muted hover:text-foreground hover:border-border/80'
                  } backdrop-blur-md`}
                >
                  <IconComponent className={`h-3.5 w-3.5 transition-colors duration-300 ${isSelected ? 'text-white' : 'text-muted-foreground'}`} />
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
          
          {/* Subtle fade edge indicators */}
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none rounded-r-2xl" />
          <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-background to-transparent pointer-events-none rounded-l-2xl" />
        </div>
      </div>
    </div>
  );
}
