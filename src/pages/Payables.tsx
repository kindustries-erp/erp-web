import { useEffect } from "react";

export function PhaiTra() {
  useEffect(() => {
    window.location.href = "/phai-thu?tab=phaittra";
  }, []);
  return null;
}
