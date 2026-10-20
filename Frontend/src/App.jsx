import { useState } from 'react';
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  Bell,
  Check,
  ChevronDown,
  Eye,
  EyeOff,
  FileText,
  Inbox,
  LockKeyhole,
  LayoutDashboard,
  Mail,
  MoveUpRight,
  Plus,
  Search,
  Settings2,
  Shapes,
  Sparkles,
  UserRound,
} from 'lucide-react';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api/v1').replace(/\/+$/, '');
const API_DOCS_URL = API_BASE_URL.endsWith('/api/v1')
  ? `${API_BASE_URL.slice(0, -7)}/api/docs`
  : `${API_BASE_URL}/docs`;

function BrandMark({ light = false }) {
  return (
    <a className={`brand${light ? ' brand-light' : ''}`} href="/" aria-label="FormSlug home">
      <span className="brand-mark" aria-hidden="true">
        <Shapes size={19} strokeWidth={2.2} />
      </span>
      <span>formslug</span>
    </a>
  );
}

function Field({ id, label, type = 'text', value, onChange, placeholder, icon: Icon, autoComplete, trailing, disabled }) {
  return (
    <label className="field" htmlFor={id}>
      <span className="field-label">{label}</span>
      <span className="input-wrap">
        <Icon className="input-icon" size={18} strokeWidth={1.8} aria-hidden="true" />
        <input
          id={id}
          name={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          disabled={disabled}
          required
        />
        {trailing}
      </span>
    </label>
  );
}

function WordmarkIllustration() {
  return (
    <div className="illustration" aria-hidden="true">
      <div className="illustration-glow" />
      <div className="orbit orbit-one" />
      <div className="orbit orbit-two" />
      <div className="orbit orbit-three" />
      <div className="floating-dot dot-one" />
      <div className="floating-dot dot-two" />
      <div className="floating-dot dot-three" />
      <div className="form-card">
        <div className="form-card-top">
          <span className="mini-mark"><Shapes size={14} /></span>
          <span className="form-card-label">NEW RESPONSE</span>
          <span className="response-dot" />
        </div>
        <div className="form-card-title">A little about you</div>
        <div className="mock-field">
          <span>Your name</span>
          <span className="mock-line" />
        </div>
        <div className="mock-field">
          <span>Email address</span>
          <span className="mock-line short-line" />
        </div>
        <div className="mock-field message-field">
          <span>What’s on your mind?</span>
          <span className="mock-line" />
          <span className="mock-line medium-line" />
        </div>
        <div className="mock-submit">Send response <ArrowRight size={14} /></div>
      </div>
      <div className="response-toast">
        <span className="toast-check"><Check size={14} strokeWidth={3} /></span>
        <span><strong>Response received</strong><small>Just now · safely delivered</small></span>
        <Sparkles className="toast-sparkle" size={17} />
      </div>
      <span className="illustration-caption">Good forms. Better conversations.</span>
    </div>
  );
}

const initialForms = [
  { id: 1, name: 'Customer feedback', responses: 128, updated: '2 hours ago', status: 'Active', color: 'sage' },
  { id: 2, name: 'Contact form', responses: 64, updated: 'Yesterday', status: 'Active', color: 'peach' },
  { id: 3, name: 'Product waitlist', responses: 32, updated: '2 days ago', status: 'Draft', color: 'lavender' },
];

function Dashboard({ onBack }) {
  const [forms, setForms] = useState(initialForms);
  const [search, setSearch] = useState('');
  const [notice, setNotice] = useState('');
  const today = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  function createForm() {
    const form = {
      id: Date.now(),
      name: 'Untitled form',
      responses: 0,
      updated: 'Just now',
      status: 'Draft',
      color: 'sage',
    };
    setForms((currentForms) => [form, ...currentForms]);
    setNotice('Draft added to this preview. It has not been saved to a server.');
  }

  const filteredForms = forms.filter((form) => form.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <main className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <BrandMark />
        <div className="workspace-switcher">
          <span className="workspace-avatar">F</span>
          <span className="workspace-name"><strong>FormSlug Studio</strong><small>Free workspace</small></span>
          <ChevronDown size={15} />
        </div>
        <div className="sidebar-label">WORKSPACE</div>
        <nav className="dashboard-nav" aria-label="Workspace navigation">
          <button className="dashboard-nav-item active" type="button">
            <LayoutDashboard size={17} /> Overview
          </button>
          <button className="dashboard-nav-item" type="button" onClick={() => setNotice('Responses are not connected in this preview.')}>
            <Inbox size={17} /> Responses
            <span className="nav-count">12</span>
          </button>
          <button className="dashboard-nav-item" type="button" onClick={() => setNotice('Settings are not connected in this preview.')}>
            <Settings2 size={17} /> Settings
          </button>
        </nav>
        <div className="sidebar-bottom">
          <div className="preview-card">
            <span className="preview-card-icon"><Sparkles size={15} /></span>
            <strong>Preview mode</strong>
            <p>Your sample workspace is stored only in this page.</p>
          </div>
          <button className="profile-button" type="button" onClick={onBack}>
            <span className="profile-avatar">J</span>
            <span><strong>Jamie Parker</strong><small>Back to sign in</small></span>
            <ChevronDown size={15} />
          </button>
        </div>
      </aside>

      <section className="dashboard-main">
        <header className="dashboard-topbar">
          <div className="breadcrumb"><span>Workspace</span><span>/</span><strong>Overview</strong></div>
          <div className="topbar-actions">
            <span className="demo-pill"><span /> Demo data</span>
            <button className="icon-button" type="button" aria-label="Notifications" onClick={() => setNotice('You’re all caught up.')}>
              <Bell size={18} />
            </button>
            <button className="topbar-avatar" type="button" onClick={onBack} aria-label="Return to sign in">J</button>
          </div>
        </header>

        <div className="dashboard-content">
          <div className="dashboard-heading">
            <div>
              <div className="dashboard-eyebrow">{today}</div>
              <h1>Good morning, Jamie <span>✳</span></h1>
              <p>Here’s what’s happening with your forms today.</p>
            </div>
            <button className="create-form-button" type="button" onClick={createForm}>
              <Plus size={17} /> Create a form
            </button>
          </div>

          {notice && (
            <div className="dashboard-notice" role="status">
              <Check size={16} /> {notice}
              <button type="button" onClick={() => setNotice('')} aria-label="Dismiss notice">×</button>
            </div>
          )}

          <div className="stats-grid">
            <article className="stat-card">
              <div className="stat-card-top"><span>Total responses</span><span className="stat-icon green"><Inbox size={17} /></span></div>
              <div className="stat-value">224</div>
              <div className="stat-foot"><span className="stat-trend">↗ 18.4%</span> <span>vs. last month</span></div>
              <div className="stat-sparkline sparkline-green" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /><i /></div>
            </article>
            <article className="stat-card">
              <div className="stat-card-top"><span>Active forms</span><span className="stat-icon lavender"><FileText size={17} /></span></div>
              <div className="stat-value">{forms.filter((form) => form.status === 'Active').length}</div>
              <div className="stat-foot"><span>Across your workspace</span></div>
              <div className="stat-sparkline sparkline-lavender" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /><i /></div>
            </article>
            <article className="stat-card">
              <div className="stat-card-top"><span>Avg. completion</span><span className="stat-icon peach"><Activity size={17} /></span></div>
              <div className="stat-value">68<span className="stat-percent">%</span></div>
              <div className="stat-foot"><span className="stat-trend">↗ 4.2%</span> <span>vs. last month</span></div>
              <div className="completion-track"><span /></div>
            </article>
          </div>

          <section className="forms-section">
            <div className="section-heading">
              <div><h2>Your forms</h2><p>A little overview of what you’re collecting.</p></div>
              <div className="forms-controls">
                <label className="form-search">
                  <Search size={16} />
                  <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search forms" aria-label="Search forms" />
                </label>
                <button className="view-all-button" type="button" onClick={() => setSearch('')}>View all <ArrowUpRight size={15} /></button>
              </div>
            </div>

            <div className="forms-table">
              <div className="forms-table-head"><span>FORM NAME</span><span>RESPONSES</span><span>LAST UPDATED</span><span>STATUS</span><span /></div>
              {filteredForms.map((form) => (
                <div className="form-row" key={form.id}>
                  <div className="form-name-cell">
                    <span className={`form-file-icon ${form.color}`}><FileText size={17} /></span>
                    <strong>{form.name}</strong>
                  </div>
                  <span className="form-response-count">{form.responses}</span>
                  <span className="form-updated">{form.updated}</span>
                  <span className={`form-status ${form.status.toLowerCase()}`}><i />{form.status}</span>
                  <button className="row-menu" type="button" aria-label={`Open ${form.name} actions`} onClick={() => setNotice(`${form.name} actions are not connected in this preview.`)}>···</button>
                </div>
              ))}
              {filteredForms.length === 0 && <div className="empty-forms">No forms match “{search}”.</div>}
            </div>
            <div className="table-footnote"><span className="live-dot" /> Showing sample data <span>·</span> No API connection</div>
          </section>

          <footer className="dashboard-footer">
            <span>Made for better conversations.</span>
            <button type="button" onClick={onBack}>Return to sign in <ArrowRight size={14} /></button>
          </footer>
        </div>
      </section>
    </main>
  );
}

export default function App() {
  const [page, setPage] = useState('auth');
  const [mode, setMode] = useState('register');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isRegister = mode === 'register';

  if (page === 'dashboard') {
    return <Dashboard onBack={() => setPage('auth')} />;
  }

  function changeMode(nextMode) {
    setMode(nextMode);
    setPassword('');
    setError('');
    setNotice('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setNotice('');

    if (password.length < 8) {
      setError('Your password must be at least 8 characters.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/${isRegister ? 'register' : 'login'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isRegister
          ? { name: name.trim(), email, password }
          : { email, password }),
      });

      let result;
      try {
        result = await response.json();
      } catch {
        throw new Error('The server returned an invalid response. Please try again.');
      }

      if (!response.ok) {
        const validationErrors = Array.isArray(result.details)
          ? result.details
            .map((detail) => detail?.field
              ? `${detail.field}: ${detail.message}`
              : detail?.message)
            .filter(Boolean)
            .join(' ')
          : '';
        throw new Error(validationErrors || result.error || 'Authentication failed. Please try again.');
      }

      if (isRegister) {
        setMode('login');
        setPassword('');
        setNotice('Account created. Sign in with your new credentials.');
        return;
      }

      if (!result.data?.accessToken || !result.data?.user) {
        throw new Error('The server returned an invalid sign-in response. Please try again.');
      }

      setNotice(`Signed in successfully. Welcome${result.data.user.name ? `, ${result.data.user.name}` : ''}.`);
    } catch (requestError) {
      setError(requestError instanceof TypeError
        ? 'Unable to reach the authentication service. Check your connection and try again.'
        : requestError.message || 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="page-shell">
      <section className="story-panel">
        <div className="story-inner">
          <BrandMark light />
          <div className="story-copy">
            <div className="eyebrow"><span /> YOUR FORMS, IN GOOD HANDS</div>
            <h1>Make space for<br />the <em>good stuff.</em></h1>
            <p>Thoughtful forms make it easier to hear what matters. Start collecting the responses that move you forward.</p>
          </div>
          <WordmarkIllustration />
          <div className="story-footer">
            <span>Simple to set up. A joy to use.</span>
            <span className="story-footer-mark">F<span>.</span></span>
          </div>
        </div>
        <div className="story-grain" aria-hidden="true" />
      </section>

      <section className="auth-panel">
        <div className="mobile-brand"><BrandMark /></div>
        <div className="auth-content">
          <>
              <div className="auth-heading">
                <div className="auth-kicker">{isRegister ? 'A FRESH START' : 'WELCOME BACK'}</div>
                <h2>{isRegister ? 'Create your account' : 'Sign in to FormSlug'}</h2>
                <p className="auth-subtitle">
                  {isRegister
                    ? 'A better way to collect, manage, and understand every response.'
                    : 'Pick up where you left off. Your responses are waiting.'}
                </p>
              </div>

              <div className="auth-tabs" role="group" aria-label="Account access">
                <button
                  className={`auth-tab${isRegister ? ' active' : ''}`}
                  aria-pressed={isRegister}
                  onClick={() => changeMode('register')}
                  disabled={isLoading}
                  type="button"
                >
                  Create account
                </button>
                <button
                  className={`auth-tab${!isRegister ? ' active' : ''}`}
                  aria-pressed={!isRegister}
                  onClick={() => changeMode('login')}
                  disabled={isLoading}
                  type="button"
                >
                  Sign in
                </button>
              </div>

              {notice && <div className="notice-message" role="status"><Check size={17} />{notice}</div>}
              {error && <div className="error-message" role="alert">{error}</div>}

              <form className="auth-form" onSubmit={handleSubmit}>
                {isRegister && (
                  <Field
                    id="name"
                    label="Your name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="e.g. Jamie Parker"
                    icon={UserRound}
                    autoComplete="name"
                    disabled={isLoading}
                  />
                )}
                <Field
                  id="email"
                  label="Email address"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  icon={Mail}
                  autoComplete="email"
                  disabled={isLoading}
                />
                <Field
                  id="password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="At least 8 characters"
                  icon={LockKeyhole}
                  autoComplete={isRegister ? 'new-password' : 'current-password'}
                  disabled={isLoading}
                  trailing={
                    <button
                      className="password-toggle"
                      type="button"
                      onClick={() => setShowPassword((visible) => !visible)}
                      disabled={isLoading}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  }
                />
                {!isRegister && (
                  <div className="form-meta">
                    <span className="secure-note"><LockKeyhole size={13} /> Secure sign in</span>
                    <span className="password-hint">Forgot password? Contact support</span>
                  </div>
                )}
                {isRegister && (
                  <p className="terms-note">
                    By creating an account, you agree to use FormSlug responsibly and keep your sign-in details secure.
                  </p>
                )}
                <button className="submit-button" type="submit" disabled={isLoading}>
                  <span>{isLoading
                    ? (isRegister ? 'Creating account...' : 'Signing in...')
                    : (isRegister ? 'Create your account' : 'Sign in')}</span>
                  {isLoading
                    ? <span className="button-spinner" aria-hidden="true" />
                    : <ArrowRight size={17} strokeWidth={2.2} />}
                </button>
              </form>

              <div className="form-bottom">
                <span className="bottom-rule" />
                <p>
                  {isRegister ? 'Already have an account?' : 'New to FormSlug?'}
                  <button type="button" disabled={isLoading} onClick={() => changeMode(isRegister ? 'login' : 'register')}>
                    {isRegister ? ' Sign in' : ' Create an account'}
                  </button>
                </p>
                <span className="bottom-rule" />
              </div>
              <button className="preview-link" type="button" disabled={isLoading} onClick={() => setPage('dashboard')}>
                Preview the workspace <ArrowRight size={14} />
              </button>
              <div className="privacy-note"><LockKeyhole size={13} /> Your information is encrypted and kept private.</div>
          </>
        </div>
        <footer className="auth-footer">
          <span>© {new Date().getFullYear()} FormSlug</span>
          <span className="footer-divider" />
          <span>Built for better conversations</span>
          <a href={API_DOCS_URL} target="_blank" rel="noreferrer" aria-label="Open API documentation">
            API docs <MoveUpRight size={13} />
          </a>
        </footer>
      </section>
    </main>
  );
}
