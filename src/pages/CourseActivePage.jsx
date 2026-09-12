import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ChevronLeft,
  Compass,
  MapPin,
  QrCode,
  CheckCircle2,
  Gift,
  LocateFixed,
  AlertCircle,
} from "lucide-react";
import { COLORS } from "../constants/colors.js";
import { enrollmentsApi, calculateDistanceMeters } from "../services/api.js";
import CourseMap from "../components/map/CourseMap.jsx";
import LoadingSkeletonList from "../components/common/LoadingSkeletonList.jsx";
import ErrorState from "../components/common/ErrorState.jsx";
import DevStateSwitcher from "../components/common/DevStateSwitcher.jsx";

/* ============================================================================
   화면 4. 코스 진행 화면 (GET /enrollments/{id})
   - 지도(CourseMap) 기반 장소 마킹 + 내 위치 표시
   - 다음 방문지 안내 카드
   - 스탬프 진행률 (예: 1/4 완료, 프로그레스 바)
   - QR 스캔 화면으로 연결되는 CTA 버튼
   ========================================================================== */

export default function CourseActivePage() {
  const { enrollmentId } = useParams();
  const navigate = useNavigate();

  const [mode, setMode] = useState("success");
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [data, setData] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationSimulated, setLocationSimulated] = useState(false);

  // 진행 데이터 조회
  const loadData = useCallback(async () => {
    setStatus("loading");
    try {
      if (mode === "error") throw new Error("NETWORK_ERROR");
      const res = await enrollmentsApi.get(enrollmentId);
      setData(res);

      // 기본적으로 첫 번째나 다음 목표 장소 근처(30m 안쪽)로 시뮬레이션 위치를 초기에 맞춰둠
      if (res.next_place) {
        setUserLocation({
          lat: res.next_place.lat - 0.00025, // 약 28m 거리
          lng: res.next_place.lng + 0.00015,
        });
      }
      setStatus("success");
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  }, [enrollmentId, mode]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 실제 브라우저 GPS 위치 가져오기
  const fetchRealGps = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
          setLocationSimulated(false);
        },
        (err) => {
          console.warn("GPS failed, using target nearby simulation", err);
        }
      );
    }
  };

  // 데모 위치 토글 (장소 바로 앞 25m vs 먼 거리 300m)
  const toggleSimulationDistance = () => {
    if (!data || !data.next_place) return;
    const target = data.next_place;
    if (locationSimulated) {
      // 300m 밖 (인증 실패 케이스 테스트용)
      setUserLocation({
        lat: target.lat + 0.0028,
        lng: target.lng + 0.0028,
      });
      setLocationSimulated(false);
    } else {
      // 25m 이내 (인증 성공 케이스)
      setUserLocation({
        lat: target.lat - 0.0002,
        lng: target.lng + 0.0001,
      });
      setLocationSimulated(true);
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
        <DevStateSwitcher mode={mode} setMode={setMode} />
        <div className="st-scroll">
          <ErrorState onRetry={loadData} />
        </div>
      </>
    );
  }

  const { course, next_place, stamped_course_place_ids, total_places } = data;
  const places = course?.places || [];
  const stampedCount = stamped_course_place_ids?.length || 0;
  const progressPercent = Math.round((stampedCount / Math.max(total_places, 1)) * 100);
  const isCompleted = data.status === "complete" || stampedCount >= total_places;

  // 다음 장소까지의 거리 계산
  let distanceToNext = null;
  if (next_place && userLocation) {
    distanceToNext = calculateDistanceMeters(
      userLocation.lat,
      userLocation.lng,
      next_place.lat,
      next_place.lng
    );
  }

  return (
    <>
      {/* 상단 네비게이션 헤더 */}
      <div className="st-topbar">
        <button className="st-iconbtn" onClick={() => navigate("/courses")}>
          <ChevronLeft size={22} />
        </button>
        <div className="st-topbar-title" style={{ fontSize: 17, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {data.course_name}
        </div>
      </div>

      <DevStateSwitcher mode={mode} setMode={setMode} />

      <div className="st-scroll" style={{ paddingBottom: 100 }}>
        {/* 1. 진행률 카드 */}
        <div className="st-card" style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.inkSoft }}>
              스탬프 진행 현황
            </span>
            <span style={{ fontSize: 14, fontWeight: 800, color: COLORS.seal }}>
              {stampedCount} / {total_places} 개 ({progressPercent}%)
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
            stampedPlaceIds={stamped_course_place_ids}
            nextPlace={next_place}
            userLocation={userLocation}
          />
        </div>

        {/* 3. 데모 GPS 보조 툴바 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: COLORS.surfaceAlt,
            padding: "8px 14px",
            borderRadius: 12,
            marginBottom: 14,
            fontSize: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 5, color: COLORS.inkSoft }}>
            <LocateFixed size={14} color={COLORS.seal} />
            <span>GPS: {distanceToNext != null ? `목표까지 ${distanceToNext}m` : "좌표 수신중"}</span>
            {distanceToNext != null && distanceToNext <= 50 ? (
              <span style={{ color: COLORS.leaf, fontWeight: 700 }}>(인증 가능 반경)</span>
            ) : (
              <span style={{ color: COLORS.danger, fontWeight: 700 }}>(50m 초과)</span>
            )}
          </div>
          <button
            onClick={toggleSimulationDistance}
            style={{
              background: COLORS.surface,
              border: `1px solid ${COLORS.line}`,
              borderRadius: 6,
              padding: "3px 8px",
              fontSize: 11,
              fontWeight: 700,
              color: COLORS.ink,
              cursor: "pointer",
            }}
          >
            {distanceToNext != null && distanceToNext <= 50 ? "원거리 시뮬(오류 테스트)" : "반경 내 위치로 맞춤"}
          </button>
        </div>

        {/* 4. 다음 목표 장소 안내 카드 */}
        {!isCompleted && next_place && (
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
                {next_place.visit_order}. {next_place.name}
              </span>
            </div>

            {next_place.image_url && (
              <div
                style={{
                  height: 120,
                  borderRadius: 12,
                  backgroundImage: `url(${next_place.image_url})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  marginBottom: 10,
                }}
              />
            )}

            <p style={{ fontSize: 13, color: COLORS.inkSoft, margin: "0 0 10px", lineHeight: 1.4 }}>
              {next_place.description}
            </p>

            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: COLORS.inkSoft }}>
              <MapPin size={14} color={COLORS.seal} />
              <span>현장 안내판 또는 카운터의 <b>QR 코드</b>를 찾아 스캔해 주세요.</span>
            </div>
          </div>
        )}

        {/* 5. 코스 전체 방문지 목록 */}
        <div style={{ marginTop: 10 }}>
          <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 10, color: COLORS.ink }}>
            코스 방문 코스 ({places.length}곳)
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {places.map((place) => {
              const done = stamped_course_place_ids.includes(place.course_place_id);
              const isCurrent = next_place?.course_place_id === place.course_place_id;

              return (
                <div
                  key={place.course_place_id}
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
                    {done ? "✓" : place.visit_order}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: done ? COLORS.inkSoft : COLORS.ink }}>
                      {place.name}
                    </div>
                    <div style={{ fontSize: 12, color: COLORS.inkSoft, textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                      {place.description}
                    </div>
                  </div>

                  <div style={{ fontSize: 11, fontWeight: 700, color: done ? COLORS.leaf : COLORS.inkSoft, flexShrink: 0 }}>
                    {done ? "완료" : isCurrent ? "방문중" : "대기"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
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
            className="st-btn"
            style={{ background: COLORS.leaf }}
            onClick={() => navigate(`/enrollments/${enrollmentId}/complete`)}
          >
            <Gift size={18} />
            <span>🎉 코스 완주! 리워드 수령하기</span>
          </button>
        ) : (
          <button
            className="st-btn"
            onClick={() =>
              navigate(`/enrollments/${enrollmentId}/scan`, {
                state: {
                  nextPlace: next_place,
                  simulatedLocation: userLocation,
                },
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
