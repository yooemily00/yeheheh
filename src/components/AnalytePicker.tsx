import { useId, useMemo, useState } from 'react';
import { type Analyte, searchAnalytes } from '../data/analytes';

interface Props {
  value: Analyte;
  onChange: (a: Analyte) => void;
  filter?: (a: Analyte) => boolean;
}

export function AnalytePicker({ value, onChange, filter }: Props) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const listId = useId();
  const results = useMemo(() => {
    const r = searchAnalytes(query);
    return filter ? r.filter(filter) : r;
  }, [query, filter]);

  return (
    <div className="picker">
      <label className="field-label" htmlFor={`${listId}-input`}>
        분석물 검색 <span className="hint">영문 · 한글 · 약어 (예: BUN, 당화혈색소, Cr)</span>
      </label>
      <input
        id={`${listId}-input`}
        className="input"
        type="search"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        placeholder={`${value.ko} · ${value.en}`}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && results[0]) {
            onChange(results[0]);
            setQuery('');
            setOpen(false);
          }
        }}
      />
      {open && (
        <ul className="picker-list" id={listId} role="listbox">
          {results.length === 0 && <li className="picker-empty">일치하는 분석물이 없습니다</li>}
          {results.map((a) => (
            <li key={a.id} role="option" aria-selected={a.id === value.id}>
              <button
                type="button"
                className="picker-item"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onChange(a);
                  setQuery('');
                  setOpen(false);
                }}
              >
                <span className="picker-name">{a.ko}</span>
                <span className="picker-en">{a.en}</span>
                <span className="picker-syn">{a.synonyms.slice(0, 4).join(' · ')}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="selected">
        선택됨: <strong>{value.ko}</strong> <span className="muted">{value.en}</span>
        <span className="chip">{value.category}</span>
      </div>
    </div>
  );
}
