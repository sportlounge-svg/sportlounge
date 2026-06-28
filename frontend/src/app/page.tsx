'use client';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden smoke-bg">
          {/* Animated background */}
          <div className="absolute inset-0" style={{
            background: 'radial-gradient(ellipse at 50% 30%, rgba(212,165,116,0.07) 0%, transparent 60%), radial-gradient(ellipse at 15% 70%, rgba(212,165,116,0.04) 0%, transparent 50%), radial-gradient(ellipse at 85% 65%, rgba(184,137,92,0.03) 0%, transparent 45%), var(--bg-primary)',
          }} />

          {/* Floating smoke particles */}
          {[...Array(6)].map((_, i) => (
            <div key={i} className="absolute rounded-full pointer-events-none" style={{
              width: `${70 + i * 45}px`,
              height: `${70 + i * 45}px`,
              background: `radial-gradient(circle, rgba(212,165,116,${0.02 + i * 0.008}) 0%, transparent 70%)`,
              left: `${8 + i * 16}%`,
              bottom: `${5 + i * 12}%`,
              animation: `smokeDrift ${7 + i * 2.5}s ease-in-out infinite`,
              animationDelay: `${i * 0.7}s`,
            }} />
          ))}

          <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
            <div className="animate-fade-in mb-4" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
              <span className="text-5xl block animate-float">🌿</span>
            </div>

            <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold mb-5 text-gold-gradient animate-fade-in tracking-tight"
                style={{ fontFamily: "'Playfair Display', serif", animationDelay: '0.3s', animationFillMode: 'both', lineHeight: 1.05 }}>
              SPORT LOUNGE
            </h1>

            <p className="text-sm sm:text-base mb-6 animate-fade-in font-mono-utility uppercase tracking-[0.3em] font-semibold"
               style={{ color: 'var(--gold)', animationDelay: '0.5s', animationFillMode: 'both' }}>
              Премиум кальянная
            </p>

            <p className="text-base sm:text-lg mb-12 max-w-2xl mx-auto animate-fade-in font-light leading-relaxed"
               style={{ color: 'var(--text-secondary)', animationDelay: '0.7s', animationFillMode: 'both' }}>
              Авторские миксы из лучших табаков мира, продуманный до мелочей интерьер и безупречный сервис.
              Каждый кальян у нас — это исключительный ритуал расслабления.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in"
                 style={{ animationDelay: '0.9s', animationFillMode: 'both' }}>
              <Link href="/order" className="no-underline btn-gold text-sm px-10 py-4.5 animate-glow">
                Заказать кальян
              </Link>
              <Link href="/menu" className="no-underline btn-outline text-sm px-10 py-4.5">
                Посмотреть меню
              </Link>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 opacity-60">
            <div style={{ width: 22, height: 38, borderRadius: 11, border: '1.5px solid var(--border)', display: 'flex', justifyContent: 'center', paddingTop: 6 }}>
              <div style={{ width: 3, height: 6, borderRadius: 1.5, background: 'var(--gold)', animation: 'slideDown 1.8s ease-in-out infinite' }} />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-28 px-4 relative" style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-3 text-gold-gradient"
                style={{ fontFamily: "'Playfair Display', serif" }}>
              Преимущества SPORT LOUNGE
            </h2>
            <p className="text-center mb-20 text-xs uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)', maxWidth: 500, margin: '0 auto 5rem' }}>
              Искусство создавать правильную атмосферу
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 stagger-children">
              {[
                { icon: '🍃', title: 'Премиум табаки', desc: 'Более 30 изысканных вкусов от легендарных мировых брендов: Darkside, Tangiers, Fumari, Must Have и др.' },
                { icon: '🎵', title: 'Уютная атмосфера', desc: 'Умное зонирование света, расслабляющий лаунж-саундтрек и деликатная ароматерапия для вашего отдыха.' },
                { icon: '⚡', title: 'Быстрый сервис', desc: 'Автоматизированная система распределения заказов гарантирует приготовление чаши за 15 минут.' },
              ].map((feature, i) => (
                <div key={i} className="card p-8 md:p-10 text-center group cursor-default" style={{ borderColor: 'var(--border)' }}>
                  <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-6 transition-transform duration-500 group-hover:scale-110"
                    style={{ background: 'rgba(212,165,116,0.03)', border: '1px solid var(--border)' }}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--gold-light)', fontFamily: "'Playfair Display', serif" }}>
                    {feature.title}
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.9rem' }} className="font-light">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-28 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-3 text-gold-gradient"
                style={{ fontFamily: "'Playfair Display', serif" }}>
              Как сделать заказ
            </h2>
            <p className="text-center mb-20 text-xs uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>
              Четыре простых шага к вашему кальяну
            </p>

            <div className="flex flex-col gap-6 stagger-children">
              {[
                { step: '01', title: 'Выберите вкусы', desc: 'Соберите индивидуальный микс в миксологе или воспользуйтесь подсказками ИИ.' },
                { step: '02', title: 'Выберите базу колбы', desc: 'Вода, молоко, сок или вино с добавлением льда для раскрытия тонких нот.' },
                { step: '03', title: 'Отправьте заказ в работу', desc: 'Кальянный мастер мгновенно получит заявку на планшет и начнёт разогрев углей.' },
                { step: '04', title: 'Отслеживайте готовность', desc: 'Наблюдайте за статусом заказа онлайн от процесса забивки чаши до подачи на стол.' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-6 card p-6" style={{ borderColor: 'var(--border)' }}>
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-xs font-bold font-mono-utility"
                       style={{ background: 'rgba(212,165,116,0.06)', color: 'var(--gold)', border: '1px solid var(--border)' }}>
                    {item.step}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold mb-0.5" style={{ color: 'var(--text-primary)' }}>{item.title}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }} className="font-light">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-4 relative smoke-bg" style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--border)' }}>
          <div className="max-w-2xl mx-auto text-center relative z-10">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gold-gradient"
                style={{ fontFamily: "'Playfair Display', serif" }}>
              Желаете отдохнуть?
            </h2>
            <p className="mb-10 font-light" style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
              Оформите заказ онлайн прямо со своего стола, и наш мастер сразу займется вашим кальяном.
            </p>
            <Link href="/order" className="no-underline btn-gold text-sm px-12 py-4.5 flex items-center gap-2 mx-auto w-max">
              Заказать кальян
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
