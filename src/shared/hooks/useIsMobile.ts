import { useState, useEffect } from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const syncMobile = () =>
      setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    syncMobile();
    window.addEventListener("resize", syncMobile);
    return () => window.removeEventListener("resize", syncMobile);
  }, []);

  return isMobile;
}
