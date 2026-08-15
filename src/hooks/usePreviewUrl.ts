import { useEffect, useRef, useState } from "react";

// Accepts File | string | null and returns a previewable URL
export function usePreviewUrl(fileOrUrl: File | string | null | undefined) {
  const [url, setUrl] = useState<string | null>(null);
  const lastBlobUrl = useRef<string | null>(null);

  useEffect(() => {
    // Clean up previous blob URL
    if (lastBlobUrl.current) {
      URL.revokeObjectURL(lastBlobUrl.current);
      lastBlobUrl.current = null;
    }

    if (!fileOrUrl) {
      setUrl(null);
      return;
    }

    if (typeof fileOrUrl === "string") {
      setUrl(fileOrUrl);
      return;
    }

    if (fileOrUrl instanceof File) {
      const blobUrl = URL.createObjectURL(fileOrUrl);
      lastBlobUrl.current = blobUrl;
      setUrl(blobUrl);
      return;
    }

    setUrl(null);
  }, [fileOrUrl]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (lastBlobUrl.current) {
        URL.revokeObjectURL(lastBlobUrl.current);
      }
    };
  }, []);

  return url;
}

export function usePreviewUrls(
  filesOrUrls: (File | string | null | undefined)[]
) {
  const [urls, setUrls] = useState<(string | null)[]>([]);
  const lastBlobUrls = useRef<string[]>([]);

  useEffect(() => {
    // cleanup previous blob urls
    lastBlobUrls.current.forEach((url) => {
      URL.revokeObjectURL(url);
    });
    lastBlobUrls.current = [];

    const newUrls = filesOrUrls.map((fileOrUrl) => {
      if (!fileOrUrl) return null;

      if (typeof fileOrUrl === "string") {
        return fileOrUrl;
      }

      if (fileOrUrl instanceof File) {
        const blobUrl = URL.createObjectURL(fileOrUrl);
        lastBlobUrls.current.push(blobUrl);
        return blobUrl;
      }

      return null;
    });

    setUrls(newUrls);

    return () => {
      lastBlobUrls.current.forEach((url) => {
        URL.revokeObjectURL(url);
      });
      lastBlobUrls.current = [];
    };
  }, [filesOrUrls]);

  return urls;
}
