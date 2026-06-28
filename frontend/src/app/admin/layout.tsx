'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { HookahIcon, WalletIcon, OrderIcon, UsersIcon, LeafIcon, MusicIcon, SettingsIcon } from '@/components/ui/Icons';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { href: '/admin', label: 'Дашборд', icon: (color: string) => <WalletIcon size={16} color={color} /> },
    { href: '/admin/orders', label: 'Заказы', icon: (color: string) => <OrderIcon size={16} color={color} /> },
    { href: '/admin/clients', label: 'Клиенты', icon: (color: string) => <UsersIcon size={16} color={color} /> },
    { href: '/admin/tobacco', label: 'Табаки', icon: (color: string) => <LeafIcon size={16} color={color} /> },
    { href: '/admin/atmosphere', label: 'Атмосфера', icon: (color: string) => <MusicIcon size={16} color={color} /> },
    { href: '/admin/smart', label: 'Smart', icon: (color: string) => <SettingsIcon size={16} color={color} /> },
  ];

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-primary)' }}>
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 fixed top-0 left-0 bottom-0 z-40 glass-strong font-mono-utility" style={{ borderRight: '1px solid var(--border)' }}>
        <div className="p-6 flex items-center gap-3" style={{ borderBottom: '1px solid var(--border)' }}>
          <HookahIcon size={20} color="var(--gold)" />
          <span className="text-[10px] font-semibold tracking-[0.2em] text-gold-gradient" style={{ fontFamily: "'Playfair Display', serif" }}>
            SPORT LOUNGE
          </span>
          <span className="text-[8px] font-bold px-2 py-0.5 rounded-full ml-auto" style={{ background: 'rgba(212,165,116,0.06)', color: 'var(--gold)', border: '1px solid var(--border)' }}>
            ADM
          </span>
        </div>

        <nav className="flex-1 p-4 flex flex-col gap-1 text-[10px]">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const itemColor = isActive ? 'var(--gold-light)' : 'var(--text-secondary)';
            return (
              <Link
                key={item.href}
                href={item.href}
                className="no-underline flex items-center gap-4 px-4 py-3 rounded-xl font-bold uppercase tracking-wider transition-all duration-300"
                style={{
                  background: isActive ? 'rgba(212, 165, 116, 0.04)' : 'transparent',
                  color: itemColor,
                  border: `1px solid ${isActive ? 'rgba(212, 165, 116, 0.15)' : 'transparent'}`,
                }}
              >
                {item.icon(itemColor)}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-5" style={{ borderTop: '1px solid var(--border)' }}>
          <Link href="/" className="no-underline flex items-center gap-2 text-[9px] font-bold uppercase tracking-wider transition-all hover:text-gold" style={{ color: 'var(--text-muted)' }}>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            На сайт
          </Link>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 glass-strong flex items-center justify-between px-4 h-16" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2.5">
          <HookahIcon size={18} color="var(--gold)" />
          <span className="text-[10px] font-bold tracking-wider text-gold-gradient font-mono-utility">SPORT LOUNGE ADMIN</span>
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 border-none cursor-pointer" style={{ background: 'transparent', color: 'var(--text-primary)' }}>
          {sidebarOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40" onClick={() => setSidebarOpen(false)}>
          <div className="absolute inset-0 bg-black/70" />
          <div className="absolute top-16 left-0 bottom-0 w-64 glass-strong animate-slide-up" style={{ borderRight: '1px solid var(--border)' }} onClick={(e) => e.stopPropagation()}>
            <nav className="p-3 flex flex-col gap-1 text-[10px] font-mono-utility">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const itemColor = isActive ? 'var(--gold-light)' : 'var(--text-secondary)';
                return (
                  <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}
                    className="no-underline flex items-center gap-4 px-4 py-3 rounded-xl font-bold uppercase tracking-wider transition-all"
                    style={{
                      background: isActive ? 'rgba(212, 165, 116, 0.04)' : 'transparent',
                      color: itemColor,
                      border: `1px solid ${isActive ? 'var(--border)' : 'transparent'}`,
                    }}>
                    {item.icon(itemColor)}
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 glass-strong flex justify-around py-2" style={{ borderTop: '1px solid var(--border)' }}>
        {navItems.slice(0, 5).map((item) => {
          const isActive = pathname === item.href;
          const itemColor = isActive ? 'var(--gold)' : 'var(--text-muted)';
          return (
            <Link key={item.href} href={item.href} className="no-underline flex flex-col items-center gap-1 px-2 py-1 font-mono-utility"
              style={{ color: itemColor, fontSize: '0.6rem', fontWeight: 600, textTransform: 'uppercase' }}>
              {item.icon(itemColor)}
              <span className="uppercase tracking-wider mt-0.5">{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Main content */}
      <main className="flex-1 md:ml-64 pt-16 md:pt-0 pb-20 md:pb-0">
        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
