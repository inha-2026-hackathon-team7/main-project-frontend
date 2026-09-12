import { useEffect, useRef } from "react";
import L from "leaflet";
import { Locate, Navigation } from "lucide-react";
import { COLORS } from "../../constants/colors.js";

/* ============================================================================
   코스 지도 컴포넌트 (Leaflet 기반)
   - 코스 내 장소 마커, 50m 인증 허용 반경 Circle 시각화
   - 사용자 현재 GPS 위치 및 코스 경로 Polyline 렌더링
   - fitBounds 자동 시야 맞춤
   ========================================================================== */

export default function CourseMap({
  places = [],
  stampedPlaceIds = [],
  nextPlace = null,
  userLocation = null,
  onSelectPlace,
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);

  // 지도 인스턴스 초기화
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialCenter = places.length > 0
        ? [places[0].lat, places[0].lng]
        : [35.0772, 129.0441];

      const map = L.map(mapContainerRef.current, {
        center: initialCenter,
        zoom: 15,
        zoomControl: false,
        attributionControl: false,
      });

      // OpenStreetMap 타일
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(map);

      // 우측 상단 줌 컨트롤
      L.control.zoom({ position: "topright" }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markersGroup;
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 마커 및 경로 갱신
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();

    if (!places || places.length === 0) return;

    const bounds = [];
    const polylineCoords = [];

    // 1. 장소 마커들
    places.forEach((p, idx) => {
      const isStamped = stampedPlaceIds.includes(p.course_place_id);
      const isTarget = nextPlace && nextPlace.course_place_id === p.course_place_id;
      const order = p.visit_order || idx + 1;

      bounds.push([p.lat, p.lng]);
      polylineCoords.push([p.lat, p.lng]);

      // 커스텀 HTML 아이콘
      const pinClass = isStamped
        ? "st-map-pin done"
        : isTarget
        ? "st-map-pin target"
        : "st-map-pin";

      const pinIcon = L.divIcon({
        className: "custom-div-icon",
        html: `<div class="${pinClass}">${isStamped ? "✓" : order}</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([p.lat, p.lng], { icon: pinIcon }).addTo(layer);

      // 팝업
      const statusBadge = isStamped
        ? `<span style="color: ${COLORS.leaf}; font-weight: 700;">✓ 스탬프 완료</span>`
        : isTarget
        ? `<span style="color: ${COLORS.seal}; font-weight: 700;">🎯 다음 목표</span>`
        : `<span style="color: ${COLORS.inkSoft};">미방문</span>`;

      marker.bindPopup(`
        <div style="font-family: inherit; font-size: 13px; line-height: 1.4; padding: 2px;">
          <div style="font-weight: 800; font-size: 14px; margin-bottom: 3px; color: ${COLORS.ink};">
            ${p.visit_order ? p.visit_order + ". " : ""}${p.name}
          </div>
          <div style="margin-bottom: 4px;">${statusBadge}</div>
          <div style="font-size: 12px; color: ${COLORS.inkSoft};">${p.description || ""}</div>
        </div>
      `);

      marker.on("click", () => {
        if (onSelectPlace) onSelectPlace(p);
      });

      // 2. 다음 목표 장소 주변 50m 허용 반경 Circle
      if (isTarget) {
        L.circle([p.lat, p.lng], {
          radius: 50, // 50m
          color: COLORS.seal,
          weight: 2,
          dashArray: "4, 6",
          fillColor: COLORS.seal,
          fillOpacity: 0.15,
        }).addTo(layer);
      }
    });

    // 3. 코스 연결선 (Polyline)
    if (polylineCoords.length > 1) {
      L.polyline(polylineCoords, {
        color: COLORS.seal,
        weight: 3.5,
        opacity: 0.7,
        dashArray: "6, 8",
      }).addTo(layer);
    }

    // 4. 사용자 현재 위치 마커
    if (userLocation && userLocation.lat && userLocation.lng) {
      bounds.push([userLocation.lat, userLocation.lng]);
      const userIcon = L.divIcon({
        className: "custom-div-icon",
        html: `<div class="st-user-marker"></div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });

      L.marker([userLocation.lat, userLocation.lng], {
        icon: userIcon,
        zIndexOffset: 1000,
      })
        .addTo(layer)
        .bindPopup("<b>내 현재 위치</b>");
    }

    // 지도 뷰 영역 자동 맞춤
    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [36, 36], maxZoom: 16 });
    }
  }, [places, stampedPlaceIds, nextPlace, userLocation]);

  // 내 위치 또는 다음 장소로 지도 이동 버튼 핸들러
  const handleRecenter = () => {
    if (!mapInstanceRef.current) return;
    if (nextPlace) {
      mapInstanceRef.current.flyTo([nextPlace.lat, nextPlace.lng], 16, {
        animate: true,
        duration: 0.8,
      });
    } else if (userLocation) {
      mapInstanceRef.current.flyTo([userLocation.lat, userLocation.lng], 16, {
        animate: true,
        duration: 0.8,
      });
    }
  };

  return (
    <div className="st-map-container">
      <div ref={mapContainerRef} className="st-map-full" />

      {/* 우측 하단 컨트롤 버튼 */}
      <div
        style={{
          position: "absolute",
          bottom: 12,
          right: 12,
          zIndex: 999,
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        <button
          onClick={handleRecenter}
          title="목표 장소로 이동"
          style={{
            width: 36,
            height: 36,
            borderRadius: 12,
            background: COLORS.surface,
            border: "none",
            boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: COLORS.seal,
          }}
        >
          <Navigation size={18} />
        </button>
      </div>

      {/* 좌측 상단 반경 안내 배지 */}
      <div
        style={{
          position: "absolute",
          top: 12,
          left: 12,
          zIndex: 999,
          background: "rgba(255, 255, 255, 0.92)",
          backdropFilter: "blur(4px)",
          padding: "5px 10px",
          borderRadius: 999,
          fontSize: 11,
          fontWeight: 700,
          color: COLORS.ink,
          boxShadow: "0 1px 4px rgba(0,0,0,0.12)",
          display: "flex",
          alignItems: "center",
          gap: 5,
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: COLORS.seal,
            display: "inline-block",
          }}
        />
        <span>스탬프 인증 반경 50m</span>
      </div>
    </div>
  );
}
