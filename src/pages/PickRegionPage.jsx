import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { COLORS } from "../constants/colors.js";
import { organizationsApi } from "../services/api.js";
import LoadingSkeletonList from "../components/common/LoadingSkeletonList.jsx";
import ErrorState from "../components/common/ErrorState.jsx";
import EmptyState from "../components/common/EmptyState.jsx";

/* ============================================================================
   코스 만들기 2단계. 지역 선택 (GET /organizations/{organizationId}/regions)
   - 선택한 조직 안에서 어느 지역의 장소들로 코스를 구성할지 고른다.
   ========================================================================== */

export default function PickRegionPage() {
  const { organizationId } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [regions, setRegions] = useState([]);

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      const data = await organizationsApi.listRegions(organizationId);
      setRegions(data);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }, [organizationId]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <>
      <div className="st-topbar">
        <button className="st-iconbtn" onClick={() => navigate(-1)} aria-label="뒤로 가기">
          <ChevronLeft size={22} />
        </button>
        <div className="st-topbar-title">코스 만들기</div>
      </div>

      <div className="st-scroll">
        <p style={{ fontSize: 13.5, color: COLORS.inkSoft, lineHeight: 1.55, margin: "0 0 18px" }}>
          어느 지역의 장소들로 코스를 구성할지 선택해 주세요.
        </p>

        {status === "loading" && <LoadingSkeletonList />}

        {status === "error" && <ErrorState onRetry={load} />}

        {status === "success" && regions.length === 0 && (
          <EmptyState title="선택할 수 있는 지역이 없습니다" desc="잠시 후 다시 시도해 주세요." />
        )}

        {status === "success" && regions.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {regions.map((region) => (
              <div
                key={region.id}
                className="st-card"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  cursor: "pointer",
                }}
                onClick={() => navigate(`/create-course/${organizationId}/${region.id}`)}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: COLORS.surfaceAlt,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <MapPin size={20} color={COLORS.seal} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: COLORS.ink, marginBottom: 2 }}>
                    {region.name}
                  </div>
                  <div style={{ fontSize: 12.5, color: COLORS.inkSoft, fontWeight: 600 }}>
                    {region.type ? `${region.type} · ` : ""}장소 {region.placeCount || 0}곳
                  </div>
                </div>
                <ChevronRight size={18} color={COLORS.inkSoft} />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
