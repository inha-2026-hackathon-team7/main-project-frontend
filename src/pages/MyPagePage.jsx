import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LogOut,
  User,
  ArrowRight,
} from "lucide-react";
import { COLORS } from "../constants/colors.js";
import { usersApi } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import LoadingSkeletonList from "../components/common/LoadingSkeletonList.jsx";
import ErrorState from "../components/common/ErrorState.jsx";
import EmptyState from "../components/common/EmptyState.jsx";

/* ============================================================================
   화면 10. 마이페이지 (GET /users/me, GET /users/me/enrollments)
   - 프로필 및 스탬프/완주 코스 통계
   - 내 진행 중/완주 코스 목록 (클릭 시 해당 코스 진행/완주 화면으로 이어하기)
   참고: 완주 여부는 백엔드 status 문자열의 정확한 표기가 스펙에 없어,
   completedAt 존재 여부로 판단한다.
   ========================================================================== */

export default function MyPagePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [status, setStatus] = useState("loading"); // loading | success | error
  const [profile, setProfile] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [filter, setFilter] = useState("all"); // all | active | complete

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      const [p, e] = await Promise.all([
        usersApi.me(),
        usersApi.myEnrollments(),
      ]);
      setProfile(p);
      setEnrollments(e);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const filteredEnrollments = enrollments.filter((enr) => {
    if (filter === "active") return !enr.completedAt;
    if (filter === "complete") return Boolean(enr.completedAt);
    return true;
  });

  return (
    <>
      <div className="st-topbar">
        <div className="st-topbar-title">마이페이지</div>
        <button
          className="st-iconbtn"
          onClick={handleLogout}
          title="로그아웃"
          aria-label="로그아웃"
        >
          <LogOut size={18} color={COLORS.inkSoft} />
        </button>
      </div>

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
            {/* 1. 프로필 요약 카드 */}
            <div className="st-card" style={{ margin: "16px 0", padding: "18px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #3182F6, #2272EB)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    boxShadow: "0 4px 12px rgba(49, 130, 246, 0.3)",
                  }}
                >
                  <User size={24} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 17, fontWeight: 800, color: COLORS.ink, marginBottom: 2 }}>
                    {profile.name || user?.name}
                  </div>
                  <div style={{ fontSize: 13, color: COLORS.inkSoft }}>
                    {profile.email || user?.email}
                  </div>
                </div>
              </div>

              {/* 스탬프 / 완주 코스 통계 */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                  marginTop: 18,
                  paddingTop: 16,
                  borderTop: `1px solid ${COLORS.line}`,
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 12, color: COLORS.inkSoft, marginBottom: 4 }}>모은 스탬프</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: COLORS.seal }}>
                    {profile.totalStamps || 0}개
                  </div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 12, color: COLORS.inkSoft, marginBottom: 4 }}>완주한 코스</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: COLORS.leaf }}>
                    {profile.completedCourses || 0}곳
                  </div>
                </div>
              </div>
            </div>

            {/* 2. 내 코스 참여 현황 섹션 */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span style={{ fontSize: 16, fontWeight: 800, color: COLORS.ink }}>
                  내 코스 참여 목록
                </span>

                {/* 필터 버튼 (전체 / 진행 중 / 완주) */}
                <div style={{ display: "flex", gap: 4, background: COLORS.surfaceAlt, padding: 3, borderRadius: 8 }}>
                  {[
                    { k: "all", label: "전체" },
                    { k: "active", label: "진행중" },
                    { k: "complete", label: "완주" },
                  ].map((tab) => (
                    <button
                      key={tab.k}
                      onClick={() => setFilter(tab.k)}
                      style={{
                        padding: "4px 8px",
                        borderRadius: 6,
                        border: "none",
                        cursor: "pointer",
                        fontSize: 11,
                        fontWeight: 700,
                        background: filter === tab.k ? COLORS.surface : "transparent",
                        color: filter === tab.k ? COLORS.ink : COLORS.inkSoft,
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {filteredEnrollments.length === 0 ? (
                <EmptyState
                  title="참여 중인 코스가 없습니다"
                  desc="코스 둘러보기에서 마음에 드는 코스를 시작해 보세요!"
                />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingBottom: 20 }}>
                  {filteredEnrollments.map((enr) => {
                    const isActive = !enr.completedAt;
                    const percent = Math.round(
                      ((enr.progress?.done || 0) / Math.max(enr.progress?.total || 1, 1)) * 100
                    );

                    return (
                      <div
                        key={enr.enrollmentId}
                        className="st-card"
                        style={{
                          padding: "16px",
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                          border: isActive ? `1.5px solid ${COLORS.seal}` : "none",
                        }}
                        onClick={() => {
                          const base = `/courses/${enr.courseId}/enrollments/${enr.enrollmentId}`;
                          navigate(isActive ? base : `${base}/complete`);
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 800,
                              color: isActive ? COLORS.seal : COLORS.leaf,
                              background: isActive ? "rgba(49, 130, 246, 0.1)" : "rgba(0, 196, 140, 0.1)",
                              padding: "3px 8px",
                              borderRadius: 6,
                            }}
                          >
                            {isActive ? "도전 진행 중" : "완주 성공"}
                          </span>

                          <span style={{ fontSize: 12, fontWeight: 700, color: COLORS.inkSoft }}>
                            {enr.progress?.done} / {enr.progress?.total}개 스탬프
                          </span>
                        </div>

                        <div style={{ fontSize: 16, fontWeight: 800, color: COLORS.ink, marginBottom: 10 }}>
                          {enr.courseName}
                        </div>

                        {/* 프로그레스 바 */}
                        <div className="st-progress-track" style={{ marginBottom: 12 }}>
                          <div className="st-progress-fill" style={{ width: `${percent}%` }} />
                        </div>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: 12, color: COLORS.inkSoft }}>
                            {isActive ? "지도로 이동하여 스탬프 찍기" : "완주 리워드 확인하기"}
                          </span>
                          <span
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
                              fontSize: 12,
                              fontWeight: 700,
                              color: isActive ? COLORS.seal : COLORS.leaf,
                            }}
                          >
                            <span>{isActive ? "이어하기" : "결과보기"}</span>
                            <ArrowRight size={14} />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
