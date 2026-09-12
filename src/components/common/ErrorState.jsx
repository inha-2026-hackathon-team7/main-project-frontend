import { AlertCircle } from "lucide-react";
import { COLORS } from "../../constants/colors.js";
import CenterState from "./CenterState.jsx";

export default function ErrorState({ onRetry, desc = "일시적인 오류로 정보를 불러오지 못했습니다." }) {
  return (
    <CenterState
      icon={<AlertCircle size={30} color={COLORS.danger} />}
      title="불러오기에 실패했습니다"
      desc={desc}
      actionLabel="다시 시도"
      onAction={onRetry}
    />
  );
}
