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
    setIds((prevIds) => {
      const exists = prevIds.includes(id);
      const nextIds = exists
        ? prevIds.filter((item) => item !== id)
        : [...prevIds, id];

      localStorage.setItem(KEY, JSON.stringify(nextIds));
      return nextIds;
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