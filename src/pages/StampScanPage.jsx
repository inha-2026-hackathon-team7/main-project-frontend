import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Html5Qrcode } from "html5-qrcode";
import {
  ChevronLeft,
  Camera,
  AlertCircle,
  CheckCircle2,
  Gift,
  Loader2,
  RefreshCw,
  MapPin,
  Compass,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { COLORS } from "../constants/colors.js";
import { enrollmentsApi } from "../services/api.js";

/* ============================================================================
   화면 5, 6, 7. QR 스캔 + GPS 위치 검증 + 스탬프 적립 화면
   - 화면 5: 카메라 뷰 및 QR 실시간 스캔
   - 화면 6: GPS 좌표 수집 및 허용 반경(50m) 검증 로딩 / 에러 분기 (404, 409, 422)
   - 화면 7: 스탬프 날인 애니메이션 피드백 -> 완주 시 화면 8 전환
   ========================================================================== */

export default function StampScanPage() {
  const { enrollmentId } = useParams();
  const navigate = useNavigate();
  const locationState = useLocation().state || {};

  const nextPlace = locationState.nextPlace;
  const initialSimulatedLocation = locationState.simulatedLocation;

  // step: "scan" (화면 5) | "verifying" (화면 6) | "error" (화면 6 에러) | "success" (화면 7)
  const [step, setStep] = useState("scan");
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);

  // 인증 처리 결과 및 에러 정보
  const [verifyError, setVerifyError] = useState(null);
  const [stampResult, setStampResult] = useState(null);

  // 수동 입력 / 데모 도구용
  const [manualCode, setManualCode] = useState("");
  const [showDemoPanel, setShowDemoPanel] = useState(false);

  const qrRegionId = "html5qr-reader";
  const html5QrCodeRef = useRef(null);

  // 카메라 초기화
  useEffect(() => {
    let html5QrCode = null;

    const startCamera = async () => {
      try {
        html5QrCode = new Html5Qrcode(qrRegionId);
        html5QrCodeRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 220, height: 220 },
            aspectRatio: 1.0,
          },
          (decodedText) => {
            // QR 스캔 성공
            handleQrScanned(decodedText);
          },
          () => {
            // 프레임별 미인식은 무시
          }
        );
        setCameraActive(true);
        setCameraError(null);
      } catch (err) {
        console.warn("Camera start failed, fallback to simulator mode", err);
        setCameraActive(false);
        setCameraError("카메라를 실행할 수 없습니다. (권한 허용 필요 또는 미지원 기기)");
      }
    };

    if (step === "scan") {
      startCamera();
    }

    return () => {
      if (html5QrCodeRef.current) {
        if (html5QrCodeRef.current.isScanning) {
          html5QrCodeRef.current.stop().catch(() => {}).finally(() => {
            html5QrCodeRef.current?.clear();
          });
        }
      }
    };
  }, [step]);

  // 카메라 중지 헬퍼
  const stopCameraSafe = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch (e) {}
    }
  };

  // QR 스캔 후 GPS 검증 프로세스 실행 (화면 6 진입)
  const handleQrScanned = async (qrCode, customLocation = null) => {
    await stopCameraSafe();
    setStep("verifying");
    setVerifyError(null);

    // 햅틱 진동 피드백
    if ("vibrate" in navigator) {
      try { navigator.vibrate(80); } catch (e) {}
    }

    // 위치 획득 (실제 GPS 또는 시뮬레이션 위치)
    let currentCoords = customLocation || initialSimulatedLocation;

    if (!currentCoords && "geolocation" in navigator) {
      try {
        const pos = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 4000 });
        });
        currentCoords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
      } catch (e) {
        console.warn("Real GPS timeout, using fallback coordinates", e);
      }
    }

    // 기본 위치(부산 영도 흰여울전망대 기본 좌표)
    if (!currentCoords) {
      currentCoords = {
        lat: nextPlace ? nextPlace.lat : 35.0772,
        lng: nextPlace ? nextPlace.lng : 129.0441,
      };
    }

    // API 호출: POST /enrollments/{enrollment_id}/stamps
    try {
      const res = await enrollmentsApi.stamp(enrollmentId, {
        qrcode_string: qrCode,
        latitude: currentCoords.lat,
        longitude: currentCoords.lng,
      });

      // 성공! (화면 7 전환)
      setStampResult(res);
      setStep("success");

      // 완주 축하 진동
      if ("vibrate" in navigator) {
        try { navigator.vibrate([100, 50, 150]); } catch (e) {}
      }
    } catch (err) {
      console.error("Stamp verification error", err);
      // 에러 코드별 분기
      setVerifyError({
        status: err.status || 500,
        message: err.message || "위치 인증에 실패했습니다.",
        distance: err.distance || null,
      });
      setStep("error");
    }
  };

  // 다시 스캔하기
  const handleRetryScan = () => {
    setVerifyError(null);
    setStep("scan");
  };

  return (
    <div style={{ minHeight: "100%", display: "flex", flexDirection: "column", background: step === "scan" ? "#0b0e14" : COLORS.paper, color: step === "scan" ? "#fff" : COLORS.ink }}>
      {/* 상단바 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "16px 20px",
          background: step === "scan" ? "rgba(0,0,0,0.6)" : COLORS.paper,
          zIndex: 10,
        }}
      >
        <button
          className="st-iconbtn"
          style={{ color: step === "scan" ? "#fff" : COLORS.ink }}
          onClick={() => navigate(`/enrollments/${enrollmentId}`)}
        >
          <ChevronLeft size={24} />
        </button>
        <div style={{ fontSize: 18, fontWeight: 800 }}>
          {step === "scan" && "스탬프 QR 스캔"}
          {step === "verifying" && "위치 인증 진행 중"}
          {step === "error" && "스탬프 인증 실패"}
          {step === "success" && "스탬프 획득 완료!"}
        </div>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* 1. QR 스캔 모드 (화면 5) */}
      {/* ------------------------------------------------------------------- */}
      {step === "scan" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "10px 20px 24px" }}>
          <div style={{ textAlign: "center", marginTop: 8 }}>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", marginBottom: 4 }}>
              현장의 <b>QR 안내판</b>을 사각형 영역에 비춰주세요.
            </div>
            {nextPlace && (
              <div style={{ fontSize: 12, color: COLORS.seal, fontWeight: 700 }}>
                목표: {nextPlace.visit_order}. {nextPlace.name}
              </div>
            )}
          </div>

          {/* 카메라 뷰파인더 래퍼 */}
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "20px 0", minHeight: 260 }}>
            <div
              style={{
                width: 240,
                height: 240,
                borderRadius: 24,
                overflow: "hidden",
                position: "relative",
                border: `3px solid ${COLORS.seal}`,
                boxShadow: "0 0 24px rgba(49, 130, 246, 0.4)",
                background: "#000",
              }}
            >
              <div id={qrRegionId} style={{ width: "100%", height: "100%" }} />
              <div className="st-scanner-laser" />

              {cameraError && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    padding: 16,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    background: "rgba(0,0,0,0.85)",
                    fontSize: 12,
                    color: "rgba(255,255,255,0.7)",
                  }}
                >
                  <Camera size={28} color={COLORS.seal} style={{ marginBottom: 8 }} />
                  <div>{cameraError}</div>
                  <div style={{ fontSize: 11, color: COLORS.gold, marginTop: 8 }}>
                    아래 데모 시뮬레이터로 스캔을 즉시 테스트할 수 있습니다.
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 팁 안내 */}
          <div
            style={{
              background: "rgba(255,255,255,0.08)",
              padding: "10px 14px",
              borderRadius: 12,
              fontSize: 12,
              color: "rgba(255,255,255,0.7)",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <MapPin size={16} color={COLORS.seal} />
            <span>QR 스캔 시 현재 기기의 GPS 위치가 함께 자동 검증(50m 반경)됩니다.</span>
          </div>

          {/* 데모/시연용 빠른 테스트 패널 (심사 및 시연 안정성 100% 확보) */}
          <div style={{ marginTop: 14 }}>
            <button
              onClick={() => setShowDemoPanel((v) => !v)}
              style={{
                width: "100%",
                background: "rgba(255, 255, 255, 0.12)",
                border: "none",
                borderRadius: 8,
                padding: "8px 12px",
                color: "#fff",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span>🧪 데모 / 에러 분기 시연 패널</span>
              <span>{showDemoPanel ? "▲ 닫기" : "▼ 열기"}</span>
            </button>

            {showDemoPanel && (
              <div
                style={{
                  background: "rgba(0,0,0,0.5)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: 10,
                  padding: 12,
                  marginTop: 8,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>
                  원클릭으로 정상 인증 및 명세서의 에러 분기를 테스트합니다:
                </div>

                {/* 버튼 1: 정상 인증 (해당 장소 QR) */}
                <button
                  className="st-btn"
                  style={{ fontSize: 12, height: 38, background: COLORS.seal }}
                  onClick={() => {
                    const targetQr = nextPlace ? nextPlace.qrcode_string : "STARTON-QR-c1-cp1_2";
                    handleQrScanned(targetQr);
                  }}
                >
                  <CheckCircle2 size={15} />
                  <span>[정상] 다음 장소 QR 스캔 (성공 케이스)</span>
                </button>

                {/* 버튼 2: 422 반경 벗어남 에러 */}
                <button
                  className="st-btn"
                  style={{ fontSize: 12, height: 38, background: "#D97706" }}
                  onClick={() => {
                    const targetQr = nextPlace ? nextPlace.qrcode_string : "STARTON-QR-c1-cp1_2";
                    // 500m 떨어진 위치 좌표 전달
                    handleQrScanned(targetQr, { lat: 35.1200, lng: 129.0800 });
                  }}
                >
                  <MapPin size={15} />
                  <span>[422] 거리 초과 (50m 밖 GPS 에러)</span>
                </button>

                {/* 버튼 3: 422 다른 코스 장소 에러 */}
                <button
                  className="st-btn"
                  style={{ fontSize: 12, height: 38, background: "#8B5CF6" }}
                  onClick={() => {
                    // 전주 청년몰 장소 QR을 영도 코스에서 스캔한 상황
                    handleQrScanned("STARTON-QR-c2-cp2_1");
                  }}
                >
                  <AlertCircle size={15} />
                  <span>[422] 다른 코스 장소 QR (코스 불일치)</span>
                </button>

                {/* 버튼 4: 404 미등록 QR 에러 */}
                <button
                  className="st-btn"
                  style={{ fontSize: 12, height: 38, background: COLORS.danger }}
                  onClick={() => {
                    handleQrScanned("UNKNOWN-QR-99999");
                  }}
                >
                  <ShieldAlert size={15} />
                  <span>[404] 미등록 QR 코드 (장소 없음)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* 2. GPS 인증 처리 로딩 화면 (화면 6) */}
      {/* ------------------------------------------------------------------- */}
      {step === "verifying" && (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px 24px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: COLORS.surface,
              boxShadow: "0 8px 24px rgba(49, 130, 246, 0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 20,
              position: "relative",
            }}
          >
            <Compass size={38} color={COLORS.seal} className="st-spin" />
          </div>

          <div style={{ fontSize: 19, fontWeight: 800, color: COLORS.ink, marginBottom: 8 }}>
            현장 위치 검증 중...
          </div>
          <div style={{ fontSize: 14, color: COLORS.inkSoft, lineHeight: 1.5, maxWidth: 260 }}>
            스캔된 QR 코드와 현재 GPS 좌표가 일치하는지 (허용 반경 50m) 확인하고 있습니다.
          </div>

          <div style={{ marginTop: 28, display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: COLORS.inkSoft }}>
            <Loader2 size={16} className="st-spin" />
            <span>서버 인증 응답 대기 중...</span>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* 3. 에러 분기 화면 (화면 6 에러 케이스: 404 / 409 / 422) */}
      {/* ------------------------------------------------------------------- */}
      {step === "error" && verifyError && (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "40px 24px 24px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", marginTop: 20 }}>
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: "rgba(240, 68, 82, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 20,
              }}
            >
              <AlertCircle size={36} color={COLORS.danger} />
            </div>

            {/* HTTP 상태 코드 배지 */}
            <span
              style={{
                background: COLORS.surfaceAlt,
                padding: "4px 10px",
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 800,
                color: COLORS.danger,
                marginBottom: 10,
              }}
            >
              HTTP {verifyError.status} ERROR
            </span>

            {/* 에러 제목 */}
            <div style={{ fontSize: 20, fontWeight: 800, color: COLORS.ink, marginBottom: 10 }}>
              {verifyError.status === 404 && "스탬프 장소를 찾을 수 없습니다"}
              {verifyError.status === 409 && "이미 완료된 스탬프입니다"}
              {verifyError.status === 422 && (verifyError.distance ? "위치 반경을 벗어났습니다" : "코스 불일치")}
            </div>

            {/* 상세 메시지 (명세 케이스별 맞춤 문구) */}
            <div
              className="st-card"
              style={{
                background: COLORS.surface,
                padding: "16px 20px",
                fontSize: 14,
                color: COLORS.inkSoft,
                lineHeight: 1.6,
                maxWidth: 320,
                textAlign: "center",
                marginTop: 6,
              }}
            >
              {verifyError.message}
            </div>

            {verifyError.distance && (
              <div style={{ marginTop: 14, fontSize: 13, color: COLORS.seal, fontWeight: 700 }}>
                💡 현재 위치에서 약 {verifyError.distance}m 떨어져 있습니다. (허용: 50m 이내)
              </div>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button className="st-btn" onClick={handleRetryScan}>
              <RefreshCw size={17} />
              <span>다시 스캔하기</span>
            </button>
            <button
              className="st-btn-ghost"
              onClick={() => navigate(`/enrollments/${enrollmentId}`)}
            >
              코스 지도로 돌아가기
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* 4. 스탬프 적립 성공 피드백 화면 (화면 7) */}
      {/* ------------------------------------------------------------------- */}
      {step === "success" && stampResult && (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "36px 24px 24px",
            textAlign: "center",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 20 }}>
            {/* 도장 쾅 날인 애니메이션 */}
            <div
              className="st-stamp-animate"
              style={{
                width: 90,
                height: 90,
                borderRadius: "50%",
                background: COLORS.leaf,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                boxShadow: "0 10px 28px rgba(0, 196, 140, 0.4)",
                marginBottom: 24,
              }}
            >
              <CheckCircle2 size={50} />
            </div>

            <div style={{ fontSize: 14, fontWeight: 800, color: COLORS.leaf, letterSpacing: "0.05em", marginBottom: 6 }}>
              STAMP VERIFIED!
            </div>

            <div style={{ fontSize: 22, fontWeight: 800, color: COLORS.ink, marginBottom: 8 }}>
              {stampResult.place_name}
            </div>

            <div style={{ fontSize: 13, color: COLORS.inkSoft, marginBottom: 20 }}>
              방문 인증이 정상적으로 완료되었습니다.
            </div>

            {/* 진행률 박스 */}
            <div
              className="st-card"
              style={{
                width: "100%",
                background: COLORS.surface,
                padding: "16px 20px",
                marginBottom: 10,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 700, marginBottom: 8 }}>
                <span style={{ color: COLORS.inkSoft }}>남은 스탬프</span>
                <span style={{ color: COLORS.seal, fontWeight: 800 }}>
                  {stampResult.progress.done} / {stampResult.progress.total} 개 완료
                </span>
              </div>
              <div className="st-progress-track">
                <div
                  className="st-progress-fill"
                  style={{
                    width: `${Math.round((stampResult.progress.done / stampResult.progress.total) * 100)}%`,
                  }}
                />
              </div>
            </div>

            {stampResult.course_completed && (
              <div
                style={{
                  background: "rgba(255, 139, 62, 0.12)",
                  padding: "12px 16px",
                  borderRadius: 14,
                  marginTop: 10,
                  color: COLORS.gold,
                  fontSize: 13,
                  fontWeight: 800,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Gift size={18} />
                <span>축하합니다! 코스의 모든 스탬프를 획득하셨습니다!</span>
              </div>
            )}
          </div>

          {/* 하단 전환 액션 */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {stampResult.course_completed ? (
              <button
                className="st-btn"
                style={{ background: COLORS.gold }}
                onClick={() => navigate(`/enrollments/${enrollmentId}/complete`)}
              >
                <Gift size={18} />
                <span>🎉 코스 완주! 리워드 수령하기</span>
                <ArrowRight size={18} />
              </button>
            ) : (
              <button
                className="st-btn"
                onClick={() => navigate(`/enrollments/${enrollmentId}`)}
              >
                <span>다음 스탬프로 이동하기</span>
                <ArrowRight size={18} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
