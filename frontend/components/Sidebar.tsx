'use client';

import { useState } from 'react';
import {
  LayoutDashboard,
  HelpCircle,
  FileText,
  Sparkles,
  Building2,
  Send,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  GraduationCap,
  Lightbulb,
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'questions', label: 'Question Bank', icon: HelpCircle },
  { id: 'exams', label: 'Exam Papers', icon: FileText },
  { id: 'generate', label: 'Generate Exam', icon: Sparkles },
  { id: 'colleges', label: 'Colleges', icon: Building2 },
  { id: 'distribute', label: 'Distribution', icon: Send },
  { id: 'sync', label: 'BloomJoin Sync', icon: RefreshCw },
];

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNavClick = (tabId: string) => {
    onTabChange(tabId);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="mobile-menu-btn"
        aria-label="Toggle menu"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay ${mobileOpen ? 'open' : ''}`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-header">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="icon-wrapper icon-wrapper-md bg-gradient-to-br from-[var(--accent-primary)] to-amber-600 text-black">
                <GraduationCap size={22} />
              </div>
              {!collapsed && (
                <div className="animate-fade-in">
                  <h1 className="font-bold text-lg text-gradient">BloomGate</h1>
                  <p className="text-xs text-[var(--text-muted)]">Exam Generator</p>
                </div>
              )}
            </div>
            {!collapsed && <ThemeToggle />}
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                style={{ 
                  animationDelay: `${index * 0.03}s`,
                  display: 'flex',
                  width: '100%',
                }}
              >
                <Icon className="nav-icon" size={20} />
                {!collapsed && <span className="nav-label">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {!collapsed && (
            <div 
              style={{ 
                padding: '12px', 
                borderRadius: '12px', 
                background: 'var(--accent-glow)', 
                border: '1px solid rgba(245, 158, 11, 0.2)' 
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Lightbulb size={14} style={{ color: 'var(--accent-primary)' }} />
                <span style={{ fontSize: '12px', color: 'var(--accent-primary)', fontWeight: 500 }}>Pro Tip</span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                Use BloomJoin to sync exam modifications across colleges efficiently.
              </p>
            </div>
          )}
          
          {/* Collapse toggle - desktop only */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{
              display: 'none',
              width: '100%',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '8px',
              borderRadius: '8px',
              color: 'var(--text-muted)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.2s ease',
            }}
            className="collapse-btn"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
