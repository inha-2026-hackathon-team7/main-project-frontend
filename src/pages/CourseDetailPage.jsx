import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Heart, MessageCircle, Send } from "lucide-react";
import { COLORS } from "../constants/colors.js";
import { mockFetch } from "../mock/api.js";
import { MOCK_COURSE_DETAIL } from "../mock/data.js";
import LoadingSkeletonList from "../components/common/LoadingSkeletonList.jsx";
import ErrorState from "../components/common/ErrorState.jsx";
import EmptyState from "../components/common/EmptyState.jsx";
import DevStateSwitcher from "../components/common/DevStateSwitcher.jsx";
import { stampIcon } from "../components/common/stampIcon.jsx";

/* ============================================================================
   화면 3. 코스 상세 (GET /courses/{id})
   ========================================================================== */
export default function CourseDetailPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [mode, setMode] = useState("success");
  const [status, setStatus] = useState("idle");
  const [detail, setDetail] = useState(null);
  const [comments, setComments] = useState([]);
  const [draft, setDraft] = useState("");

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      const full = MOCK_COURSE_DETAIL[courseId] || MOCK_COURSE_DETAIL.c1;
      const data = await mockFetch(mode, full, { ...full, stamps: [], comments: [] });
      setDetail(data);
      setComments(data.comments);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }, [mode, courseId]);

  useEffect(() => { load(); }, [load]);

  const postComment = () => {
    if (!draft.trim()) return;
    setComments((cs) => [{ id: `local-${Date.now()}`, user: "나", text: draft.trim(), date: "방금", likes: 0 }, ...cs]);
    setDraft("");
  };

  return (
    <>
      <div className="st-topbar">
        <button className="st-iconbtn" onClick={() => navigate(-1)} aria-label="뒤로 가기"><ChevronLeft size={22} /></button>
        <div className="st-topbar-title">코스 상세</div>
      </div>
      <DevStateSwitcher mode={mode} setMode={setMode} />
      <div className="st-scroll">
        {status === "loading" && (
          <div style={{ paddingTop: 10 }}>
            <div className="st-skel" style={{ height: 22, width: "60%", marginBottom: 10 }} />
            <div className="st-skel" style={{ height: 14, width: "40%", marginBottom: 20 }} />
            <LoadingSkeletonList rows={3} />
          </div>
        )}

        {status === "error" && <ErrorState onRetry={load} />}

        {status === "success" && detail && (
          <>
            <div style={{ paddingTop: 12 }}>
              <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em" }}>{detail.title}</div>
              <div style={{ fontSize: 13, color: COLORS.inkSoft, marginTop: 4 }}>{detail.region} · {detail.category}</div>
              <p style={{ fontSize: 13.5, lineHeight: 1.6, color: COLORS.ink, marginTop: 14 }}>{detail.description}</p>
            </div>

            <div style={{ marginTop: 22 }}>
              <div style={{ fontWeight: 800, fontSize: 14.5, marginBottom: 10 }}>스탬프 지점</div>
              {detail.stamps.length === 0 ? (
                <EmptyState title="등록된 스탬프 지점이 없습니다" desc="코스 운영자가 지점을 준비 중입니다. 잠시 후 다시 확인해 주세요." />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {detail.stamps.map((s) => (
                    <div key={s.id} className="st-card" style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{
                        width: 30, height: 30, borderRadius: 999, background: COLORS.surfaceAlt,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontWeight: 800, fontSize: 12.5, flexShrink: 0,
                      }}>{s.order}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{s.name}</div>
                        <div style={{ fontSize: 12, color: COLORS.inkSoft, marginTop: 2 }}>{s.location}</div>
                      </div>
                      <div style={{
                        display: "flex", alignItems: "center", gap: 4, fontSize: 11.5, fontWeight: 700,
                        color: COLORS.inkSoft, background: COLORS.surfaceAlt, borderRadius: 999, padding: "5px 10px",
                      }}>
                        {stampIcon(s.type)}{s.type}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ marginTop: 26 }}>
              <div style={{ fontWeight: 800, fontSize: 14.5, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                <MessageCircle size={16} />의견 나누기 ({comments.length})
              </div>

              <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                <input
                  className="st-input" placeholder="이 코스에 대한 생각을 남겨보세요"
                  value={draft} onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && postComment()}
                />
                <button className="st-iconbtn" style={{ background: COLORS.seal, color: "#fff", borderRadius: 12 }} onClick={postComment} aria-label="댓글 등록">
                  <Send size={17} />
                </button>
              </div>

              {comments.length === 0 ? (
                <EmptyState title="아직 댓글이 없습니다" desc="이 코스를 다녀온 첫 번째 이야기를 남겨보세요." />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {comments.map((c) => (
                    <div key={c.id} style={{ borderBottom: `1px solid ${COLORS.line}`, paddingBottom: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5 }}>
                        <span style={{ fontWeight: 700 }}>{c.user}</span>
                        <span style={{ color: COLORS.inkSoft }}>{c.date}</span>
                      </div>
                      <div style={{ fontSize: 13.5, marginTop: 4, lineHeight: 1.5 }}>{c.text}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 6, color: COLORS.inkSoft, fontSize: 12 }}>
                        <Heart size={13} />{c.likes}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
