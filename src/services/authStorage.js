/* ============================================================================
   로그인 세션(user + accessToken) 저장소
   - AuthContext(React 상태)와 httpClient(axios 인터셉터)가 공통으로 참조한다.
   ========================================================================== */
const STORAGE_KEY = "starton_auth_session";

export function getAuthSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore malformed storage
  }
  return { user: null, accessToken: null };
}

export function setAuthSession(user, accessToken) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, accessToken }));
  } catch {
    // storage unavailable (private mode 등) — 세션 유지만 못할 뿐 앱은 계속 동작
  }
}

export function clearAuthSession() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
