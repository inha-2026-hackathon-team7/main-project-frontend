import React, { useState, useEffect, useCallback } from "react";
import {
  MapPin, QrCode, Nfc, MessageCircle, Heart, ChevronLeft, User, Gift,
  LogOut, AlertCircle, Inbox, Loader2, Search, Check, Star, Calendar,
  Compass, Send, Sprout,
} from "lucide-react";

/* ============================================================================
   디자인 토큰
   컨셉: "토스"류 핀테크 앱의 정돈된 느낌 — 옅은 회색 배경 위에 흰 카드를
   그림자로 띄우고, 파랑 하나를 포인트로 또렷하게 쓴다. 테두리는 최소화하고
   면과 그림자로 위계를 만든다.
   ========================================================================== */
const COLORS = {
  paper: "#F2F4F6",       // 배경: 옅은 그레이
  surface: "#FFFFFF",     // 카드 표면
  surfaceAlt: "#F2F4F6",  // 보조 표면 (입력폼 채움)
  ink: "#191F28",         // 본문 텍스트 (짙은 네이비 블랙)
  inkSoft: "#8B95A1",     // 보조 텍스트
  line: "#E5E8EB",        // 최소한으로만 쓰는 구분선
  seal: "#3182F6",        // 포인트 컬러 (버튼/강조/활성 상태)
  sealDark: "#2272EB",
  gold: "#FF8B3E",        // 리워드 강조 (오렌지)
  leaf: "#00C48C",        // 완료/성공
  danger: "#F04452",
};

/* ============================================================================
   전역 스타일
   ========================================================================== */
const GlobalStyle = () => (
  <style>{`
    .st-root {
      background: ${COLORS.paper};
      color: ${COLORS.ink};
      font-family: -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo",
        "Pretendard", "Malgun Gothic", sans-serif;
      min-height: 100vh;
      display: flex;
      justify-content: center;
      padding: 24px 12px;
      box-sizing: border-box;
    }
    .st-frame {
      width: 100%;
      max-width: 430px;
      background: ${COLORS.paper};
      border-radius: 28px;
      box-shadow: 0 1px 2px rgba(25,31,40,0.04), 0 16px 40px rgba(25,31,40,0.12);
      overflow: hidden;
      position: relative;
      min-height: 780px;
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

    .st-label {
      font-size: 12.5px;
      font-weight: 700;
      color: ${COLORS.inkSoft};
      margin-bottom: 6px;
      display: block;
    }
    .st-fieldmsg { font-size: 12px; color: ${COLORS.danger}; margin-top: 5px; font-weight: 600; }

    .st-bottomnav {
      position: absolute;
      left: 0; right: 0; bottom: 0;
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


    @media (prefers-reduced-motion: reduce) {
      .st-skel, .st-spin { animation: none; }
    }
  `}</style>
);

/* ============================================================================
   Mock 데이터
   백엔드 API 명세서(P0)의 Response 필드 구조를 그대로 따르는 더미 데이터.
   ========================================================================== */
const MOCK_COURSES = [
  { id: "c1", title: "영도 해안 벽화 골목", region: "부산 영도구", category: "예술/벽화", distance: "2.4km", durationMin: 70, stampCount: 4, summary: "바다를 낀 좁은 골목마다 숨은 벽화를 따라 걷는 코스", tag: "인기" },
  { id: "c2", title: "청년몰 야시장 먹부림", region: "전주 완산구", category: "먹거리", distance: "1.1km", durationMin: 50, stampCount: 3, summary: "청년 상인들이 운영하는 야시장 상점을 도장 깨듯 방문", tag: "신규" },
  { id: "c3", title: "폐역이 된 간이역 기행", region: "정선군", category: "역사/철도", distance: "6.8km", durationMin: 140, stampCount: 5, summary: "운행을 멈춘 간이역 다섯 곳을 잇는 반나절 여정", tag: null },
  { id: "c4", title: "동네 책방 지도", region: "제주 조천읍", category: "문화/서점", distance: "3.2km", durationMin: 90, stampCount: 4, summary: "각기 다른 개성의 독립서점을 돌며 도장을 모으는 코스", tag: null },
];

const MOCK_COURSE_DETAIL = {
  c1: {
    id: "c1", title: "영도 해안 벽화 골목", region: "부산 영도구", category: "예술/벽화",
    description: "흰여울문화마을부터 절영해안산책로까지, 주민들이 직접 그린 벽화 12점이 남아있는 좁은 골목을 따라 걷습니다. 스탬프 4개를 모두 찍으면 완주 리워드가 발급됩니다.",
    stamps: [
      { id: "s1", order: 1, name: "흰여울 전망대", type: "GPS", location: "부산 영도구 흰여울길 전망대 앞" },
      { id: "s2", order: 2, name: "물양장 벽화거리", type: "QR", location: "안내판 하단 QR 코드 스캔" },
      { id: "s3", order: 3, name: "절영 서점", type: "NFC", location: "서점 카운터 옆 NFC 태그" },
      { id: "s4", order: 4, name: "감지해변 포토존", type: "GPS", location: "부산 영도구 감지해변로" },
    ],
    comments: [
      { id: "m1", user: "바다냥", text: "골목이 진짜 예뻐요, 3번째 스탬프 서점에서 커피도 팔아요", date: "9.10", likes: 6 },
      { id: "m2", user: "해운대러버", text: "저녁 노을 시간대 추천합니다", date: "9.11", likes: 3 },
    ],
  },
  c2: {
    id: "c2", title: "청년몰 야시장 먹부림", region: "전주 완산구", category: "먹거리",
    description: "전주 청년몰 야시장의 이색 먹거리 상점 세 곳을 방문하고 도장을 모으는 코스입니다.",
    stamps: [
      { id: "s1", order: 1, name: "가맥 포차", type: "QR", location: "매대 앞 QR 스티커" },
      { id: "s2", order: 2, name: "수제 소떡 노점", type: "NFC", location: "계산대 NFC 태그" },
      { id: "s3", order: 3, name: "야시장 중앙광장", type: "GPS", location: "전주 완산구 청년몰 중앙광장" },
    ],
    comments: [],
  },
};

const MOCK_REWARDS = [
  { id: "r1", title: "영도 흰여울 카페 아메리카노 교환권", region: "부산 영도구", code: "YD-2291", status: "unused", expiresAt: "2026-10-31", courseTitle: "영도 해안 벽화 골목" },
  { id: "r2", title: "완산 청년몰 상품권 5,000원", region: "전주 완산구", code: "JJ-1183", status: "used", expiresAt: "2026-09-30", courseTitle: "청년몰 야시장 먹부림" },
  { id: "r3", title: "정선 간이역 기념 배지", region: "정선군", code: "JS-0042", status: "unused", expiresAt: "2026-12-31", courseTitle: "폐역이 된 간이역 기행" },
];

const MOCK_USER = {
  name: "김도장", email: "stamp.kim@example.com", level: "여행 3단",
  joinedAt: "2026.03", totalStamps: 27, completedCourses: 3,
};

const MOCK_ENROLLMENTS = [
  { id: "e1", courseId: "c1", courseTitle: "영도 해안 벽화 골목", region: "부산 영도구", status: "in_progress", stampedCount: 2, totalStamps: 4 },
  { id: "e2", courseId: "c2", courseTitle: "청년몰 야시장 먹부림", region: "전주 완산구", status: "completed", stampedCount: 3, totalStamps: 3 },
  { id: "e3", courseId: "c4", courseTitle: "동네 책방 지도", region: "제주 조천읍", status: "in_progress", stampedCount: 1, totalStamps: 4 },
];

/* ============================================================================
   Mock API 레이어
   실제 fetch를 흉내내는 지연 + 성공/실패/빈값 시뮬레이션 함수.
   mode: "success" | "error" | "empty" (loading은 호출측에서 관리)
   ========================================================================== */
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

async function mockFetch(mode, successData, emptyData) {
  await delay(650);
  if (mode === "error") {
    const err = new Error("NETWORK_ERROR");
    throw err;
  }
  if (mode === "empty") return emptyData;
  return successData;
}

/* ============================================================================
   공용 상태 컴포넌트: 로딩 / 에러 / 빈 상태
   ========================================================================== */
function LoadingSkeletonList({ rows = 3 }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingTop: 6 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="st-card" style={{ display: "flex", gap: 12 }}>
          <div className="st-skel" style={{ width: 56, height: 56, flexShrink: 0 }} />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8, justifyContent: "center" }}>
            <div className="st-skel" style={{ height: 14, width: "70%" }} />
            <div className="st-skel" style={{ height: 12, width: "40%" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function CenterState({ icon, title, desc, actionLabel, onAction }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center",
      padding: "56px 20px", color: COLORS.inkSoft, gap: 6,
    }}>
      {icon}
      <div style={{ fontWeight: 800, fontSize: 15.5, color: COLORS.ink, marginTop: 8 }}>{title}</div>
      <div style={{ fontSize: 13.5, lineHeight: 1.55, maxWidth: 260 }}>{desc}</div>
      {actionLabel && (
        <button className="st-btn-ghost" style={{ marginTop: 14 }} onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}

function ErrorState({ onRetry, desc = "일시적인 오류로 정보를 불러오지 못했습니다." }) {
  return (
    <CenterState
      icon={<AlertCircle size={30} color={COLORS.danger} />}
      title="불러오기에 실패했습니다"
      desc={desc}
      actionLabel="다시 시도"
      onAction={onRetry}
    />
  );
}

function EmptyState({ title, desc, actionLabel, onAction }) {
  return (
    <CenterState
      icon={<Inbox size={30} color={COLORS.inkSoft} />}
      title={title}
      desc={desc}
      actionLabel={actionLabel}
      onAction={onAction}
    />
  );
}

/* 개발용 상태 시뮬레이터: 백엔드 부재 상황에서 로딩/성공/에러/빈 상태를 눈으로 확인하기 위한 도구 */
function DevStateSwitcher({ mode, setMode }) {
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

const stampIcon = (type) => {
  if (type === "GPS") return <MapPin size={15} />;
  if (type === "QR") return <QrCode size={15} />;
  if (type === "NFC") return <Nfc size={15} />;
  return null;
};

/* ============================================================================
   화면 1. 로그인 / 회원가입
   ========================================================================== */
function AuthScreen({ onAuthed }) {
  const [tab, setTab] = useState("login"); // login | register
  const [form, setForm] = useState({ email: "demo@example.com", password: "demo1234", passwordConfirm: "", nickname: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    const next = {};
    if (tab === "login") {
      // 데모 로그인: 값이 채워져 있는지만 확인 (실제 형식 검증은 회원가입에서 보여줌)
      if (!form.email) next.email = "이메일을 입력해 주세요";
      if (!form.password) next.password = "비밀번호를 입력해 주세요";
      setErrors(next);
      return Object.keys(next).length === 0;
    }
    // 회원가입: 형식/길이까지 검증
    if (!form.email) next.email = "이메일을 입력해 주세요";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = "올바른 이메일 형식이 아닙니다";
    if (!form.password) next.password = "비밀번호를 입력해 주세요";
    else if (form.password.length < 8) next.password = "비밀번호는 8자 이상이어야 합니다";
    if (!form.nickname) next.nickname = "닉네임을 입력해 주세요";
    if (form.passwordConfirm !== form.password) next.passwordConfirm = "비밀번호가 일치하지 않습니다";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    if (!validate()) return;
    setSubmitting(true);
    try {
      // POST /auth/login 또는 POST /auth/register 목업 호출
      await delay(700);
      // 데모용: "fail@test.com"으로 로그인 시도 시 실패 케이스 재현
      if (form.email === "fail@test.com") {
        throw new Error("INVALID_CREDENTIALS");
      }
      onAuthed({ email: form.email, nickname: form.nickname || form.email.split("@")[0] });
    } catch (err) {
      setSubmitError(
        tab === "login"
          ? "이메일 또는 비밀번호가 올바르지 않습니다."
          : "회원가입에 실패했습니다. 잠시 후 다시 시도해 주세요."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="st-scroll" style={{ paddingTop: 40 }}>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div className="st-stamp" style={{ margin: "0 auto 14px", width: 52, height: 52 }}><Check size={22} /></div>
        <div style={{ fontSize: 19, fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.4 }}>지역을 걷고, 도장을 모으고,<br />리워드를 받으세요</div>
      </div>

      <div style={{ display: "flex", background: COLORS.surfaceAlt, borderRadius: 12, padding: 4, marginBottom: 22 }}>
        {[["login", "로그인"], ["register", "회원가입"]].map(([k, label]) => (
          <button
            key={k}
            onClick={() => { setTab(k); setErrors({}); setSubmitError(null); }}
            style={{
              flex: 1, padding: "10px 0", borderRadius: 9, border: "none", cursor: "pointer",
              fontWeight: 700, fontSize: 14,
              background: tab === k ? COLORS.surface : "transparent",
              color: tab === k ? COLORS.ink : COLORS.inkSoft,
              boxShadow: tab === k ? "0 1px 3px rgba(25,31,40,0.12)" : "none",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {tab === "register" && (
          <div>
            <label className="st-label" htmlFor="nickname">닉네임</label>
            <input id="nickname" className="st-input" data-error={!!errors.nickname}
              placeholder="투어에서 사용할 이름" value={form.nickname} onChange={update("nickname")} />
            {errors.nickname && <div className="st-fieldmsg">{errors.nickname}</div>}
          </div>
        )}

        <div>
          <label className="st-label" htmlFor="email">이메일</label>
          <input id="email" type="email" className="st-input" data-error={!!errors.email}
            placeholder="you@example.com" value={form.email} onChange={update("email")} />
          {errors.email && <div className="st-fieldmsg">{errors.email}</div>}
        </div>

        <div>
          <label className="st-label" htmlFor="password">비밀번호</label>
          <input id="password" type="password" className="st-input" data-error={!!errors.password}
            placeholder="8자 이상" value={form.password} onChange={update("password")} />
          {errors.password && <div className="st-fieldmsg">{errors.password}</div>}
        </div>

        {tab === "register" && (
          <div>
            <label className="st-label" htmlFor="pw2">비밀번호 확인</label>
            <input id="pw2" type="password" className="st-input" data-error={!!errors.passwordConfirm}
              placeholder="비밀번호를 한 번 더 입력" value={form.passwordConfirm} onChange={update("passwordConfirm")} />
            {errors.passwordConfirm && <div className="st-fieldmsg">{errors.passwordConfirm}</div>}
          </div>
        )}

        {submitError && (
          <div style={{
            display: "flex", gap: 8, alignItems: "flex-start", fontSize: 13, color: COLORS.danger,
            background: "rgba(240,68,82,0.08)", borderRadius: 10, padding: "10px 12px",
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>{submitError}</span>
          </div>
        )}

        <button className="st-btn-primary" type="submit" disabled={submitting}>
          {submitting ? <Loader2 size={17} className="st-spin" /> : null}
          {submitting ? "확인하는 중" : tab === "login" ? "로그인" : "회원가입"}
        </button>

        {tab === "login" && (
          <button
            type="button"
            className="st-btn-ghost"
            onClick={() => onAuthed({ email: "guest@example.com", nickname: "게스트" })}
          >
            로그인 없이 둘러보기
          </button>
        )}
      </form>

      <div style={{ fontSize: 11.5, color: COLORS.inkSoft, textAlign: "center", marginTop: 18 }}>
        데모: 이메일·비밀번호에 아무 값이나 입력하면 로그인됩니다 (실패 상태는 fail@test.com 으로 확인)
      </div>
    </div>
  );
}

/* ============================================================================
   화면 2. 코스 목록 (GET /courses)
   ========================================================================== */
function CourseListScreen({ onOpenCourse }) {
  const [mode, setMode] = useState("success");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [courses, setCourses] = useState([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("전체");

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      const data = await mockFetch(mode, MOCK_COURSES, []);
      setCourses(data);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }, [mode]);

  useEffect(() => { load(); }, [load]);

  const categories = ["전체", ...Array.from(new Set(MOCK_COURSES.map((c) => c.category)))];
  const filtered = courses.filter((c) => {
    const matchCat = category === "전체" || c.category === category;
    const matchQuery = !query || c.title.includes(query) || c.region.includes(query);
    return matchCat && matchQuery;
  });

  return (
    <>
      <div className="st-topbar">
        <div className="st-topbar-title">코스 둘러보기</div>
      </div>
      <DevStateSwitcher mode={mode} setMode={setMode} />
      <div className="st-scroll">
        <div style={{ position: "relative", margin: "16px 0 12px" }}>
          <Search size={16} color={COLORS.inkSoft} style={{ position: "absolute", left: 13, top: 14 }} />
          <input
            className="st-input" style={{ paddingLeft: 36 }}
            placeholder="지역이나 코스 이름으로 검색"
            value={query} onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, marginBottom: 6 }}>
          {categories.map((c) => (
            <button key={c} className="st-chip" data-active={category === c} onClick={() => setCategory(c)}>
              {c}
            </button>
          ))}
        </div>

        <div style={{ paddingTop: 8 }}>
          {status === "loading" && <LoadingSkeletonList rows={4} />}

          {status === "error" && <ErrorState onRetry={load} />}

          {status === "success" && filtered.length === 0 && (
            <EmptyState
              title={courses.length === 0 ? "등록된 코스가 없습니다" : "검색 결과가 없습니다"}
              desc={courses.length === 0
                ? "새로운 지역 코스가 등록되면 이곳에 표시됩니다."
                : "다른 지역명이나 카테고리로 다시 찾아보세요."}
              actionLabel={courses.length === 0 ? undefined : "필터 초기화"}
              onAction={() => { setQuery(""); setCategory("전체"); }}
            />
          )}

          {status === "success" && filtered.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {filtered.map((c) => (
                <button
                  key={c.id}
                  onClick={() => onOpenCourse(c.id)}
                  className="st-card"
                  style={{ display: "flex", gap: 12, textAlign: "left", cursor: "pointer", width: "100%" }}
                >
                  <div className="st-stamp">{c.stampCount}개</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ fontWeight: 800, fontSize: 15 }}>{c.title}</div>
                      {c.tag && (
                        <span style={{ fontSize: 10.5, fontWeight: 800, color: COLORS.seal, background: "rgba(49,130,246,0.1)", padding: "2px 7px", borderRadius: 999 }}>
                          {c.tag}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 12.5, color: COLORS.inkSoft, marginTop: 3 }}>{c.region} · {c.category}</div>
                    <div style={{ fontSize: 12.5, color: COLORS.inkSoft, marginTop: 6 }}>{c.summary}</div>
                    <div style={{ fontSize: 11.5, color: COLORS.inkSoft, marginTop: 6, display: "flex", gap: 10 }}>
                      <span>{c.distance}</span><span>약 {c.durationMin}분</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* ============================================================================
   화면 3. 코스 상세 (GET /courses/{id})
   ========================================================================== */
function CourseDetailScreen({ courseId, onBack }) {
  const [mode, setMode] = useState("success");
  const [status, setStatus] = useState("idle");
  const [detail, setDetail] = useState(null);
  const [comments, setComments] = useState([]);
  const [draft, setDraft] = useState("");

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      const full = MOCK_COURSE_DETAIL[courseId] || MOCK_COURSE_DETAIL.c1;
      const data = await mockFetch(mode, full, { ...full, stamps: [], comments: [] });
      setDetail(data);
      setComments(data.comments);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }, [mode, courseId]);

  useEffect(() => { load(); }, [load]);

  const postComment = () => {
    if (!draft.trim()) return;
    setComments((cs) => [{ id: `local-${Date.now()}`, user: "나", text: draft.trim(), date: "방금", likes: 0 }, ...cs]);
    setDraft("");
  };

  return (
    <>
      <div className="st-topbar">
        <button className="st-iconbtn" onClick={onBack} aria-label="뒤로 가기"><ChevronLeft size={22} /></button>
        <div className="st-topbar-title">코스 상세</div>
      </div>
      <DevStateSwitcher mode={mode} setMode={setMode} />
      <div className="st-scroll">
        {status === "loading" && (
          <div style={{ paddingTop: 10 }}>
            <div className="st-skel" style={{ height: 22, width: "60%", marginBottom: 10 }} />
            <div className="st-skel" style={{ height: 14, width: "40%", marginBottom: 20 }} />
            <LoadingSkeletonList rows={3} />
          </div>
        )}

        {status === "error" && <ErrorState onRetry={load} />}

        {status === "success" && detail && (
          <>
            <div style={{ paddingTop: 12 }}>
              <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em" }}>{detail.title}</div>
              <div style={{ fontSize: 13, color: COLORS.inkSoft, marginTop: 4 }}>{detail.region} · {detail.category}</div>
              <p style={{ fontSize: 13.5, lineHeight: 1.6, color: COLORS.ink, marginTop: 14 }}>{detail.description}</p>
            </div>

            <div style={{ marginTop: 22 }}>
              <div style={{ fontWeight: 800, fontSize: 14.5, marginBottom: 10 }}>스탬프 지점</div>
              {detail.stamps.length === 0 ? (
                <EmptyState title="등록된 스탬프 지점이 없습니다" desc="코스 운영자가 지점을 준비 중입니다. 잠시 후 다시 확인해 주세요." />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {detail.stamps.map((s) => (
                    <div key={s.id} className="st-card" style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{
                        width: 30, height: 30, borderRadius: 999, background: COLORS.surfaceAlt,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontWeight: 800, fontSize: 12.5, flexShrink: 0,
                      }}>{s.order}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{s.name}</div>
                        <div style={{ fontSize: 12, color: COLORS.inkSoft, marginTop: 2 }}>{s.location}</div>
                      </div>
                      <div style={{
                        display: "flex", alignItems: "center", gap: 4, fontSize: 11.5, fontWeight: 700,
                        color: COLORS.inkSoft, background: COLORS.surfaceAlt, borderRadius: 999, padding: "5px 10px",
                      }}>
                        {stampIcon(s.type)}{s.type}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ marginTop: 26 }}>
              <div style={{ fontWeight: 800, fontSize: 14.5, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                <MessageCircle size={16} />의견 나누기 ({comments.length})
              </div>

              <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                <input
                  className="st-input" placeholder="이 코스에 대한 생각을 남겨보세요"
                  value={draft} onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && postComment()}
                />
                <button className="st-iconbtn" style={{ background: COLORS.seal, color: "#fff", borderRadius: 12 }} onClick={postComment} aria-label="댓글 등록">
                  <Send size={17} />
                </button>
              </div>

              {comments.length === 0 ? (
                <EmptyState title="아직 댓글이 없습니다" desc="이 코스를 다녀온 첫 번째 이야기를 남겨보세요." />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {comments.map((c) => (
                    <div key={c.id} style={{ borderBottom: `1px solid ${COLORS.line}`, paddingBottom: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5 }}>
                        <span style={{ fontWeight: 700 }}>{c.user}</span>
                        <span style={{ color: COLORS.inkSoft }}>{c.date}</span>
                      </div>
                      <div style={{ fontSize: 13.5, marginTop: 4, lineHeight: 1.5 }}>{c.text}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 6, color: COLORS.inkSoft, fontSize: 12 }}>
                        <Heart size={13} />{c.likes}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}

/* ============================================================================
   화면 4. 리워드함 (GET /users/me/reward-claims)
   ========================================================================== */
function RewardsScreen() {
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

/* ============================================================================
   화면 5. 마이페이지 (GET /users/me, GET /users/me/enrollments)
   ========================================================================== */
function MyPageScreen({ user, onLogout }) {
  const [mode, setMode] = useState("success");
  const [status, setStatus] = useState("idle");
  const [profile, setProfile] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [filter, setFilter] = useState("전체"); // 전체 | 진행중 | 완주

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      const [p, e] = await Promise.all([
        mockFetch(mode, MOCK_USER, MOCK_USER),
        mockFetch(mode, MOCK_ENROLLMENTS, []),
      ]);
      setProfile(p);
      setEnrollments(e);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }, [mode]);

  useEffect(() => { load(); }, [load]);

  const filtered = enrollments.filter((e) => {
    if (filter === "전체") return true;
    if (filter === "진행중") return e.status === "in_progress";
    return e.status === "completed";
  });

  return (
    <>
      <div className="st-topbar"><div className="st-topbar-title">마이페이지</div></div>
      <DevStateSwitcher mode={mode} setMode={setMode} />
      <div className="st-scroll">
        {status === "loading" && (
          <div style={{ paddingTop: 14 }}>
            <div className="st-skel" style={{ height: 90, marginBottom: 20 }} />
            <LoadingSkeletonList rows={3} />
          </div>
        )}

        {status === "error" && <ErrorState onRetry={load} />}

        {status === "success" && profile && (
          <>
            <div className="st-card" style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{
                width: 52, height: 52, borderRadius: 999, background: COLORS.ink, color: COLORS.surface,
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}><User size={24} /></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: 16 }}>{user?.nickname || profile.name}</div>
                <div style={{ fontSize: 12.5, color: COLORS.inkSoft, marginTop: 2 }}>{profile.email}</div>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 4, marginTop: 6, fontSize: 11.5, fontWeight: 700,
                  color: COLORS.leaf, background: "rgba(0,196,140,0.12)", padding: "3px 9px", borderRadius: 999,
                }}><Sprout size={12} />{profile.level}</div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
              <div className="st-card" style={{ flex: 1, textAlign: "center" }}>
                <div style={{ fontSize: 20, fontWeight: 800 }}>{profile.totalStamps}</div>
                <div style={{ fontSize: 11.5, color: COLORS.inkSoft, marginTop: 2 }}>모은 스탬프</div>
              </div>
              <div className="st-card" style={{ flex: 1, textAlign: "center" }}>
                <div style={{ fontSize: 20, fontWeight: 800 }}>{profile.completedCourses}</div>
                <div style={{ fontSize: 11.5, color: COLORS.inkSoft, marginTop: 2 }}>완주 코스</div>
              </div>
              <div className="st-card" style={{ flex: 1, textAlign: "center" }}>
                <div style={{ fontSize: 13, fontWeight: 800, marginTop: 4 }}>{profile.joinedAt}</div>
                <div style={{ fontSize: 11.5, color: COLORS.inkSoft, marginTop: 2 }}>가입일</div>
              </div>
            </div>

            <div style={{ marginTop: 24 }}>
              <div style={{ fontWeight: 800, fontSize: 14.5, marginBottom: 10 }}>내 투어 코스</div>
              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                {["전체", "진행중", "완주"].map((f) => (
                  <button key={f} className="st-chip" data-active={filter === f} onClick={() => setFilter(f)}>{f}</button>
                ))}
              </div>

              {enrollments.length === 0 && (
                <EmptyState title="참여 중인 코스가 없습니다" desc="코스 목록에서 마음에 드는 코스를 시작해 보세요." />
              )}

              {enrollments.length > 0 && filtered.length === 0 && (
                <EmptyState title="해당하는 코스가 없습니다" desc="다른 필터를 선택해 보세요." />
              )}

              {filtered.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {filtered.map((e) => (
                    <div key={e.id} className="st-card" style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      {e.status === "completed"
                        ? <Check size={20} color={COLORS.leaf} style={{ flexShrink: 0 }} />
                        : <Calendar size={20} color={COLORS.gold} style={{ flexShrink: 0 }} />}
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{e.courseTitle}</div>
                        <div style={{ fontSize: 12, color: COLORS.inkSoft, marginTop: 2 }}>{e.region}</div>
                      </div>
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: e.status === "completed" ? COLORS.leaf : COLORS.inkSoft }}>
                        {e.stampedCount}/{e.totalStamps}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button className="st-btn-ghost" style={{ width: "100%", marginTop: 26, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }} onClick={onLogout}>
              <LogOut size={15} />로그아웃
            </button>
          </>
        )}
      </div>
    </>
  );
}

/* ============================================================================
   하단 탭 네비게이션
   ========================================================================== */
function BottomNav({ current, onChange }) {
  const items = [
    { k: "list", label: "코스", icon: Compass },
    { k: "rewards", label: "리워드함", icon: Gift },
    { k: "mypage", label: "마이페이지", icon: User },
  ];
  return (
    <nav className="st-bottomnav">
      {items.map(({ k, label, icon: Icon }) => (
        <button key={k} className="st-navitem" data-active={current === k} onClick={() => onChange(k)}>
          <Icon size={20} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}

/* ============================================================================
   루트 컴포넌트
   ========================================================================== */
export default function StartonApp() {
  const [user, setUser] = useState(null);
  const [screen, setScreen] = useState("list"); // list | detail | rewards | mypage
  const [selectedCourseId, setSelectedCourseId] = useState(null);

  const handleAuthed = (u) => { setUser(u); setScreen("list"); };
  const handleLogout = () => { setUser(null); setScreen("list"); };
  const openCourse = (id) => { setSelectedCourseId(id); setScreen("detail"); };
  const navChange = (k) => setScreen(k);

  return (
    <div className="st-root">
      <GlobalStyle />
      <div className="st-frame">
        {!user && <AuthScreen onAuthed={handleAuthed} />}

        {user && screen === "list" && <CourseListScreen onOpenCourse={openCourse} />}
        {user && screen === "detail" && (
          <CourseDetailScreen courseId={selectedCourseId} onBack={() => setScreen("list")} />
        )}
        {user && screen === "rewards" && <RewardsScreen />}
        {user && screen === "mypage" && <MyPageScreen user={user} onLogout={handleLogout} />}

        {user && screen !== "detail" && <BottomNav current={screen} onChange={navChange} />}
      </div>
    </div>
  );
}
