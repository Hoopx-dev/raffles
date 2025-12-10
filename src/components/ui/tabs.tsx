'use client';

import { cn } from '@/lib/utils';

interface Tab {
  id: string;
  label: string;
  count?: number;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onTabChange, className }: TabsProps) {
  return (
    <div className={cn("flex", className)}>
      {tabs.map((tab, index) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "flex-1 py-3.5 px-4 text-sm font-semibold transition-all cursor-pointer border-none outline-none",
            activeTab === tab.id
              ? "text-[#D99739] bg-[#91000A] rounded-t-2xl"
              : "text-white/70 bg-transparent hover:text-white"
          )}
        >
          <span className="flex items-center justify-center gap-2">
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className={cn(
                "text-[10px] px-1.5 py-0.5 rounded-full min-w-[18px]",
                activeTab === tab.id
                  ? "bg-primary text-white"
                  : "bg-white/20 text-white"
              )}>
                {tab.count}
              </span>
            )}
          </span>
        </button>
      ))}
    </div>
  );
}

interface SubTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export function SubTabs({ tabs, activeTab, onTabChange, className }: SubTabsProps) {
  return (
    <div className={cn("flex gap-2", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer",
            activeTab === tab.id
              ? "bg-primary text-white"
              : "bg-white/10 text-white/70 hover:bg-white/20"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
