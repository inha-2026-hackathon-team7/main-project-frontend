/* ============================================================================
   Mock API 레이어
   실제 fetch를 흉내내는 지연 + 성공/실패/빈값 시뮬레이션 함수.
   mode: "success" | "error" | "empty" (loading은 호출측에서 관리)
   ========================================================================== */
export const delay = (ms) => new Promise((res) => setTimeout(res, ms));

export async function mockFetch(mode, successData, emptyData) {
  await delay(650);
  if (mode === "error") {
    const err = new Error("NETWORK_ERROR");
    throw err;
  }
  if (mode === "empty") return emptyData;
  return successData;
}
