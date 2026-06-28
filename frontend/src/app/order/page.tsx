'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { api } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { BrandWithFlavors, Liquid } from '@/types';
import { SparklesIcon, LiquidWaterIcon, LiquidMilkIcon, LiquidJuiceIcon, LiquidWineIcon, LiquidIceIcon, LiquidEnergyIcon } from '@/components/ui/Icons';

interface MixItem {
  flavor_id: number;
  name: string;
  brand: string;
  grams: number;
}

const LIQUID_ICONS: Record<string, React.ReactNode> = {
  'Вода': <LiquidWaterIcon size={32} color="var(--gold)" />,
  'Молоко': <LiquidMilkIcon size={32} color="var(--gold)" />,
  'Сок': <LiquidJuiceIcon size={32} color="var(--gold)" />,
  'Вино': <LiquidWineIcon size={32} color="var(--gold)" />,
  'Лёд + Вода': <LiquidIceIcon size={32} color="var(--gold)" />,
  'Энергетик': <LiquidEnergyIcon size={32} color="var(--gold)" />,
};

export default function CreateOrderPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [brands, setBrands] = useState<BrandWithFlavors[]>([]);
  const [liquids, setLiquids] = useState<Liquid[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Auth state
  const [session, setSession] = useState<any>(null);
  const [isAiEnabled, setIsAiEnabled] = useState(false);

  // Form state
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [mix, setMix] = useState<MixItem[]>([]);
  const [selectedLiquid, setSelectedLiquid] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  
  // AI Mixologist state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiDescription, setAiDescription] = useState('');
  const [mixName, setMixName] = useState('');
  const [savedMixSuccess, setSavedMixSuccess] = useState(false);

  useEffect(() => {
    // 1. Fetch data
    Promise.all([
      api.getFlavorsByBrand(),
      api.getLiquids(),
      api.getSmartFeatures()
    ])
      .then(([b, l, features]) => {
        setBrands(b);
        setLiquids(l);
        const aiFeature = features.find(f => f.feature_key === 'ai_mixologist');
        setIsAiEnabled(!!aiFeature?.is_enabled);
      })
      .catch(console.error)
      .finally(() => setLoading(false));

    // 2. Auth state handling
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session) {
        if (session.user?.user_metadata) {
          setGuestName(session.user.user_metadata.full_name || session.user.user_metadata.name || '');
        }
        try {
          const profile = await api.getCurrentUser(session.access_token);
          if (profile) {
            if (profile.name) setGuestName(profile.name);
            if (profile.phone) setGuestPhone(profile.phone);
          }
        } catch (e) {
          console.error('[CreatePage] Failed to fetch current user profile details:', e);
        }
      }
    });

    // 3. Check for prefilled mix from profile
    const prefilled = localStorage.getItem('sport_lounge_prefill_mix');
    if (prefilled) {
      try {
        const parsed = JSON.parse(prefilled);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMix(parsed);
          setStep(2); // Jump to step 2 directly
        }
      } catch (e) {
        console.error(e);
      }
      localStorage.removeItem('sport_lounge_prefill_mix');
    }
  }, []);

  const addToMix = (flavorId: number, name: string, brand: string) => {
    if (mix.find((m) => m.flavor_id === flavorId)) return;
    setMix([...mix, { flavor_id: flavorId, name, brand, grams: 15 }]);
    setSavedMixSuccess(false);
  };

  const removeFromMix = (flavorId: number) => {
    setMix(mix.filter((m) => m.flavor_id !== flavorId));
    setSavedMixSuccess(false);
  };

  const updateGrams = (flavorId: number, grams: number) => {
    setMix(mix.map((m) => m.flavor_id === flavorId ? { ...m, grams } : m));
    setSavedMixSuccess(false);
  };

  const handleGenerateAiMix = async () => {
    setAiLoading(true);
    setSavedMixSuccess(false);
    try {
      const recommendation = await api.generateAiMix();
      setMix(recommendation.items);
      setAiDescription(recommendation.description);
      setMixName(recommendation.name);
    } catch (e: any) {
      alert('Ошибка генерации: ' + e.message);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSaveMixToProfile = async () => {
    if (!session) {
      alert('Пожалуйста, войдите в личный кабинет, чтобы сохранить микс.');
      router.push('/login');
      return;
    }
    
    if (mix.length === 0) return;
    
    try {
      const name = mixName || prompt('Введите название для вашего микса:', 'Мой микс') || 'Любимый микс';
      await api.saveUserMix(session.access_token, {
        name,
        description: aiDescription || 'Пользовательский микс',
        items: mix.map(m => ({ flavor_id: m.flavor_id, grams: m.grams }))
      });
      setSavedMixSuccess(true);
    } catch (e: any) {
      alert('Ошибка при сохранении: ' + e.message);
    }
  };

  const canProceed = () => {
    if (step === 1) return guestName.trim().length > 0;
    if (step === 2) return mix.length > 0;
    if (step === 3) return selectedLiquid !== null;
    return true;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const order = await api.createOrder({
        user_id: session?.user?.id || undefined,
        guest_name: guestName,
        guest_phone: guestPhone || undefined,
        table_number: tableNumber ? parseInt(tableNumber) : undefined,
        liquid_id: selectedLiquid,
        notes: notes || undefined,
        items: mix.map((m) => ({ flavor_id: m.flavor_id, grams: m.grams })),
      }, session?.access_token || undefined);
      
      router.push(`/track?id=${order.id}`);
    } catch (e: any) {
      alert('Ошибка создания заказа: ' + e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const totalGrams = mix.reduce((sum, m) => sum + m.grams, 0);

  return (
    <>
      <Header />
      <main className="pt-24 pb-16 min-h-screen relative overflow-hidden smoke-bg">
        {/* Glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full filter blur-[150px] opacity-[0.04] pointer-events-none"
          style={{ background: 'radial-gradient(circle, var(--gold) 0%, transparent 70%)' }} />

        <div className="max-w-5xl mx-auto px-4 pt-6 relative z-10 animate-fade-in">
          <h1 className="text-4xl font-bold text-center mb-2 text-gold-gradient tracking-wide" style={{ fontFamily: "'Playfair Display', serif" }}>
            Заказ кальяна
          </h1>
          <p className="text-center mb-10 text-xs uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>
            Индивидуальный подбор вкусовой гаммы
          </p>

          {/* Progress Stepper */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 mb-12 font-mono-utility text-[10px]">
            {['Данные', 'Микс', 'Жидкость', 'Проверка'].map((label, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full font-bold uppercase tracking-wider transition-all duration-300" style={{
                  background: step > i + 1 ? 'rgba(129,199,132,0.06)' : step === i + 1 ? 'rgba(212,165,116,0.06)' : 'rgba(255,255,255,0.01)',
                  color: step > i + 1 ? 'var(--success)' : step === i + 1 ? 'var(--gold-light)' : 'var(--text-muted)',
                  border: `1px solid ${step === i + 1 ? 'var(--gold)' : 'var(--border)'}`,
                }}>
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold" style={{
                    background: step > i + 1 ? 'var(--success)' : step === i + 1 ? 'var(--gold)' : 'rgba(255,255,255,0.03)',
                    color: step >= i + 1 ? '#060608' : 'var(--text-muted)',
                  }}>
                    {step > i + 1 ? '✓' : i + 1}
                  </span>
                  <span>{label}</span>
                </div>
                {i < 3 && <div className="w-4 sm:w-6 h-px" style={{ background: step > i + 1 ? 'var(--success)' : 'var(--border)' }} />}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content Area */}
            <div className="lg:col-span-2">
              {/* Step 1: Guest Info */}
              {step === 1 && (
                <div className="card p-8 shadow-premium animate-fade-in" style={{ border: '1px solid var(--border)' }}>
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-xl font-semibold" style={{ color: 'var(--gold-light)' }}>Ваши данные</h2>
                    {!session && (
                      <button onClick={() => router.push('/login')} className="px-4 py-2 text-[9px] font-bold uppercase tracking-wider rounded-lg btn-outline cursor-pointer">
                        Авторизоваться
                      </button>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-6">
                    <div>
                      <label className="block text-[10px] uppercase font-mono-utility tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>Имя *</label>
                      <input className="input text-sm" placeholder="Как вас зовут?" value={guestName} onChange={(e) => setGuestName(e.target.value)} required />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-mono-utility tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>Телефон</label>
                      <input className="input text-sm font-mono-utility" placeholder="+7 (___) ___-__-__" value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-mono-utility tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>Номер стола</label>
                      <input className="input text-sm font-mono-utility" type="number" placeholder="Укажите номер стола" value={tableNumber} onChange={(e) => setTableNumber(e.target.value)} />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Mix Builder */}
              {step === 2 && (
                <div className="animate-fade-in">
                  <div className="card p-6 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-premium" style={{ border: '1px solid var(--border)' }}>
                    <div>
                      <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--gold-light)' }}>Состав смеси</h2>
                      <p className="text-xs font-light" style={{ color: 'var(--text-muted)' }}>Выберите вкусы табака и настройте идеальные пропорции</p>
                    </div>

                    {isAiEnabled && (
                      <button
                        onClick={handleGenerateAiMix}
                        disabled={aiLoading}
                        className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold border-none cursor-pointer transition-all duration-300 btn-gold animate-glow text-[9px]"
                      >
                        <SparklesIcon size={12} color="#060608" />
                        {aiLoading ? 'Смешиваем...' : 'ИИ-миксолог'}
                      </button>
                    )}
                  </div>

                  {aiDescription && (
                    <div className="card p-6 mb-8 shadow-premium" style={{ background: 'rgba(212,165,116,0.02)', border: '1px dashed var(--gold)' }}>
                      <div className="flex items-center gap-2 mb-3">
                        <SparklesIcon size={16} color="var(--gold)" />
                        <h4 className="text-xs uppercase tracking-wider font-bold" style={{ color: 'var(--gold)' }}>Рекомендация ИИ: {mixName}</h4>
                      </div>
                      <p className="text-xs leading-relaxed font-light mb-4" style={{ color: 'var(--text-secondary)' }}>{aiDescription}</p>
                      
                      <button
                        onClick={handleSaveMixToProfile}
                        disabled={savedMixSuccess}
                        className="text-[9px] font-bold uppercase tracking-wider px-4 py-2 rounded-lg border-none cursor-pointer font-mono-utility"
                        style={{
                          background: savedMixSuccess ? 'rgba(129,199,132,0.1)' : 'var(--gold)',
                          color: savedMixSuccess ? 'var(--success)' : '#060608'
                        }}
                      >
                        {savedMixSuccess ? '✓ Сохранено в профиль' : '💾 Сохранить в профиль'}
                      </button>
                    </div>
                  )}

                  {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-20 rounded-xl" />)}
                    </div>
                  ) : (
                    brands.map((brand) => (
                      <div key={brand.id} className="mb-8">
                        <h3 className="text-[10px] font-bold mb-4 uppercase tracking-[0.2em] font-mono-utility" style={{ color: 'var(--gold-dark)' }}>
                          {brand.name}
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {brand.flavors.map((flavor) => {
                            const inMix = mix.find((m) => m.flavor_id === flavor.id);
                            return (
                              <button
                                key={flavor.id}
                                onClick={() => inMix ? removeFromMix(flavor.id) : addToMix(flavor.id, flavor.name, brand.name)}
                                className="text-left p-5 rounded-xl border-none cursor-pointer transition-all duration-300 shadow-premium"
                                style={{
                                  background: inMix ? 'rgba(212,165,116,0.04)' : 'var(--bg-card)',
                                  border: `1px solid ${inMix ? 'var(--gold)' : 'var(--border)'}`,
                                  color: 'var(--text-primary)',
                                }}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-semibold text-xs uppercase tracking-wide">{flavor.name}</span>
                                  {inMix ? (
                                    <span className="text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full font-mono-utility" style={{ background: 'var(--gold)', color: '#060608' }}>✓ В миксе</span>
                                  ) : (
                                    <span className="text-[8px] font-bold uppercase tracking-wider font-mono-utility" style={{ color: 'var(--text-muted)' }}>+ Добавить</span>
                                  )}
                                </div>
                                {flavor.description && (
                                  <p className="text-xs font-light mt-2" style={{ color: 'var(--text-muted)' }}>{flavor.description}</p>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Step 3: Liquid Selection */}
              {step === 3 && (
                <div className="card p-8 shadow-premium animate-fade-in" style={{ border: '1px solid var(--border)' }}>
                  <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--gold-light)' }}>База для колбы</h2>
                  <p className="text-xs mb-8" style={{ color: 'var(--text-muted)' }}>Выберите жидкость, которая дополнит ваш микс</p>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {liquids.map((liquid) => (
                      <button
                        key={liquid.id}
                        onClick={() => setSelectedLiquid(liquid.id)}
                        className="p-6 rounded-2xl text-center transition-all duration-300 border-none cursor-pointer flex flex-col items-center justify-center gap-3 shadow-premium"
                        style={{
                          background: selectedLiquid === liquid.id ? 'rgba(212,165,116,0.03)' : 'var(--bg-card)',
                          border: `1.5px solid ${selectedLiquid === liquid.id ? 'var(--gold)' : 'var(--border)'}`,
                          color: 'var(--text-primary)',
                        }}
                      >
                        <div className="transition-transform duration-300" style={{ transform: selectedLiquid === liquid.id ? 'scale(1.08)' : 'scale(1)' }}>
                          {LIQUID_ICONS[liquid.name] || <span>💧</span>}
                        </div>
                        <span className="font-bold text-[10px] uppercase tracking-wider block mt-1 font-mono-utility">{liquid.name}</span>
                        {liquid.description && (
                          <span className="text-[9px] block font-light leading-snug mt-1" style={{ color: 'var(--text-muted)' }}>{liquid.description}</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 4: Review */}
              {step === 4 && (
                <div className="card p-8 shadow-premium animate-fade-in" style={{ border: '1px solid var(--border)' }}>
                  <h2 className="text-xl font-semibold mb-6" style={{ color: 'var(--gold-light)' }}>Проверка заказа</h2>

                  <div className="flex flex-col gap-5">
                    <div className="p-5 rounded-xl" style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border)' }}>
                      <span className="text-[9px] uppercase tracking-wider font-bold font-mono-utility" style={{ color: 'var(--text-muted)' }}>Гость</span>
                      <p className="font-semibold text-sm mt-1">{guestName}</p>
                      {guestPhone && <p className="text-xs mt-0.5 font-mono-utility" style={{ color: 'var(--text-secondary)' }}>{guestPhone}</p>}
                      {tableNumber && <p className="text-xs mt-0.5 font-mono-utility" style={{ color: 'var(--text-secondary)' }}>Стол #{tableNumber}</p>}
                    </div>

                    <div className="p-5 rounded-xl" style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border)' }}>
                      <span className="text-[9px] uppercase tracking-wider font-bold font-mono-utility" style={{ color: 'var(--text-muted)' }}>Микс ({totalGrams}г)</span>
                      <div className="mt-2 flex flex-col gap-1.5 font-mono-utility text-xs">
                        {mix.map((m) => (
                          <p key={m.flavor_id} className="font-light">
                            <span style={{ color: 'var(--gold)' }} className="font-sans font-semibold">{m.brand}</span> {m.name} — <span style={{ color: 'var(--gold-light)' }} className="font-semibold">{m.grams}г</span>
                          </p>
                        ))}
                      </div>
                    </div>

                    <div className="p-5 rounded-xl" style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border)' }}>
                      <span className="text-[9px] uppercase tracking-wider font-bold font-mono-utility" style={{ color: 'var(--text-muted)' }}>База колбы</span>
                      <p className="font-semibold text-[10px] uppercase tracking-wider mt-1 font-mono-utility">
                        {liquids.find((l) => l.id === selectedLiquid)?.name}
                      </p>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-mono-utility tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>Пожелания мастеру</label>
                      <textarea
                        className="input text-xs"
                        placeholder="Крепость, жаростойкость чаши, скорость подачи и т.д."
                        rows={3}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        style={{ resize: 'none' }}
                      />
                    </div>

                    <p className="text-[10px] text-center italic mt-2" style={{ color: 'var(--text-muted)' }}>
                      💰 Стоимость пробивается администратором индивидуально после подачи
                    </p>
                  </div>
                </div>
              )}

              {/* Navigation buttons */}
              <div className="flex justify-between mt-10">
                {step > 1 ? (
                  <button onClick={() => setStep(step - 1)} className="btn-outline text-xs font-bold font-mono-utility">← Назад</button>
                ) : <div />}
                {step < 4 ? (
                  <button onClick={() => setStep(step + 1)} disabled={!canProceed()} className="btn-gold text-xs font-bold font-mono-utility"
                    style={{ opacity: canProceed() ? 1 : 0.4, cursor: canProceed() ? 'pointer' : 'not-allowed' }}>
                    Далее →
                  </button>
                ) : (
                  <button onClick={handleSubmit} disabled={submitting} className="btn-gold text-xs font-bold font-mono-utility animate-glow">
                    {submitting ? 'Отправка...' : 'Отправить заказ'}
                  </button>
                )}
              </div>
            </div>

            {/* Sidebar: Mix Preview */}
            <div className="lg:col-span-1">
              <div className="card p-6 sticky top-28 shadow-premium" style={{ border: '1px solid var(--border)' }}>
                <div className="flex justify-between items-center mb-5">
                  <h3 className="text-base font-semibold tracking-wide" style={{ color: 'var(--gold-light)', fontFamily: "'Playfair Display', serif" }}>
                    Ваша чаша
                  </h3>
                  {mix.length > 0 && (
                    <button onClick={handleSaveMixToProfile} className="text-[9px] uppercase font-bold tracking-wider border-none cursor-pointer font-mono-utility" style={{ background: 'transparent', color: 'var(--gold)' }}>
                      💾 Сохранить
                    </button>
                  )}
                </div>
                
                {mix.length === 0 ? (
                  <p className="text-xs font-light leading-relaxed" style={{ color: 'var(--text-muted)' }}>Выберите вкусы табака в списке слева, чтобы составить микс.</p>
                ) : (
                  <div className="flex flex-col gap-4 font-mono-utility">
                    {mix.map((m) => (
                      <div key={m.flavor_id} className="p-3.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border)' }}>
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <span className="text-[8px] uppercase tracking-wider font-bold" style={{ color: 'var(--gold-dark)' }}>{m.brand}</span>
                            <p className="text-xs font-medium font-sans">{m.name}</p>
                          </div>
                          <button onClick={() => removeFromMix(m.flavor_id)} className="text-xs border-none cursor-pointer"
                            style={{ background: 'transparent', color: 'var(--danger)' }}>✕</button>
                        </div>
                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min={5}
                            max={30}
                            value={m.grams}
                            onChange={(e) => updateGrams(m.flavor_id, parseInt(e.target.value))}
                            className="flex-1 cursor-pointer"
                            style={{ accentColor: 'var(--gold)' }}
                          />
                          <span className="text-[10px] font-semibold w-8 text-right" style={{ color: 'var(--gold)' }}>{m.grams}г</span>
                        </div>
                      </div>
                    ))}
                    <div className="pt-4 mt-2" style={{ borderTop: '1px solid var(--border)' }}>
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                        <span style={{ color: 'var(--text-secondary)' }}>Общий вес</span>
                        <span style={{ color: 'var(--gold)' }}>{totalGrams}г</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
