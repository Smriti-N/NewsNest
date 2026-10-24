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
    if (ids.includes(id)) {
      ids.splice(ids.indexOf(id), 1);
    } else {
      ids.push(id);
    }
    localStorage.setItem(KEY, JSON.stringify(ids));
    setIds(ids);
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
