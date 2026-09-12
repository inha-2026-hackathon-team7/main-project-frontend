import { COLORS } from "../../constants/colors.js";

/* 개발용 상태 시뮬레이터: 백엔드 부재 상황에서 로딩/성공/에러/빈 상태를 눈으로 확인하기 위한 도구 */
export default function DevStateSwitcher({ mode, setMode }) {
  const opts = [
    { k: "loading", label: "로딩" },
    { k: "success", label: "성공" },
    { k: "error", label: "에러" },
    { k: "empty", label: "빈 데이터" },
  ];
  return (
    <div className="st-devbar">
      <span style={{ fontSize: 11, fontWeight: 700, color: COLORS.inkSoft, alignSelf: "center", marginRight: 2 }}>
        상태 시뮬레이션
      </span>
      {opts.map((o) => (
        <button
          key={o.k}
          className="st-devbtn"
          data-active={mode === o.k}
          onClick={() => setMode(o.k)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
