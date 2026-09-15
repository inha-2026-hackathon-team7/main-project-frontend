import { COLORS } from "../constants/colors.js";

/* ============================================================================
   전역 스타일
   ========================================================================== */
export default function GlobalStyle() {
  return (
    <style>{`
    html, body, #root {
      height: 100%;
      margin: 0;
    }
    .st-root {
      background: ${COLORS.line};
      color: ${COLORS.ink};
      font-family: -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo",
        "Pretendard", "Malgun Gothic", sans-serif;
      min-height: 100vh;
      min-height: 100dvh;
      display: flex;
      justify-content: center;
      box-sizing: border-box;
    }
    /* 430px를 넘는 화면에서는 모바일 레이아웃 폭을 고정하고,
       좌우 남는 공간은 filler(.st-root 배경)가 채운다 */
    .st-frame {
      width: 100%;
      max-width: 430px;
      background: ${COLORS.paper};
      box-shadow: 0 0 0 1px ${COLORS.line};
      position: relative;
      min-height: 100vh;
      min-height: 100dvh;
      display: flex;
      flex-direction: column;
    }
    .st-topbar {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 20px 20px 14px;
      flex-shrink: 0;
      background: ${COLORS.paper};
    }
    .st-topbar-title {
      font-size: 20px;
      font-weight: 800;
      letter-spacing: -0.03em;
      flex: 1;
    }
    .st-iconbtn {
      background: none;
      border: none;
      padding: 6px;
      margin: -6px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 10px;
      color: ${COLORS.ink};
      cursor: pointer;
    }
    .st-iconbtn:hover { background: rgba(25,31,40,0.05); }
    .st-iconbtn:focus-visible { outline: 2px solid ${COLORS.seal}; outline-offset: 2px; }

    .st-scroll {
      flex: 1;
      overflow-y: auto;
      padding: 0 20px 100px;
    }
    /* 하단 탭바가 sticky(실제 레이아웃 공간 차지)로 바뀌면서, 탭바가 없던 시절
       겹침 방지용으로 잡아뒀던 넉넉한 하단 여백이 탭바 높이만큼 이중으로 남는다.
       탭바가 실제로 다음 형제로 존재하는 화면(코스 목록/리워드함/마이페이지)에서만
       여백을 좁혀 원래 의도한 간격으로 되돌린다. */
    .st-scroll:has(+ .st-bottomnav) {
      padding-bottom: 20px;
    }

    .st-card {
      background: ${COLORS.surface};
      border-radius: 20px;
      padding: 16px;
      box-shadow: 0 1px 2px rgba(25,31,40,0.04), 0 2px 12px rgba(25,31,40,0.05);
    }

    .st-chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      border-radius: 999px;
      font-size: 13px;
      font-weight: 700;
      border: none;
      background: ${COLORS.surface};
      color: ${COLORS.inkSoft};
      cursor: pointer;
      white-space: nowrap;
      flex-shrink: 0;
    }
    .st-chip[data-active="true"] {
      background: ${COLORS.seal};
      color: #FFFFFF;
    }
    .st-chip:focus-visible { outline: 2px solid ${COLORS.seal}; outline-offset: 2px; }

    .st-btn-primary {
      width: 100%;
      background: ${COLORS.seal};
      color: #FFFFFF;
      border: none;
      border-radius: 16px;
      padding: 15px;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    .st-btn-primary:hover { background: ${COLORS.sealDark}; }
    .st-btn-primary:disabled { opacity: 0.45; cursor: not-allowed; }
    .st-btn-primary:focus-visible { outline: 2px solid ${COLORS.ink}; outline-offset: 2px; }

    .st-btn-ghost {
      background: ${COLORS.surfaceAlt};
      border: none;
      color: ${COLORS.ink};
      border-radius: 16px;
      padding: 13px;
      font-weight: 700;
      font-size: 14px;
      cursor: pointer;
    }
    .st-btn-ghost:hover { background: #E5E8EB; }
    .st-btn-ghost:focus-visible { outline: 2px solid ${COLORS.seal}; outline-offset: 2px; }

    .st-input {
      width: 100%;
      background: ${COLORS.surfaceAlt};
      border: 1.5px solid transparent;
      border-radius: 14px;
      padding: 14px 15px;
      font-size: 15px;
      color: ${COLORS.ink};
      box-sizing: border-box;
    }
    .st-input:focus-visible, .st-input:focus {
      outline: none;
      border-color: ${COLORS.seal};
      background: ${COLORS.surface};
    }
    .st-input::placeholder { color: #B0B8C1; }
    .st-input[data-error="true"] { border-color: ${COLORS.danger}; }

    .st-textarea {
      width: 100%;
      min-height: 96px;
      background: ${COLORS.surfaceAlt};
      border: 1.5px solid transparent;
      border-radius: 14px;
      padding: 14px 15px;
      font-size: 15px;
      font-family: inherit;
      color: ${COLORS.ink};
      box-sizing: border-box;
      resize: vertical;
    }
    .st-textarea:focus-visible, .st-textarea:focus {
      outline: none;
      border-color: ${COLORS.seal};
      background: ${COLORS.surface};
    }
    .st-textarea::placeholder { color: #B0B8C1; }
    .st-textarea[data-error="true"] { border-color: ${COLORS.danger}; }

    .st-label {
      font-size: 12.5px;
      font-weight: 700;
      color: ${COLORS.inkSoft};
      margin-bottom: 6px;
      display: block;
    }
    .st-fieldmsg { font-size: 12px; color: ${COLORS.danger}; margin-top: 5px; font-weight: 600; }

    .st-bottomnav {
      position: sticky;
      bottom: 0;
      background: ${COLORS.surface};
      box-shadow: 0 -1px 0 rgba(25,31,40,0.05), 0 -8px 24px rgba(25,31,40,0.05);
      display: flex;
      padding: 8px 6px calc(8px + env(safe-area-inset-bottom, 0px));
    }
    .st-navitem {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 3px;
      background: none;
      border: none;
      padding: 6px 0;
      cursor: pointer;
      color: #B0B8C1;
      font-size: 11px;
      font-weight: 700;
      border-radius: 10px;
    }
    .st-navitem[data-active="true"] { color: ${COLORS.seal}; }
    .st-navitem:focus-visible { outline: 2px solid ${COLORS.seal}; outline-offset: -2px; }

    /* 스탬프 카운트 배지 - 포인트 컬러를 꽉 채운 원형 배지 */
    .st-stamp {
      width: 46px;
      height: 46px;
      border-radius: 999px;
      background: ${COLORS.seal};
      color: #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 13px;
      flex-shrink: 0;
    }

    .st-usedstamp { opacity: 0.55; }

    .st-skel {
      background: linear-gradient(90deg, #EDEEF0 25%, #E1E4E8 50%, #EDEEF0 75%);
      background-size: 200% 100%;
      animation: st-shimmer 1.3s infinite;
      border-radius: 12px;
    }
    @keyframes st-shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    .st-spin { animation: st-spin 0.9s linear infinite; }
    @keyframes st-spin { to { transform: rotate(360deg); } }

    .st-devbar {
      display: flex;
      gap: 6px;
      padding: 10px 20px;
      flex-wrap: wrap;
      background: #E8EBEF;
    }
    .st-devbtn {
      font-size: 11px;
      font-weight: 700;
      padding: 5px 10px;
      border-radius: 999px;
      border: none;
      background: ${COLORS.surface};
      color: ${COLORS.inkSoft};
      cursor: pointer;
    }
    .st-devbtn[data-active="true"] { background: ${COLORS.ink}; color: ${COLORS.surface}; }

    /* Map Styles */
    .st-map-container {
      width: 100%;
      height: 280px;
      border-radius: 20px;
      overflow: hidden;
      position: relative;
      background: #e5e9ec;
      box-shadow: 0 4px 16px rgba(25, 31, 40, 0.06);
    }
    .st-map-full {
      width: 100%;
      height: 100%;
    }
    .st-map-pin {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: ${COLORS.surface};
      color: ${COLORS.ink};
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 800;
      box-shadow: 0 3px 8px rgba(0,0,0,0.25);
      border: 2.5px solid ${COLORS.seal};
      transition: transform 0.2s;
    }
    .st-map-pin.done {
      background: ${COLORS.leaf};
      border-color: #ffffff;
      color: #ffffff;
    }
    .st-map-pin.target {
      background: ${COLORS.seal};
      border-color: #ffffff;
      color: #ffffff;
      transform: scale(1.15);
      animation: st-pin-bounce 1.4s infinite ease-in-out;
    }
    .st-map-pin.selected {
      background: ${COLORS.seal};
      border-color: #ffffff;
      color: #ffffff;
    }
    .st-user-marker {
      width: 18px;
      height: 18px;
      background: #2272EB;
      border: 3px solid #ffffff;
      border-radius: 50%;
      box-shadow: 0 0 10px rgba(34,114,235,0.7);
      position: relative;
    }
    .st-user-marker::after {
      content: "";
      position: absolute;
      top: -8px; left: -8px;
      width: 28px; height: 28px;
      border-radius: 50%;
      background: rgba(34,114,235,0.3);
      animation: st-pulse 2s infinite ease-out;
    }
    @keyframes st-pulse {
      0% { transform: scale(0.6); opacity: 1; }
      100% { transform: scale(2.2); opacity: 0; }
    }
    @keyframes st-pin-bounce {
      0%, 100% { transform: scale(1.15) translateY(0); }
      50% { transform: scale(1.15) translateY(-5px); }
    }

    /* Progress bar */
    .st-progress-track {
      width: 100%;
      height: 8px;
      background: ${COLORS.surfaceAlt};
      border-radius: 999px;
      overflow: hidden;
    }
    .st-progress-fill {
      height: 100%;
      background: linear-gradient(90deg, ${COLORS.seal}, #00C48C);
      border-radius: 999px;
      transition: width 0.4s ease;
    }

    /* Stamp Animations */
    @keyframes st-stamp-slam {
      0% { transform: scale(2.6) rotate(-15deg); opacity: 0; }
      60% { transform: scale(0.92) rotate(4deg); opacity: 1; }
      80% { transform: scale(1.04) rotate(-1deg); }
      100% { transform: scale(1) rotate(0deg); opacity: 1; }
    }
    .st-stamp-animate {
      animation: st-stamp-slam 0.65s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
    }

    /* Scanner Viewfinder */
    .st-scanner-box {
      width: 220px;
      height: 220px;
      border: 3px solid ${COLORS.seal};
      border-radius: 24px;
      position: relative;
      box-shadow: 0 0 0 4000px rgba(0, 0, 0, 0.45);
      overflow: hidden;
    }
    .st-scanner-laser {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, transparent, #3182F6, transparent);
      box-shadow: 0 0 10px #3182F6;
      animation: st-laser 2s infinite ease-in-out;
    }
    @keyframes st-laser {
      0% { top: 5%; }
      50% { top: 92%; }
      100% { top: 5%; }
    }

    @media (prefers-reduced-motion: reduce) {
      .st-skel, .st-spin, .st-stamp-animate, .st-scanner-laser, .st-map-pin.target { animation: none; }
    }
  `}</style>
  );
}
