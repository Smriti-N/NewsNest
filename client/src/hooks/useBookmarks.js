import { useState } from 'react';

const KEY = 'newsnest:bookmarks';

function read() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
}

export default function useBookmarks() {
  const [ids, setIds] = useState(read);

  function toggle(id) {
    const next = ids.includes(id)
      ? ids.filter((item) => item !== id)
      : [...ids, id];
    localStorage.setItem(KEY, JSON.stringify(next));
    setIds(next);
  }

  function clear() {
    localStorage.setItem(KEY, '[]');
    setIds([]);
  }

  return {
    ids,
    toggle,
    clear,
    isBookmarked: (id) => ids.includes(id),
  };
}
