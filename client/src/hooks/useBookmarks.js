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
    setIds((prev) => {
      const next = prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id];
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
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
