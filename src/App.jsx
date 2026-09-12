import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import RootLayout from "./layouts/RootLayout.jsx";
import ProtectedLayout from "./layouts/ProtectedLayout.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import CourseListPage from "./pages/CourseListPage.jsx";
import CourseDetailPage from "./pages/CourseDetailPage.jsx";
import RewardsPage from "./pages/RewardsPage.jsx";
import MyPagePage from "./pages/MyPagePage.jsx";

/* ============================================================================
   루트 컴포넌트
   ========================================================================== */
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<RootLayout />}>
            <Route index element={<Navigate to="/courses" replace />} />
            <Route path="login" element={<AuthPage />} />

            <Route element={<ProtectedLayout />}>
              <Route path="courses" element={<CourseListPage />} />
              <Route path="courses/:courseId" element={<CourseDetailPage />} />
              <Route path="rewards" element={<RewardsPage />} />
              <Route path="mypage" element={<MyPagePage />} />
            </Route>

            <Route path="*" element={<Navigate to="/courses" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
