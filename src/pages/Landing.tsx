import { useNavigate } from 'react-router-dom';
import TopBar, { BP_LOGO_SRC } from '../components/TopBar';
import { SectionLabel, Empty } from '../components/Common';
import { usePortal } from '../lib/PortalContext';
import { courseStatus, fmtDate, fmtMoney, parseDate } from '../lib/utils';

export default function Landing() {
  const navigate = useNavigate();
  const { data } = usePortal();

  const allUpcoming = data.courses
    .filter((c) => courseStatus(c) === 'upcoming')
    .sort((a, b) => parseDate(a.startDate).getTime() - parseDate(b.startDate).getTime());
  const teaser = allUpcoming.slice(0, 4);

  return (
    <>
      <TopBar />
      <div className="wrap">
        <div className="hero">
          <div>
            <div className="eyebrow">ISHWARI — THE INSTITUTE FOR CONSCIOUS LIVING</div>
            <h1>Learn with intention. Grow with awareness.</h1>
            <p className="lede">
              A calm, secure course portal to discover upcoming programmes, register as a student, track enrollment,
              view results and access certificates.
            </p>
            <div className="hero-actions">
              <button className="btn gold" onClick={() => navigate('/register')}>
                Register as a new student
              </button>
              <button className="btn secondary" onClick={() => navigate('/login')}>
                Student login
              </button>
              <button className="btn secondary" onClick={() => navigate('/admin/login')}>
                Admin login
              </button>
            </div>
          </div>
          <div className="portal-visual" aria-label="Portal highlights">
            <div className="pv-glow" />
            <div className="pv-kicker">Your learning journey</div>
            <h3>One thoughtful place for every step.</h3>
            <div className="pv-line" />
            <div className="pv-item">
              <span>Explore upcoming courses</span>
              <span className="pv-pill">Discover</span>
            </div>
            <div className="pv-item">
              <span>Complete your registration</span>
              <span className="pv-pill">Register</span>
            </div>
            <div className="pv-item">
              <span>Track enrollment &amp; results</span>
              <span className="pv-pill">Track</span>
            </div>
            <div className="pv-item">
              <span>Access your certificate</span>
              <span className="pv-pill">Achieve</span>
            </div>
          </div>
        </div>

        <SectionLabel>UPCOMING COURSES</SectionLabel>
        {teaser.length === 0 ? (
          <Empty>No courses have been published yet. Check back soon, or log in as admin to publish the first one.</Empty>
        ) : (
          teaser.map((c) => (
            <div className="course-row" key={c.id}>
              <div>
                <div className="course-name">{c.name}</div>
                {c.description && <div className="course-desc">{c.description}</div>}
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="course-name" style={{ fontSize: 14 }}>
                  {fmtMoney(c.fee)}
                </div>
                <div className="course-dates" style={{ marginTop: 6 }}>
                  Starts {fmtDate(c.startDate)}
                </div>
              </div>
            </div>
          ))
        )}
        {allUpcoming.length > 0 && (
          <div style={{ textAlign: 'center', marginTop: 22 }}>
            <button className="btn secondary" onClick={() => navigate('/catalog')}>
              Browse full catalog ({allUpcoming.length})
            </button>
          </div>
        )}
        <div className="footer-tagline">Awakening Consciousness. Transforming Lives.</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, paddingTop: 8 }}>
          <span className="footer-note" style={{ padding: 0 }}>
            ISHWARI — The Institute for Conscious Living, under
          </span>
          <img src={BP_LOGO_SRC} alt="Breathing Point Integrative Therapy" style={{ height: 18, width: 'auto' }} />
        </div>
        <div className="footer-note">breathingpoint.in</div>
      </div>
    </>
  );
}
