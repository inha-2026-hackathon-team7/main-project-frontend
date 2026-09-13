/* ============================================================================
   브라우저 GPS 위치를 안전하게 가져오는 헬퍼
   - 권한 거부/미지원/타임아웃 시에도 절대 reject하지 않고 null을 반환한다.
   - 코스 목록/상세 조회 시 서버가 distanceMeters를 계산할 수 있도록 lat/lng로 사용된다.
   ========================================================================== */
export function getCurrentPositionSafe(timeout = 4000) {
  return new Promise((resolve) => {
    if (!("geolocation" in navigator)) {
      resolve(null);
      return;
    }
    let settled = false;
    const finish = (value) => {
      if (settled) return;
      settled = true;
      resolve(value);
    };
    const timer = setTimeout(() => finish(null), timeout);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        clearTimeout(timer);
        finish({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => {
        clearTimeout(timer);
        finish(null);
      },
      { timeout }
    );
  });
}

// 미터 단위 거리를 "350m" / "2.4km" 형태로 표시
export function formatDistanceMeters(meters) {
  if (meters == null || Number.isNaN(meters)) return null;
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}
