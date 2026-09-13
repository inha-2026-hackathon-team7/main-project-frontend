import axios from "axios";
import { getAuthSession } from "./authStorage.js";
import { camelizeKeys, snakeizeKeys } from "../utils/caseConvert.js";
import { isTokenExpired } from "../utils/jwt.js";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

// 로그인/회원가입 자체의 401(비밀번호 오류 등)은 "세션 만료"가 아니므로
// 아래 401 공통 처리에서 제외한다 — 그 화면이 이미 자기 에러 문구를 보여준다.
const AUTH_ENDPOINT_PATTERN = /\/auth\/(login|register)$/;

// 401 응답을 받았을 때(=보호된 API에 접근했는데 인증이 거부됨) 실행할 핸들러.
// httpClient.js는 React 트리 밖의 순수 모듈이라 직접 navigate/toast를 할 수 없으므로,
// AuthExpiryWatcher(React 트리 안)가 마운트 시 이 핸들러를 등록해 실제 동작(로그아웃
// 처리 + 스낵바 + /login 이동)을 맡는다.
let unauthorizedHandler = null;
export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler;
}

const httpClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// 로그인된 user가 있으면(=accessToken 존재) 모든 요청에 Bearer 토큰을 자동으로 싣는다.
// 백엔드가 spring.jackson.property-naming-strategy=SNAKE_CASE라 요청 JSON 바디도
// snake_case여야 필드가 제대로 바인딩되므로, 여기서 camelCase 바디를 자동 변환한다.
// (쿼리 파라미터는 건드리지 않음 — api.js에서 이미 스펙대로 snake_case로 직접 지정한다.)
httpClient.interceptors.request.use((config) => {
  const { user, accessToken } = getAuthSession();
  if (user && accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  if (config.data && typeof config.data === "object") {
    config.data = snakeizeKeys(config.data);
  }
  return config;
});

// 응답 바디의 키를 전부 camelCase로 정규화한다 (백엔드가 SNAKE_CASE로 내려주므로).
// 프론트는 항상 camelCase만 다루도록 여기서 흡수한다.
// 에러 응답도 {status, message, data} 형태로 통일해서 각 서비스 함수가 try/catch 없이 쓸 수 있게 한다.
httpClient.interceptors.response.use(
  (res) => {
    if (res.data) res.data = camelizeKeys(res.data);
    return res;
  },
  (err) => {
    const status = err.response?.status ?? 0;
    const data = err.response?.data ? camelizeKeys(err.response.data) : err.response?.data;
    const message =
      data?.message || data?.error || err.message || "요청 처리 중 오류가 발생했습니다.";
    const normalized = new Error(message);
    normalized.status = status;
    normalized.data = data;
    // 서버가 거리 초과(422) 응답에 distance를 함께 내려주는 경우를 대비 (스펙에 명시되어 있지 않아 best-effort)
    if (typeof data?.distance === "number") normalized.distance = data.distance;

    // 보호된 API가 401을 준 경우 — 로그인 화면 자체의 로그인 실패는 위에서 걸러졌으므로,
    // 여기 도달하는 401은 "로그인은 했었는데 그 토큰이 더는 안 통한다"는 뜻이다.
    // 저장된 토큰의 exp가 이미 지났으면 "만료", 그렇지 않으면(서명 위조/서버 시크릿 변경 등)
    // "잘못된 토큰"으로 분류해 서로 다른 안내 문구를 보여줄 수 있게 한다.
    if (status === 401 && !AUTH_ENDPOINT_PATTERN.test(err.config?.url || "")) {
      const { accessToken } = getAuthSession();
      if (accessToken) {
        const reason = isTokenExpired(accessToken) ? "expired" : "invalid";
        unauthorizedHandler?.(reason);
      }
    }

    return Promise.reject(normalized);
  }
);

export default httpClient;
