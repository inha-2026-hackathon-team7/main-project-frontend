import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import BottomNav from "../components/BottomNav.jsx";

const DETAIL_ROUTE = /^\/courses\/[^/]+$/;

export default function ProtectedLayout() {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const isDetailScreen = DETAIL_ROUTE.test(location.pathname);

  return (
    <>
      <Outlet />
      {!isDetailScreen && <BottomNav />}
    </>
  );
}
