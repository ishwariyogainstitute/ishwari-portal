import { useMemo, useState } from 'react';
import { SectionLabel, Empty, StatusBadge, Pagination, Modal } from '../../components/Common';
import { usePortal } from '../../lib/PortalContext';
import { courseStatus, fmtDate, fmtMoney, parseDate } from '../../lib/utils';
import { addCourse, saveCourseEdit } from '../../lib/actions';
import type { Course } from '../../types';

const PAGE_SIZE = 8;

function emptyForm() {
  return { name: '', description: '', startDate: '', endDate: '', category: '', fee: 0 };
}

export default function AdminCourses() {
  const portal = usePortal();
  const { data } = portal;
  const [form, setForm] = useState(emptyForm());
  const [formError, setFormError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Course | null>(null);
  const [editForm, setEditForm] = useState(emptyForm());
  const [editError, setEditError] = useState<string | null>(null);

  const categoryOptions = useMemo(() => [...new Set(data.courses.map((c) => c.category).filter(Boolean))], [data.courses]);
  const q = search.trim().toLowerCase();
  const filtered = data.courses.filter((c) => !q || (c.name + ' ' + (c.category || '')).toLowerCase().includes(q));
  const sorted = [...filtered].sort((a, b) => parseDate(a.startDate).getTime() - parseDate(b.startDate).getTime());
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = sorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  async function submitAdd() {
    setFormError(null);
    const err = await addCourse(portal, form);
    if (err) setFormError(err);
    else setForm(emptyForm());
  }

  function openEdit(c: Course) {
    setEditing(c);
    setEditForm({ name: c.name, description: c.description, startDate: c.startDate, endDate: c.endDate, category: c.category, fee: c.fee });
    setEditError(null);
  }

  async function submitEdit() {
    if (!editing) return;
    const err = await saveCourseEdit(portal, editing.id, editForm);
    if (err) setEditError(err);
    else setEditing(null);
  }

  return (
    <>
      <div className="panel accent">
        <h2>Publish a new course</h2>
        <div className="sub">This appears immediately on the public catalog once its start date is in the future.</div>
        {formError && <div className="msg err">{formError}</div>}
        <div className="field">
          <label>Course name</label>
          <input placeholder="e.g. YCB Yoga Wellness Instructor (YWI)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="field">
          <label>Description</label>
          <textarea rows={2} placeholder="One or two lines about the course" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="row2">
          <div className="field">
            <label>Start date</label>
            <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
          </div>
          <div className="field">
            <label>End date</label>
            <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
          </div>
        </div>
        <div className="row2">
          <div className="field">
            <label>Category</label>
            <input list="catList" placeholder="e.g. YCB Certification" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            <datalist id="catList">
              {categoryOptions.map((c) => (
                <option value={c} key={c} />
              ))}
            </datalist>
          </div>
          <div className="field">
            <label>Fee (₹, leave blank or 0 for free)</label>
            <input type="number" min={0} placeholder="0" value={form.fee || ''} onChange={(e) => setForm({ ...form, fee: Number(e.target.value) || 0 })} />
          </div>
        </div>
        <button className="btn gold" onClick={submitAdd}>Publish course</button>
      </div>

      <SectionLabel>ALL COURSES ({data.courses.length})</SectionLabel>
      <div className="field" style={{ maxWidth: 320 }}>
        <input
          placeholder="Search by name or category"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>
      {pageItems.length === 0 ? (
        <Empty>No courses match this search.</Empty>
      ) : (
        <>
          <table>
            <tbody>
              <tr>
                <th>Course</th><th>Category</th><th>Fee</th><th>Start</th><th>End</th><th>Status</th><th>Enrolled</th><th></th>
              </tr>
              {pageItems.map((c) => {
                const count = data.enrollments.filter((e) => e.courseId === c.id).length;
                return (
                  <tr key={c.id}>
                    <td><div className="serif" style={{ fontSize: 15 }}>{c.name}</div></td>
                    <td>{c.category || '—'}</td>
                    <td>{fmtMoney(c.fee)}</td>
                    <td>{fmtDate(c.startDate)}</td>
                    <td>{fmtDate(c.endDate)}</td>
                    <td><StatusBadge status={courseStatus(c)} /></td>
                    <td>{count}</td>
                    <td><button className="btn small secondary" onClick={() => openEdit(c)}>Edit</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <Pagination page={currentPage} totalPages={totalPages} onChange={setPage} />
        </>
      )}

      {editing && (
        <Modal onClose={() => setEditing(null)}>
          <h2 style={{ fontSize: 19 }}>Edit course</h2>
          <div className="sub">{editing.id} — changes apply immediately, including to the public catalog.</div>
          {editError && <div className="msg err">{editError}</div>}
          <div className="field">
            <label>Course name</label>
            <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
          </div>
          <div className="field">
            <label>Description</label>
            <textarea rows={2} value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
          </div>
          <div className="row2">
            <div className="field">
              <label>Start date</label>
              <input type="date" value={editForm.startDate} onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })} />
            </div>
            <div className="field">
              <label>End date</label>
              <input type="date" value={editForm.endDate} onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })} />
            </div>
          </div>
          <div className="row2">
            <div className="field">
              <label>Category</label>
              <input value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} />
            </div>
            <div className="field">
              <label>Fee (₹)</label>
              <input type="number" min={0} value={editForm.fee} onChange={(e) => setEditForm({ ...editForm, fee: Number(e.target.value) || 0 })} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn green" onClick={submitEdit}>Save changes</button>
            <button className="btn secondary" onClick={() => setEditing(null)}>Cancel</button>
          </div>
        </Modal>
      )}
    </>
  );
}
