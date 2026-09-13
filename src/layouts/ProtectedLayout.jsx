import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import BottomNav from "../components/BottomNav.jsx";

// 코스 상세 및 코스 진행/스캔/완주 화면에서는 하단 탭바를 숨겨 몰입감 제공
const HIDE_BOTTOM_NAV_ROUTE = /^(\/courses\/[^/]+|\/enrollments\/[^/]+|\/create-course)/;

export default function ProtectedLayout() {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const hideBottomNav = HIDE_BOTTOM_NAV_ROUTE.test(location.pathname);

  return (
    <>
      <Outlet />
      {!hideBottomNav && <BottomNav />}
    </>
  );
}
