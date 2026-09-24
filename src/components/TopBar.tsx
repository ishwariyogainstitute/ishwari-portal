import { useNavigate } from 'react-router-dom';
import ishwariLogo from '../assets/ishwari-logo.png';
import { usePortal } from '../lib/PortalContext';

const BP_LOGO_SRC = 'https://breathingpoint.in/assets/img/logo-horizontal.png';

export default function TopBar({ showLogout = false }: { showLogout?: boolean }) {
  const navigate = useNavigate();
  const portal = usePortal();

  return (
    <div className="topbar">
      <div className="topbar-inner">
        <div className="brand" onClick={() => navigate('/')}>
          <img src={ishwariLogo} alt="ISHWARI — The Institute for Conscious Living" />
          <div className="brand-divider" />
          <div className="brand-sub">
            <div className="brand-sub-label">under</div>
            <img src={BP_LOGO_SRC} alt="Breathing Point Integrative Therapy" className="bp-logo" />
          </div>
        </div>
        <div className="topbar-actions">
          {!showLogout && (
            <button className="btn secondary small" onClick={() => navigate('/catalog')}>
              Browse courses
            </button>
          )}
          {showLogout && (
            <button
              className="btn secondary small"
              onClick={async () => {
                await portal.logout();
                navigate('/');
              }}
            >
              Log out
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export { BP_LOGO_SRC };
