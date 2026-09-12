import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { AlertCircle, Check, Loader2 } from "lucide-react";
import { COLORS } from "../constants/colors.js";
import { delay } from "../mock/api.js";
import { useAuth } from "../context/AuthContext.jsx";

/* ============================================================================
   화면 1. 로그인 / 회원가입
   ========================================================================== */
export default function AuthPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [tab, setTab] = useState("login"); // login | register
  const [form, setForm] = useState({ email: "demo@example.com", password: "demo1234", passwordConfirm: "", nickname: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  if (user) {
    const redirectTo = location.state?.from?.pathname ?? "/courses";
    return <Navigate to={redirectTo} replace />;
  }

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

  const handleAuthed = (u) => {
    login(u);
    const redirectTo = location.state?.from?.pathname ?? "/courses";
    navigate(redirectTo, { replace: true });
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
      handleAuthed({ email: form.email, nickname: form.nickname || form.email.split("@")[0] });
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
            onClick={() => handleAuthed({ email: "guest@example.com", nickname: "게스트" })}
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
