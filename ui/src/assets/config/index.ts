const trimTrailingSlash = (url: string) => url.replace(/\/+$/, "");

export const apiUrl = trimTrailingSlash(import.meta.env.VITE_API_URL || "http://localhost:5000");

export const adminApiUrl = `${apiUrl}/admin`;

export const linksUrl = trimTrailingSlash(import.meta.env.VITE_LINKS_URL || apiUrl);

export const appVersion = __APP_VERSION__;

export const storageKeys = {
  auth: "pocketrun_auth",
  pageDrafts: "pocketrun_page_drafts"
} as const;

export const healthCheckInterval = 20000;

export const explorerPageSize = 15;

export const copyFeedbackDuration = 2000;

export const brandFontCssUrl =
  "https://fonts.googleapis.com/css2?family=Unbounded:wght@800&text=POCKETRUN&display=block";

export const brandFontTimeout = 8000;

export const brandWordmark = {
  text: "POCKETRUN",
  font: "800 100px Unbounded, sans-serif",
  fontSize: 100,
  capHeight: 72,
  letterSpacing: -3.5,
  fallbackWidth: 720
} as const;

export const symbolMotion = {
  spreadDegrees: 10,
  spreadTilt: 4,
  snapDegrees: 16,
  savedFeedbackDuration: 1400
} as const;

export const expiryWarningDays = 14;

export const slugCheckDelay = 500;

export const randomSlugLength = 8;

export const linkTitleMaxLength = 20;

export const defaultGroupAppearance = { color: "gray", icon: "stack" } as const;

export const historyPageSize = 20;

export const linksPageSize = 20;

export const pagesPageSize = 20;

export const pageTitleMaxLength = 20;

export const pageHtmlMaxBytes = 512 * 1024;

export const pagePreviewDelay = 600;

export const pageVersionMessageMaxLength = 80;

export const pageAccessPinLength = 6;

export const pageAccessSessionHours = 12;

export const pageAccessKeysMax = 20;

export const pageVersionsKept = 50;

export const pageDraftSaveDelay = 1000;

export const pageLintDelay = 400;

export const searchDelay = 800;

export const searchSpinnerMinDuration = 500;

export const clickLimitRange = { min: 1, max: 150, initial: 100 } as const;

export const defaultPeriodHours = 168;

export const customPeriodHours = 24;
