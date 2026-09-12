export default function LoadingSkeletonList({ rows = 3 }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingTop: 6 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="st-card" style={{ display: "flex", gap: 12 }}>
          <div className="st-skel" style={{ width: 56, height: 56, flexShrink: 0 }} />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8, justifyContent: "center" }}>
            <div className="st-skel" style={{ height: 14, width: "70%" }} />
            <div className="st-skel" style={{ height: 12, width: "40%" }} />
          </div>
        </div>
      ))}
    </div>
  );
}
