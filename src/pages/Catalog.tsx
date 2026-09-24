import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import { SectionLabel, Empty, Pagination } from '../components/Common';
import { usePortal } from '../lib/PortalContext';
import { courseStatus, fmtDate, fmtMoney, parseDate } from '../lib/utils';

const PAGE_SIZE = 6;

export default function Catalog() {
  const navigate = useNavigate();
  const { data } = usePortal();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);

  const all = data.courses.filter((c) => courseStatus(c) === 'upcoming');
  const categories = useMemo(() => [...new Set(all.map((c) => c.category).filter(Boolean))].sort(), [all]);

  const filtered = all
    .filter((c) => {
      const q = search.trim().toLowerCase();
      const matchesSearch = !q || (c.name + ' ' + (c.description || '')).toLowerCase().includes(q);
      const matchesCategory = !category || c.category === category;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => parseDate(a.startDate).getTime() - parseDate(b.startDate).getTime());

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <>
      <TopBar />
      <div className="wrap" style={{ paddingTop: 36 }}>
        <SectionLabel>COURSE CATALOG</SectionLabel>
        <div className="row2">
          <div className="field">
            <input
              placeholder="Search courses"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="field">
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
        {pageItems.length === 0 ? (
          <Empty>No courses match your search.</Empty>
        ) : (
          pageItems.map((c) => (
            <div className="course-row" key={c.id}>
              <div>
                <div className="course-name">{c.name}</div>
                {c.category && <div className="course-dates">{c.category}</div>}
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
        <Pagination page={currentPage} totalPages={totalPages} onChange={setPage} />
        <div style={{ textAlign: 'center', marginTop: 26 }}>
          <button className="btn secondary" onClick={() => navigate('/')}>
            &larr; Back to home
          </button>
        </div>
      </div>
    </>
  );
}
