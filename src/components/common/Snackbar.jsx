import { AlertTriangle } from "lucide-react";
import { COLORS } from "../../constants/colors.js";
import { useSnackbar } from "../../context/SnackbarContext.jsx";

export default function Snackbar() {
  const { snackbar, hideSnackbar } = useSnackbar();
  if (!snackbar) return null;

  return (
    <div
      role="status"
      onClick={hideSnackbar}
      style={{
        position: "fixed",
        left: "50%",
        bottom: 28,
        transform: "translateX(-50%)",
        width: "calc(100% - 40px)",
        maxWidth: 390,
        background: COLORS.ink,
        color: "#fff",
        borderRadius: 14,
        padding: "13px 16px",
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        fontSize: 13.5,
        fontWeight: 700,
        lineHeight: 1.4,
        boxShadow: "0 8px 24px rgba(0,0,0,0.28)",
        cursor: "pointer",
        zIndex: 2000,
      }}
    >
      <AlertTriangle size={16} color={COLORS.gold} style={{ flexShrink: 0, marginTop: 1 }} />
      <span>{snackbar.message}</span>
    </div>
  );
}
