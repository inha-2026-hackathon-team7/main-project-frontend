# 프로젝트 인수인계 문서 (instructions.md)

이 문서는 이전 세션에서 진행한 작업을 다음 작업자(사람이든 에이전트든)가 이어받을 수 있도록
현재 상태, 핵심 설계 결정, 알려진 이슈, 남은 작업을 정리한 것이다.

## 1. 프로젝트 개요

- 지역 기반 스탬프 투어 앱의 **사용자용 프론트엔드** (React + Vite).
- `/admin/**` 엔드포인트(조직 관리자용)는 이 프론트의 대상이 아니다. 별도 관리자 대시보드가 있는 것으로 보인다.
- 원래는 팀원이 만든 정적 mock(localStorage 기반) 프로토타입이었고, 이번 세션들에서 **실제 백엔드 API 연동**으로 전환했다.
- 스택: React 18, react-router-dom v6, axios, leaflet(지도), html5-qrcode(QR 스캔), Vite, Docker(nginx로 정적 서빙).

## 2. 폴더 구조 핵심

```
src/
  App.jsx                 라우트 정의
  layouts/
    RootLayout.jsx        전역 스타일 + 프레임 래퍼
    ProtectedLayout.jsx   로그인 가드 + 하단 탭바 표시 여부
  context/AuthContext.jsx 로그인 상태(user, accessToken) React Context
  services/
    httpClient.js         axios 인스턴스 — 인증 헤더 자동 첨부 + camelCase<->snake_case 자동 변환 (★핵심, 아래 3번 참고)
    authStorage.js         localStorage에 user+accessToken 저장/조회
    api.js                 실제 API 호출 함수들 (authApi, coursesApi, enrollmentsApi, rewardsApi, usersApi)
  utils/
    caseConvert.js         camelizeKeys / snakeizeKeys (재귀적으로 객체 키 변환)
    geolocation.js          getCurrentPositionSafe (브라우저 GPS, 실패 시 null), formatDistanceMeters
  pages/                   화면별 컴포넌트 (아래 4번 라우팅 참고)
  components/
    map/CourseMap.jsx      Leaflet 지도 (장소 마커, 다음 목표 강조, 50m 반경 표시)
    common/                로딩 스켈레톤, 빈 상태, 에러 상태 등 공용 UI
  styles/GlobalStyle.jsx    전역 CSS (디자인 시스템: 토스 스타일, COLORS는 constants/colors.js)
```

## 3. ★가장 중요: 백엔드 naming 정책과 자동 변환 레이어

백엔드는 `spring.jackson.property-naming-strategy=SNAKE_CASE`로 설정되어 있다.
즉 **실제 요청/응답 바디는 전부 snake_case**다 (`access_token`, `enrollment_id`, `thumbnail_url` 등).
OpenAPI 스펙 문서(`api-docs.json`)에는 필드명이 camelCase로 나오는데, 이는 문서 생성 시점의 표기일 뿐 실제 런타임 값과 다르다 — **스펙 문서의 필드명 표기를 곧이곧대로 믿지 말 것.**

이 문제를 [src/services/httpClient.js](src/services/httpClient.js)에서 한 번에 해결해두었다:

- **요청 인터셉터**: `config.data`(JSON 바디)가 있으면 `snakeizeKeys()`로 camelCase → snake_case 변환 후 전송.
  쿼리 파라미터(`organization_id`, `region_id` 등)는 원래부터 스펙상 snake_case라 변환하지 않고 `api.js`에서 직접 그 이름으로 지정한다.
- **응답 인터셉터**: 성공/에러 응답 바디 모두 `camelizeKeys()`로 snake_case → camelCase 변환.

**따라서 `api.js`와 그 위의 모든 컴포넌트는 항상 camelCase만 다루면 된다.** 새 엔드포인트를 추가할 때도
그냥 camelCase로 짜면 되고, 이 변환 레이어를 우회하거나 개별적으로 snake_case를 신경 쓸 필요가 없다.

만약 새로운 필드에서 "undefined가 뜬다"는 버그가 또 나오면, 십중팔구 이 변환 레이어의 문제가 아니라
**백엔드 필드 자체가 예상과 다른 이름/구조로 내려오는 것**이니 실제 네트워크 응답(브라우저 개발자 도구 Network 탭 — 여긴 원본 snake_case가 그대로 보이는 게 정상)을 까서 확인해야 한다.

## 4. 라우팅 구조 ([App.jsx](src/App.jsx))

```
/                                                          -> /courses로 리다이렉트
/login                                                     AuthPage
/courses                                                   CourseListPage
/courses/:courseId                                         CourseDetailPage
/courses/:courseId/enrollments/:enrollmentId               CourseActivePage   (코스 진행 화면)
/courses/:courseId/enrollments/:enrollmentId/scan          StampScanPage      (QR 스캔)
/courses/:courseId/enrollments/:enrollmentId/complete      CourseCompletePage (완주 → 리워드 수령)
/rewards                                                   RewardsPage        (리워드함)
/mypage                                                    MyPagePage
```

- `/login`을 제외한 전부 `ProtectedLayout`으로 감싸여 있어 로그인 안 하면 `/login`으로 리다이렉트된다.
  (`GET /courses`, `GET /courses/{id}`는 스펙상 인증 불필요(public)인데도 지금은 로그인 없이 접근 불가 — 의도적으로 손대지 않았다. 게스트 열람을 원하면 이 구조를 바꿔야 한다.)
- enrollment 관련 라우트에 `courseId`를 넣어둔 이유: 처음엔 `GET /enrollments/{id}` 응답에 course 정보가 없어서 별도로 `GET /courses/{courseId}`를 호출해 병합해야 했기 때문. 지금은 백엔드가 진행 상황 응답에 `course`/`places`/`reward`를 직접 내려주도록 스펙이 개선되어 실제로는 courseId 없이도 동작 가능하지만(`enrollmentsApi.getWithCourse(enrollmentId)`가 `getProgress`만 호출), 라우트 구조는 그대로 두었다(마이페이지 목록 등에서 이미 courseId를 알고 있어 URL에 넣는 게 자연스러움).

## 5. 인증 흐름

- `POST /auth/login` → `{ accessToken, user: { id, name, role } }` (실제로는 `access_token`으로 오지만 위 변환 레이어가 처리).
- `POST /auth/register` → 응답에 토큰이 없어서, [AuthPage.jsx](src/pages/AuthPage.jsx)는 회원가입 성공 직후 같은 자격증명으로 다시 로그인을 호출한다.
- `AuthContext.login(user, accessToken)`이 [authStorage.js](src/services/authStorage.js)를 통해 `localStorage["starton_auth_session"]`에 저장.
- `httpClient.js`의 요청 인터셉터가 저장된 `accessToken`이 있으면 모든 요청에 `Authorization: Bearer ...`를 자동으로 붙인다.
- 로그인 없이 둘러보기(게스트) 기능은 실제 인증 체계로 전환하면서 제거했다 (가짜 토큰 없는 상태로 보호된 API를 호출하면 401만 나서 의미가 없었음).

## 6. 알려진 이슈 / 확실하지 않은 것 (다음 작업자가 주의할 부분)

1. **enum 실제 표기값이 스펙에 문서화되어 있지 않음.**
   - 코스/enrollment의 `status` 문자열 정확한 케이스를 신뢰하지 않고, 대신 `completedAt` 필드의 존재 유무로 "완주 여부"를 판단한다 ([api.js](src/services/api.js:150), [MyPagePage.jsx](src/pages/MyPagePage.jsx)).
   - 리워드 클레임의 `status`는 실제로 `"claimed"`(수령 직후, 미사용)를 관측했고, `redeem` 성공 시 `"used"`로 바뀌는 것으로 확인됨 ([RewardsPage.jsx](src/pages/RewardsPage.jsx)의 `isRewardUsed()`). 만약 실제로 다른 문자열이 나오면 이 함수만 고치면 된다.
2. **`GET /courses`, `GET /courses/{courseId}`에 여전히 없는 필드**: 코스 `category`. (region/거리/소요시간은 나중에 추가되어 지금은 사용 중 — `regionName`, `distanceMeters`, `durationMinutes`.)
3. **매장 사용 완료 처리(`POST /reward-claims/{claimId}/redeem`)**의 에러 응답 바디 형태(코드 필드명이 `code`인지 `error`인지)를 정확히 확인 못 했다. [RewardsPage.jsx](src/pages/RewardsPage.jsx)의 `describeRedeemError()`가 `err.data?.code || err.data?.error`를 방어적으로 다 체크하도록 되어 있는데, 실제로 다른 필드명이면 메시지가 기본 문구로만 뜬다.
4. **리워드 쿠폰 교환 코드/바코드 필드가 스펙에 없음.** 매장에 제시할 바코드 숫자는 `claimId`를 시드로 한 결정적 해시로 **mock** 생성 중이다 (`mockBarcodeCode()` in RewardsPage.jsx). 실제 서비스에 낼 거면 백엔드에 진짜 교환 코드 필드 추가를 요청해야 한다.
5. **위치정보**: 코스 목록/상세 조회 시 `getCurrentPositionSafe()`로 실제 브라우저 GPS를 가져와 `lat`/`lng` 쿼리로 보내 거리 계산을 받는다. 권한 거부/타임아웃 시 그냥 `undefined`를 보내고, 서버가 거리 없이 응답해도 UI는 정상 동작(거리 표시만 생략)하도록 만들어져 있다.
6. **로그인 게이트가 `/courses`, `/courses/:id`까지 막고 있음** (5번 항목 참고). 스펙상 public인데 실제로는 로그인 필요 — 필요하면 라우트 구조 재검토.

## 7. 이번 세션들에서 처리한 작업 순서 요약 (git log 참고용)

1. 모놀리식 mock 프로토타입 → 라우팅/레이아웃 분리 (React Router, 반응형 레이아웃, 버튼 스타일 버그 수정 등).
2. 실제 백엔드 OpenAPI 스펙 분석 → mock(localStorage) 엔진 완전 제거, axios 기반 실연동으로 전환.
3. camelCase ↔ snake_case 자동 변환 레이어 도입 (httpClient.js request/response 인터셉터) — 로그인 토큰 안 잡히는 버그, 코스 시작 시 `/enrollments/undefined` 이동 버그, 코스 이미지 안 보이는 버그가 전부 이 문제였음.
4. `POST /reward-claims/{claimId}/redeem`, `POST /enrollments/{enrollmentId}/abandon` 신규 엔드포인트 연동 (리워드 매장 사용 처리, 코스 포기하기 UI 추가).
5. 완주 화면 재방문 시 리워드 무한 수령 방지 (이미 수령한 기록이 있으면 수령 버튼 대신 "확인하기" 버튼으로 전환).
6. 개발/시연용 상태 시뮬레이션 UI 전부 제거: `DevStateSwitcher`(로딩/성공/에러/빈 데이터 강제 전환 버튼), 코스 진행 화면의 GPS 위치 시뮬레이션 토글, QR 스캔 데모 패널. 지금은 전부 실제 API 응답과 실제 GPS만 사용.

## 8. 로컬 개발 / 배포

- `npm install && npm run dev` (Vite, 기본 포트 5173).
- `.env`에 `VITE_API_BASE_URL` 설정 (기본값 `http://localhost:8080`). `.env`는 gitignore 처리되어 있으니 각자 로컬에서 `.env.example`을 복사해 쓸 것 — 백엔드가 다른 머신/IP에서 뜨면 이 값만 바꾸면 된다.
- Docker 배포: `Dockerfile`이 빌드 시점에 `VITE_API_BASE_URL`을 `--build-arg`로 굽는다 (Vite는 런타임에 env를 못 바꾸므로 배포 시마다 재빌드 필요). `nginx.conf`는 단순 SPA fallback(`try_files ... /index.html`) 설정.
- (2026-09-14 갱신) 현재 세션 환경(WSL)에는 Node.js v25.2.1 / npm 11.6.2가 설치되어 있어 `npm run dev`/`npm run build` 실행 검증이 가능하다. 이전 세션들에서는 Node.js가 없어 실행 검증을 못 했었는데, 이제는 다음 작업자가 실제로 빌드/실행해서 확인해야 한다(더 이상 환경 제약을 이유로 건너뛸 수 없음).

## 9. 다음에 하면 좋을 것 (제안, 미착수)

- 코스 목록/상세에 `category` 필드가 추가되면 UI에 다시 노출.
- 리워드 클레임에 실제 교환 코드 필드가 생기면 mock 바코드 로직 제거.
- `/courses`, `/courses/:id`를 로그인 없이도 볼 수 있게 라우트 구조 변경 여부 검토 (스펙상 public).
- `redeem`/`abandon` 에러 응답의 실제 바디 필드명 확인 후 `describeRedeemError`/`handleAbandon`의 에러 코드 파싱 로직 검증.

## 10. (2026-09-14) User 코스 추천(사용자 제작 코스) 기능 추가

하단 탭에 "코스 만들기"(`MapPinned` 아이콘, `/create-course`)를 추가했다. 3단계 플로우:

1. `pages/PickOrganizationPage.jsx` (`/create-course`) — `GET /organizations`로 조직 목록을 받아 선택.
2. `pages/CreateCoursePage.jsx` (`/create-course/:organizationId`) — `GET /organizations/{id}/places`로
   장소 목록을 받아 제목/설명 입력 + 지도(`components/map/PlacePickerMap.jsx`, 신규)와 리스트에서 장소를
   선택(탭 순서 = 방문 순서, 최소 2개). `POST /courses`로 생성.
3. `pages/CreateCourseCompletePage.jsx` (`/create-course/:organizationId/complete`) — 생성 결과를
   `navigate` state로 받아 표시. 새로고침하면 state가 없어져 폴백 문구만 보임(의도된 동작).

**주의할 점**:
- `BottomNav.jsx`의 `data-active`가 `startsWith(path)`라서, 새 탭 경로를 `/courses`로 시작하게 만들면
  안 된다(기존 "코스" 탭과 동시 활성화됨) — 그래서 `/create-course`라는 별도 최상위 경로를 씀.
- `PlacePickerMap.jsx`는 기존 `CourseMap.jsx`(진행 중 코스 전용, 50m 반경/다음 목표 개념)를 건드리지
  않고 새로 만든 형제 컴포넌트다 — props 의미가 다름(`stampedPlaceIds`/`nextPlace`가 아니라
  `selectedPlaceIds`/`onTogglePlace`).
- 사용자 코스는 리워드가 없는 상태로 즉시 게시되므로, `CourseListPage.jsx`/`CourseDetailPage.jsx`는
  이미 리워드 null-safe였고 "user" 타입 배지("유저 참여")도 이미 있어서 **변경 없이 그대로 동작**함을
  확인함.
- `GlobalStyle.jsx`에 `.st-textarea`(코스 설명 입력), `.st-map-pin.selected`(장소 선택 상태) 두 클래스를
  추가했다.
- 백엔드 신규 엔드포인트(`POST /courses`, `GET /organizations`, `GET /organizations/{id}/places`)는
  백엔드 `instructions.md` §9 참고. 실제 백엔드 기동 후 curl로 전체 플로우(가입→로그인→조직 선택→
  장소 조회→생성→관리자 승인/반려)와 검증 실패 케이스까지 전부 확인했다.
- `npm run build` 통과 확인함. 브라우저에서 실제 클릭 플로우(지도 탭, 리스트 탭, disabled 버튼 상태 등)는
  아직 수동으로 확인 안 했음 — 다음 작업자가 `npm run dev`로 직접 클릭해서 확인할 것.
