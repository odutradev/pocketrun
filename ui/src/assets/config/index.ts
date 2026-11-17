const trimTrailingSlash = (url: string) => url.replace(/\/+$/, "");

export const apiUrl = trimTrailingSlash(import.meta.env.VITE_API_URL || "http://localhost:5000");

export const adminApiUrl = `${apiUrl}/admin`;

export const appVersion = __APP_VERSION__;

export const storageKeys = {
  auth: "pocketrun_auth"
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

export const clickLimitRange = { min: 1, max: 150, initial: 100 } as const;

export const defaultPeriodHours = 168;

export const customPeriodHours = 24;
