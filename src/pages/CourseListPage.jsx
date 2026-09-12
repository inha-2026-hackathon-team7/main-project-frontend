import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { COLORS } from "../constants/colors.js";
import { mockFetch } from "../mock/api.js";
import { MOCK_COURSES } from "../mock/data.js";
import LoadingSkeletonList from "../components/common/LoadingSkeletonList.jsx";
import ErrorState from "../components/common/ErrorState.jsx";
import EmptyState from "../components/common/EmptyState.jsx";
import DevStateSwitcher from "../components/common/DevStateSwitcher.jsx";

/* ============================================================================
   화면 2. 코스 목록 (GET /courses)
   ========================================================================== */
export default function CourseListPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("success");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [courses, setCourses] = useState([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("전체");

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      const data = await mockFetch(mode, MOCK_COURSES, []);
      setCourses(data);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }, [mode]);

  useEffect(() => { load(); }, [load]);

  const categories = ["전체", ...Array.from(new Set(MOCK_COURSES.map((c) => c.category)))];
  const filtered = courses.filter((c) => {
    const matchCat = category === "전체" || c.category === category;
    const matchQuery = !query || c.title.includes(query) || c.region.includes(query);
    return matchCat && matchQuery;
  });

  return (
    <>
      <div className="st-topbar">
        <div className="st-topbar-title">코스 둘러보기</div>
      </div>
      <DevStateSwitcher mode={mode} setMode={setMode} />
      <div className="st-scroll">
        <div style={{ position: "relative", margin: "16px 0 12px" }}>
          <Search size={16} color={COLORS.inkSoft} style={{ position: "absolute", left: 13, top: 14 }} />
          <input
            className="st-input" style={{ paddingLeft: 36 }}
            placeholder="지역이나 코스 이름으로 검색"
            value={query} onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, marginBottom: 6 }}>
          {categories.map((c) => (
            <button key={c} className="st-chip" data-active={category === c} onClick={() => setCategory(c)}>
              {c}
            </button>
          ))}
        </div>

        <div style={{ paddingTop: 8 }}>
          {status === "loading" && <LoadingSkeletonList rows={4} />}

          {status === "error" && <ErrorState onRetry={load} />}

          {status === "success" && filtered.length === 0 && (
            <EmptyState
              title={courses.length === 0 ? "등록된 코스가 없습니다" : "검색 결과가 없습니다"}
              desc={courses.length === 0
                ? "새로운 지역 코스가 등록되면 이곳에 표시됩니다."
                : "다른 지역명이나 카테고리로 다시 찾아보세요."}
              actionLabel={courses.length === 0 ? undefined : "필터 초기화"}
              onAction={() => { setQuery(""); setCategory("전체"); }}
            />
          )}

          {status === "success" && filtered.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {filtered.map((c) => (
                <button
                  key={c.id}
                  onClick={() => navigate(`/courses/${c.id}`)}
                  className="st-card"
                  style={{ display: "flex", gap: 12, textAlign: "left", cursor: "pointer", width: "100%" }}
                >
                  <div className="st-stamp">{c.stampCount}개</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ fontWeight: 800, fontSize: 15 }}>{c.title}</div>
                      {c.tag && (
                        <span style={{ fontSize: 10.5, fontWeight: 800, color: COLORS.seal, background: "rgba(49,130,246,0.1)", padding: "2px 7px", borderRadius: 999 }}>
                          {c.tag}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 12.5, color: COLORS.inkSoft, marginTop: 3 }}>{c.region} · {c.category}</div>
                    <div style={{ fontSize: 12.5, color: COLORS.inkSoft, marginTop: 6 }}>{c.summary}</div>
                    <div style={{ fontSize: 11.5, color: COLORS.inkSoft, marginTop: 6, display: "flex", gap: 10 }}>
                      <span>{c.distance}</span><span>약 {c.durationMin}분</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
