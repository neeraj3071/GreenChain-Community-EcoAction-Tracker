import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Check, Sparkles, ShieldCheck, Rocket, BarChart3, PlayCircle, ArrowRight } from 'lucide-react';
import './PremiumLanding.css';

const heroText = 'Track Climate Action Together With EcoStreak';

const serviceTiles = [
  {
    id: 'action-logging',
    title: 'Smart Action Logging',
    summary: 'Capture transport, energy, waste, water, and food actions in seconds.',
    details: ['Category-based tracking', 'Auto points assignment', 'Daily activity timeline'],
  },
  {
    id: 'ai-guidance',
    title: 'AI Eco Guidance',
    summary: 'Get personalized recommendations that improve your footprint every week.',
    details: ['Context-aware suggestions', 'Impact score insights', 'Behavior-based nudges'],
  },
  {
    id: 'challenge-mode',
    title: 'Challenge Mode',
    summary: 'Join daily and weekly community missions to build momentum together.',
    details: ['Daily challenge prompts', 'Weekly campaigns', 'Reward multipliers'],
  },
  {
    id: 'leaderboards',
    title: 'Live Leaderboards',
    summary: 'Compete with friends and neighborhoods on verified eco impact.',
    details: ['Global ranking', 'Personal rank insights', 'Community impact rollups'],
  },
  {
    id: 'carbon-calculator',
    title: 'Carbon Calculator',
    summary: 'Estimate emissions and discover practical ways to reduce CO2 output.',
    details: ['Lifestyle footprint estimate', 'Comparison benchmarks', 'Offset suggestions'],
  },
  {
    id: 'achievement-system',
    title: 'Achievement System',
    summary: 'Unlock badges and streaks that make sustainable habits stick.',
    details: ['Milestone badges', 'Streak tracking', 'XP progression'],
  },
  {
    id: 'social-impact',
    title: 'Social Impact Feed',
    summary: 'Celebrate wins, follow eco-warriors, and inspire local action.',
    details: ['Community activity feed', 'Follow and connect', 'Progress sharing'],
  },
];

const differentiators = [
  { title: 'Real Impact Metrics', text: 'Every action translates into clear CO2 and points outcomes.', icon: ShieldCheck },
  { title: 'Habit-Building Loops', text: 'Challenges, streaks, and badges keep sustainability consistent.', icon: Rocket },
  { title: 'Community Motivation', text: 'Leaderboards and social proof turn individual habits into movement.', icon: BarChart3 },
  { title: 'AI Personalization', text: 'Recommendations adapt to your progress and lifestyle profile.', icon: Sparkles },
];

const caseStudies = [
  {
    title: 'Campus Green Sprint',
    blurb: 'Students used daily challenges to coordinate low-carbon transport and recycling habits.',
    stats: [
      { label: 'Actions Logged', value: '+12.4k' },
      { label: 'CO2 Saved', value: '8.2T' },
    ],
  },
  {
    title: 'Neighborhood Eco League',
    blurb: 'A city district used EcoStreak teams and rankings to boost weekly participation.',
    stats: [
      { label: 'Weekly Retention', value: '+63%' },
      { label: 'Challenge Completions', value: '+4.1x' },
    ],
  },
];

const testimonials = [
  {
    quote: 'EcoStreak made climate action feel tangible. Our team now competes to save more CO2 every week.',
    author: 'Priya S.',
    role: 'Sustainability Lead',
  },
  {
    quote: 'The leaderboard and challenge flow changed behavior faster than any awareness campaign we ran before.',
    author: 'Daniel M.',
    role: 'Community Program Manager',
  },
  {
    quote: 'Our students love the app. The AI recommendations are practical, and streaks keep them engaged.',
    author: 'Ayesha R.',
    role: 'University Climate Coordinator',
  },
];

const timeline = [
  { title: 'Create Profile', detail: 'Set your baseline and connect your daily sustainability goals.' },
  { title: 'Log Eco Actions', detail: 'Track real actions across transport, energy, waste, and food choices.' },
  { title: 'Join Challenges', detail: 'Complete daily and weekly missions to unlock bonus points and badges.' },
  { title: 'Measure Growth', detail: 'Review your CO2 savings, rank progression, and AI-powered next steps.' },
];

const faqs = [
  {
    q: 'What can I track in EcoStreak?',
    a: 'You can log eco actions across transportation, energy, waste, water, food, and more.',
  },
  {
    q: 'How are points and badges calculated?',
    a: 'Each validated action grants points based on impact level, and milestones unlock achievement badges.',
  },
  {
    q: 'Do I need to be part of a team to use the app?',
    a: 'No. You can use EcoStreak individually, and optionally join community challenges and leaderboards.',
  },
  {
    q: 'Where do AI recommendations come from?',
    a: 'Recommendations are generated from your logged behavior and designed to improve your personal footprint over time.',
  },
];

const particleSeed = Array.from({ length: 28 }, (_, index) => ({
  id: index,
  left: `${Math.random() * 100}%`,
  top: `${Math.random() * 100}%`,
  delay: `${Math.random() * 20}s`,
  duration: `${16 + Math.random() * 10}s`,
}));

function PremiumLanding() {
  const [expandedService, setExpandedService] = useState(serviceTiles[0].id);
  const [activeFaq, setActiveFaq] = useState(0);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [cursorHover, setCursorHover] = useState(false);
  const [scrolled, setScrolled] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const revealRef = useRef([]);

  const characters = useMemo(() => heroText.split(''), []);

  useEffect(() => {
    setRevealed(true);
    const onScroll = () => setScrolled(window.scrollY);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onMove = (event) => {
      setCursorPos({ x: event.clientX, y: event.clientY });
    };

    const onOver = (event) => {
      if (event.target.closest('a,button,.service-tile,.faq-item')) {
        setCursorHover(true);
      } else {
        setCursorHover(false);
      }
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseover', onOver);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseover', onOver);
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
          }
        });
      },
      { threshold: 0.18 }
    );

    revealRef.current.forEach((node) => {
      if (node) observer.observe(node);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="premium-landing">
      <div className={`custom-cursor-ring ${cursorHover ? 'active' : ''}`} style={{ left: cursorPos.x, top: cursorPos.y }} />
      <div className="custom-cursor-dot" style={{ left: cursorPos.x, top: cursorPos.y }} />

      <div className="particle-layer" style={{ transform: `translateY(${scrolled * 0.08}px)` }}>
        {particleSeed.map((particle) => (
          <span
            key={particle.id}
            className="particle"
            style={{ left: particle.left, top: particle.top, animationDelay: particle.delay, animationDuration: particle.duration }}
          />
        ))}
      </div>

      <header className="premium-header">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <Link to="/" className="brand-mark">
            ECOSTREAK
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm text-slate-200/80">
            <a href="#services" className="premium-link">Features</a>
            <a href="#work" className="premium-link">Impact Stories</a>
            <a href="#process" className="premium-link">Process</a>
            <a href="#faq" className="premium-link">FAQ</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/login" className="premium-link text-sm">Sign In</Link>
            <Link to="/register" className="book-demo-btn">Start Tracking</Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6">
        <section className="hero min-h-screen flex flex-col items-center justify-center text-center">
          <p className="text-cyan-300 uppercase tracking-[0.3em] text-xs mb-8">Community Eco Action Tracker</p>
          <h1 className="hero-title max-w-5xl">
            {characters.map((char, index) => (
              <span
                key={`${char}-${index}`}
                className={`hero-char ${revealed ? 'reveal' : ''}`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {char === ' ' ? '\u00A0' : char}
              </span>
            ))}
          </h1>
          <p className="mt-8 max-w-3xl text-lg text-slate-300/90 leading-relaxed font-outfit">
            EcoStreak helps communities turn sustainable habits into measurable progress through action logging, AI recommendations, challenges, and leaderboards.
          </p>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
            <Link to="/register" className="btn-primary premium-interactive">
              Create Your Green Profile
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/login" className="btn-secondary premium-interactive">
              <PlayCircle className="h-4 w-4" />
              Open Dashboard
            </Link>
          </div>
        </section>

        <section id="services" className="section-spacing">
          <div className="section-heading">
            <h2>Interactive Service Tiles</h2>
            <p>Explore EcoStreak capabilities. Click any tile to expand details.</p>
          </div>
          <div className="services-grid">
            {serviceTiles.map((tile) => {
              const expanded = expandedService === tile.id;
              return (
                <button
                  key={tile.id}
                  type="button"
                  onClick={() => setExpandedService(expanded ? '' : tile.id)}
                  className={`service-tile premium-interactive ${expanded ? 'expanded' : ''}`}
                >
                  <div className="service-icon" />
                  <h3>{tile.title}</h3>
                  <p>{tile.summary}</p>
                  <div className="service-content">
                    {tile.details.map((detail) => (
                      <div key={detail} className="service-detail">
                        <Check className="h-4 w-4" />
                        <span>{detail}</span>
                      </div>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="section-spacing grid md:grid-cols-4 gap-6">
          {differentiators.map((item, index) => {
            const Icon = item.icon;
            return (
              <article
                key={item.title}
                ref={(el) => {
                  revealRef.current[index] = el;
                }}
                className="diff-card reveal-on-scroll"
              >
                <div className="diff-icon"><Icon className="h-10 w-10" /></div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            );
          })}
        </section>

        <section id="work" className="section-spacing">
          <div className="section-heading">
            <h2>Case Studies Portfolio</h2>
            <p>Real outcomes from communities using EcoStreak to drive climate action.</p>
          </div>
          <div className="grid lg:grid-cols-2 gap-7">
            {caseStudies.map((study) => (
              <article key={study.title} className="case-card premium-interactive">
                <h3>{study.title}</h3>
                <p>{study.blurb}</p>
                <div className="case-results">
                  {study.stats.map((stat) => (
                    <div key={stat.label}>
                      <p className="case-value">{stat.value}</p>
                      <p className="case-label">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="section-spacing">
          <div className="section-heading">
            <h2>Glassmorphic Testimonials</h2>
            <p>Users and organizers sharing what changed after adopting EcoStreak.</p>
          </div>
          <div className="grid lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <article key={testimonial.author} className={`testimonial-card premium-interactive ${index === 1 ? 'center-lift' : ''}`}>
                <p className="quote">“{testimonial.quote}”</p>
                <div className="mt-8 flex items-center gap-3">
                  <div className="avatar" />
                  <div>
                    <p className="font-semibold text-white">{testimonial.author}</p>
                    <p className="text-sm text-slate-300">{testimonial.role}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="process" className="section-spacing">
          <div className="section-heading">
            <h2>Process Timeline</h2>
            <p>From first action to long-term impact in four simple steps.</p>
          </div>
          <div className="timeline-wrap">
            <div className="timeline-line" />
            {timeline.map((step, index) => (
              <article key={step.title} className={`timeline-step ${index % 2 === 0 ? 'left' : 'right'}`}>
                <span className="timeline-node" />
                <div className="timeline-card">
                  <p className="timeline-index">0{index + 1}</p>
                  <h3>{step.title}</h3>
                  <p>{step.detail}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="faq" className="section-spacing">
          <div className="faq-shell">
            <div className="section-heading text-center">
              <h2>Frequently Asked Questions</h2>
              <p>Quick answers about how EcoStreak tracks impact and keeps users engaged.</p>
            </div>
            <div className="space-y-4 mt-8">
              {faqs.map((faq, index) => {
                const open = index === activeFaq;
                return (
                  <article key={faq.q} className="faq-item premium-interactive">
                    <button type="button" onClick={() => setActiveFaq(open ? -1 : index)} className="faq-trigger">
                      <span>{faq.q}</span>
                      <ChevronDown className={`h-5 w-5 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
                    </button>
                    <div className={`faq-content ${open ? 'open' : ''}`}>
                      <p>{faq.a}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <footer className="premium-footer">
        <div className="mx-auto max-w-7xl px-6 py-16 grid md:grid-cols-4 gap-10">
          <div>
            <h3 className="footer-title">ECOSTREAK</h3>
            <p className="footer-text">A community platform for tracking eco-actions, reducing carbon footprints, and celebrating collective progress.</p>
          </div>
          <div>
            <h4 className="footer-heading">Platform</h4>
            <ul className="footer-links">
              <li><a href="#services">Features</a></li>
              <li><a href="#work">Impact Stories</a></li>
              <li><a href="#process">Process</a></li>
            </ul>
          </div>
          <div>
            <h4 className="footer-heading">Resources</h4>
            <ul className="footer-links">
              <li><a href="#faq">FAQs</a></li>
              <li><a href="/login">Dashboard Login</a></li>
              <li><a href="/register">Create Account</a></li>
            </ul>
          </div>
          <div>
            <h4 className="footer-heading">Newsletter</h4>
            <div className="newsletter-row">
              <input type="email" placeholder="you@example.com" />
              <button type="button">Subscribe</button>
            </div>
            <div className="social-row">
              <a href="https://www.linkedin.com" aria-label="LinkedIn">in</a>
              <a href="https://x.com" aria-label="X">x</a>
              <a href="https://dribbble.com" aria-label="Dribbble">d</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default PremiumLanding;
