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
    <div className="w-full mt-20 sticky top-[72px] z-40 transition-all">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex gap-2.5 overflow-x-auto py-3 px-4 rounded-2xl border border-border/40 bg-white/70 dark:bg-card/75 backdrop-blur-md hide-scrollbar items-center shadow-sm">
          {CATEGORIES.map((cat) => {
            const IconComponent = (Icons as any)[cat.icon] || Icons.HelpCircle;
            const isSelected = selectedCategory === cat.name;

            return (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 shrink-0 text-xs font-bold border cursor-pointer active:scale-95 ${
                  isSelected
                    ? 'bg-primary text-white border-primary shadow-sm shadow-primary/15'
                    : 'bg-white/50 dark:bg-black/10 text-muted-foreground border-border/40 hover:bg-muted hover:text-foreground'
                }`}
              >
                <IconComponent className={`h-4 w-4 ${isSelected ? 'text-white' : 'text-muted-foreground'}`} />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
