import { createContext, useCallback, useContext, useRef, useState } from "react";

const SnackbarContext = createContext(null);

/* ============================================================================
   전역 스낵바(짧은 안내 배너) — 세션 만료 등 어느 화면에서든 뜰 수 있는
   알림을 위해 라우트와 무관하게 최상단(RootLayout)에서 렌더링한다.
   ========================================================================== */
export function SnackbarProvider({ children }) {
  const [snackbar, setSnackbar] = useState(null); // { message, tone }
  const timerRef = useRef(null);

  const showSnackbar = useCallback((message, tone = "default") => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setSnackbar({ message, tone });
    timerRef.current = setTimeout(() => setSnackbar(null), 3500);
  }, []);

  const hideSnackbar = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setSnackbar(null);
  }, []);

  return (
    <SnackbarContext.Provider value={{ snackbar, showSnackbar, hideSnackbar }}>
      {children}
    </SnackbarContext.Provider>
  );
}

export function useSnackbar() {
  const ctx = useContext(SnackbarContext);
  if (!ctx) throw new Error("useSnackbar must be used within a SnackbarProvider");
  return ctx;
}
