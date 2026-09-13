import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Building2 } from "lucide-react";
import { COLORS } from "../constants/colors.js";
import { organizationsApi } from "../services/api.js";
import LoadingSkeletonList from "../components/common/LoadingSkeletonList.jsx";
import ErrorState from "../components/common/ErrorState.jsx";
import EmptyState from "../components/common/EmptyState.jsx";

/* ============================================================================
   코스 만들기 1단계. 조직 선택 (GET /organizations)
   - 어떤 조직의 장소들로 코스를 만들지 먼저 고른다.
   ========================================================================== */

const ORG_TYPE_LABEL = {
  government: "공공기관",
  company: "기업",
  facility: "시설",
};

export default function PickOrganizationPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [organizations, setOrganizations] = useState([]);

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      const data = await organizationsApi.list();
      setOrganizations(data);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }, []);

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
          코스를 만들 지역/조직을 먼저 선택해 주세요. 선택한 조직의 장소들로 코스를 구성할 수 있어요.
        </p>

        {status === "loading" && <LoadingSkeletonList />}

        {status === "error" && <ErrorState onRetry={load} />}

        {status === "success" && organizations.length === 0 && (
          <EmptyState title="선택할 수 있는 조직이 없습니다" desc="잠시 후 다시 시도해 주세요." />
        )}

        {status === "success" && organizations.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {organizations.map((org) => (
              <div
                key={org.id}
                className="st-card"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  cursor: "pointer",
                }}
                onClick={() => navigate(`/create-course/${org.id}`)}
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
                  <Building2 size={20} color={COLORS.seal} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: COLORS.ink, marginBottom: 2 }}>
                    {org.name}
                  </div>
                  <div style={{ fontSize: 12.5, color: COLORS.inkSoft, fontWeight: 600 }}>
                    {ORG_TYPE_LABEL[org.type] || org.type}
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
