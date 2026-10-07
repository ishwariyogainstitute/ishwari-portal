import React, { useState } from 'react';
import { useYoga } from '../context/YogaContext';
import { Award, CheckCircle, Download, BookOpen, GraduationCap, ShieldAlert } from 'lucide-react';
import { PeepalLeaf, LotusFlower } from './BotanicalAssets';

export const YcbView: React.FC = () => {
  const { addInquiry } = useYoga();
  
  // Form States
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [level, setLevel] = useState('YCB Level 1: Protocol Instructor');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !email) {
      alert('Please fill out Name, Phone and Email to submit enrollment.');
      return;
    }

    addInquiry({
      name,
      phone,
      email,
      programInterestedIn: `YCB: ${level}`,
      message: message || `Enrolled for YCB Level: ${level}`
    });

    setSubmitted(true);
    setName('');
    setPhone('');
    setEmail('');
    setMessage('');
  };

  const handleDownloadProspectus = () => {
    const text = `ISHWARI YOGA INSTITUTE\n\nOFFICIAL YCB COURSE PROSPECTUS\n\nRegulated by Yoga Certification Board (YCB), Ministry of AYUSH, Govt of India.\n\nLevels offered:\n- Level 1: Yoga Protocol Instructor (3 Months)\n- Level 2: Yoga Wellness Educator (6 Months)\n- Level 3: Yoga Teacher & Evaluator (6 Months Advanced)\n- Level 4: Yoga Master\n\nSyllabus Focus:\n- Classical Text analysis (Patanjali, Hatha Pradipika, Gheranda Samhita)\n- Anatomy, Physiology & Bioenergetics\n- Sanskrit pronunciations & chanting standards\n- Hands-on alignment & Shatkarmas\n\nLead Instructors:\n- Devika Bhide (MA Yogashastra, YCB L7 Therapeutic specialist)\n- Shweta Vaikunthe (YCB L4 Yoga Master)\n\nEmail: Devikabhide8@gmail.com`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ishwari_ycb_courses_prospectus.pdf';
    a.click();
    URL.revokeObjectURL(url);
  };

  const faqs = [
    { q: 'What is the benefit of a YCB Certificate?', a: 'YCB is the ultimate standard authorized by the Ministry of Ayush, Government of India. It validates your expertise globally and is a prerequisite for jobs in government institutes, schools, international centers, and medical wellness facilities.' },
    { q: 'Who conducts the final examinations?', a: 'The examinations are conducted at our accredited center in Pune by a panel of external, independent evaluators appointed directly by the YCB, Ministry of Ayush.' },
    { q: 'Is there a theoretical exam?', a: 'Yes. The evaluation involves a written theoretical exam (covering scriptures, anatomy, and lifestyle codes) and a rigorous practical evaluation of your asana, pranayama, Shatkarma, and pedagogical chanting skills.' },
  ];

  return (
    <div id="ycb-view" className="relative overflow-hidden animate-fadeIn pb-24 px-4 sm:px-6 lg:px-8">
      
      {/* Background leaf overlays */}
      <div className="absolute top-24 right-4 pointer-events-none opacity-5 select-none">
        <PeepalLeaf size={160} />
      </div>

      {/* Page Header */}
      <section className="max-w-4xl mx-auto pt-16 pb-12 text-center space-y-6">
        <span className="font-mono text-[10px] tracking-[0.25em] text-biscuit font-bold uppercase">Government Accredited Standards</span>
        <h1 className="font-cinzel text-4xl md:text-5xl font-semibold text-espresso tracking-tight">
          YCB Teacher Training
        </h1>
        <p className="font-sans text-sm text-espresso/70 max-w-2xl mx-auto">
          Deepen your personal sadhana, study the original Sanskrit shastras, and secure global validation under the Yoga Certification Board (YCB), Ministry of Ayush, Government of India.
        </p>
        <div className="w-16 h-0.5 bg-biscuit mx-auto" />
      </section>

      {/* What is YCB Info block */}
      <section className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 py-12 items-center border-b border-biscuit/25">
        <div className="space-y-6">
          <div className="flex gap-3 items-center text-olive-green">
            <Award size={28} />
            <h2 className="font-cinzel text-xl font-bold text-espresso">What is YCB Certification?</h2>
          </div>
          <p className="font-sans text-sm text-espresso/80 leading-relaxed">
            The Yoga Certification Board (YCB) was established by the Ministry of Ayush, Government of India, to standardize and promote authentic yogic practices across the country and the globe. YCB provides official credentials confirming that your knowledge corresponds exactly to ancient traditional benchmarks as well as safe anatomical pedagogy.
          </p>
          <p className="font-sans text-sm text-espresso/80 leading-relaxed">
            At Ishwari Yoga Institute, we don't just "teach to the exam." We treat the YCB syllabus as a rich academic roadmap, ensuring you achieve absolute mastery over original Sanskrit chants, cleansing methods (*Shatkarma*), and therapeutic alignments.
          </p>
        </div>
        <div className="bg-warm-beige/30 border border-biscuit/40 p-8 rounded-xl space-y-4 artistic-double-border">
          <h3 className="font-cinzel text-base font-bold text-espresso">Who Should Join This Program?</h3>
          <ul className="space-y-3 font-sans text-xs text-espresso/85">
            <li className="flex items-start gap-2">
              <CheckCircle size={14} className="text-olive-green shrink-0 mt-0.5" />
              <span><strong>Serious Sadhakas:</strong> Who want to study authentic shastras without modern commercial diluting.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle size={14} className="text-olive-green shrink-0 mt-0.5" />
              <span><strong>Aspiring Teachers:</strong> Looking for recognized licenses to teach in colleges, schools, corporate hubs, or international ashrams.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle size={14} className="text-olive-green shrink-0 mt-0.5" />
              <span><strong>Health Care Professionals:</strong> Wanting to integrate clinical-grade yoga therapy with modern medicine.</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Levels Offered Grid */}
      <section className="max-w-5xl mx-auto py-16 space-y-12">
        <div className="text-center space-y-2">
          <h2 className="font-cinzel text-2xl font-semibold text-espresso">Levels Offered</h2>
          <p className="font-sans text-xs text-espresso/60">We prepare and certify seekers for multiple levels based on experience.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Level 1 */}
          <div className="p-8 artistic-card rounded-xl space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <span className="font-mono text-[9px] bg-warm-beige/50 text-espresso px-2 py-0.5 border border-biscuit/30 rounded font-semibold uppercase tracking-wider">Level 1</span>
              <h3 className="font-cinzel text-base font-bold text-espresso">Yoga Protocol Instructor</h3>
              <p className="font-sans text-xs text-espresso/70 leading-relaxed">
                Ideal for beginners wanting a professional foundation. Learn general health protocols, daily asana, pranayama basics, and standard Ayush protocols.
              </p>
              <div className="text-xs font-sans text-espresso/60 space-y-1 pt-2 border-t border-biscuit/10">
                <p><strong>Duration:</strong> 3 Months</p>
                <p><strong>Eligibility:</strong> Open to all seekers (10th standard pass)</p>
              </div>
            </div>
          </div>

          {/* Level 2/3 */}
          <div className="p-8 border border-olive-green/40 bg-warm-beige/10 rounded-xl shadow-sm space-y-4 flex flex-col justify-between relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-olive-green text-primary-white text-[9px] font-mono tracking-wider uppercase px-3 py-1 rounded-full font-bold shadow-sm">
              Highly Recommended
            </div>
            <div className="space-y-3 pt-2">
              <span className="font-mono text-[9px] bg-olive-green/10 text-olive-green px-2 py-0.5 rounded font-bold uppercase tracking-wider border border-olive-green/20">Level 3</span>
              <h3 className="font-cinzel text-base font-bold text-espresso">Yoga Teacher & Evaluator</h3>
              <p className="font-sans text-xs text-espresso/70 leading-relaxed">
                Suited for serious seekers. Master deep text interpretation (Patanjali, Gita), advanced alignments, and learn how to run teacher trainings and evaluate candidates.
              </p>
              <div className="text-xs font-sans text-espresso/60 space-y-1 pt-2 border-t border-biscuit/10">
                <p><strong>Duration:</strong> 6 Months</p>
                <p><strong>Eligibility:</strong> Graduate in any stream or Level 1 credentials</p>
              </div>
            </div>
          </div>

          {/* Level 4/7 */}
          <div className="p-8 artistic-card rounded-xl space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <span className="font-mono text-[9px] bg-warm-beige/50 text-espresso px-2 py-0.5 border border-biscuit/30 rounded font-semibold uppercase tracking-wider">Level 4 / 7</span>
              <h3 className="font-cinzel text-base font-bold text-espresso">Yoga Master & Therapeutic</h3>
              <p className="font-sans text-xs text-espresso/70 leading-relaxed">
                Elite certification. Focused on clinical integrations, designing specialized therapeutic setups, and deep Sanskrit scripture studies.
              </p>
              <div className="text-xs font-sans text-espresso/60 space-y-1 pt-2 border-t border-biscuit/10">
                <p><strong>Duration:</strong> Customizable (Hybrid)</p>
                <p><strong>Eligibility:</strong> Active teaching experience of 3+ years</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Current Course Offerings — Foundation & Teacher Training Programs */}
      <section className="max-w-5xl mx-auto py-16 space-y-12 border-t border-biscuit/25">
        <div className="text-center space-y-2">
          <div className="flex gap-3 items-center justify-center text-olive-green">
            <GraduationCap size={26} />
            <h2 className="font-cinzel text-2xl font-semibold text-espresso">Current Course Offerings</h2>
          </div>
          <p className="font-sans text-xs text-espresso/60 max-w-xl mx-auto">
            Enrolling now — download the full brochure for each program for the detailed curriculum, schedule and fees.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* IYA Foundation and Yoga Pravesh Course */}
          <div className="p-8 artistic-card rounded-xl space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <span className="font-mono text-[9px] bg-warm-beige/50 text-espresso px-2 py-0.5 border border-biscuit/30 rounded font-semibold uppercase tracking-wider">
                3-Month Program
              </span>
              <h3 className="font-cinzel text-lg font-bold text-espresso">IYA Foundation &amp; Yoga Pravesh Course</h3>
              <p className="font-sans text-xs text-espresso/70 leading-relaxed">
                A comprehensive 3-month teacher training combining three certifications — Yoga Pravesh (Yoga Vidya Gurukul),
                Yoga Foundation and CCY Teacher Training (Indian Yoga Association) — plus IYA membership.
              </p>
              <ul className="space-y-2 font-sans text-xs text-espresso/85 pt-2 border-t border-biscuit/10">
                <li className="flex items-start gap-2">
                  <CheckCircle size={14} className="text-olive-green shrink-0 mt-0.5" />
                  <span><strong>Dates:</strong> 1st October – 21st December 2026 (Diwali vacation 5–15 Nov)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={14} className="text-olive-green shrink-0 mt-0.5" />
                  <span><strong>Schedule:</strong> Theory 6–7 AM (Mon/Wed/Fri), Practical 7–8 AM (Mon–Fri)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={14} className="text-olive-green shrink-0 mt-0.5" />
                  <span><strong>Fee:</strong> ₹34,500 (Diwali offer, flat 25% off ₹46,000)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={14} className="text-olive-green shrink-0 mt-0.5" />
                  <span>Exams available in Hindi, Marathi and English</span>
                </li>
              </ul>
            </div>
            <a
              href="/brochures/iya-foundation-yoga-pravesh.pdf"
              download
              className="px-5 py-3 bg-espresso hover:bg-olive-green text-primary-white font-sans text-xs tracking-widest uppercase font-semibold inline-flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm focus:outline-none rounded"
            >
              <Download size={14} />
              <span>Download Brochure (PDF)</span>
            </a>
          </div>

          {/* Yoga Teacher Education Program */}
          <div className="p-8 border border-olive-green/40 bg-warm-beige/10 rounded-xl shadow-sm space-y-4 flex flex-col justify-between relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-olive-green text-primary-white text-[9px] font-mono tracking-wider uppercase px-3 py-1 rounded-full font-bold shadow-sm">
              Leads to YCB Level 2
            </div>
            <div className="space-y-3 pt-2">
              <span className="font-mono text-[9px] bg-olive-green/10 text-olive-green px-2 py-0.5 rounded font-bold uppercase tracking-wider border border-olive-green/20">
                5-Month Program
              </span>
              <h3 className="font-cinzel text-lg font-bold text-espresso">Yoga Teacher Education Program</h3>
              <p className="font-sans text-xs text-espresso/70 leading-relaxed">
                A complete 5-month journey from beginner to certified yoga teacher, preparing you for four certifications:
                Yoga Pravesh, Yoga Parichay, YCB Level 1 (Yoga Protocol Instructor) and YCB Level 2 (Yoga Wellness
                Instructor, 400-hour TTC).
              </p>
              <ul className="space-y-2 font-sans text-xs text-espresso/85 pt-2 border-t border-biscuit/10">
                <li className="flex items-start gap-2">
                  <CheckCircle size={14} className="text-olive-green shrink-0 mt-0.5" />
                  <span><strong>Mode:</strong> 100% online live classes, all sessions recorded</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={14} className="text-olive-green shrink-0 mt-0.5" />
                  <span><strong>Schedule:</strong> Practical 6–7 AM (Mon–Fri), Theory 9–10 PM (Tue/Wed/Thu)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={14} className="text-olive-green shrink-0 mt-0.5" />
                  <span><strong>Fee:</strong> ₹60,000, all-inclusive — payable in 2 instalments</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={14} className="text-olive-green shrink-0 mt-0.5" />
                  <span>Study support and exams in Hindi, Marathi and English</span>
                </li>
              </ul>
            </div>
            <a
              href="/brochures/yoga-teacher-education-program.pdf"
              download
              className="px-5 py-3 bg-espresso hover:bg-olive-green text-primary-white font-sans text-xs tracking-widest uppercase font-semibold inline-flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm focus:outline-none rounded"
            >
              <Download size={14} />
              <span>Download Brochure (PDF)</span>
            </a>
          </div>

        </div>
      </section>

      {/* Brochure download CTA */}
      <section className="max-w-4xl mx-auto py-12 px-6 rounded-2xl bg-[#F3EBDD]/50 border border-biscuit/40 text-center space-y-6">
        <LotusFlower size={42} className="text-lotus-pink mx-auto animate-pulse" />
        <h3 className="font-cinzel text-xl font-bold text-espresso">Curriculum Syllabus & Syllabus Booklet</h3>
        <p className="font-sans text-xs text-espresso/80 max-w-lg mx-auto">
          We have compiled a detailed PDF booklet containing unit-wise theoretical syllabi, practical checklists (asanas and shatkarmas), eligibility codes, and fee setups.
        </p>
        <button
          onClick={handleDownloadProspectus}
          className="px-6 py-3.5 bg-espresso hover:bg-olive-green text-primary-white font-sans text-xs tracking-widest uppercase font-semibold inline-flex items-center gap-2 transition-all cursor-pointer shadow-sm focus:outline-none"
        >
          <Download size={14} />
          <span>Download YCB Courses Brochure PDF</span>
        </button>
      </section>

      {/* Registration/Enrollment and FAQ Side-by-side */}
      <section className="max-w-5xl mx-auto py-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start border-t border-biscuit/25 mt-12">
        
        {/* Left: FAQs */}
        <div className="lg:col-span-6 space-y-6">
          <div className="flex gap-2.5 items-center text-olive-green">
            <BookOpen size={20} />
            <h3 className="font-cinzel text-lg font-bold text-espresso uppercase tracking-wider">YCB Syllabus FAQs</h3>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="p-6 artistic-card rounded-xl">
                <h4 className="font-cinzel text-xs font-bold text-espresso mb-1">Q: {faq.q}</h4>
                <p className="font-sans text-xs text-espresso/70 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};
