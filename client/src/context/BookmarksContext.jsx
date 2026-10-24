import { createContext, useContext } from 'react';
import useBookmarks from '../hooks/useBookmarks.js';

const BookmarksContext = createContext(null);

export function BookmarksProvider({ children }) {
  const bookmarks = useBookmarks();
  return (
    <BookmarksContext.Provider value={bookmarks}>
      {children}
    </BookmarksContext.Provider>
  );
}

export function useBookmarkContext() {
  return useContext(BookmarksContext);
}
