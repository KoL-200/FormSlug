import { useState } from 'react';
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  MoveUpRight,
  Shapes,
  Sparkles,
  UserRound,
} from 'lucide-react';

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

function Field({ id, label, type = 'text', value, onChange, placeholder, icon: Icon, autoComplete, trailing }) {
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

export default function App() {
  const [mode, setMode] = useState('register');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const isRegister = mode === 'register';

  function changeMode(nextMode) {
    setMode(nextMode);
    setPassword('');
    setError('');
    setNotice('');
  }

  function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setNotice('');

    if (password.length < 8) {
      setError('Your password must be at least 8 characters.');
      return;
    }

    setNotice(`${isRegister ? 'Sign-up' : 'Login'} is not connected yet. No request was sent.`);
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
                  type="button"
                >
                  Create account
                </button>
                <button
                  className={`auth-tab${!isRegister ? ' active' : ''}`}
                  aria-pressed={!isRegister}
                  onClick={() => changeMode('login')}
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
                  trailing={
                    <button
                      className="password-toggle"
                      type="button"
                      onClick={() => setShowPassword((visible) => !visible)}
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
                <button className="submit-button" type="submit">
                  <span>{isRegister ? 'Create your account' : 'Sign in'}</span>
                  <ArrowRight size={17} strokeWidth={2.2} />
                </button>
              </form>

              <div className="form-bottom">
                <span className="bottom-rule" />
                <p>
                  {isRegister ? 'Already have an account?' : 'New to FormSlug?'}
                  <button type="button" onClick={() => changeMode(isRegister ? 'login' : 'register')}>
                    {isRegister ? ' Sign in' : ' Create an account'}
                  </button>
                </p>
                <span className="bottom-rule" />
              </div>
              <div className="privacy-note"><LockKeyhole size={13} /> Your information is encrypted and kept private.</div>
          </>
        </div>
        <footer className="auth-footer">
          <span>© {new Date().getFullYear()} FormSlug</span>
          <span className="footer-divider" />
          <span>Built for better conversations</span>
          <a href="http://localhost:3000/api/docs" target="_blank" rel="noreferrer" aria-label="Open API documentation">
            API docs <MoveUpRight size={13} />
          </a>
        </footer>
      </section>
    </main>
  );
}
