import { Inbox } from "lucide-react";
import { COLORS } from "../../constants/colors.js";
import CenterState from "./CenterState.jsx";

export default function EmptyState({ title, desc, actionLabel, onAction }) {
  return (
    <CenterState
      icon={<Inbox size={30} color={COLORS.inkSoft} />}
      title={title}
      desc={desc}
      actionLabel={actionLabel}
      onAction={onAction}
    />
  );
}
