import { useCallback, useEffect, useState } from "react";
import { Gift, Calendar, QrCode, X, CheckCircle2, Ticket } from "lucide-react";
import { COLORS } from "../constants/colors.js";
import { rewardsApi, getStoredState, saveStoredState } from "../services/api.js";
import LoadingSkeletonList from "../components/common/LoadingSkeletonList.jsx";
import ErrorState from "../components/common/ErrorState.jsx";
import EmptyState from "../components/common/EmptyState.jsx";
import DevStateSwitcher from "../components/common/DevStateSwitcher.jsx";

/* ============================================================================
   화면 9. 리워드함 (GET /users/me/reward-claims)
   - 보유 리워드 목록 (미사용 / 사용 완료 탭)
   - 유효기간 및 발급일시 표시
   - 모바일 쿠폰 바코드/QR 제시 모달
   ========================================================================== */

export default function RewardsPage() {
  const [mode, setMode] = useState("success");
  const [status, setStatus] = useState("idle");
  const [rewards, setRewards] = useState([]);
  const [tab, setTab] = useState("unused"); // unused | used
  const [selectedReward, setSelectedReward] = useState(null);

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      if (mode === "error") throw new Error("MOCK_ERROR");
      if (mode === "empty") {
        setRewards([]);
        setStatus("success");
        return;
      }
      const data = await rewardsApi.myRewards();
      setRewards(data);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }, [mode]);

  useEffect(() => {
    load();
  }, [load]);

  // 사용 완료 토글 (매장 사용 시뮬레이션)
  const handleUseReward = (claimId) => {
    const state = getStoredState();
    const item = state.rewards.find((r) => r.claim_id === claimId);
    if (item) {
      item.status = "used";
      saveStoredState(state);
      setRewards([...state.rewards]);
      setSelectedReward(null);
    }
  };

  const filtered = rewards.filter((r) => r.status === tab);

  return (
    <>
      <div className="st-topbar">
        <div className="st-topbar-title">리워드함</div>
      </div>

      <DevStateSwitcher mode={mode} setMode={setMode} />

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
              const isUnused = r.status === "unused";

              return (
                <div
                  key={r.claim_id}
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
                      backgroundImage: `url(${r.image_url || "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300"})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      flexShrink: 0,
                    }}
                  />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: isUnused ? COLORS.gold : COLORS.inkSoft, marginBottom: 3 }}>
                      {r.course_title || "코스 완주 리워드"}
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: COLORS.ink, marginBottom: 6 }}>
                      {r.reward_name}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: COLORS.inkSoft }}>
                      <Calendar size={13} />
                      <span>
                        {isUnused ? `유효기간: ~${r.valid_until}` : "사용 완료된 쿠폰"}
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
              onClick={() => setSelectedReward(null)}
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
              {selectedReward.reward_name}
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
                {selectedReward.code || "ST-9982-1049"}
              </div>
            </div>

            <div style={{ fontSize: 12, color: COLORS.inkSoft, marginBottom: 20 }}>
              매장 직원에게 위 바코드 또는 쿠폰 번호를 제시해 주세요.<br />
              유효기간: ~{selectedReward.valid_until}
            </div>

            <button
              className="st-btn"
              onClick={() => handleUseReward(selectedReward.claim_id)}
            >
              <CheckCircle2 size={16} />
              <span>매장 사용 완료 처리하기</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
