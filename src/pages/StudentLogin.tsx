import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import { PortalFlash } from '../components/Common';
import { usePortal } from '../lib/PortalContext';

export default function StudentLogin() {
  const navigate = useNavigate();
  const portal = usePortal();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [forgotNote, setForgotNote] = useState<{ ok: boolean; text: string } | null>(null);

  async function submit() {
    const outcome = await portal.loginStudent(email, password);
    if (outcome.ok) navigate('/portal');
    else portal.flash('err', outcome.error || 'Login failed.');
  }

  async function forgotPassword() {
    if (!email.trim()) {
      setForgotNote({ ok: false, text: 'Enter your registered email first.' });
      return;
    }
    const outcome = await portal.resetPassword(email);
    setForgotNote(
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
          <h2>Student login</h2>
          <div className="field">
            <label>Email</label>
            <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" placeholder="Your password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button className="btn gold" style={{ width: '100%' }} onClick={submit}>
            Log in
          </button>
          <div style={{ marginTop: 14, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <button className="btn secondary small" onClick={() => navigate('/')}>
              &larr; Back
            </button>
            <button className="btn secondary small" onClick={() => navigate('/register')}>
              New here? Register
            </button>
          </div>
          <div style={{ marginTop: 10 }}>
            <button className="btn secondary small" onClick={forgotPassword}>
              Forgot password?
            </button>
          </div>
          {forgotNote && <div className={`msg ${forgotNote.ok ? 'ok' : 'err'}`} style={{ marginTop: 12 }}>{forgotNote.text}</div>}
        </div>
      </div>
    </>
  );
}
