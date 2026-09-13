import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ChevronLeft,
  MapPin,
  QrCode,
  CheckCircle2,
  Gift,
  XCircle,
  Loader2,
} from "lucide-react";
import { COLORS } from "../constants/colors.js";
import { enrollmentsApi } from "../services/api.js";
import CourseMap from "../components/map/CourseMap.jsx";
import LoadingSkeletonList from "../components/common/LoadingSkeletonList.jsx";
import ErrorState from "../components/common/ErrorState.jsx";

/* ============================================================================
   화면 4. 코스 진행 화면 (GET /enrollments/{id} — course/places/reward 포함 응답)
   - 지도(CourseMap) 기반 장소 마킹 + 내 위치 표시
   - 다음 방문지 안내 카드
   - 스탬프 진행률 (예: 1/4 완료, 프로그레스 바)
   - QR 스캔 화면으로 연결되는 CTA 버튼
   ========================================================================== */

export default function CourseActivePage() {
  const { courseId, enrollmentId } = useParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState("loading"); // loading | success | error
  const [data, setData] = useState(null);
  const [abandoning, setAbandoning] = useState(false);

  // 진행 데이터 조회
  const loadData = useCallback(async () => {
    setStatus("loading");
    try {
      const res = await enrollmentsApi.getWithCourse(enrollmentId);
      setData(res);
      setStatus("success");
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  }, [enrollmentId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 코스 포기하기 (POST /enrollments/{id}/abandon) — 멱등이라 두 번 눌러도 안전하지만
  // 실수 클릭 방지를 위해 확인창을 거친다.
  const handleAbandon = async () => {
    if (!window.confirm("정말 이 코스를 포기하시겠어요? 지금까지 모은 스탬프 기록은 사라집니다.")) {
      return;
    }
    setAbandoning(true);
    try {
      await enrollmentsApi.abandon(enrollmentId);
      navigate("/courses");
    } catch (err) {
      const code = err?.data?.code || err?.data?.error;
      alert(
        code === "ENROLLMENT_ALREADY_ENDED"
          ? "이미 완주했거나 종료된 코스는 포기할 수 없습니다."
          : err.message || "코스 포기에 실패했습니다."
      );
    } finally {
      setAbandoning(false);
    }
  };

  if (status === "loading") {
    return (
      <>
        <div className="st-topbar">
          <button className="st-iconbtn" onClick={() => navigate(-1)}><ChevronLeft size={22} /></button>
          <div className="st-topbar-title">코스 진행</div>
        </div>
        <div className="st-scroll">
          <LoadingSkeletonList />
        </div>
      </>
    );
  }

  if (status === "error" || !data) {
    return (
      <>
        <div className="st-topbar">
          <button className="st-iconbtn" onClick={() => navigate(-1)}><ChevronLeft size={22} /></button>
          <div className="st-topbar-title">코스 진행</div>
        </div>
        <div className="st-scroll">
          <ErrorState onRetry={loadData} />
        </div>
      </>
    );
  }

  const { course, courseName, nextPlace, stampedCoursePlaceIds, totalPlaces } = data;
  const places = course?.places || [];
  const stampedCount = stampedCoursePlaceIds?.length || 0;
  const progressPercent = Math.round((stampedCount / Math.max(totalPlaces, 1)) * 100);
  const isCompleted = Boolean(data.completedAt) || stampedCount >= totalPlaces;

  return (
    <>
      {/* 상단 네비게이션 헤더 */}
      <div className="st-topbar">
        <button className="st-iconbtn" onClick={() => navigate("/courses")}>
          <ChevronLeft size={22} />
        </button>
        <div className="st-topbar-title" style={{ fontSize: 17, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {courseName}
        </div>
      </div>

      <div className="st-scroll" style={{ paddingBottom: 100 }}>
        {/* 1. 진행률 카드 */}
        <div className="st-card" style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.inkSoft }}>
              스탬프 진행 현황
            </span>
            <span style={{ fontSize: 14, fontWeight: 800, color: COLORS.seal }}>
              {stampedCount} / {totalPlaces} 개 ({progressPercent}%)
            </span>
          </div>

          <div className="st-progress-track">
            <div className="st-progress-fill" style={{ width: `${progressPercent}%` }} />
          </div>

          {isCompleted && (
            <div
              style={{
                marginTop: 10,
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 12px",
                background: "rgba(0, 196, 140, 0.1)",
                borderRadius: 10,
                color: COLORS.leaf,
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              <CheckCircle2 size={16} />
              <span>모든 스탬프를 모았습니다! 리워드를 확인해 보세요.</span>
            </div>
          )}
        </div>

        {/* 2. 인터랙티브 Leaflet 지도 */}
        <div style={{ marginBottom: 14 }}>
          <CourseMap
            places={places}
            stampedPlaceIds={stampedCoursePlaceIds}
            nextPlace={nextPlace}
          />
        </div>

        {/* 3. 다음 목표 장소 안내 카드 */}
        {!isCompleted && nextPlace && (
          <div
            className="st-card"
            style={{
              border: `1.5px solid ${COLORS.seal}`,
              marginBottom: 14,
              background: "#F8FAFF",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <span
                style={{
                  background: COLORS.seal,
                  color: "#fff",
                  padding: "3px 8px",
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 800,
                }}
              >
                NEXT GOAL
              </span>
              <span style={{ fontSize: 14, fontWeight: 800, color: COLORS.ink }}>
                {nextPlace.visitOrder}. {nextPlace.name}
              </span>
            </div>

            {nextPlace.imageUrl && (
              <div
                style={{
                  height: 120,
                  borderRadius: 12,
                  backgroundImage: `url(${nextPlace.imageUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  marginBottom: 10,
                }}
              />
            )}

            {nextPlace.description && (
              <p style={{ fontSize: 13, color: COLORS.inkSoft, margin: "0 0 10px", lineHeight: 1.4 }}>
                {nextPlace.description}
              </p>
            )}

            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: COLORS.inkSoft }}>
              <MapPin size={14} color={COLORS.seal} />
              <span>현장 안내판 또는 카운터의 <b>QR 코드</b>를 찾아 스캔해 주세요.</span>
            </div>
          </div>
        )}

        {/* 4. 코스 전체 방문지 목록 */}
        <div style={{ marginTop: 10 }}>
          <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 10, color: COLORS.ink }}>
            코스 방문 코스 ({places.length}곳)
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {places.map((place) => {
              const done = stampedCoursePlaceIds.includes(place.coursePlaceId);
              const isCurrent = nextPlace?.coursePlaceId === place.coursePlaceId;

              return (
                <div
                  key={place.coursePlaceId}
                  className="st-card"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 14px",
                    background: done ? "#F9FBFA" : COLORS.surface,
                    border: isCurrent ? `1.5px solid ${COLORS.seal}` : "none",
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 800,
                      fontSize: 13,
                      background: done ? COLORS.leaf : isCurrent ? COLORS.seal : COLORS.surfaceAlt,
                      color: done || isCurrent ? "#fff" : COLORS.inkSoft,
                      flexShrink: 0,
                    }}
                  >
                    {done ? "✓" : place.visitOrder}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: done ? COLORS.inkSoft : COLORS.ink }}>
                      {place.name}
                    </div>
                    {place.description && (
                      <div style={{ fontSize: 12, color: COLORS.inkSoft, textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                        {place.description}
                      </div>
                    )}
                  </div>

                  <div style={{ fontSize: 11, fontWeight: 700, color: done ? COLORS.leaf : COLORS.inkSoft, flexShrink: 0 }}>
                    {done ? "완료" : isCurrent ? "방문중" : "대기"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 5. 코스 포기하기 */}
        {!isCompleted && (
          <div style={{ marginTop: 22, textAlign: "center" }}>
            <button
              onClick={handleAbandon}
              disabled={abandoning}
              style={{
                background: "none",
                border: "none",
                color: COLORS.danger,
                fontSize: 12.5,
                fontWeight: 700,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: 6,
              }}
            >
              {abandoning ? <Loader2 size={13} className="st-spin" /> : <XCircle size={13} />}
              <span>{abandoning ? "포기하는 중..." : "코스 포기하기"}</span>
            </button>
          </div>
        )}
      </div>

      {/* 하단 플로팅 CTA 버튼 */}
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
        {isCompleted ? (
          <button
            className="st-btn-primary"
            style={{ background: COLORS.leaf }}
            onClick={() => navigate(`/courses/${courseId}/enrollments/${enrollmentId}/complete`)}
          >
            <Gift size={18} />
            <span>🎉 코스 완주! 리워드 수령하기</span>
          </button>
        ) : (
          <button
            className="st-btn-primary"
            onClick={() =>
              navigate(`/courses/${courseId}/enrollments/${enrollmentId}/scan`, {
                state: { nextPlace },
              })
            }
          >
            <QrCode size={19} />
            <span>QR 코드 스캔하여 스탬프 찍기</span>
          </button>
        )}
      </div>
    </>
  );
}
