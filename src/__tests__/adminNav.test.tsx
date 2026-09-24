import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HashRouter } from 'react-router-dom';

// Mock the Firebase-backed context so we can test pure routing behavior
// without touching the network.
vi.mock('../lib/PortalContext', () => {
  return {
    usePortal: () => ({
      data: {
        courses: [], students: [], enrollments: [], results: [], certificates: [],
        settings: { serviceId: '', templateId: '', publicKey: '' },
      },
      loading: false,
      role: 'admin',
      currentStudent: null,
      message: null,
      flash: vi.fn(),
      clearMessage: vi.fn(),
      setCollection: vi.fn(),
      loginAdmin: vi.fn(),
      loginStudent: vi.fn(),
      registerStudent: vi.fn(),
      resetPassword: vi.fn(),
      logout: vi.fn(),
    }),
    PortalProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

import AdminShell from '../pages/admin/AdminShell';

describe('Admin nav routing', () => {
  it('clicking between nav items replaces the path instead of appending to it', async () => {
    window.location.hash = '#/admin/courses';
    const user = userEvent.setup();
    render(
      <HashRouter>
        <AdminShell />
      </HashRouter>
    );

    expect(window.location.hash).toBe('#/admin/courses');

    await user.click(screen.getByText('Results & certificates'));
    expect(window.location.hash).toBe('#/admin/results');

    await user.click(screen.getByText('Enrollments & status'));
    expect(window.location.hash).toBe('#/admin/enrollments');

    await user.click(screen.getByText('Registrations'));
    expect(window.location.hash).toBe('#/admin/students');

    await user.click(screen.getByText('Reports'));
    expect(window.location.hash).toBe('#/admin/reports');

    // The bug we're guarding against: hash should NEVER accumulate segments.
    expect(window.location.hash.split('/').length).toBeLessThanOrEqual(3);
  });
});
