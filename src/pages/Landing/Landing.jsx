import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Brain, 
  TrendingUp, 
  RefreshCw, 
  History, 
  BookOpen, 
  X, 
  Check, 
  ArrowRight,
  User,
  MessagesSquare
} from 'lucide-react';
import '../../App.css';

export default function Landing() {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="app-container">
      {/* Navbar */}
      <nav className="navbar" style={{ borderBottomColor: scrolled ? 'var(--border-color)' : 'transparent' }}>
        <div className="container">
          <div className="logo">
            <Brain className="logo-icon" size={28} />
            <span>FounderMind</span>
          </div>
          <div className="nav-links">
            <a href="#problem">The Problem</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#features">Features</a>
          </div>
          <div className="nav-cta" style={{ display: 'flex', gap: '16px' }}>
            <button className="btn btn-secondary" onClick={() => navigate('/login')}>Log In</button>
            <button className="btn btn-primary" onClick={() => navigate('/signup')} style={{ padding: '8px 16px', fontSize: '0.9rem' }}>Sign Up</button>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="hero">
          <div className="container">
            <h1 className="animate-fade-up">The AI Chief of Staff <br/><span className="text-gradient">for Startup Founders</span></h1>
            <p className="animate-fade-up delay-100">
              Unlike generic chatbots, our AI remembers your past meetings, adapts to your priorities, 
              and creates a continuous, context-aware operational hub just for you.
            </p>
            <div className="hero-ctas animate-fade-up delay-200">
              <button className="btn btn-primary" onClick={() => navigate('/signup')}>Start Free Trial <ArrowRight size={18} /></button>
              <button className="btn btn-secondary">See How It Works</button>
            </div>
            <p className="animate-fade-up delay-300" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '40px' }}>
              Built for high-growth entrepreneurs.
            </p>
            
            <div className="hero-visual animate-fade-up delay-300">
              <div className="hero-dashboard">
                <div className="dashboard-header">
                  <div className="dashboard-dot dot-red"></div>
                  <div className="dashboard-dot dot-yellow"></div>
                  <div className="dashboard-dot dot-green"></div>
                  <span style={{ marginLeft: '12px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Active Context: Fundraising Q3</span>
                </div>
                <div className="dashboard-body chat-container">
                  <div className="chat-message student">
                    <div className="chat-avatar avatar-student"><User size={20}/></div>
                    <div className="chat-bubble">Draft an email to Sequoia about our recent user growth.</div>
                  </div>
                  <div className="chat-message tutor">
                    <div className="chat-avatar avatar-tutor"><Brain size={20}/></div>
                    <div className="chat-bubble">
                      <p>Drafting now. I'll include the 24% MoM growth metric you mentioned in yesterday's board prep, and tie it back to the acquisition strategy we discussed last week.</p>
                      <div className="chat-memory-indicator">
                        <History size={14} /> Recalling metrics from Board Prep session
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Problem Section */}
        <section id="problem" className="section">
          <div className="container">
            <div className="section-header">
              <span className="section-label">The Problem</span>
              <h2 className="section-title">Generic AI is Forgetful</h2>
              <p className="section-subtitle">Most AI tools fail founders because they treat every prompt as your first interaction.</p>
            </div>
            
            <div className="problem-grid">
              <div className="glass-card problem-card">
                <div className="problem-icon"><History size={24} /></div>
                <h3>They Forget Everything</h3>
                <p>Start from zero every time. Generic AI doesn't know your business model, investors, or recent fires.</p>
              </div>
              <div className="glass-card problem-card">
                <div className="problem-icon"><RefreshCw size={24} /></div>
                <h3>Repetitive Context Loading</h3>
                <p>You waste hours pasting the same background information into prompts just to get a usable response.</p>
              </div>
              <div className="glass-card problem-card">
                <div className="problem-icon"><TrendingUp size={24} /></div>
                <h3>No Strategic Continuity</h3>
                <p>They can't adapt to your evolving startup strategy because they lack persistent memory.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Solution Section */}
        <section id="how-it-works" className="section" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <div className="container">
            <div className="section-header">
              <span className="section-label">The Solution</span>
              <h2 className="section-title">A Chief of Staff with <span className="text-gradient">Memory</span></h2>
              <p className="section-subtitle">We built an intelligent engine that learns your business as you build it.</p>
            </div>

            <div className="memory-loop">
              <div className="memory-step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h3>You Plan & Execute</h3>
                  <p>Interact naturally to manage tasks, meetings, and strategy.</p>
                </div>
              </div>
              <div className="memory-step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h3>System Stores Context</h3>
                  <p>Behind the scenes, we map your startup's core concepts, key people, and priorities.</p>
                </div>
              </div>
              <div className="memory-step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h3>Contextual Recall</h3>
                  <p>In your next session, the AI brings back relevant context without you having to ask.</p>
                </div>
              </div>
              <div className="memory-step">
                <div className="step-number">4</div>
                <div className="step-content">
                  <h3>Proactive Support</h3>
                  <p>As the AI learns your operations, it anticipates your needs and drafts assets proactively.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="section">
          <div className="container">
            <div className="section-header">
              <span className="section-label">Capabilities</span>
              <h2 className="section-title">Built for Serious Operators</h2>
            </div>

            <div className="features-grid">
              <div className="glass-card feature-card">
                <div className="feature-icon-wrapper"><History size={24} /></div>
                <h3>Persistent Memory</h3>
                <p>Remembers past decisions, meeting notes, and KPIs, ensuring you never repeat yourself.</p>
              </div>
              <div className="glass-card feature-card">
                <div className="feature-icon-wrapper"><TrendingUp size={24} /></div>
                <h3>Strategic Alignment</h3>
                <p>Aligns daily tasks with long-term company objectives, keeping you focused.</p>
              </div>
              <div className="glass-card feature-card">
                <div className="feature-icon-wrapper"><RefreshCw size={24} /></div>
                <h3>Contextual Drafting</h3>
                <p>Writes emails and documents using the exact tone and context of your startup.</p>
              </div>
              <div className="glass-card feature-card">
                <div className="feature-icon-wrapper"><User size={24} /></div>
                <h3>Meeting Intelligence</h3>
                <p>Prepares you for meetings by recalling past interactions with investors and clients.</p>
              </div>
              <div className="glass-card feature-card">
                <div className="feature-icon-wrapper"><BookOpen size={24} /></div>
                <h3>Knowledge Base</h3>
                <p>Automatically categorizes operational documents for instant retrieval.</p>
              </div>
              <div className="glass-card feature-card">
                <div className="feature-icon-wrapper"><MessagesSquare size={24} /></div>
                <h3>Natural Follow-Ups</h3>
                <p>Feels like a real Chief of Staff continuing the conversation naturally from yesterday.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Comparison Section */}
        <section className="section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Why We Are Different</h2>
            </div>
            
            <div className="comparison-grid">
              <div className="glass-card comparison-card generic">
                <h3>Generic AI Chatbots</h3>
                <ul className="comparison-list">
                  <li><X size={20} className="icon-x"/> Stateless interactions</li>
                  <li><X size={20} className="icon-x"/> Same starting point every time</li>
                  <li><X size={20} className="icon-x"/> Requires massive prompt engineering</li>
                  <li><X size={20} className="icon-x"/> Siloed from your daily operations</li>
                </ul>
              </div>
              <div className="glass-card comparison-card product">
                <h3>FounderMind</h3>
                <ul className="comparison-list">
                  <li><Check size={20} className="icon-check"/> Persistent memory loop</li>
                  <li><Check size={20} className="icon-check"/> Personalized operational context</li>
                  <li><Check size={20} className="icon-check"/> Zero prompt engineering needed</li>
                  <li><Check size={20} className="icon-check"/> Integrated deeply with your workflows</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <div className="container">
            <h2>Operations work better when your AI <span className="text-gradient">remembers you.</span></h2>
            <div className="hero-ctas">
              <button className="btn btn-primary" onClick={() => navigate('/signup')}>Start Free Trial</button>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div>
              <div className="footer-logo">
                <Brain className="logo-icon" size={20} />
                FounderMind
              </div>
              <p>The AI Chief of Staff for Startup Founders.</p>
            </div>
            <div className="footer-links">
              <a href="#">Features</a>
              <a href="#">Pricing</a>
              <a href="#">Blog</a>
              <a href="#">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
