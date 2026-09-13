import { useLocation, useNavigate } from "react-router-dom";
import { Compass, Gift, MapPinned, User } from "lucide-react";

const ITEMS = [
  { k: "courses", label: "코스", icon: Compass, path: "/courses" },
  { k: "createCourse", label: "코스 만들기", icon: MapPinned, path: "/create-course" },
  { k: "rewards", label: "리워드함", icon: Gift, path: "/rewards" },
  { k: "mypage", label: "마이페이지", icon: User, path: "/mypage" },
];

/* ============================================================================
   하단 탭 네비게이션
   ========================================================================== */
export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="st-bottomnav">
      {ITEMS.map(({ k, label, icon: Icon, path }) => (
        <button
          key={k}
          className="st-navitem"
          data-active={location.pathname.startsWith(path)}
          onClick={() => navigate(path)}
        >
          <Icon size={20} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}
