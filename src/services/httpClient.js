import axios from "axios";
import { getAuthSession } from "./authStorage.js";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const httpClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// 로그인된 user가 있으면(=accessToken 존재) 모든 요청에 Bearer 토큰을 자동으로 싣는다.
httpClient.interceptors.request.use((config) => {
  const { user, accessToken } = getAuthSession();
  if (user && accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// 에러 응답을 {status, message, data} 형태로 통일해서 각 서비스 함수가 try/catch 없이 쓸 수 있게 한다.
httpClient.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status ?? 0;
    const data = err.response?.data;
    const message =
      data?.message || data?.error || err.message || "요청 처리 중 오류가 발생했습니다.";
    const normalized = new Error(message);
    normalized.status = status;
    normalized.data = data;
    // 서버가 거리 초과(422) 응답에 distance를 함께 내려주는 경우를 대비 (스펙에 명시되어 있지 않아 best-effort)
    if (typeof data?.distance === "number") normalized.distance = data.distance;
    return Promise.reject(normalized);
  }
);

export default httpClient;
