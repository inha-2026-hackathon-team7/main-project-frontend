import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { setUnauthorizedHandler } from "../services/httpClient.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useSnackbar } from "../context/SnackbarContext.jsx";

/* ============================================================================
   전역 401 처리 — httpClient.js가 만료/무효 토큰을 감지하면 이 컴포넌트가
   등록해둔 핸들러가 로그아웃 + 스낵바 안내 + /login 이동을 수행한다.
   화면을 그리지 않고 RootLayout에 한 번만 마운트된다.
   ========================================================================== */
export default function AuthExpiryWatcher() {
  const { logout } = useAuth();
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();

  useEffect(() => {
    setUnauthorizedHandler((reason) => {
      logout();
      showSnackbar(
        reason === "expired"
          ? "로그인이 만료되었습니다. 다시 로그인해 주세요."
          : "인증에 문제가 발생했습니다. 다시 로그인해 주세요."
      );
      navigate("/login", { replace: true });
    });
    return () => setUnauthorizedHandler(null);
  }, [logout, showSnackbar, navigate]);

  return null;
}
