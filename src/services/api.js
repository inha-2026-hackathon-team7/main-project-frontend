import {
  INITIAL_COURSES,
  INITIAL_ENROLLMENTS,
  INITIAL_REWARDS,
  INITIAL_USER,
} from "../mock/data.js";

/* ============================================================================
   StartOn API 서비스 레이어 (API 명세서 P0 준수)
   - 백엔드 /api 인터페이스 100% 매핑
   - 브라우저 로컬 저장소를 연계한 실시간 반응형 Mock State Engine
   - Haversine 기반 50m 허용 반경 거리 검증 및 404/409/422 에러 분기
   ========================================================================== */

const STORAGE_KEY = "starton_state_v2";

export function getStoredState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to load stored state", e);
  }
  const init = {
    courses: INITIAL_COURSES,
    enrollments: INITIAL_ENROLLMENTS,
    rewards: INITIAL_REWARDS,
    user: INITIAL_USER,
  };
  saveStoredState(init);
  return init;
}

export function saveStoredState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Failed to save state", e);
  }
}

export function resetDemoState() {
  localStorage.removeItem(STORAGE_KEY);
  return getStoredState();
}

const delay = (ms = 450) => new Promise((res) => setTimeout(res, ms));

// Haversine 거리 계산 (미터 단위)
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
  async register({ name, email, password }) {
    await delay();
    const state = getStoredState();
    const userId = `u_${Date.now()}`;
    const newUser = {
      id: userId,
      name,
      email,
      role: "user",
      level: "신규 도전자 Lv.1",
      joined_at: new Date().toISOString().slice(0, 7).replace("-", "."),
    };
    state.user = newUser;
    saveStoredState(state);
    return {
      user_id: userId,
      name: newUser.name,
      email: newUser.email,
    };
  },

  async login({ email, password }) {
    await delay();
    const state = getStoredState();
    const token = `jwt_mock_${Date.now()}`;
    return {
      access_token: token,
      user: state.user,
    };
  },
};

// ----------------------------------------------------------------------------
// 2. Courses API (화면 2, 3)
// ----------------------------------------------------------------------------
export const coursesApi = {
  async list({ type, query, organization_id, region_id } = {}) {
    await delay();
    const state = getStoredState();
    let list = state.courses.map((c) => ({
      id: c.id,
      name: c.name,
      type: c.type,
      view_count: c.view_count,
      thumbnail_url: c.thumbnail_url,
      reward_summary: c.reward_summary,
      region: c.region,
      category: c.category,
      distance: c.distance,
      durationMin: c.durationMin,
      total_places: c.places.length,
    }));

    if (type && type !== "all") {
      list = list.filter((c) => c.type === type);
    }
    if (query) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.region.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q)
      );
    }
    return list;
  },

  async get(courseId) {
    await delay();
    const state = getStoredState();
    const course = state.courses.find((c) => c.id === courseId);
    if (!course) {
      const err = new Error("COURSE_NOT_FOUND");
      err.status = 404;
      throw err;
    }

    // 로그인 유저의 active enrollment 여부 확인
    const activeEnrollment = state.enrollments.find(
      (e) => e.course_id === courseId && e.status === "active"
    );

    return {
      id: course.id,
      name: course.name,
      description: course.description,
      is_ordered: course.is_ordered,
      places: course.places,
      reward: course.reward,
      category: course.category,
      region: course.region,
      distance: course.distance,
      durationMin: course.durationMin,
      my_enrollment_id: activeEnrollment ? activeEnrollment.enrollment_id : null,
    };
  },
};

// ----------------------------------------------------------------------------
// 3. Enrollments API (화면 3, 4)
// ----------------------------------------------------------------------------
export const enrollmentsApi = {
  async start(courseId) {
    await delay();
    const state = getStoredState();
    const course = state.courses.find((c) => c.id === courseId);
    if (!course) {
      const err = new Error("COURSE_NOT_FOUND");
      err.status = 404;
      throw err;
    }

    // 기존 active enrollment가 있으면 idempotent 처리로 그대로 반환
    const existing = state.enrollments.find(
      (e) => e.course_id === courseId && e.status === "active"
    );
    if (existing) {
      return {
        enrollment_id: existing.enrollment_id,
        status: existing.status,
        started_at: existing.started_at,
      };
    }

    const newEnrollment = {
      enrollment_id: `enr_${Date.now()}`,
      course_id: course.id,
      course_name: course.name,
      status: "active",
      stamped_course_place_ids: [],
      total_places: course.places.length,
      started_at: new Date().toISOString(),
      completed_at: null,
    };

    state.enrollments.unshift(newEnrollment);
    saveStoredState(state);

    return {
      enrollment_id: newEnrollment.enrollment_id,
      status: newEnrollment.status,
      started_at: newEnrollment.started_at,
    };
  },

  async get(enrollmentId) {
    await delay();
    const state = getStoredState();
    const enr = state.enrollments.find((e) => e.enrollment_id === enrollmentId);
    if (!enr) {
      const err = new Error("ENROLLMENT_NOT_FOUND");
      err.status = 404;
      throw err;
    }

    const course = state.courses.find((c) => c.id === enr.course_id);

    // 다음 방문지 계산
    let nextPlace = null;
    if (course && course.places) {
      const remaining = course.places.filter(
        (p) => !enr.stamped_course_place_ids.includes(p.course_place_id)
      );
      if (course.is_ordered) {
        remaining.sort((a, b) => a.visit_order - b.visit_order);
      }
      if (remaining.length > 0) {
        nextPlace = remaining[0];
      }
    }

    return {
      enrollment_id: enr.enrollment_id,
      course_id: enr.course_id,
      course_name: enr.course_name,
      status: enr.status,
      stamped_course_place_ids: enr.stamped_course_place_ids,
      total_places: enr.total_places,
      next_place: nextPlace,
      completed_at: enr.completed_at,
      started_at: enr.started_at,
      course: course || null,
    };
  },

  // --------------------------------------------------------------------------
  // 4. QR + GPS 스탬프 인증 API (화면 5, 6, 7)
  // --------------------------------------------------------------------------
  async stamp(enrollmentId, { qrcode_string, latitude, longitude }) {
    await delay(700); // 위치 및 QR 검증 연출 딜레이
    const state = getStoredState();
    const enr = state.enrollments.find((e) => e.enrollment_id === enrollmentId);
    if (!enr) {
      const err = new Error("ENROLLMENT_NOT_FOUND");
      err.status = 404;
      throw err;
    }

    const course = state.courses.find((c) => c.id === enr.course_id);
    if (!course) {
      const err = new Error("COURSE_NOT_FOUND");
      err.status = 404;
      throw err;
    }

    // 1) 전체 장소 중 qrcode_string 검색
    let matchedPlace = null;
    let placeCourseId = null;

    for (const c of state.courses) {
      const p = c.places.find((pl) => pl.qrcode_string === qrcode_string);
      if (p) {
        matchedPlace = p;
        placeCourseId = c.id;
        break;
      }
    }

    // 404: qrcode_string에 해당하는 place 없음
    if (!matchedPlace) {
      const err = new Error("PLACE_NOT_FOUND");
      err.status = 404;
      err.message = "등록되지 않은 QR 코드입니다. 현장의 안내판을 확인해 주세요.";
      throw err;
    }

    // 422: 해당 코스에 속하지 않는 place
    if (placeCourseId !== course.id) {
      const err = new Error("NOT_IN_COURSE");
      err.status = 422;
      err.message = "현재 진행 중인 코스에 포함되지 않은 스탬프 장소입니다.";
      throw err;
    }

    // 409: 이미 스탬프 찍은 place
    if (enr.stamped_course_place_ids.includes(matchedPlace.course_place_id)) {
      const err = new Error("ALREADY_STAMPED");
      err.status = 409;
      err.message = "이미 스탬프를 인증한 장소입니다.";
      throw err;
    }

    // 422: GPS 좌표 검증 (허용 반경 50m)
    // latitude / longitude가 제공된 경우 거리 검산
    if (latitude != null && longitude != null) {
      const dist = calculateDistanceMeters(
        latitude,
        longitude,
        matchedPlace.lat,
        matchedPlace.lng
      );
      if (dist > 50) {
        const err = new Error("OUT_OF_RANGE");
        err.status = 422;
        err.distance = dist;
        err.message = `스탬프 장소에서 ${dist}m 떨어져 있습니다. 50m 이내로 더 가까이 이동해 주세요.`;
        throw err;
      }
    }

    // 성공 처리
    enr.stamped_course_place_ids.push(matchedPlace.course_place_id);
    const doneCount = enr.stamped_course_place_ids.length;
    const totalCount = course.places.length;
    const courseCompleted = doneCount >= totalCount;

    if (courseCompleted) {
      enr.status = "complete";
      enr.completed_at = new Date().toISOString();
    }

    saveStoredState(state);

    return {
      stamp_id: `st_${Date.now()}`,
      place_name: matchedPlace.name,
      course_place_id: matchedPlace.course_place_id,
      stamped_at: new Date().toISOString(),
      progress: {
        done: doneCount,
        total: totalCount,
      },
      course_completed: courseCompleted,
    };
  },
};

// ----------------------------------------------------------------------------
// 5. Rewards API (화면 8, 9)
// ----------------------------------------------------------------------------
export const rewardsApi = {
  async claim(course_enrollment_id) {
    await delay(500);
    const state = getStoredState();
    const enr = state.enrollments.find(
      (e) => e.enrollment_id === course_enrollment_id
    );

    if (!enr) {
      const err = new Error("ENROLLMENT_NOT_FOUND");
      err.status = 404;
      throw err;
    }

    if (enr.status !== "complete") {
      const err = new Error("ENROLLMENT_NOT_COMPLETED");
      err.status = 400;
      err.message = "코스를 완주해야 리워드를 수령할 수 있습니다.";
      throw err;
    }

    const course = state.courses.find((c) => c.id === enr.course_id);
    const rewardInfo = course?.reward || {
      name: "코스 완주 기념 상품권",
      image_url: "",
      valid_days: 30,
    };

    // 이미 수령했는지 확인
    const alreadyClaimed = state.rewards.find(
      (r) => r.enrollment_id === course_enrollment_id
    );
    if (alreadyClaimed) {
      return {
        claim_id: alreadyClaimed.claim_id,
        reward_name: alreadyClaimed.reward_name,
        status: alreadyClaimed.status,
        claimed_at: alreadyClaimed.claimed_at,
        is_duplicate: true,
      };
    }

    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + (rewardInfo.valid_days || 30));

    const newClaim = {
      claim_id: `rc_${Date.now()}`,
      enrollment_id: course_enrollment_id,
      reward_name: rewardInfo.name,
      image_url: rewardInfo.image_url,
      code: `STARTON-${Math.floor(1000 + Math.random() * 9000)}`,
      status: "unused",
      valid_until: validUntil.toISOString().slice(0, 10),
      claimed_at: new Date().toISOString(),
      course_title: course?.name,
    };

    state.rewards.unshift(newClaim);
    saveStoredState(state);

    return {
      claim_id: newClaim.claim_id,
      reward_name: newClaim.reward_name,
      status: "claimed",
      claimed_at: newClaim.claimed_at,
    };
  },

  async myRewards() {
    await delay();
    const state = getStoredState();
    return state.rewards;
  },
};

// ----------------------------------------------------------------------------
// 6. Users API (화면 10)
// ----------------------------------------------------------------------------
export const usersApi = {
  async me() {
    await delay();
    const state = getStoredState();
    const totalStamps = state.enrollments.reduce(
      (acc, e) => acc + (e.stamped_course_place_ids?.length || 0),
      0
    );
    const completedCourses = state.enrollments.filter(
      (e) => e.status === "complete"
    ).length;

    return {
      ...state.user,
      totalStamps,
      completedCourses,
    };
  },

  async myEnrollments(status) {
    await delay();
    const state = getStoredState();
    let list = state.enrollments.map((e) => ({
      enrollment_id: e.enrollment_id,
      course_id: e.course_id,
      course_name: e.course_name,
      status: e.status,
      progress: {
        done: e.stamped_course_place_ids?.length || 0,
        total: e.total_places || 0,
      },
      started_at: e.started_at,
      completed_at: e.completed_at,
    }));

    if (status && status !== "all") {
      list = list.filter((e) => e.status === status);
    }
    return list;
  },
};
