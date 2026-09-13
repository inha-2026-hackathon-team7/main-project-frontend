/* ============================================================================
   snake_case ↔ camelCase 변환 유틸
   - 백엔드 응답이 DTO마다 camelCase/snake_case를 섞어 내려보내는 것으로 확인되어
     (예: LoginResponse는 access_token, EnrollmentStartResponse는 enrollment_id,
     UserCourseListItem은 thumbnail_url 등) 응답을 받는 즉시 전부 camelCase로
     정규화해서 프론트 코드는 항상 camelCase만 신경 쓰면 되도록 한다.
   ========================================================================== */

// JSON.parse가 만들어내는 순수 {} 객체만 대상으로 한다 (Date/Blob/File 등 다른 객체는 건드리지 않음)
const isPlainObject = (v) => v !== null && typeof v === "object" && v.constructor === Object;

function snakeToCamelKey(key) {
  return key.replace(/_([a-zA-Z0-9])/g, (_, c) => c.toUpperCase());
}

// 객체/배열을 깊이 순회하며 모든 키를 snake_case -> camelCase로 변환한다.
// 이미 camelCase인 키는 언더스코어가 없어 그대로 유지되므로 안전하게 항상 적용 가능하다.
export function camelizeKeys(value) {
  if (Array.isArray(value)) {
    return value.map(camelizeKeys);
  }
  if (isPlainObject(value)) {
    const out = {};
    for (const [key, v] of Object.entries(value)) {
      out[snakeToCamelKey(key)] = camelizeKeys(v);
    }
    return out;
  }
  return value;
}
