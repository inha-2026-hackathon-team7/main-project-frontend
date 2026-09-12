import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Check, LogOut, Sprout, User } from "lucide-react";
import { COLORS } from "../constants/colors.js";
import { mockFetch } from "../mock/api.js";
import { MOCK_ENROLLMENTS, MOCK_USER } from "../mock/data.js";
import { useAuth } from "../context/AuthContext.jsx";
import LoadingSkeletonList from "../components/common/LoadingSkeletonList.jsx";
import ErrorState from "../components/common/ErrorState.jsx";
import EmptyState from "../components/common/EmptyState.jsx";
import DevStateSwitcher from "../components/common/DevStateSwitcher.jsx";

/* ============================================================================
   화면 5. 마이페이지 (GET /users/me, GET /users/me/enrollments)
   ========================================================================== */
export default function MyPagePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState("success");
  const [status, setStatus] = useState("idle");
  const [profile, setProfile] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [filter, setFilter] = useState("전체"); // 전체 | 진행중 | 완주

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      const [p, e] = await Promise.all([
        mockFetch(mode, MOCK_USER, MOCK_USER),
        mockFetch(mode, MOCK_ENROLLMENTS, []),
      ]);
      setProfile(p);
      setEnrollments(e);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }, [mode]);

  useEffect(() => { load(); }, [load]);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const filtered = enrollments.filter((e) => {
    if (filter === "전체") return true;
    if (filter === "진행중") return e.status === "in_progress";
    return e.status === "completed";
  });

  return (
    <>
      <div className="st-topbar"><div className="st-topbar-title">마이페이지</div></div>
      <DevStateSwitcher mode={mode} setMode={setMode} />
      <div className="st-scroll">
        {status === "loading" && (
          <div style={{ paddingTop: 14 }}>
            <div className="st-skel" style={{ height: 90, marginBottom: 20 }} />
            <LoadingSkeletonList rows={3} />
          </div>
        )}

        {status === "error" && <ErrorState onRetry={load} />}

        {status === "success" && profile && (
          <>
            <div className="st-card" style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{
                width: 52, height: 52, borderRadius: 999, background: COLORS.ink, color: COLORS.surface,
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}><User size={24} /></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: 16 }}>{user?.nickname || profile.name}</div>
                <div style={{ fontSize: 12.5, color: COLORS.inkSoft, marginTop: 2 }}>{profile.email}</div>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 4, marginTop: 6, fontSize: 11.5, fontWeight: 700,
                  color: COLORS.leaf, background: "rgba(0,196,140,0.12)", padding: "3px 9px", borderRadius: 999,
                }}><Sprout size={12} />{profile.level}</div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
              <div className="st-card" style={{ flex: 1, textAlign: "center" }}>
                <div style={{ fontSize: 20, fontWeight: 800 }}>{profile.totalStamps}</div>
                <div style={{ fontSize: 11.5, color: COLORS.inkSoft, marginTop: 2 }}>모은 스탬프</div>
              </div>
              <div className="st-card" style={{ flex: 1, textAlign: "center" }}>
                <div style={{ fontSize: 20, fontWeight: 800 }}>{profile.completedCourses}</div>
                <div style={{ fontSize: 11.5, color: COLORS.inkSoft, marginTop: 2 }}>완주 코스</div>
              </div>
              <div className="st-card" style={{ flex: 1, textAlign: "center" }}>
                <div style={{ fontSize: 13, fontWeight: 800, marginTop: 4 }}>{profile.joinedAt}</div>
                <div style={{ fontSize: 11.5, color: COLORS.inkSoft, marginTop: 2 }}>가입일</div>
              </div>
            </div>

            <div style={{ marginTop: 24 }}>
              <div style={{ fontWeight: 800, fontSize: 14.5, marginBottom: 10 }}>내 투어 코스</div>
              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                {["전체", "진행중", "완주"].map((f) => (
                  <button key={f} className="st-chip" data-active={filter === f} onClick={() => setFilter(f)}>{f}</button>
                ))}
              </div>

              {enrollments.length === 0 && (
                <EmptyState title="참여 중인 코스가 없습니다" desc="코스 목록에서 마음에 드는 코스를 시작해 보세요." />
              )}

              {enrollments.length > 0 && filtered.length === 0 && (
                <EmptyState title="해당하는 코스가 없습니다" desc="다른 필터를 선택해 보세요." />
              )}

              {filtered.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {filtered.map((e) => (
                    <div key={e.id} className="st-card" style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      {e.status === "completed"
                        ? <Check size={20} color={COLORS.leaf} style={{ flexShrink: 0 }} />
                        : <Calendar size={20} color={COLORS.gold} style={{ flexShrink: 0 }} />}
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{e.courseTitle}</div>
                        <div style={{ fontSize: 12, color: COLORS.inkSoft, marginTop: 2 }}>{e.region}</div>
                      </div>
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: e.status === "completed" ? COLORS.leaf : COLORS.inkSoft }}>
                        {e.stampedCount}/{e.totalStamps}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button className="st-btn-ghost" style={{ width: "100%", marginTop: 26, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }} onClick={handleLogout}>
              <LogOut size={15} />로그아웃
            </button>
          </>
        )}
      </div>
    </>
  );
}
