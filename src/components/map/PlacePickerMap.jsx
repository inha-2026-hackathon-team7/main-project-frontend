import { useEffect, useRef } from "react";
import L from "leaflet";

/* ============================================================================
   장소 선택 지도 컴포넌트 (Leaflet 기반)
   - 조직의 전체 장소를 지도에 표시하고, 탭하면 선택/해제된다.
   - 선택 순서 = 방문 순서(visitOrder) — 선택된 핀에는 그 순번을 배지로 표시한다.
   - CourseMap.jsx(진행 중인 코스 전용, 50m 반경/다음 목표 개념)와는 의미가 달라
     별도 컴포넌트로 분리했다.
   ========================================================================== */

export default function PlacePickerMap({ places = [], selectedPlaceIds = [], onTogglePlace }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);

  // 지도 인스턴스 초기화
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialCenter = places.length > 0
        ? [places[0].latitude, places[0].longitude]
        : [35.0772, 129.0441];

      const map = L.map(mapContainerRef.current, {
        center: initialCenter,
        zoom: 15,
        zoomControl: false,
        attributionControl: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(map);

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

  // 마커 갱신
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();

    if (!places || places.length === 0) return;

    const bounds = [];

    places.forEach((p) => {
      const order = selectedPlaceIds.indexOf(p.id);
      const isSelected = order !== -1;

      bounds.push([p.latitude, p.longitude]);

      const pinClass = isSelected ? "st-map-pin selected" : "st-map-pin";
      const pinIcon = L.divIcon({
        className: "custom-div-icon",
        html: `<div class="${pinClass}">${isSelected ? order + 1 : ""}</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([p.latitude, p.longitude], { icon: pinIcon }).addTo(layer);

      marker.bindPopup(`
        <div style="font-family: inherit; font-size: 13px; line-height: 1.4; padding: 2px;">
          <div style="font-weight: 800; font-size: 14px; color: #191F28;">${p.name}</div>
        </div>
      `);

      marker.on("click", () => onTogglePlace?.(p.id));
    });

    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [36, 36], maxZoom: 16 });
    }
  }, [places, selectedPlaceIds, onTogglePlace]);

  return (
    <div className="st-map-container">
      <div ref={mapContainerRef} className="st-map-full" />
    </div>
  );
}
