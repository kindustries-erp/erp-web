export function getBuildVersionLabel(): string {
  const buildVersion = __APP_BUILD_VERSION__;
  const rawIso = buildVersion.split("-").slice(0, 3).join("-");
  const parsed = new Date(rawIso);
  if (Number.isNaN(parsed.getTime())) return buildVersion;
  const utcMs = parsed.getTime() + parsed.getTimezoneOffset() * 60 * 1000;
  const gmt7 = new Date(utcMs + 7 * 60 * 60 * 1000);
  const yyyy = gmt7.getFullYear();
  const mm = String(gmt7.getMonth() + 1).padStart(2, "0");
  const dd = String(gmt7.getDate()).padStart(2, "0");
  const hh = String(gmt7.getHours()).padStart(2, "0");
  const min = String(gmt7.getMinutes()).padStart(2, "0");
  const ss = String(gmt7.getSeconds()).padStart(2, "0");
  return `${yyyy}${mm}${dd}.${hh}${min}${ss}`;
}
