import { useEffect } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useFaviconEffect(companyProfile: any, appName: string) {
  useEffect(() => {
    if (companyProfile?.company_name) {
      document.title = companyProfile.company_name;
    } else {
      document.title = appName;
    }

    const setFavicon = (url: string) => {
      let link: HTMLLinkElement | null =
        document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
      }
      link.href = url;

      const appleLink: HTMLLinkElement | null = document.querySelector(
        "link[rel='apple-touch-icon']",
      );
      if (appleLink) {
        appleLink.href = url;
      }
    };

    if (companyProfile?.logo) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const size = Math.min(img.width, img.height, 256); // Limit canvas size
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const radius = size * 0.22; // ~22% border radius looks good for app icons
          ctx.beginPath();
          ctx.moveTo(radius, 0);
          ctx.lineTo(size - radius, 0);
          ctx.quadraticCurveTo(size, 0, size, radius);
          ctx.lineTo(size, size - radius);
          ctx.quadraticCurveTo(size, size, size - radius, size);
          ctx.lineTo(radius, size);
          ctx.quadraticCurveTo(0, size, 0, size - radius);
          ctx.lineTo(0, radius);
          ctx.quadraticCurveTo(0, 0, radius, 0);
          ctx.closePath();
          ctx.clip();

          // Draw image covering the square
          const scale = size / Math.min(img.width, img.height);
          const x = (size - img.width * scale) / 2;
          const y = (size - img.height * scale) / 2;
          ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

          setFavicon(canvas.toDataURL("image/png"));
        } else {
          setFavicon(companyProfile.logo!);
        }
      };
      img.onerror = () => setFavicon(companyProfile.logo!);
      img.src = companyProfile.logo;
    } else {
      setFavicon("/favicon.svg");
    }
  }, [companyProfile, appName]);
}
