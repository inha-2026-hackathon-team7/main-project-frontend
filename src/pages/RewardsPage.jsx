import { useCallback, useEffect, useState } from "react";
import { Calendar, X, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { COLORS } from "../constants/colors.js";
import { rewardsApi } from "../services/api.js";
import LoadingSkeletonList from "../components/common/LoadingSkeletonList.jsx";
import ErrorState from "../components/common/ErrorState.jsx";
import EmptyState from "../components/common/EmptyState.jsx";

/* ============================================================================
   화면 9. 리워드함 (GET /users/me/reward-claims)
   - 보유 리워드 목록 (미사용 / 사용 완료 탭)
   - 유효기간 및 발급일시 표시
   - 모바일 쿠폰 바코드/QR 제시 모달 + 매장 사용 처리 (POST /reward-claims/{claimId}/redeem)
   참고: redeem 성공 시 서버가 status를 "used"로 바꿔주는 것으로 확인됨. 바코드 하단 번호는
   교환 코드 필드가 없어 claimId 기반으로 결정적으로 생성한 10자리 숫자를 mock으로 표시한다.
   ========================================================================== */

// claimId를 시드로 항상 같은 10자리 숫자를 만들어내는 간단한 해시 (진짜 랜덤 대신 안정적으로 표시되도록)
function mockBarcodeCode(seed) {
  const s = String(seed);
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return String(h % 10000000000).padStart(10, "0");
}

function isRewardUsed(status) {
  return status?.toLowerCase() === "used";
}

// redeem 실패 응답의 에러 코드(REWARD_CLAIM_NOT_FOUND/ALREADY_USED/EXPIRED)를 안내 문구로 변환
function describeRedeemError(err) {
  const code = err?.data?.code || err?.data?.error;
  if (err?.status === 404 || code === "REWARD_CLAIM_NOT_FOUND") {
    return "본인 소유의 리워드가 아닙니다.";
  }
  if (code === "REWARD_CLAIM_ALREADY_USED") {
    return "이미 사용된 리워드입니다.";
  }
  if (code === "REWARD_CLAIM_EXPIRED") {
    return "유효기간이 지난 리워드입니다.";
  }
  return err?.message || "리워드 사용 처리에 실패했습니다.";
}

export default function RewardsPage() {
  const [status, setStatus] = useState("idle");
  const [rewards, setRewards] = useState([]);
  const [tab, setTab] = useState("unused"); // unused | used
  const [selectedReward, setSelectedReward] = useState(null);
  const [redeeming, setRedeeming] = useState(false);
  const [redeemError, setRedeemError] = useState(null);

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      const data = await rewardsApi.myRewards();
      setRewards(data);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // 매장 사용 완료 처리 (POST /reward-claims/{claimId}/redeem)
  const handleUseReward = async (claimId) => {
    setRedeeming(true);
    setRedeemError(null);
    try {
      await rewardsApi.redeem(claimId);
      setRewards((prev) =>
        prev.map((r) => (r.claimId === claimId ? { ...r, status: "used" } : r))
      );
      setSelectedReward(null);
    } catch (err) {
      setRedeemError(describeRedeemError(err));
    } finally {
      setRedeeming(false);
    }
  };

  const closeModal = () => {
    setSelectedReward(null);
    setRedeemError(null);
  };

  const filtered = rewards.filter((r) =>
    tab === "used" ? isRewardUsed(r.status) : !isRewardUsed(r.status)
  );

  return (
    <>
      <div className="st-topbar">
        <div className="st-topbar-title">리워드함</div>
      </div>

      <div className="st-scroll">
        {/* 미사용 / 사용완료 탭 */}
        <div
          style={{
            display: "flex",
            background: COLORS.surfaceAlt,
            borderRadius: 12,
            padding: 4,
            margin: "16px 0",
          }}
        >
          {[["unused", "미사용"], ["used", "사용완료"]].map(([k, label]) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              style={{
                flex: 1,
                padding: "10px 0",
                borderRadius: 9,
                border: "none",
                cursor: "pointer",
                fontWeight: 700,
                fontSize: 14,
                background: tab === k ? COLORS.surface : "transparent",
                color: tab === k ? COLORS.ink : COLORS.inkSoft,
                boxShadow: tab === k ? "0 1px 3px rgba(25,31,40,0.12)" : "none",
                transition: "all 0.15s ease",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {status === "loading" && <LoadingSkeletonList rows={3} />}
        {status === "error" && <ErrorState onRetry={load} />}

        {status === "success" && rewards.length === 0 && (
          <EmptyState
            title="받은 리워드가 없습니다"
            desc="코스를 완주하면 지역 상점 리워드 쿠폰이 이곳에 보관됩니다."
          />
        )}

        {status === "success" && rewards.length > 0 && filtered.length === 0 && (
          <EmptyState
            title={tab === "unused" ? "미사용 리워드가 없습니다" : "사용 완료된 리워드가 없습니다"}
            desc={tab === "unused" ? "새로운 코스를 완주해 보세요!" : "쿠폰을 매장에서 사용해 보세요."}
          />
        )}

        {status === "success" && filtered.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingBottom: 24 }}>
            {filtered.map((r) => {
              const isUnused = !isRewardUsed(r.status);

              return (
                <div
                  key={r.claimId}
                  className="st-card"
                  style={{
                    display: "flex",
                    gap: 14,
                    padding: "16px",
                    cursor: isUnused ? "pointer" : "default",
                    opacity: isUnused ? 1 : 0.6,
                    border: isUnused ? `1px solid ${COLORS.line}` : "none",
                  }}
                  onClick={() => isUnused && setSelectedReward(r)}
                >
                  {/* 리워드 썸네일 */}
                  <div
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 14,
                      backgroundImage: `url(${r.imageUrl || "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300"})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      flexShrink: 0,
                    }}
                  />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: isUnused ? COLORS.gold : COLORS.inkSoft, marginBottom: 3 }}>
                      {r.courseTitle || "코스 완주 리워드"}
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: COLORS.ink, marginBottom: 6 }}>
                      {r.rewardName}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: COLORS.inkSoft }}>
                      <Calendar size={13} />
                      <span>
                        {isUnused ? `유효기간: ~${r.validUntil}` : "사용 완료된 쿠폰"}
                      </span>
                    </div>
                  </div>

                  {isUnused && (
                    <div style={{ alignSelf: "center", flexShrink: 0 }}>
                      <span
                        style={{
                          background: COLORS.surfaceAlt,
                          padding: "6px 10px",
                          borderRadius: 8,
                          fontSize: 12,
                          fontWeight: 700,
                          color: COLORS.seal,
                        }}
                      >
                        사용하기
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 리워드 바코드/QR 모달 팝업 (매장 제시용) */}
      {selectedReward && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <div
            className="st-card"
            style={{
              width: "100%",
              maxWidth: 360,
              padding: "24px 20px",
              textAlign: "center",
              position: "relative",
              background: COLORS.surface,
              borderRadius: 24,
            }}
          >
            <button
              onClick={closeModal}
              style={{
                position: "absolute",
                top: 14,
                right: 14,
                background: "none",
                border: "none",
                cursor: "pointer",
                color: COLORS.inkSoft,
              }}
            >
              <X size={20} />
            </button>

            <div style={{ fontSize: 12, fontWeight: 800, color: COLORS.gold, marginBottom: 4 }}>
              STARTON REWARD COUPON
            </div>
            <div style={{ fontSize: 17, fontWeight: 800, color: COLORS.ink, marginBottom: 16 }}>
              {selectedReward.rewardName}
            </div>

            {/* 바코드 / QR 비주얼 영역 */}
            <div
              style={{
                background: COLORS.paper,
                padding: "20px 16px",
                borderRadius: 16,
                marginBottom: 16,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              {/* 더미 바코드 */}
              <div
                style={{
                  width: 200,
                  height: 60,
                  background: "repeating-linear-gradient(90deg, #191F28 0, #191F28 3px, transparent 3px, transparent 6px, #191F28 6px, #191F28 10px, transparent 10px, transparent 12px)",
                  marginBottom: 8,
                }}
              />
              <div style={{ fontFamily: "monospace", fontSize: 14, fontWeight: 800, letterSpacing: "0.1em", color: COLORS.ink }}>
                {mockBarcodeCode(selectedReward.claimId)}
              </div>
            </div>

            <div style={{ fontSize: 12, color: COLORS.inkSoft, marginBottom: 20 }}>
              매장 직원에게 위 바코드 또는 쿠폰 번호를 제시해 주세요.<br />
              유효기간: ~{selectedReward.validUntil}
            </div>

            {redeemError && (
              <div
                style={{
                  display: "flex", gap: 6, alignItems: "flex-start", fontSize: 12.5, color: COLORS.danger,
                  background: "rgba(240,68,82,0.08)", borderRadius: 10, padding: "10px 12px",
                  marginBottom: 14, textAlign: "left",
                }}
              >
                <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                <span>{redeemError}</span>
              </div>
            )}

            <button
              className="st-btn-primary"
              onClick={() => handleUseReward(selectedReward.claimId)}
              disabled={redeeming}
            >
              {redeeming ? <Loader2 size={16} className="st-spin" /> : <CheckCircle2 size={16} />}
              <span>{redeeming ? "처리 중..." : "매장 사용 완료 처리하기"}</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
