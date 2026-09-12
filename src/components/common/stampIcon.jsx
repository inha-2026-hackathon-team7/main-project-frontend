import { MapPin, QrCode, Nfc } from "lucide-react";

export const stampIcon = (type) => {
  if (type === "GPS") return <MapPin size={15} />;
  if (type === "QR") return <QrCode size={15} />;
  if (type === "NFC") return <Nfc size={15} />;
  return null;
};
