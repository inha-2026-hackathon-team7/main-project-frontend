import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Award,
  CheckCircle,
  Gift,
  ArrowRight,
  Sparkles,
  PartyPopper,
  Loader2,
  Calendar,
  Compass,
} from "lucide-react";
import { COLORS } from "../constants/colors.js";
import { enrollmentsApi, rewardsApi } from "../services/api.js";
import LoadingSkeletonList from "../components/common/LoadingSkeletonList.jsx";
import ErrorState from "../components/common/ErrorState.jsx";

/* ============================================================================
   화면 8. 코스 완주 → 리워드 수령 (POST /reward-claims)
   - 완주 축하 연출
   - 리워드 정보 확인 및 1-Click 수령 처리
   - 수령 완료 후 리워드함(/rewards) 안내
   ========================================================================== */

export default function CourseCompletePage() {
  const { enrollmentId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [enrollment, setEnrollment] = useState(null);
  const [claimResult, setClaimResult] = useState(null);
  const [error, setError] = useState(null);

  // 정보 불러오기
  const loadInfo = useCallback(async () => {
    setLoading(true);
    try {
      const data = await enrollmentsApi.get(enrollmentId);
      setEnrollment(data);
    } catch (e) {
      setError("코스 정보를 불러올 수 없습니다.");
    } finally {
      setLoading(false);
    }
  }, [enrollmentId]);

  useEffect(() => {
    loadInfo();
  }, [loadInfo]);

  // 리워드 수령 처리
  const handleClaimReward = async () => {
    setClaiming(true);
    setError(null);
    try {
      const res = await rewardsApi.claim(enrollmentId);
      setClaimResult(res);
    } catch (err) {
      console.error(err);
      setError(err.message || "리워드 수령에 실패했습니다.");
    } finally {
      setClaiming(false);
    }
  };

  if (loading) {
    return (
      <div className="st-scroll" style={{ paddingTop: 40 }}>
        <LoadingSkeletonList />
      </div>
    );
  }

  if (error && !enrollment) {
    return (
      <div className="st-scroll">
        <ErrorState onRetry={loadInfo} />
      </div>
    );
  }

  const course = enrollment?.course;
  const reward = course?.reward || {
    name: "완주 기념 교환권",
    description: "제휴 상점에서 사용 가능한 모바일 쿠폰입니다.",
    image_url: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&auto=format&fit=crop&q=80",
    valid_days: 30,
  };

  return (
    <div
      className="st-scroll"
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        minHeight: "100%",
        padding: "32px 20px 24px",
      }}
    >
      <div>
        {/* 상단 완주 축하 헤더 */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div
            className="st-stamp-animate"
            style={{
              width: 88,
              height: 88,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #FF8B3E, #FF5B00)",
              margin: "0 auto 18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              boxShadow: "0 12px 30px rgba(255, 139, 62, 0.4)",
            }}
          >
            <Award size={48} />
          </div>

          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              padding: "4px 10px",
              borderRadius: 999,
              background: "rgba(255, 139, 62, 0.12)",
              color: COLORS.gold,
              fontSize: 12,
              fontWeight: 800,
              marginBottom: 8,
            }}
          >
            <Sparkles size={14} />
            <span>COURSE COMPLETED</span>
          </div>

          <div style={{ fontSize: 22, fontWeight: 800, color: COLORS.ink, marginBottom: 6 }}>
            {enrollment?.course_name} 완주!
          </div>
          <div style={{ fontSize: 13, color: COLORS.inkSoft }}>
            모든 스탬프({enrollment?.total_places}곳)를 성공적으로 수집하셨습니다.
          </div>
        </div>

        {/* 리워드 카드 */}
        <div
          className="st-card"
          style={{
            padding: 0,
            overflow: "hidden",
            marginBottom: 20,
            border: `1.5px solid ${COLORS.gold}`,
          }}
        >
          {reward.image_url && (
            <div
              style={{
                height: 140,
                backgroundImage: `url(${reward.image_url})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
          )}

          <div style={{ padding: "18px 16px" }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: COLORS.gold, marginBottom: 4 }}>
              완주 달성 리워드
            </div>
            <div style={{ fontSize: 17, fontWeight: 800, color: COLORS.ink, marginBottom: 6 }}>
              {reward.name}
            </div>
            <div style={{ fontSize: 13, color: COLORS.inkSoft, lineHeight: 1.5, marginBottom: 12 }}>
              {reward.description}
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 12,
                color: COLORS.inkSoft,
                borderTop: `1px solid ${COLORS.line}`,
                paddingTop: 10,
              }}
            >
              <Calendar size={14} color={COLORS.inkSoft} />
              <span>유효기간: 발급일로부터 {reward.valid_days || 30}일간 유효</span>
            </div>
          </div>
        </div>

        {/* 수령 완료 상태 표시 */}
        {claimResult && (
          <div
            className="st-card"
            style={{
              background: "#F0FDF4",
              border: `1.5px solid ${COLORS.leaf}`,
              textAlign: "center",
              padding: "16px",
              marginBottom: 16,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, color: COLORS.leaf, fontWeight: 800, fontSize: 15, marginBottom: 4 }}>
              <CheckCircle size={18} />
              <span>리워드 수령 완료!</span>
            </div>
            <div style={{ fontSize: 13, color: COLORS.inkSoft }}>
              보유 중인 쿠폰은 언제든지 <b>[리워드함]</b>에서 확인하고 매장에서 사용할 수 있습니다.
            </div>
          </div>
        )}

        {error && (
          <div style={{ color: COLORS.danger, fontSize: 13, textAlign: "center", marginBottom: 14 }}>
            {error}
          </div>
        )}
      </div>

      {/* 액션 버튼 */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {!claimResult ? (
          <button
            className="st-btn"
            style={{ background: COLORS.gold }}
            onClick={handleClaimReward}
            disabled={claiming}
          >
            {claiming ? <Loader2 size={18} className="st-spin" /> : <Gift size={18} />}
            <span>{claiming ? "리워드 쿠폰 발급 중..." : "리워드 쿠폰 지금 받기"}</span>
          </button>
        ) : (
          <>
            <button
              className="st-btn"
              onClick={() => navigate("/rewards")}
            >
              <Gift size={18} />
              <span>내 리워드함에서 쿠폰 확인하기</span>
              <ArrowRight size={17} />
            </button>
            <button
              className="st-btn-ghost"
              onClick={() => navigate("/courses")}
            >
              <Compass size={17} />
              <span>다른 코스 둘러보기</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
