/* ============================================================================
   JWT 만료 여부 판별 (서명 검증 없이 payload만 디코드)
   - 서버가 401을 주면 "토큰이 만료된 것"과 "토큰 자체가 잘못된 것"을 구분해
     사용자에게 다른 안내를 보여주기 위해 사용한다.
   - 서명 검증은 서버만 할 수 있으므로, 여기서는 payload의 exp 클레임만 읽어
     "적어도 만료 시각은 지났다"를 판단한다. 디코드 자체가 실패하면(형식이
     깨졌거나 exp가 없으면) 만료 여부를 알 수 없으니 false를 반환 — 호출부는
     이 경우 "invalid"(잘못된 토큰)로 분류한다.
   ========================================================================== */
export function isTokenExpired(token) {
  if (!token) return false;
  try {
    const payloadBase64Url = token.split(".")[1];
    if (!payloadBase64Url) return false;
    const payloadBase64 = payloadBase64Url.replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(payloadBase64));
    if (typeof payload.exp !== "number") return false;
    return Date.now() >= payload.exp * 1000;
  } catch {
    return false;
  }
}
