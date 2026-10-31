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
    const nextIds = ids.includes(id)
      ? ids.filter((savedId) => savedId !== id)
      : [...ids, id];
    localStorage.setItem(KEY, JSON.stringify(nextIds));
    setIds(nextIds);
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
