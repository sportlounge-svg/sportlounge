'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { supabase } from '@/lib/supabase';
import { HookahIcon } from '@/components/ui/Icons';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'demo' | 'email' | 'google'>('demo');

  // Email form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    // If user is already logged in, redirect to profile
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace('/profile');
      }
    });
  }, [router]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const isGithub = window.location.hostname.endsWith('github.io');
      const basePath = isGithub ? '/sportlounge' : '';
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}${basePath}/profile/`,
        },
      });
      if (error) throw error;
    } catch (e: any) {
      setError(e.message || 'Ошибка входа через Google');
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Пожалуйста, заполните все поля');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      if (isSignUp) {
        // Sign up
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: email.split('@')[0],
              role: 'client'
            }
          }
        });
        if (error) throw error;
        setSuccessMsg('Регистрация успешна! Проверьте почту или войдите.');
        setIsSignUp(false);
      } else {
        // Sign in
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
        router.replace('/profile');
      }
    } catch (e: any) {
      setError(e.message || 'Ошибка аутентификации');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role: 'client' | 'admin') => {
    setLoading(true);
    setError('');
    setSuccessMsg('');
    const demoEmail = `${role}@sportlounge.ru`;
    const demoPassword = 'demo_password_123';
    
    try {
      // 1. Try to sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email: demoEmail,
        password: demoPassword
      });

      if (error) {
        // 2. If user not found, try to sign up
        if (error.message.includes('Invalid login credentials') || error.status === 400) {
          console.log(`Demo account ${demoEmail} not found. Creating it...`);
          const { error: signUpError } = await supabase.auth.signUp({
            email: demoEmail,
            password: demoPassword,
            options: {
              data: {
                name: role === 'admin' ? 'Демо Администратор' : 'Демо Клиент',
                role: role
              }
            }
          });
          if (signUpError) throw signUpError;

          // Try signing in again
          const retry = await supabase.auth.signInWithPassword({
            email: demoEmail,
            password: demoPassword
          });
          if (retry.error) throw retry.error;
        } else {
          throw error;
        }
      }
      
      router.replace('/profile');
    } catch (e: any) {
      setError(e.message || 'Ошибка демонстрационного входа');
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <main className="pt-24 pb-16 min-h-screen flex items-center justify-center relative overflow-hidden smoke-bg">
        {/* Decorative background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full filter blur-[160px] opacity-[0.06] pointer-events-none"
          style={{ background: 'radial-gradient(circle, var(--gold) 0%, transparent 70%)' }} />

        <div className="max-w-md w-full px-4 relative z-10 animate-fade-in">
          <div className="card p-8 text-center relative overflow-hidden" style={{ border: '1px solid var(--border)' }}>
            
            <div className="flex justify-center mb-5">
              <div className="p-3 rounded-full" style={{ background: 'rgba(212,165,116,0.04)', border: '1px solid var(--border)' }}>
                <HookahIcon size={36} color="var(--gold)" />
              </div>
            </div>
            
            <h1 className="text-3xl font-bold mb-1.5 text-gold-gradient tracking-wider" style={{ fontFamily: "'Playfair Display', serif" }}>
              SPORT LOUNGE
            </h1>
            <p className="text-xs mb-8 uppercase tracking-[0.15em] font-light" style={{ color: 'var(--text-secondary)' }}>
              Вход в личный кабинет
            </p>

            {/* Error and Success Banners */}
            {error && (
              <div className="p-4 mb-6 rounded-xl text-xs text-left font-mono-utility" style={{ background: 'rgba(229,115,115,0.08)', color: 'var(--danger)', border: '1px solid rgba(229,115,115,0.2)' }}>
                ⚠️ {error}
              </div>
            )}
            {successMsg && (
              <div className="p-4 mb-6 rounded-xl text-xs text-left font-mono-utility" style={{ background: 'rgba(129,199,132,0.08)', color: 'var(--success)', border: '1px solid rgba(129,199,132,0.2)' }}>
                ✓ {successMsg}
              </div>
            )}

            {/* Tab Selectors */}
            <div className="flex rounded-xl p-1 mb-6 font-mono-utility text-[10px]" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)' }}>
              <button
                onClick={() => { setActiveTab('demo'); setError(''); }}
                className="flex-1 py-2.5 rounded-lg border-none cursor-pointer font-bold uppercase transition-all duration-300"
                style={{
                  background: activeTab === 'demo' ? 'var(--gold-dark)' : 'transparent',
                  color: activeTab === 'demo' ? '#060608' : 'var(--text-secondary)'
                }}
              >
                Демо
              </button>
              <button
                onClick={() => { setActiveTab('email'); setError(''); }}
                className="flex-1 py-2.5 rounded-lg border-none cursor-pointer font-bold uppercase transition-all duration-300"
                style={{
                  background: activeTab === 'email' ? 'var(--gold-dark)' : 'transparent',
                  color: activeTab === 'email' ? '#060608' : 'var(--text-secondary)'
                }}
              >
                Пароль
              </button>
              <button
                onClick={() => { setActiveTab('google'); setError(''); }}
                className="flex-1 py-2.5 rounded-lg border-none cursor-pointer font-bold uppercase transition-all duration-300"
                style={{
                  background: activeTab === 'google' ? 'var(--gold-dark)' : 'transparent',
                  color: activeTab === 'google' ? '#060608' : 'var(--text-secondary)'
                }}
              >
                Google
              </button>
            </div>

            {/* Tab 1: Demo Login */}
            {activeTab === 'demo' && (
              <div className="animate-fade-in flex flex-col gap-4">
                <p className="text-xs font-light text-left leading-relaxed mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Для быстрого ознакомления с функционалом заведения войдите в один клик под тестовой учётной записью:
                </p>
                <button
                  onClick={() => handleDemoLogin('client')}
                  disabled={loading}
                  className="w-full py-4 rounded-xl font-bold border-none cursor-pointer transition-all duration-300 btn-gold"
                >
                  Войти как VIP-Клиент
                </button>
                <button
                  onClick={() => handleDemoLogin('admin')}
                  disabled={loading}
                  className="w-full py-4 rounded-xl font-bold cursor-pointer transition-all duration-300 btn-outline"
                >
                  Войти как Администратор
                </button>
                <p className="text-[10px] font-mono-utility text-center mt-3" style={{ color: 'var(--text-muted)' }}>
                  Аккаунты будут автоматически инициализированы в вашей БД Supabase.
                </p>
              </div>
            )}

            {/* Tab 2: Email & Password */}
            {activeTab === 'email' && (
              <form onSubmit={handleEmailAuth} className="animate-fade-in flex flex-col gap-5 text-left">
                <div>
                  <label className="block text-[10px] uppercase font-mono-utility tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>E-mail</label>
                  <input
                    type="email"
                    className="input font-mono-utility text-sm"
                    placeholder="name@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-mono-utility tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>Пароль</label>
                  <input
                    type="password"
                    className="input font-mono-utility text-sm"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-xl font-bold border-none cursor-pointer transition-all duration-300 btn-gold mt-2"
                >
                  {loading ? 'Загрузка...' : isSignUp ? 'Создать аккаунт' : 'Войти в личный кабинет'}
                </button>

                <div className="text-center mt-2">
                  <button
                    type="button"
                    onClick={() => { setIsSignUp(!isSignUp); setError(''); setSuccessMsg(''); }}
                    className="text-xs font-mono-utility cursor-pointer border-none bg-transparent"
                    style={{ color: 'var(--gold)' }}
                  >
                    {isSignUp ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Зарегистрироваться'}
                  </button>
                </div>
              </form>
            )}

            {/* Tab 3: Google Login */}
            {activeTab === 'google' && (
              <div className="animate-fade-in flex flex-col gap-5">
                <button
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 py-4 rounded-xl font-semibold border-none cursor-pointer transition-all duration-300 btn-gold"
                >
                  {loading ? (
                    <>
                      <span className="animate-spin inline-block w-4 h-4 rounded-full border-2 border-solid border-current border-t-transparent mr-2" />
                      Перенаправление...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.41 0-6.19-2.772-6.19-6.19 0-3.42 2.78-6.19 6.19-6.19 1.54 0 2.946.567 4.027 1.498L20.9 4.88C18.66 2.94 15.68 1.8 12.24 1.8 6.44 1.8 1.8 6.44 1.8 1.24s4.64 10.44 10.44 10.44c6.11 0 10.16-4.29 10.16-10.33 0-.69-.06-1.35-.18-2.065h-9.98z" />
                      </svg>
                      Войти через Google
                    </>
                  )}
                </button>

                <div className="p-4 rounded-xl text-left border" style={{ background: 'rgba(212,165,116,0.02)', borderColor: 'var(--border)' }}>
                  <h4 className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5" style={{ color: 'var(--gold)' }}>
                    💡 Инструкция по настройке:
                  </h4>
                  <p className="text-[10px] leading-relaxed font-light" style={{ color: 'var(--text-secondary)' }}>
                    Чтобы вход через Google работал корректно на вашем деплое, зайдите в **Supabase Dashboard** вашей базы данных, перейдите в **Auth {"->"} URL Configuration** и добавьте следующий адрес в список **Redirect URLs**:
                  </p>
                  <code className="block p-2 rounded-lg text-[9px] font-mono-utility mt-3 select-all overflow-x-auto" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--gold-light)' }}>
                    https://sportlounge-svg.github.io/sportlounge/profile/
                  </code>
                </div>
              </div>
            )}

            <div className="mt-8 text-[10px]" style={{ color: 'var(--text-muted)' }}>
              Авторизуясь на сайте, вы соглашаетесь с условиями обслуживания и политикой использования файлов cookie.
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
