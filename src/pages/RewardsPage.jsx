import { useCallback, useEffect, useState } from "react";
import { Gift } from "lucide-react";
import { COLORS } from "../constants/colors.js";
import { mockFetch } from "../mock/api.js";
import { MOCK_REWARDS } from "../mock/data.js";
import LoadingSkeletonList from "../components/common/LoadingSkeletonList.jsx";
import ErrorState from "../components/common/ErrorState.jsx";
import EmptyState from "../components/common/EmptyState.jsx";
import DevStateSwitcher from "../components/common/DevStateSwitcher.jsx";

/* ============================================================================
   화면 4. 리워드함 (GET /users/me/reward-claims)
   ========================================================================== */
export default function RewardsPage() {
  const [mode, setMode] = useState("success");
  const [status, setStatus] = useState("idle");
  const [rewards, setRewards] = useState([]);
  const [tab, setTab] = useState("unused"); // unused | used

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      const data = await mockFetch(mode, MOCK_REWARDS, []);
      setRewards(data);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }, [mode]);

  useEffect(() => { load(); }, [load]);

  const filtered = rewards.filter((r) => r.status === tab);

  return (
    <>
      <div className="st-topbar"><div className="st-topbar-title">리워드함</div></div>
      <DevStateSwitcher mode={mode} setMode={setMode} />
      <div className="st-scroll">
        <div style={{ display: "flex", background: COLORS.surfaceAlt, borderRadius: 12, padding: 4, margin: "16px 0" }}>
          {[["unused", "미사용"], ["used", "사용완료"]].map(([k, label]) => (
            <button key={k} onClick={() => setTab(k)} style={{
              flex: 1, padding: "10px 0", borderRadius: 9, border: "none", cursor: "pointer",
              fontWeight: 700, fontSize: 14,
              background: tab === k ? COLORS.surface : "transparent",
              color: tab === k ? COLORS.ink : COLORS.inkSoft,
              boxShadow: tab === k ? "0 1px 3px rgba(25,31,40,0.12)" : "none",
            }}>{label}</button>
          ))}
        </div>

        {status === "loading" && <LoadingSkeletonList rows={3} />}
        {status === "error" && <ErrorState onRetry={load} />}

        {status === "success" && rewards.length === 0 && (
          <EmptyState title="받은 리워드가 없습니다" desc="코스를 완주하면 지역 리워드가 이곳에 도착합니다." />
        )}

        {status === "success" && rewards.length > 0 && filtered.length === 0 && (
          <EmptyState
            title={tab === "unused" ? "사용 가능한 리워드가 없습니다" : "사용한 리워드가 없습니다"}
            desc={tab === "unused" ? "코스를 완주하면 새 리워드를 받을 수 있어요." : "리워드를 사용하면 이곳에서 확인할 수 있어요."}
          />
        )}

        {status === "success" && filtered.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingBottom: 4 }}>
            {filtered.map((r) => (
              <div key={r.id} className={`st-card ${r.status === "used" ? "st-usedstamp" : ""}`}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                  <div>
                    <div style={{ fontSize: 11.5, fontWeight: 700, color: COLORS.gold }}>{r.region}</div>
                    <div style={{ fontWeight: 800, fontSize: 15, marginTop: 3 }}>{r.title}</div>
                    <div style={{ fontSize: 12, color: COLORS.inkSoft, marginTop: 4 }}>{r.courseTitle} 완주 리워드</div>
                  </div>
                  <Gift size={20} color={COLORS.gold} style={{ flexShrink: 0 }} />
                </div>
                {r.status === "used" && (
                  <div style={{
                    display: "inline-block", marginTop: 10, fontSize: 11, fontWeight: 700,
                    color: COLORS.inkSoft, background: COLORS.surfaceAlt, borderRadius: 999, padding: "3px 9px",
                  }}>사용완료</div>
                )}
                <div style={{
                  marginTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center",
                  borderTop: `1px solid ${COLORS.line}`, paddingTop: 10,
                }}>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>{r.code}</span>
                  <span style={{ fontSize: 11.5, color: COLORS.inkSoft }}>{r.expiresAt} 까지</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
