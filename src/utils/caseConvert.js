/* ============================================================================
   snake_case ↔ camelCase 변환 유틸
   - 백엔드가 spring.jackson.property-naming-strategy=SNAKE_CASE로 설정되어 있어,
     JSON 응답/요청 바디의 키가 전부 snake_case다 (access_token, enrollment_id,
     thumbnail_url, qrcode_string 등). 프론트 코드는 항상 camelCase만 다루도록
     axios 요청/응답 양쪽에서 이 유틸로 자동 변환한다.
   - 쿼리 파라미터(organization_id 등)는 Jackson과 무관하게 스펙에 원래부터
     snake_case로 정의되어 있어 여기서 건드리지 않는다(api.js에서 직접 지정).
   ========================================================================== */

// JSON.parse/JSON.stringify가 다루는 순수 {} 객체만 대상으로 한다 (Date/Blob/File 등은 건드리지 않음)
const isPlainObject = (v) => v !== null && typeof v === "object" && v.constructor === Object;

function snakeToCamelKey(key) {
  return key.replace(/_([a-zA-Z0-9])/g, (_, c) => c.toUpperCase());
}

function camelToSnakeKey(key) {
  return key.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
}

function transformKeysDeep(value, keyFn) {
  if (Array.isArray(value)) {
    return value.map((v) => transformKeysDeep(v, keyFn));
  }
  if (isPlainObject(value)) {
    const out = {};
    for (const [key, v] of Object.entries(value)) {
      out[keyFn(key)] = transformKeysDeep(v, keyFn);
    }
    return out;
  }
  return value;
}

// 응답 바디: snake_case -> camelCase (이미 camelCase인 키는 언더스코어가 없어 그대로 유지됨)
export function camelizeKeys(value) {
  return transformKeysDeep(value, snakeToCamelKey);
}

// 요청 바디: camelCase -> snake_case
export function snakeizeKeys(value) {
  return transformKeysDeep(value, camelToSnakeKey);
}
