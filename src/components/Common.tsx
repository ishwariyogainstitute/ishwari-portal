import type { ReactNode } from 'react';
import type { CourseStatus, EnrollmentStatus, FlashMessage } from '../types';
import { usePortal } from '../lib/PortalContext';

export function StatusBadge({ status }: { status: CourseStatus }) {
  const label = status === 'upcoming' ? 'Upcoming' : status === 'ongoing' ? 'Ongoing' : 'Completed';
  return <span className={`badge ${status}`}>{label}</span>;
}

export function AdmissionBadge({ status }: { status: EnrollmentStatus }) {
  if (status === 'Active') return <span className="badge activestatus">Active</span>;
  if (status === 'Pending') return <span className="badge pendingstatus">Pending</span>;
  return <span className="badge inreview">In Review</span>;
}

export function FlashBlock({ message }: { message: FlashMessage }) {
  if (!message) return null;
  return <div className={`msg ${message.type}`}>{message.text}</div>;
}

/** Convenience wrapper that reads the flash message straight from context. */
export function PortalFlash() {
  const { message } = usePortal();
  return <FlashBlock message={message} />;
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="section-label">
      <span>{children}</span>
      <span className="rule" />
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="empty">{children}</div>;
}

export function Pagination({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (p: number) => void }) {
  if (totalPages <= 1) return null;
  return (
    <div className="pagination">
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <button key={p} className={`btn small ${p === page ? '' : 'secondary'}`} onClick={() => onChange(p)}>
          {p}
        </button>
      ))}
    </div>
  );
}

export function Modal({ onClose, children, maxWidth = 520 }: { onClose: () => void; children: ReactNode; maxWidth?: number }) {
  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-box" style={{ maxWidth }}>
        {children}
      </div>
    </div>
  );
}
