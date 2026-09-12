/* ============================================================================
   Mock 데이터
   백엔드 API 명세서(P0)의 Response 필드 구조를 그대로 따르는 더미 데이터.
   ========================================================================== */
export const MOCK_COURSES = [
  { id: "c1", title: "영도 해안 벽화 골목", region: "부산 영도구", category: "예술/벽화", distance: "2.4km", durationMin: 70, stampCount: 4, summary: "바다를 낀 좁은 골목마다 숨은 벽화를 따라 걷는 코스", tag: "인기" },
  { id: "c2", title: "청년몰 야시장 먹부림", region: "전주 완산구", category: "먹거리", distance: "1.1km", durationMin: 50, stampCount: 3, summary: "청년 상인들이 운영하는 야시장 상점을 도장 깨듯 방문", tag: "신규" },
  { id: "c3", title: "폐역이 된 간이역 기행", region: "정선군", category: "역사/철도", distance: "6.8km", durationMin: 140, stampCount: 5, summary: "운행을 멈춘 간이역 다섯 곳을 잇는 반나절 여정", tag: null },
  { id: "c4", title: "동네 책방 지도", region: "제주 조천읍", category: "문화/서점", distance: "3.2km", durationMin: 90, stampCount: 4, summary: "각기 다른 개성의 독립서점을 돌며 도장을 모으는 코스", tag: null },
];

export const MOCK_COURSE_DETAIL = {
  c1: {
    id: "c1", title: "영도 해안 벽화 골목", region: "부산 영도구", category: "예술/벽화",
    description: "흰여울문화마을부터 절영해안산책로까지, 주민들이 직접 그린 벽화 12점이 남아있는 좁은 골목을 따라 걷습니다. 스탬프 4개를 모두 찍으면 완주 리워드가 발급됩니다.",
    stamps: [
      { id: "s1", order: 1, name: "흰여울 전망대", type: "GPS", location: "부산 영도구 흰여울길 전망대 앞" },
      { id: "s2", order: 2, name: "물양장 벽화거리", type: "QR", location: "안내판 하단 QR 코드 스캔" },
      { id: "s3", order: 3, name: "절영 서점", type: "NFC", location: "서점 카운터 옆 NFC 태그" },
      { id: "s4", order: 4, name: "감지해변 포토존", type: "GPS", location: "부산 영도구 감지해변로" },
    ],
    comments: [
      { id: "m1", user: "바다냥", text: "골목이 진짜 예뻐요, 3번째 스탬프 서점에서 커피도 팔아요", date: "9.10", likes: 6 },
      { id: "m2", user: "해운대러버", text: "저녁 노을 시간대 추천합니다", date: "9.11", likes: 3 },
    ],
  },
  c2: {
    id: "c2", title: "청년몰 야시장 먹부림", region: "전주 완산구", category: "먹거리",
    description: "전주 청년몰 야시장의 이색 먹거리 상점 세 곳을 방문하고 도장을 모으는 코스입니다.",
    stamps: [
      { id: "s1", order: 1, name: "가맥 포차", type: "QR", location: "매대 앞 QR 스티커" },
      { id: "s2", order: 2, name: "수제 소떡 노점", type: "NFC", location: "계산대 NFC 태그" },
      { id: "s3", order: 3, name: "야시장 중앙광장", type: "GPS", location: "전주 완산구 청년몰 중앙광장" },
    ],
    comments: [],
  },
};

export const MOCK_REWARDS = [
  { id: "r1", title: "영도 흰여울 카페 아메리카노 교환권", region: "부산 영도구", code: "YD-2291", status: "unused", expiresAt: "2026-10-31", courseTitle: "영도 해안 벽화 골목" },
  { id: "r2", title: "완산 청년몰 상품권 5,000원", region: "전주 완산구", code: "JJ-1183", status: "used", expiresAt: "2026-09-30", courseTitle: "청년몰 야시장 먹부림" },
  { id: "r3", title: "정선 간이역 기념 배지", region: "정선군", code: "JS-0042", status: "unused", expiresAt: "2026-12-31", courseTitle: "폐역이 된 간이역 기행" },
];

export const MOCK_USER = {
  name: "김도장", email: "stamp.kim@example.com", level: "여행 3단",
  joinedAt: "2026.03", totalStamps: 27, completedCourses: 3,
};

export const MOCK_ENROLLMENTS = [
  { id: "e1", courseId: "c1", courseTitle: "영도 해안 벽화 골목", region: "부산 영도구", status: "in_progress", stampedCount: 2, totalStamps: 4 },
  { id: "e2", courseId: "c2", courseTitle: "청년몰 야시장 먹부림", region: "전주 완산구", status: "completed", stampedCount: 3, totalStamps: 3 },
  { id: "e3", courseId: "c4", courseTitle: "동네 책방 지도", region: "제주 조천읍", status: "in_progress", stampedCount: 1, totalStamps: 4 },
];
