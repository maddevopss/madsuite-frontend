import { createContext, useCallback, useContext, useRef, useState } from "react";

const RefreshContext = createContext();

export function RefreshProvider({ children }) {
  const [refreshKey, setRefreshKey] = useState(0);
  const timeoutRef = useRef(null);

  // Déclenche un refresh global, avec debounce pour éviter les reloads en rafale
  const refreshAppData = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setRefreshKey((prev) => prev + 1);
      timeoutRef.current = null;
    }, 150);
  }, []);

  return (
    <RefreshContext.Provider
      value={{
        refreshKey,
        refreshAppData,
      }}>
      {children}
    </RefreshContext.Provider>
  );
}

export function useRefresh() {
  return useContext(RefreshContext);
}
