import { useState } from 'react';
import { usePortal } from '../../lib/PortalContext';
import { saveEmailSettings } from '../../lib/actions';

export default function AdminSettings() {
  const portal = usePortal();
  const s = portal.data.settings;
  const [serviceId, setServiceId] = useState(s.serviceId);
  const [templateId, setTemplateId] = useState(s.templateId);
  const [publicKey, setPublicKey] = useState(s.publicKey);
  const configured = !!(s.serviceId && s.templateId && s.publicKey);

  return (
    <div className="panel accent">
      <h2>Email notifications</h2>
      <div className="sub">
        Sent from the browser via{' '}
        <a href="https://www.emailjs.com" target="_blank" rel="noopener noreferrer">EmailJS</a> — no server required. Create a
        free EmailJS account, an email service, and a template with the variables <code>to_email</code>, <code>to_name</code>,{' '}
        <code>subject</code>, <code>message</code>, then paste your IDs below. Until this is configured, confirmations only
        appear on-screen.
      </div>
      <div className="field">
        <label>EmailJS Service ID</label>
        <input value={serviceId} onChange={(e) => setServiceId(e.target.value)} />
      </div>
      <div className="field">
        <label>EmailJS Template ID</label>
        <input value={templateId} onChange={(e) => setTemplateId(e.target.value)} />
      </div>
      <div className="field">
        <label>EmailJS Public Key</label>
        <input value={publicKey} onChange={(e) => setPublicKey(e.target.value)} />
      </div>
      <button className="btn green" onClick={() => saveEmailSettings(portal, { serviceId: serviceId.trim(), templateId: templateId.trim(), publicKey: publicKey.trim() })}>
        Save settings
      </button>
      <div style={{ marginTop: 12, fontSize: 12.5, color: 'var(--ink-soft)' }}>
        Status: {configured ? 'Configured — emails will be attempted on registration, enrollment and result publication.' : 'Not configured yet — on-screen confirmations only.'}
      </div>
    </div>
  );
}
