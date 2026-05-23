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
    <div className="w-full sticky top-[82px] z-30 transition-all duration-300">
      <div className="relative bg-background/80 dark:bg-background/85 backdrop-blur-md py-3 px-1">
        <div className="flex gap-4 md:gap-7 overflow-x-auto hide-scrollbar items-center justify-start md:justify-center snap-x snap-mandatory scroll-px-4">
          {CATEGORIES.map((cat) => {
            const IconComponent = (Icons as any)[cat.icon] || Icons.HelpCircle;
            const isSelected = selectedCategory === cat.name;

            return (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className="flex flex-col items-center gap-1.5 cursor-pointer group snap-start shrink-0 transition-all duration-300 relative pb-1 active:scale-95"
              >
                {/* Circular Icon Container */}
                <div 
                  className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isSelected
                      ? 'bg-gradient-to-tr from-primary to-[#10b981] text-white shadow-md shadow-primary/20 scale-105 border-transparent'
                      : 'bg-primary/5 dark:bg-white/5 border border-primary/5 dark:border-white/5 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/10 dark:group-hover:text-primary-foreground group-hover:scale-105'
                  }`}
                >
                  <IconComponent 
                    className={`h-4.5 w-4.5 transition-all duration-300 group-hover:rotate-6 ${
                      isSelected ? 'stroke-[2.5px] scale-110 text-white' : 'stroke-[2px]'
                    }`} 
                  />
                </div>

                {/* Compact Label */}
                <span 
                  className={`text-[9px] font-black uppercase tracking-wider transition-colors duration-300 ${
                    isSelected 
                      ? 'text-primary dark:text-[#34d399]' 
                      : 'text-muted-foreground/80 group-hover:text-foreground'
                  }`}
                >
                  {cat.name}
                </span>

                {/* Bottom Dot Indicator */}
                {isSelected && (
                  <span className="absolute bottom-[-1px] w-1 h-1 rounded-full bg-primary dark:bg-[#34d399] shadow-sm animate-scaleIn" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
