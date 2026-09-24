import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import { PortalFlash } from '../components/Common';
import { usePortal } from '../lib/PortalContext';
import { calcAge } from '../lib/utils';
import { sendEmail } from '../lib/notifications';

const EMAIL_RE = /^\S+@\S+\.\S+$/;

export default function StudentRegister() {
  const navigate = useNavigate();
  const portal = usePortal();
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [occupation, setOccupation] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [education, setEducation] = useState('');
  const [priorYoga, setPriorYoga] = useState<'yes' | 'no'>('no');
  const [priorYogaDetail, setPriorYogaDetail] = useState('');
  const [examLanguage, setExamLanguage] = useState('');
  const [medical, setMedical] = useState<'yes' | 'no'>('no');
  const [medicalDetail, setMedicalDetail] = useState('');
  const [purpose, setPurpose] = useState('');
  const [password, setPassword] = useState('');
  const [agree, setAgree] = useState(false);

  const age = calcAge(dob);

  async function submit() {
    setError(null);
    if (
      !name || !dob || !gender || !occupation || !mobile || !email || !address ||
      !education || !examLanguage || !purpose || !password
    ) {
      setError('Please complete all fields before submitting.');
      return;
    }
    if (!EMAIL_RE.test(email)) { setError('Enter a valid email address.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (priorYoga === 'yes' && !priorYogaDetail) { setError('Please specify your prior yoga knowledge/certification.'); return; }
    if (medical === 'yes' && !medicalDetail) { setError('Please specify the medical condition we should be aware of.'); return; }
    if (!agree) { setError('Please agree to the terms and conditions to continue.'); return; }

    const now = new Date().toISOString();
    const outcome = await portal.registerStudent(
      {
        name, dob, age: calcAge(dob), gender, occupation, mobile, email, address, education,
        priorYoga, priorYogaDetail, examLanguage, medical, medicalDetail, purpose,
        agreedAt: now, registeredAt: now,
      },
      password
    );
    if (!outcome.ok) { setError(outcome.error || 'Registration could not be completed.'); return; }
    navigate('/portal');
    portal.flash('ok', `Registration confirmed. Your Student ID is ${outcome.student!.id} — you're logged in and ready to enroll.`);
    sendEmail(portal.data.settings, outcome.student!.email, outcome.student!.name, 'Registration confirmed',
      `Your Student ID is ${outcome.student!.id}. You can now log in to enroll in courses.`).catch(() => {});
  }

  return (
    <>
      <TopBar />
      <div className="wrap" style={{ maxWidth: 640, paddingTop: 40, paddingBottom: 40 }}>
        <PortalFlash />
        <div className="panel accent">
          <h2>New student registration</h2>
          <div className="sub">Please complete all sections below. Once registered, you can log in right away to enroll in a course.</div>
          {error && <div className="msg err">{error}</div>}

          <fieldset>
            <legend>Personal Information</legend>
            <div className="field">
              <label>Full Name</label>
              <input placeholder="Your full name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="row3">
              <div className="field">
                <label>Date of Birth</label>
                <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
              </div>
              <div className="field">
                <label>Age</label>
                <input placeholder="—" readOnly style={{ background: '#F7F5EE' }} value={age === null ? '' : age} />
              </div>
              <div className="field">
                <label>Gender</label>
                <div className="radio-row">
                  {['Male', 'Female', 'Other'].map((g) => (
                    <label key={g}>
                      <input type="radio" name="rGender" value={g} checked={gender === g} onChange={() => setGender(g)} /> {g}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="field">
              <label>Occupation</label>
              <input placeholder="Your occupation" value={occupation} onChange={(e) => setOccupation(e.target.value)} />
            </div>
          </fieldset>

          <fieldset>
            <legend>Contact Details</legend>
            <div className="row2">
              <div className="field">
                <label>Mobile Number</label>
                <input placeholder="Mobile number" value={mobile} onChange={(e) => setMobile(e.target.value)} />
              </div>
              <div className="field">
                <label>Email Address</label>
                <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>
            <div className="field">
              <label>Address</label>
              <textarea rows={2} placeholder="Your address" value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
          </fieldset>

          <fieldset>
            <legend>Education</legend>
            <div className="field">
              <label>Highest qualification / education background</label>
              <input placeholder="e.g. B.A., B.Com, Graduate" value={education} onChange={(e) => setEducation(e.target.value)} />
            </div>
          </fieldset>

          <fieldset>
            <legend>Yoga Background</legend>
            <div className="field">
              <label>Do you have any previous knowledge or certification in Yoga?</label>
              <div className="radio-row">
                <label><input type="radio" name="rYogaPrior" checked={priorYoga === 'no'} onChange={() => setPriorYoga('no')} /> No</label>
                <label><input type="radio" name="rYogaPrior" checked={priorYoga === 'yes'} onChange={() => setPriorYoga('yes')} /> Yes (please specify)</label>
              </div>
            </div>
            {priorYoga === 'yes' && (
              <div className="field">
                <label>Please specify</label>
                <input placeholder="e.g. 200hr YTT, 2019" value={priorYogaDetail} onChange={(e) => setPriorYogaDetail(e.target.value)} />
              </div>
            )}
          </fieldset>

          <fieldset>
            <legend>Examination Details</legend>
            <div className="field">
              <label>Preferred Language for Examination</label>
              <div className="radio-row">
                {['English', 'Hindi', 'Marathi'].map((lang) => (
                  <label key={lang}>
                    <input type="radio" name="rExamLang" checked={examLanguage === lang} onChange={() => setExamLanguage(lang)} /> {lang}
                  </label>
                ))}
              </div>
            </div>
          </fieldset>

          <fieldset>
            <legend>Medical Information</legend>
            <div className="field">
              <label>Do you have any medical history or health condition that we should be aware of?</label>
              <div className="radio-row">
                <label><input type="radio" name="rMedical" checked={medical === 'no'} onChange={() => setMedical('no')} /> No</label>
                <label><input type="radio" name="rMedical" checked={medical === 'yes'} onChange={() => setMedical('yes')} /> Yes (please specify)</label>
              </div>
            </div>
            {medical === 'yes' && (
              <div className="field">
                <label>Please specify</label>
                <input placeholder="e.g. knee injury, hypertension" value={medicalDetail} onChange={(e) => setMedicalDetail(e.target.value)} />
              </div>
            )}
          </fieldset>

          <fieldset>
            <legend>Statement of Purpose</legend>
            <div className="field">
              <label>Why do you wish to enroll in this course?</label>
              <textarea rows={3} placeholder="Tell us briefly" value={purpose} onChange={(e) => setPurpose(e.target.value)} />
            </div>
          </fieldset>

          <fieldset>
            <legend>Account &amp; Declaration</legend>
            <div className="field">
              <label>Set a password</label>
              <input type="password" placeholder="Choose a password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div className="terms-box">
              <ul style={{ margin: 0, paddingLeft: 16 }}>
                <li>The course curriculum is taught by the faculty of ISHWARI — The Institute for Conscious Living.</li>
                <li>Admission is confirmed only on completion of registration and payment of applicable fees.</li>
                <li>Course fees, once paid, are non-refundable and non-transferable except as approved by the Institute.</li>
                <li>Completion of the course does not guarantee passing YCB examinations — results are awarded solely by the certifying authority.</li>
                <li>The Institute follows a strict policy against malpractice during examinations.</li>
              </ul>
            </div>
            <div className="agree-row">
              <input type="checkbox" id="rAgree" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
              <label htmlFor="rAgree">
                I have read, understood, and agree to the above terms and conditions of ISHWARI — The Institute for Conscious Living.
              </label>
            </div>
          </fieldset>

          <button className="btn gold" style={{ width: '100%' }} onClick={submit}>
            Register
          </button>
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
