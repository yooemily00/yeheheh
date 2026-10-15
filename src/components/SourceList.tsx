import type { Source } from '../lib/sources';

export function SourceList({ sources }: { sources: Source[] }) {
  return (
    <ul className="sources">
      {sources.map((s) => (
        <li key={s.id}>
          <a href={s.url} target="_blank" rel="noreferrer">{s.label}</a>
          {!s.verified && <span className="tag-verify" title={s.note}>TODO(verify)</span>}
          {s.note && <div className="muted small">{s.note}</div>}
        </li>
      ))}
    </ul>
  );
}
