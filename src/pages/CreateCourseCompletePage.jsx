import { useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Compass, MapPinned, Sparkles } from "lucide-react";
import { COLORS } from "../constants/colors.js";

/* ============================================================================
   코스 만들기 3단계. 생성 완료 (POST /courses 성공 이후)
   - 사용자 코스는 리워드가 없으므로 완주 화면과 달리 리워드 수령 UI가 없다.
   - 코스는 이미 게시(published)된 상태라 바로 상세로 이동할 수 있다.
   ========================================================================== */

export default function CreateCourseCompletePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const course = location.state?.course;

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
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div
            className="st-stamp-animate"
            style={{
              width: 88,
              height: 88,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${COLORS.seal}, ${COLORS.sealDark})`,
              margin: "0 auto 18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              boxShadow: "0 12px 30px rgba(49, 130, 246, 0.4)",
            }}
          >
            <MapPinned size={44} />
          </div>

          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              padding: "4px 10px",
              borderRadius: 999,
              background: "rgba(49, 130, 246, 0.12)",
              color: COLORS.seal,
              fontSize: 12,
              fontWeight: 800,
              marginBottom: 8,
            }}
          >
            <Sparkles size={14} />
            <span>COURSE PUBLISHED</span>
          </div>

          <div style={{ fontSize: 22, fontWeight: 800, color: COLORS.ink, marginBottom: 6 }}>
            {course ? `"${course.name}" 코스가 생성됐어요!` : "코스가 생성됐어요!"}
          </div>
          <div style={{ fontSize: 13, color: COLORS.inkSoft, lineHeight: 1.5 }}>
            다른 사용자들도 지금 바로 이 코스를 볼 수 있어요.
            <br />
            관리자가 검토 후 보너스 리워드를 연결해 줄 수도 있어요.
          </div>
        </div>

        {course && (
          <div className="st-card" style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: COLORS.ink, marginBottom: 4 }}>
              {course.name}
            </div>
            {course.description && (
              <div style={{ fontSize: 13, color: COLORS.inkSoft, lineHeight: 1.5, marginBottom: 8 }}>
                {course.description}
              </div>
            )}
            <div style={{ fontSize: 12, color: COLORS.seal, fontWeight: 700 }}>
              스탬프 {course.places?.length || 0}곳
            </div>
          </div>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {course ? (
          <button className="st-btn-primary" onClick={() => navigate(`/courses/${course.id}`)}>
            <span>내 코스 보러가기</span>
            <ArrowRight size={17} />
          </button>
        ) : null}
        <button className="st-btn-ghost" onClick={() => navigate("/courses")}>
          <Compass size={17} style={{ marginRight: 6, verticalAlign: "-3px" }} />
          <span>코스 목록으로</span>
        </button>
      </div>
    </div>
  );
}
