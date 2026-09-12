import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ChevronLeft,
  MapPin,
  Gift,
  Clock,
  Navigation,
  Compass,
  CheckCircle,
  Play,
  ArrowRight,
  Loader2,
  Calendar,
} from "lucide-react";
import { COLORS } from "../constants/colors.js";
import { coursesApi, enrollmentsApi } from "../services/api.js";
import LoadingSkeletonList from "../components/common/LoadingSkeletonList.jsx";
import ErrorState from "../components/common/ErrorState.jsx";
import EmptyState from "../components/common/EmptyState.jsx";
import DevStateSwitcher from "../components/common/DevStateSwitcher.jsx";

/* ============================================================================
   화면 3. 코스 상세 (GET /courses/{course_id})
   - 포함된 place 순서/목록 및 지도 핀 정보
   - 리워드 안내 (POST /courses/{id}/enrollments 와 연결)
   - my_enrollment_id 기준 "이어하기" vs "코스 시작하기" CTA 분기
   ========================================================================== */

export default function CourseDetailPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [mode, setMode] = useState("success");
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [detail, setDetail] = useState(null);
  const [starting, setStarting] = useState(false);

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      if (mode === "error") throw new Error("MOCK_ERROR");
      if (mode === "empty") {
        setDetail(null);
        setStatus("success");
        return;
      }
      const data = await coursesApi.get(courseId);
      setDetail(data);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }, [mode, courseId]);

  useEffect(() => {
    load();
  }, [load]);

  // 코스 시작하기 처리 (POST /courses/{id}/enrollments)
  const handleStartCourse = async () => {
    if (detail?.my_enrollment_id) {
      navigate(`/enrollments/${detail.my_enrollment_id}`);
      return;
    }

    setStarting(true);
    try {
      const res = await enrollmentsApi.start(courseId);
      navigate(`/enrollments/${res.enrollment_id}`);
    } catch (err) {
      alert("코스 시작에 실패했습니다.");
    } finally {
      setStarting(false);
    }
  };

  return (
    <>
      <div className="st-topbar">
        <button className="st-iconbtn" onClick={() => navigate(-1)} aria-label="뒤로 가기">
          <ChevronLeft size={22} />
        </button>
        <div className="st-topbar-title">코스 상세</div>
      </div>

      <DevStateSwitcher mode={mode} setMode={setMode} />

      <div className="st-scroll" style={{ paddingBottom: 90 }}>
        {status === "loading" && (
          <div style={{ paddingTop: 10 }}>
            <div className="st-skel" style={{ height: 22, width: "60%", marginBottom: 10 }} />
            <div className="st-skel" style={{ height: 14, width: "40%", marginBottom: 20 }} />
            <LoadingSkeletonList rows={3} />
          </div>
        )}

        {status === "error" && <ErrorState onRetry={load} />}

        {status === "success" && !detail && (
          <EmptyState title="코스 정보를 찾을 수 없습니다" desc="목록으로 돌아가 확인해 주세요." />
        )}

        {status === "success" && detail && (
          <>
            {/* 코스 기본 헤더 */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <span
                  style={{
                    background: COLORS.surfaceAlt,
                    padding: "3px 8px",
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 700,
                    color: COLORS.inkSoft,
                  }}
                >
                  {detail.region} · {detail.category}
                </span>

                {detail.is_ordered && (
                  <span
                    style={{
                      background: "rgba(49, 130, 246, 0.1)",
                      color: COLORS.seal,
                      padding: "3px 8px",
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    순서형 코스
                  </span>
                )}
              </div>

              <div style={{ fontSize: 22, fontWeight: 800, color: COLORS.ink, marginBottom: 8, lineHeight: 1.3 }}>
                {detail.name}
              </div>

              <p style={{ fontSize: 14, color: COLORS.inkSoft, lineHeight: 1.55, margin: "0 0 14px" }}>
                {detail.description}
              </p>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  background: COLORS.surface,
                  padding: "12px 16px",
                  borderRadius: 14,
                  fontSize: 13,
                  fontWeight: 700,
                  color: COLORS.ink,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <MapPin size={15} color={COLORS.seal} />
                  <span>스탬프 {detail.places?.length}곳</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <Navigation size={15} color={COLORS.seal} />
                  <span>{detail.distance || "2.4km"}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <Clock size={15} color={COLORS.seal} />
                  <span>약 {detail.durationMin || 60}분 소요</span>
                </div>
              </div>
            </div>

            {/* 리워드 정보 카드 */}
            {detail.reward && (
              <div
                className="st-card"
                style={{
                  background: "linear-gradient(135deg, #FFF9F5, #FFF3EB)",
                  border: `1.5px solid ${COLORS.gold}`,
                  marginBottom: 20,
                  display: "flex",
                  gap: 14,
                  alignItems: "center",
                }}
              >
                {detail.reward.image_url && (
                  <div
                    style={{
                      width: 68,
                      height: 68,
                      borderRadius: 12,
                      backgroundImage: `url(${detail.reward.image_url})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      flexShrink: 0,
                    }}
                  />
                )}
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: COLORS.gold, marginBottom: 3 }}>
                    🎁 코스 완주 리워드
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: COLORS.ink, marginBottom: 3 }}>
                    {detail.reward.name}
                  </div>
                  <div style={{ fontSize: 12, color: COLORS.inkSoft, lineHeight: 1.4 }}>
                    {detail.reward.description}
                  </div>
                </div>
              </div>
            )}

            {/* 포함된 장소(Places) 순서/목록 */}
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: COLORS.ink, marginBottom: 12 }}>
                방문 장소 코스 안내 ({detail.places?.length || 0}곳)
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {detail.places?.map((p, idx) => (
                  <div
                    key={p.course_place_id}
                    className="st-card"
                    style={{ display: "flex", gap: 14, padding: "14px" }}
                  >
                    {/* 번호 핀 */}
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background: COLORS.seal,
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 800,
                        fontSize: 14,
                        flexShrink: 0,
                      }}
                    >
                      {p.visit_order || idx + 1}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 800, color: COLORS.ink, marginBottom: 4 }}>
                        {p.name}
                      </div>
                      <div style={{ fontSize: 13, color: COLORS.inkSoft, lineHeight: 1.4, marginBottom: 6 }}>
                        {p.description}
                      </div>
                      <div style={{ fontSize: 11, color: COLORS.seal, fontWeight: 700 }}>
                        QR 스캔 + GPS 반경 50m 인증
                      </div>
                    </div>

                    {p.image_url && (
                      <div
                        style={{
                          width: 56,
                          height: 56,
                          borderRadius: 10,
                          backgroundImage: `url(${p.image_url})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          flexShrink: 0,
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* 하단 고정 CTA 버튼 */}
      {status === "success" && detail && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: "14px 20px 20px",
            background: "linear-gradient(to top, rgba(242,244,246,1) 80%, rgba(242,244,246,0))",
          }}
        >
          <button
            className="st-btn"
            onClick={handleStartCourse}
            disabled={starting}
            style={{
              background: detail.my_enrollment_id ? COLORS.seal : COLORS.ink,
            }}
          >
            {starting ? (
              <Loader2 size={18} className="st-spin" />
            ) : detail.my_enrollment_id ? (
              <Play size={18} />
            ) : (
              <Compass size={18} />
            )}
            <span>
              {starting
                ? "시작하는 중..."
                : detail.my_enrollment_id
                ? "이어서 코스 진행하기"
                : "이 코스 시작하기"}
            </span>
            <ArrowRight size={17} />
          </button>
        </div>
      )}
    </>
  );
}
