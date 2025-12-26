'use client';

import { useState } from 'react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'questions', label: 'Question Bank', icon: '❓' },
  { id: 'exams', label: 'Exam Papers', icon: '📝' },
  { id: 'generate', label: 'Generate Exam', icon: '✨' },
  { id: 'colleges', label: 'Colleges', icon: '🏛️' },
  { id: 'distribute', label: 'Distribution', icon: '📤' },
  { id: 'sync', label: 'BloomJoin Sync', icon: '🔄' },
];

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-[var(--bg-secondary)] border-r border-[var(--border-subtle)] transition-all duration-300 z-50 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Logo */}
      <div className="p-6 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent-primary)] to-amber-600 flex items-center justify-center text-xl shadow-lg">
            🎓
          </div>
          {!collapsed && (
            <div className="animate-fade-in">
              <h1 className="font-bold text-lg text-gradient">BloomGate</h1>
              <p className="text-xs text-[var(--text-muted)]">Exam Generator</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {navItems.map((item, index) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`nav-item w-full animate-slide-in ${
              activeTab === item.id ? 'active' : ''
            }`}
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <span className="text-xl">{item.icon}</span>
            {!collapsed && <span>{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-default)] transition-all"
      >
        {collapsed ? '→' : '←'}
      </button>

      {/* Version info */}
      {!collapsed && (
        <div className="absolute bottom-20 left-0 right-0 px-6">
          <div className="p-4 rounded-xl bg-[var(--accent-glow)] border border-[var(--accent-primary)]/20">
            <p className="text-xs text-[var(--accent-primary)] font-medium">Pro Tip</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Use BloomJoin to efficiently sync exam modifications across colleges.
            </p>
          </div>
        </div>
      )}
    </aside>
  );
}

