import { JSX } from "react";

export function highlightMatch(value: string, search: string): JSX.Element {
  if (!search) return <>{value}</>;

  const regex = new RegExp(`(${search})`, 'gi');
  const parts = value.split(regex);

  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === search.toLowerCase() ? (
          <mark key={i} className="opacity-50 bg-yellow-300 rounded px-1">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}