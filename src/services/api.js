import httpClient from "./httpClient.js";

/* ============================================================================
   StartOn API 서비스 레이어
   - 백엔드 OpenAPI 스펙(/admin/** 제외)에 맞춰 실제 HTTP 호출을 수행한다.
   - 백엔드는 spring.jackson.property-naming-strategy=SNAKE_CASE로 설정되어 있어
     실제 요청/응답 바디는 snake_case다. httpClient.js가 요청 시 camelCase -> snake_case,
     응답 시 snake_case -> camelCase 변환을 자동으로 해주므로, 이 파일과 그 아래
     컴포넌트들은 신경 쓰지 않고 항상 camelCase만 쓰면 된다.
   ========================================================================== */

// Haversine 거리 계산 (미터 단위) — 클라이언트에서 GPS 반경 안내용으로만 사용
export function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth radius in meters
  const toRad = (deg) => (deg * Math.PI) / 180;
  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lon2 - lon1);

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

// ----------------------------------------------------------------------------
// 1. Auth API
// ----------------------------------------------------------------------------
export const authApi = {
  // POST /auth/register — 응답에 accessToken이 없어 가입 후 별도 로그인이 필요하다.
  async register({ name, email, password }) {
    const { data } = await httpClient.post("/auth/register", { name, email, password });
    return data; // { userId, name, email }
  },

  // POST /auth/login
  async login({ email, password }) {
    const { data } = await httpClient.post("/auth/login", { email, password });
    return data; // { accessToken, user: { id, name, role } }
  },
};

// ----------------------------------------------------------------------------
// 2. Courses API (화면 2, 3) — GET /courses, GET /courses/{courseId}는 인증 불필요
// ----------------------------------------------------------------------------
export const coursesApi = {
  // lat/lng을 넘기면 응답의 distanceMeters가 그 위치 기준으로 계산되어 내려온다.
  async list({ organizationId, regionId, type, page, size, lat, lng } = {}) {
    const { data } = await httpClient.get("/courses", {
      params: {
        organization_id: organizationId,
        region_id: regionId,
        type,
        page,
        size,
        lat,
        lng,
      },
    });
    return data; // UserCourseListItem[] (regionName/distanceMeters/durationMinutes 포함)
  },

  async get(courseId, { lat, lng } = {}) {
    const { data } = await httpClient.get(`/courses/${courseId}`, {
      params: { lat, lng },
    });
    return data; // UserCourseDetailResponse (regionName/distanceMeters/durationMinutes 포함)
  },
};

// ----------------------------------------------------------------------------
// 3. Enrollments API (화면 3, 4)
// ----------------------------------------------------------------------------
export const enrollmentsApi = {
  // POST /courses/{courseId}/enrollments — 코스 시작하기
  async start(courseId) {
    const { data } = await httpClient.post(`/courses/${courseId}/enrollments`);
    return data; // { enrollmentId, status, startedAt }
  },

  // GET /enrollments/{enrollmentId} — 코스 진행 상황 조회 (스펙 원본 그대로)
  async getProgress(enrollmentId) {
    const { data } = await httpClient.get(`/enrollments/${enrollmentId}`);
    return data; // { status, stampedCoursePlaceIds, totalPlaces, nextPlace, completedAt, course, places, reward }
  },

  // 백엔드가 진행 상황 응답에 course/places/reward를 직접 내려주므로(EnrollmentCourseSummary,
  // EnrollmentPlaceItem[], UserCourseRewardDetail) 별도 코스 조회 없이 여기서 모양만 맞춰준다.
  async getWithCourse(enrollmentId) {
    const progress = await enrollmentsApi.getProgress(enrollmentId);
    return {
      ...progress,
      courseId: progress.course?.id,
      courseName: progress.course?.name,
      course: {
        id: progress.course?.id,
        name: progress.course?.name,
        isOrdered: progress.course?.isOrdered,
        places: progress.places,
        reward: progress.reward,
      },
    };
  },

  // POST /enrollments/{enrollmentId}/stamps — QR + GPS 방문 인증
  async stamp(enrollmentId, { qrcodeString, latitude, longitude }) {
    const { data } = await httpClient.post(`/enrollments/${enrollmentId}/stamps`, {
      qrcodeString,
      latitude,
      longitude,
    });
    return data; // { stampId, placeName, stampedAt, progress: {done, total}, courseCompleted }
  },

  // POST /enrollments/{enrollmentId}/abandon — 코스 포기
  // 멱등: 이미 ABANDONED면 그대로 반환. COMPLETE 상태는 409 ENROLLMENT_ALREADY_ENDED.
  async abandon(enrollmentId) {
    const { data } = await httpClient.post(`/enrollments/${enrollmentId}/abandon`);
    return data;
  },
};

// ----------------------------------------------------------------------------
// 4. Rewards API (화면 8, 9)
// ----------------------------------------------------------------------------
export const rewardsApi = {
  // POST /reward-claims — 코스 완주 리워드 수령
  async claim(courseEnrollmentId) {
    const { data } = await httpClient.post("/reward-claims", {
      courseEnrollmentId: Number(courseEnrollmentId),
    });
    return data; // { claimId, rewardName, status, claimedAt } — imageUrl/validUntil/코드는 미포함
  },

  // GET /users/me/reward-claims — 내 리워드함 조회
  async myRewards() {
    const { data } = await httpClient.get("/users/me/reward-claims");
    return data; // UserRewardClaimItem[]
  },

  // POST /reward-claims/{claimId}/redeem — 매장에서 리워드 사용 처리 (status -> "used")
  // 404 REWARD_CLAIM_NOT_FOUND(본인 소유 아님), 409 REWARD_CLAIM_ALREADY_USED, 409 REWARD_CLAIM_EXPIRED
  async redeem(claimId) {
    const { data } = await httpClient.post(`/reward-claims/${claimId}/redeem`);
    return data;
  },
};

// ----------------------------------------------------------------------------
// 5. Users API (화면 10)
// ----------------------------------------------------------------------------
export const usersApi = {
  // GET /users/me는 {id, name, email}만 반환하므로, 스탬프/완주 통계는
  // /users/me/enrollments 결과를 클라이언트에서 집계해 붙여준다.
  async me() {
    const [{ data: profile }, enrollments] = await Promise.all([
      httpClient.get("/users/me"),
      usersApi.myEnrollments(),
    ]);
    const totalStamps = enrollments.reduce(
      (acc, e) => acc + (e.progress?.done || 0),
      0
    );
    const completedCourses = enrollments.filter((e) => Boolean(e.completedAt)).length;

    return { ...profile, totalStamps, completedCourses };
  },

  // GET /users/me/enrollments
  // status enum의 실제 표기(대소문자 등)가 스펙에 명시되어 있지 않아, 서버 필터 대신
  // 항상 전체를 받아 completedAt 유무로 클라이언트에서 판단한다(호출부 참고).
  async myEnrollments() {
    const { data } = await httpClient.get("/users/me/enrollments");
    return data; // MyEnrollmentItem[]
  },
};
