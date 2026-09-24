import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import { PortalFlash } from '../components/Common';
import { usePortal } from '../lib/PortalContext';

export default function AdminLogin() {
  const navigate = useNavigate();
  const portal = usePortal();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetNote, setResetNote] = useState<{ ok: boolean; text: string } | null>(null);

  async function submit() {
    const outcome = await portal.loginAdmin(email, password);
    if (outcome.ok) navigate('/admin');
    else portal.flash('err', outcome.error || 'Login failed.');
  }

  async function forgotPassword() {
    if (!email.trim()) {
      setResetNote({ ok: false, text: 'Enter your registered email first.' });
      return;
    }
    const outcome = await portal.resetPassword(email);
    setResetNote(
      outcome.ok
        ? { ok: true, text: 'Password reset email sent. Please check your inbox.' }
        : { ok: false, text: outcome.error || 'Unable to send reset email.' }
    );
  }

  return (
    <>
      <TopBar />
      <div className="wrap" style={{ maxWidth: 420, paddingTop: 56 }}>
        <PortalFlash />
        <div className="panel accent">
          <h2>Admin login</h2>
          <div className="sub">Sign in with the administrator account configured in Firebase Authentication.</div>
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              autoComplete="username"
              placeholder="admin@ishwariyogainstitute.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="field">
            <label>Password</label>
            <input
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button className="btn gold" style={{ width: '100%' }} onClick={submit}>
            Log in
          </button>
          <div style={{ marginTop: 10, textAlign: 'center' }}>
            <button className="btn secondary small" onClick={forgotPassword}>
              Forgot password?
            </button>
          </div>
          {resetNote && <div className={`msg ${resetNote.ok ? 'ok' : 'err'}`} style={{ marginTop: 12 }}>{resetNote.text}</div>}
          <div style={{ marginTop: 14 }}>
            <button className="btn secondary small" onClick={() => navigate('/')}>
              &larr; Back
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
