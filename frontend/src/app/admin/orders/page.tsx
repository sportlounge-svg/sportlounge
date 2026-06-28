'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Order, Master, STATUS_LABELS, STATUS_EMOJI } from '@/types';

const TABS = [
  { key: '', label: 'Все' },
  { key: 'pending', label: 'Ожидают' },
  { key: 'assigned,preparing', label: 'В работе' },
  { key: 'ready,serving', label: 'Готовы' },
  { key: 'completed', label: 'Завершенные' },
  { key: 'cancelled', label: 'Отмененные' },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [masters, setMasters] = useState<Master[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('');

  const fetchData = () => {
    Promise.all([api.getOrders(tab || undefined), api.getMasters()])
      .then(([o, m]) => { setOrders(o.orders || []); setMasters(m); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [tab]);
  useEffect(() => { const i = setInterval(fetchData, 10000); return () => clearInterval(i); }, [tab]);

  const handleStatusChange = async (orderId: string, status: string) => {
    try {
      await api.updateOrderStatus(orderId, status);
      fetchData();
    } catch (e: any) { alert(e.message); }
  };

  const handlePriceChange = async (orderId: string, price: number) => {
    try {
      await api.setOrderPrice(orderId, price);
      fetchData();
    } catch (e: any) { alert(e.message); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gold-gradient font-sans" style={{ fontFamily: "'Playfair Display', serif" }}>
          📦 Управление заказами
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 font-mono-utility text-[9px]">
        {TABS.map((t) => {
          const isActive = tab === t.key;
          return (
            <button key={t.key} onClick={() => { setTab(t.key); setLoading(true); }}
              className="px-4 py-2 rounded-lg font-bold uppercase tracking-wider border-none cursor-pointer transition-all"
              style={{
                background: isActive ? 'var(--gold)' : 'rgba(255,255,255,0.01)',
                color: isActive ? '#060608' : 'var(--text-secondary)',
                border: `1px solid ${isActive ? 'var(--gold)' : 'var(--border)'}`,
              }}>
              {t.label}
            </button>
          );
        })}
      </div>

      {loading && (
        <div className="flex flex-col gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-40 rounded-2xl animate-pulse" />)}
        </div>
      )}

      {!loading && orders.length === 0 && (
        <div className="card p-12 text-center" style={{ border: '1px solid var(--border)' }}>
          <span className="text-5xl block mb-4">📭</span>
          <p style={{ color: 'var(--text-muted)' }} className="text-xs uppercase tracking-wider">Заказы в данной категории отсутствуют</p>
        </div>
      )}

      {!loading && (
        <div className="flex flex-col gap-4 stagger-children">
          {orders.map((order) => (
            <div key={order.id} className="card p-5" style={{ border: '1px solid var(--border)' }}>
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-1.5">
                    <span className="text-lg">{STATUS_EMOJI[order.status]}</span>
                    <h3 className="text-sm font-semibold">{order.guest_name}</h3>
                    <span className={`badge badge-${order.status} text-[8px] font-bold`}>{STATUS_LABELS[order.status]}</span>
                  </div>
                  <div className="flex flex-wrap gap-3.5 text-[9px] font-mono-utility uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                    {order.table_number && <span>🪑 Стол {order.table_number}</span>}
                    <span>⏰ {new Date(order.created_at).toLocaleDateString('ru-RU')} {new Date(order.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</span>
                    {order.master && <span>👨‍🍳 {order.master.name}</span>}
                  </div>
                </div>

                {/* Price tier buttons */}
                <div className="flex items-center gap-1 font-mono-utility text-[9px]">
                  {[500, 750, 1000].map((price) => (
                    <button key={price} onClick={() => handlePriceChange(order.id, price)}
                      className="px-3 py-1.5 rounded-lg font-bold border-none cursor-pointer transition-all"
                      style={{
                        background: order.price_tier === price ? 'var(--gold-dark)' : 'rgba(255,255,255,0.01)',
                        color: order.price_tier === price ? '#060608' : 'var(--text-muted)',
                        border: `1px solid ${order.price_tier === price ? 'var(--gold)' : 'var(--border)'}`,
                      }}>
                      {price}₽
                    </button>
                  ))}
                </div>
              </div>

              {/* Mix */}
              <div className="mb-4 p-3.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border)' }}>
                <div className="flex flex-wrap gap-2">
                  {order.items?.map((item) => (
                    <span key={item.id} className="text-[9px] font-mono-utility font-bold tracking-wide px-2.5 py-1 rounded-lg" style={{ background: 'rgba(212,165,116,0.04)', color: 'var(--gold)', border: '1px solid var(--border)' }}>
                      {item.flavor?.brand?.name} {item.flavor?.name} ({item.grams}г)
                    </span>
                  ))}
                  {order.liquid && (
                    <span className="text-[9px] font-mono-utility font-bold tracking-wide px-2.5 py-1 rounded-lg" style={{ background: 'rgba(100,181,246,0.04)', color: 'var(--info)', border: '1px solid rgba(100,181,246,0.15)' }}>
                      {order.liquid.icon} {order.liquid.name}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                {order.status === 'pending' && (
                  <>
                    <button onClick={() => handleStatusChange(order.id, 'preparing')} className="btn-success btn-sm font-bold">✅ Принять</button>
                    <button onClick={() => handleStatusChange(order.id, 'cancelled')} className="btn-danger btn-sm font-bold">❌ Отменить</button>
                  </>
                )}
                {['assigned', 'preparing'].includes(order.status) && (
                  <>
                    <button onClick={() => handleStatusChange(order.id, 'ready')} className="btn-success btn-sm font-bold">✅ Готов</button>
                    <button onClick={() => handleStatusChange(order.id, 'cancelled')} className="btn-danger btn-sm font-bold">❌ Отменить</button>
                  </>
                )}
                {order.status === 'ready' && (
                  <button onClick={() => handleStatusChange(order.id, 'serving')} className="btn-success btn-sm font-bold">✨ Подать на стол</button>
                )}
                {order.status === 'serving' && (
                  <button onClick={() => handleStatusChange(order.id, 'completed')} className="btn-success btn-sm font-bold">🎉 Завершить</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
