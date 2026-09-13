import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AlertCircle, ChevronLeft, Loader2, MapPin, X } from "lucide-react";
import { COLORS } from "../constants/colors.js";
import { coursesApi, organizationsApi } from "../services/api.js";
import PlacePickerMap from "../components/map/PlacePickerMap.jsx";
import LoadingSkeletonList from "../components/common/LoadingSkeletonList.jsx";
import ErrorState from "../components/common/ErrorState.jsx";
import EmptyState from "../components/common/EmptyState.jsx";

/* ============================================================================
   코스 만들기 2단계. 제목/설명 + 장소 선택 (POST /courses)
   - 선택한 순서 그대로 방문 순서(visitOrder)가 된다.
   - 최소 2개 이상의 장소를 선택해야 코스를 만들 수 있다.
   ========================================================================== */

const MIN_PLACES = 2;

export default function CreateCoursePage() {
  const { organizationId } = useParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState("loading"); // loading | success | error
  const [places, setPlaces] = useState([]);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedPlaceIds, setSelectedPlaceIds] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      const data = await organizationsApi.listPlaces(organizationId);
      setPlaces(data);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }, [organizationId]);

  useEffect(() => {
    load();
  }, [load]);

  const togglePlace = (placeId) => {
    setSelectedPlaceIds((prev) =>
      prev.includes(placeId) ? prev.filter((id) => id !== placeId) : [...prev, placeId]
    );
  };

  const canSubmit = name.trim().length > 0 && selectedPlaceIds.length >= MIN_PLACES;

  const handleSubmit = async () => {
    const nextErrors = {};
    if (!name.trim()) nextErrors.name = "코스 제목을 입력해 주세요";
    if (selectedPlaceIds.length < MIN_PLACES) {
      nextErrors.places = `장소를 최소 ${MIN_PLACES}개 이상 선택해 주세요`;
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitError(null);
    setSubmitting(true);
    try {
      const course = await coursesApi.create({
        organizationId,
        name: name.trim(),
        description: description.trim() || undefined,
        placeIds: selectedPlaceIds,
      });
      navigate(`/create-course/${organizationId}/complete`, { state: { course } });
    } catch (err) {
      setSubmitError(err.message || "코스 생성에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="st-topbar">
        <button className="st-iconbtn" onClick={() => navigate(-1)} aria-label="뒤로 가기">
          <ChevronLeft size={22} />
        </button>
        <div className="st-topbar-title">코스 만들기</div>
      </div>

      <div className="st-scroll" style={{ paddingBottom: 100 }}>
        {status === "loading" && <LoadingSkeletonList />}

        {status === "error" && <ErrorState onRetry={load} />}

        {status === "success" && places.length === 0 && (
          <EmptyState title="등록된 장소가 없습니다" desc="이 조직에는 아직 코스로 만들 장소가 없어요." />
        )}

        {status === "success" && places.length > 0 && (
          <>
            <div style={{ marginBottom: 18 }}>
              <label className="st-label" htmlFor="course-name">코스 제목</label>
              <input
                id="course-name"
                className="st-input"
                data-error={!!errors.name}
                placeholder="예: 성수동 카페 골목 산책"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              {errors.name && <div className="st-fieldmsg">{errors.name}</div>}
            </div>

            <div style={{ marginBottom: 20 }}>
              <label className="st-label" htmlFor="course-description">코스 소개 (선택)</label>
              <textarea
                id="course-description"
                className="st-textarea"
                placeholder="이 코스를 어떻게 소개하고 싶나요?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: COLORS.ink, marginBottom: 4 }}>
                장소 선택 ({selectedPlaceIds.length}/{MIN_PLACES}개 이상)
              </div>
              <p style={{ fontSize: 12.5, color: COLORS.inkSoft, margin: "0 0 12px" }}>
                지도의 핀을 탭하거나 목록에서 선택해 주세요. 선택한 순서대로 방문 순서가 정해져요.
              </p>
            </div>

            <div style={{ marginBottom: 16 }}>
              <PlacePickerMap
                places={places}
                selectedPlaceIds={selectedPlaceIds}
                onTogglePlace={togglePlace}
              />
            </div>

            {errors.places && (
              <div className="st-fieldmsg" style={{ marginBottom: 10 }}>{errors.places}</div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {places.map((p) => {
                const order = selectedPlaceIds.indexOf(p.id);
                const isSelected = order !== -1;
                return (
                  <div
                    key={p.id}
                    className="st-card"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "12px 14px",
                      cursor: "pointer",
                      border: isSelected ? `1.5px solid ${COLORS.seal}` : "1.5px solid transparent",
                    }}
                    onClick={() => togglePlace(p.id)}
                  >
                    <div
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: "50%",
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 800,
                        fontSize: 13,
                        background: isSelected ? COLORS.seal : COLORS.surfaceAlt,
                        color: isSelected ? "#fff" : COLORS.inkSoft,
                      }}
                    >
                      {isSelected ? order + 1 : <MapPin size={14} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14.5, fontWeight: 700, color: COLORS.ink }}>{p.name}</div>
                      {p.regionName && (
                        <div style={{ fontSize: 12, color: COLORS.inkSoft }}>{p.regionName}</div>
                      )}
                    </div>
                    {isSelected && (
                      <button
                        className="st-iconbtn"
                        aria-label="선택 해제"
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePlace(p.id);
                        }}
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {submitError && (
              <div style={{
                display: "flex", gap: 8, alignItems: "flex-start", fontSize: 13, color: COLORS.danger,
                background: "rgba(240,68,82,0.08)", borderRadius: 10, padding: "10px 12px", marginTop: 16,
              }}>
                <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
                <span>{submitError}</span>
              </div>
            )}
          </>
        )}
      </div>

      {status === "success" && places.length > 0 && (
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
          <button className="st-btn-primary" onClick={handleSubmit} disabled={!canSubmit || submitting}>
            {submitting ? <Loader2 size={18} className="st-spin" /> : null}
            <span>{submitting ? "만드는 중..." : "코스 만들기 완료"}</span>
          </button>
        </div>
      )}
    </>
  );
}
