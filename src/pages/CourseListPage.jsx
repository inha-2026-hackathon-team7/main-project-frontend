import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Gift, Eye, Sparkles, User, Award } from "lucide-react";
import { COLORS } from "../constants/colors.js";
import { coursesApi } from "../services/api.js";
import LoadingSkeletonList from "../components/common/LoadingSkeletonList.jsx";
import ErrorState from "../components/common/ErrorState.jsx";
import EmptyState from "../components/common/EmptyState.jsx";
import DevStateSwitcher from "../components/common/DevStateSwitcher.jsx";

/* ============================================================================
   화면 2. 코스 목록 (GET /courses)
   - 공식 / AI / 사용자 코스 필터 (API 명세 type: official/user/ai)
   - 썸네일, place 미리보기, 리워드 여부 및 조회수 표시
   ========================================================================== */

const TYPE_TABS = [
  { id: "all", label: "전체" },
  { id: "official", label: "공식 코스", icon: Award },
  { id: "ai", label: "AI 추천", icon: Sparkles },
  { id: "user", label: "사용자 코스", icon: User },
];

export default function CourseListPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("success");
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [courses, setCourses] = useState([]);
  const [query, setQuery] = useState("");
  const [activeType, setActiveType] = useState("all");

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      if (mode === "error") throw new Error("MOCK_ERROR");
      if (mode === "empty") {
        setCourses([]);
        setStatus("success");
        return;
      }
      const data = await coursesApi.list({ type: activeType, query });
      setCourses(data);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }, [mode, activeType, query]);

  useEffect(() => {
    load();
  }, [load]);

  const getTypeBadge = (type) => {
    switch (type) {
      case "official":
        return { label: "공식", bg: COLORS.seal, color: "#fff" };
      case "ai":
        return { label: "AI 추천", bg: "#8B5CF6", color: "#fff" };
      case "user":
        return { label: "유저 참여", bg: COLORS.leaf, color: "#fff" };
      default:
        return null;
    }
  };

  return (
    <>
      <div className="st-topbar">
        <div className="st-topbar-title">코스 둘러보기</div>
      </div>

      <DevStateSwitcher mode={mode} setMode={setMode} />

      <div className="st-scroll">
        {/* 검색 인풋 */}
        <div style={{ position: "relative", margin: "16px 0 12px" }}>
          <Search
            size={16}
            color={COLORS.inkSoft}
            style={{ position: "absolute", left: 13, top: 14 }}
          />
          <input
            className="st-input"
            style={{ paddingLeft: 36 }}
            placeholder="지역 또는 코스 이름 검색"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {/* 코스 유형 필터 탭 (official / user / ai) */}
        <div
          style={{
            display: "flex",
            gap: 8,
            overflowX: "auto",
            paddingBottom: 4,
            marginBottom: 16,
          }}
        >
          {TYPE_TABS.map(({ id, label, icon: Icon }) => {
            const isActive = activeType === id;
            return (
              <button
                key={id}
                onClick={() => setActiveType(id)}
                style={{
                  padding: "7px 14px",
                  borderRadius: 999,
                  border: "none",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  whiteSpace: "nowrap",
                  background: isActive ? COLORS.ink : COLORS.surfaceAlt,
                  color: isActive ? "#fff" : COLORS.inkSoft,
                  transition: "all 0.15s ease",
                }}
              >
                {Icon && <Icon size={13} />}
                <span>{label}</span>
              </button>
            );
          })}
        </div>

        {/* 상태별 렌더링 */}
        {status === "loading" && <LoadingSkeletonList />}

        {status === "error" && <ErrorState onRetry={load} />}

        {status === "success" && courses.length === 0 && (
          <EmptyState
            title="조건에 맞는 코스가 없습니다"
            desc="다른 검색어나 필터를 선택해 보세요."
          />
        )}

        {status === "success" && courses.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14, paddingBottom: 24 }}>
            {courses.map((c) => {
              const badge = getTypeBadge(c.type);

              return (
                <div
                  key={c.id}
                  className="st-card"
                  style={{
                    padding: 0,
                    overflow: "hidden",
                    cursor: "pointer",
                    transition: "transform 0.15s ease",
                  }}
                  onClick={() => navigate(`/courses/${c.id}`)}
                >
                  {/* 카드 썸네일 */}
                  <div
                    style={{
                      height: 140,
                      position: "relative",
                      backgroundImage: `url(${c.thumbnail_url})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  >
                    {badge && (
                      <div
                        style={{
                          position: "absolute",
                          top: 10,
                          left: 10,
                          background: badge.bg,
                          color: badge.color,
                          padding: "4px 8px",
                          borderRadius: 6,
                          fontSize: 11,
                          fontWeight: 800,
                          boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                        }}
                      >
                        {badge.label}
                      </div>
                    )}

                    <div
                      style={{
                        position: "absolute",
                        top: 10,
                        right: 10,
                        background: "rgba(0,0,0,0.55)",
                        backdropFilter: "blur(4px)",
                        color: "#fff",
                        padding: "3px 8px",
                        borderRadius: 6,
                        fontSize: 11,
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <Eye size={12} />
                      <span>{c.view_count}</span>
                    </div>

                    <div
                      style={{
                        position: "absolute",
                        bottom: 10,
                        left: 10,
                        background: "rgba(0,0,0,0.65)",
                        backdropFilter: "blur(4px)",
                        color: "#fff",
                        padding: "3px 8px",
                        borderRadius: 6,
                        fontSize: 11,
                        fontWeight: 600,
                      }}
                    >
                      {c.region} · {c.category}
                    </div>
                  </div>

                  {/* 카드 본문 */}
                  <div style={{ padding: "14px 16px" }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: COLORS.ink, marginBottom: 4 }}>
                      {c.name}
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        fontSize: 12,
                        color: COLORS.inkSoft,
                        marginBottom: 10,
                      }}
                    >
                      <span>장소 {c.total_places}곳</span>
                      <span>·</span>
                      <span>{c.distance}</span>
                      <span>·</span>
                      <span>약 {c.durationMin}분</span>
                    </div>

                    {/* 리워드 배지 (요구사항: 리워드 여부) */}
                    {c.reward_summary && (
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          background: "rgba(255, 139, 62, 0.12)",
                          padding: "5px 10px",
                          borderRadius: 8,
                          color: COLORS.gold,
                          fontSize: 12,
                          fontWeight: 700,
                        }}
                      >
                        <Gift size={13} />
                        <span>리워드: {c.reward_summary}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
