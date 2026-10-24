import { useEffect, useState } from 'react';
import { getCategories } from '../api.js';

let cached = null;

export default function useCategories() {
  const [categories, setCategories] = useState(cached || []);

  useEffect(() => {
    if (cached) return;
    getCategories()
      .then((list) => {
        cached = list;
        setCategories(list);
      })
      .catch(() => {});
  }, []);

  return categories;
}
