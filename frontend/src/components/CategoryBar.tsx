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
    <div className="w-full border-b border-border bg-card/40 backdrop-blur-md sticky top-[61px] z-40 transition-all">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex gap-8 overflow-x-auto py-3 no-scrollbar items-center">
          {CATEGORIES.map((cat) => {
            const IconComponent = (Icons as any)[cat.icon] || Icons.HelpCircle;
            const isSelected = selectedCategory === cat.name;

            return (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className={`flex flex-col items-center gap-1.5 pb-1 border-b-2 transition shrink-0 hover:text-foreground text-xs font-semibold ${
                  isSelected
                    ? 'border-accent text-foreground'
                    : 'border-transparent text-muted-foreground hover:border-muted-foreground/30'
                }`}
              >
                <IconComponent className={`h-5 w-5 ${isSelected ? 'text-accent' : ''}`} />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
