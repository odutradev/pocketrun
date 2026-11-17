import { brandFontCssUrl } from "@assets/config";

const blobToDataUrl = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });

export const getEmbeddedFontCss = async (signal?: AbortSignal): Promise<string> => {
  const cssResponse = await fetch(brandFontCssUrl, { signal });
  const css = await cssResponse.text();
  const fontUrls = [...css.matchAll(/url\((https:[^)]+)\)/g)].map((match) => match[1]);
  const dataUrls = await Promise.all(
    fontUrls.map(async (url) => {
      const fontResponse = await fetch(url, { signal });
      return blobToDataUrl(await fontResponse.blob());
    })
  );
  return fontUrls.reduce((result, url, index) => result.replace(url, dataUrls[index]), css);
};
