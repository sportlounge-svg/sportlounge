'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { supabase } from '@/lib/supabase';
import { api } from '@/lib/api';
import { Order, STATUS_LABELS, STATUS_EMOJI } from '@/types';
import { CrownIcon, OrderIcon, UsersIcon, LogoutIcon } from '@/components/ui/Icons';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [mixes, setMixes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        router.replace('/login');
        return;
      }
      
      try {
        const token = session.access_token;
        const [profile, history, savedMixes] = await Promise.all([
          api.getCurrentUser(token),
          api.getUserOrders(token),
          api.getUserMixes(token)
        ]);
        
        setUser(profile);
        setOrders(history);
        setMixes(savedMixes);
      } catch (e) {
        console.error('Error fetching user profile data:', e);
        // Fallback to basic session info
        setUser({
          ...session.user,
          name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Гость',
          avatar: session.user.user_metadata?.avatar_url || null,
          role: 'client',
          total_orders: 0,
          total_spent: 0
        });
      } finally {
        setLoading(false);
      }
    });
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/');
  };

  const handleDeleteMix = async (mixId: number) => {
    if (!confirm('Вы действительно хотите удалить этот микс?')) return;
    try {
      const session = (await supabase.auth.getSession()).data.session;
      if (!session) return;
      
      await api.deleteUserMix(session.access_token, mixId);
      setMixes(mixes.filter(m => m.id !== mixId));
    } catch (e: any) {
      alert('Ошибка при удалении: ' + e.message);
    }
  };

  const handleOrderMix = (mix: any) => {
    localStorage.setItem('sport_lounge_prefill_mix', JSON.stringify(mix.items.map((i: any) => ({
      flavor_id: i.flavor_id,
      name: i.flavor.name,
      brand: i.flavor.brand?.name || 'Unknown',
      grams: i.grams
    }))));
    router.push('/order');
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="pt-36 md:pt-40 pb-16 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <span className="animate-spin inline-block w-8 h-8 rounded-full border-4 border-solid border-current border-t-transparent text-gold mr-3" style={{ color: 'var(--gold)' }} />
            <p className="mt-4 text-xs uppercase tracking-wider font-mono-utility" style={{ color: 'var(--text-muted)' }}>Загрузка профиля...</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const isUserValid = user && user.role;

  return (
    <>
      <Header />
      <main className="pt-36 md:pt-40 pb-16 min-h-screen relative overflow-hidden smoke-bg">
        {/* Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full filter blur-[150px] opacity-[0.03] pointer-events-none"
          style={{ background: 'radial-gradient(circle, var(--gold) 0%, transparent 70%)' }} />

        <div className="max-w-4xl mx-auto px-4 pt-4 relative z-10 animate-fade-in">
          {/* Profile header card */}
          {user && (
            <div className="card p-8 md:p-10 mb-12 relative overflow-hidden shadow-premium" style={{ border: '1px solid var(--border)' }}>
              <div className="flex flex-col md:flex-row items-center gap-8 z-10 relative">
                {isUserValid && user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-20 h-20 rounded-full border-2 border-solid" style={{ borderColor: 'var(--gold)' }} />
                ) : (
                  <div className="w-20 h-20 rounded-full flex items-center justify-center border" style={{ background: 'rgba(255,255,255,0.01)', borderColor: 'var(--border)' }}>
                    <UsersIcon size={32} color="var(--gold)" />
                  </div>
                )}
                
                <div className="text-center md:text-left flex-1">
                  <h1 className="text-3xl font-bold text-gold-gradient mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {isUserValid ? user.name : (user.email ? user.email.split('@')[0] : 'Уважаемый Гость')}
                  </h1>
                  <p className="text-xs mb-5 font-mono-utility" style={{ color: 'var(--text-secondary)' }}>{user.email}</p>
                  
                  <div className="flex flex-wrap justify-center md:justify-start gap-3.5 text-[9px] font-bold uppercase tracking-wider font-mono-utility">
                    <span className="px-3.5 py-1.5 rounded-full" style={{ background: 'rgba(212,165,116,0.03)', color: 'var(--gold)', border: '1px solid var(--border)' }}>
                      Статус: {isUserValid && user.role === 'admin' ? 'Администратор' : isUserValid && user.role === 'master' ? 'Мастер' : 'VIP Клиент'}
                    </span>
                    <span className="px-3.5 py-1.5 rounded-full" style={{ background: 'rgba(129,199,132,0.04)', color: 'var(--success)', border: '1px solid rgba(129,199,132,0.15)' }}>
                      {isUserValid ? user.total_orders : 0} визитов
                    </span>
                    <span className="px-3.5 py-1.5 rounded-full" style={{ background: 'rgba(100,181,246,0.04)', color: 'var(--info)', border: '1px solid rgba(100,181,246,0.15)' }}>
                      {(isUserValid ? user.total_spent : 0).toLocaleString('ru-RU')}₽
                    </span>
                  </div>
                </div>

                <button onClick={handleLogout} className="btn-outline text-[9px] font-bold px-5 py-2.5 flex items-center gap-2 font-mono-utility">
                  <LogoutIcon size={12} color="var(--gold)" />
                  Выйти
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Left side: Favourite Mixes */}
            <div>
              <div className="flex items-center gap-2.5 mb-6">
                <CrownIcon size={18} color="var(--gold)" />
                <h2 className="text-xl font-bold text-gold-gradient" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Мои миксы
                </h2>
              </div>
              
              {mixes.length === 0 ? (
                <div className="card p-10 text-center shadow-premium" style={{ border: '1px solid var(--border)' }}>
                  <span className="text-4xl block mb-3">🍃</span>
                  <p className="text-xs font-light" style={{ color: 'var(--text-muted)' }}>У вас пока нет сохраненных миксов</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {mixes.map(mix => (
                    <div key={mix.id} className="card p-6 shadow-premium hover-lift" style={{ border: '1px solid var(--border)' }}>
                      <div className="flex justify-between items-start mb-3 gap-2">
                        <h3 className="font-semibold text-xs uppercase tracking-wide">{mix.name}</h3>
                        <div className="flex gap-2">
                          <button onClick={() => handleOrderMix(mix)} className="text-[8px] font-bold uppercase tracking-wider border-none cursor-pointer px-3 py-1.5 rounded-lg btn-gold font-mono-utility">Заказать</button>
                          <button onClick={() => handleDeleteMix(mix.id)} className="text-xs border-none cursor-pointer p-1 rounded-lg" style={{ color: 'var(--danger)', background: 'transparent' }}>✕</button>
                        </div>
                      </div>
                      
                      {mix.description && <p className="text-xs mb-4 leading-relaxed font-light font-mono-utility" style={{ color: 'var(--text-secondary)' }}>{mix.description}</p>}
                      
                      <div className="flex flex-wrap gap-2 pt-3 font-mono-utility" style={{ borderTop: '1px solid var(--border)' }}>
                        {mix.items.map((i: any) => (
                          <span key={i.id} className="text-[9px] px-2.5 py-0.5 rounded-full font-medium" style={{ background: 'rgba(255,255,255,0.01)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                            {i.flavor.brand?.name} {i.flavor.name} ({i.grams}г)
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right side: Orders History */}
            <div>
              <div className="flex items-center gap-2.5 mb-6">
                <OrderIcon size={18} color="var(--gold)" />
                <h2 className="text-xl font-bold text-gold-gradient" style={{ fontFamily: "'Playfair Display', serif" }}>
                  История заказов
                </h2>
              </div>

              {orders.length === 0 ? (
                <div className="card p-10 text-center shadow-premium" style={{ border: '1px solid var(--border)' }}>
                  <span className="text-4xl block mb-3">💨</span>
                  <p className="text-xs font-light" style={{ color: 'var(--text-muted)' }}>История заказов пока пуста</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {orders.map(order => (
                    <div key={order.id} className="card p-6 shadow-premium" style={{ border: '1px solid var(--border)' }}>
                      <div className="flex justify-between items-center mb-4 font-mono-utility text-[9px]">
                        <span style={{ color: 'var(--text-muted)' }} className="font-bold">
                          {new Date(order.created_at).toLocaleDateString('ru-RU')} • {new Date(order.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        
                        <span className="px-2.5 py-0.5 rounded-full font-bold tracking-wider" style={{
                          background: order.status === 'completed' ? 'rgba(129,199,132,0.08)' : order.status === 'cancelled' ? 'rgba(229,115,115,0.08)' : 'rgba(212,165,116,0.08)',
                          color: order.status === 'completed' ? 'var(--success)' : order.status === 'cancelled' ? 'var(--danger)' : 'var(--gold)',
                          border: `1px solid ${order.status === 'completed' ? 'rgba(129,199,132,0.15)' : order.status === 'cancelled' ? 'rgba(229,115,115,0.15)' : 'var(--border)'}`
                        }}>
                          {STATUS_EMOJI[order.status]} {STATUS_LABELS[order.status]}
                        </span>
                      </div>

                      <div className="mb-4">
                        <span className="text-[8px] uppercase tracking-wider font-bold block mb-1 font-mono-utility" style={{ color: 'var(--text-muted)' }}>Кальянная смесь:</span>
                        <p className="text-xs leading-relaxed font-light">
                          {order.items?.map(i => `${i.flavor?.brand?.name} ${i.flavor?.name} (${i.grams}г)`).join(', ')}
                        </p>
                      </div>

                      <div className="flex justify-between items-center text-xs pt-3 font-mono-utility" style={{ borderTop: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                        <span className="font-light">Колба: {order.liquid?.icon} {order.liquid?.name}</span>
                        <span className="font-bold" style={{ color: 'var(--gold)' }}>
                          {order.total_price > 0 ? `${order.total_price}₽` : 'В расчете'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
