import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { contentApi } from "../utils/api";
import { useLiveData } from "../hooks/useLiveData";
import { resolveImageUrl } from "../utils/imageUrl";
import {
  DEFAULT_SITE_IMAGES,
  mergeSiteImages,
} from "../utils/siteImagesDefaults";
import { readCache, writeCache } from "../utils/storeCache";

const SiteImagesContext = createContext(null);

function resolveWithFallback(path, fallbackPath) {
  return (
    resolveImageUrl(path) || resolveImageUrl(fallbackPath) || fallbackPath || ""
  );
}

export function SiteImagesProvider({ children }) {
  const [images, setImages] = useState(() =>
    mergeSiteImages(readCache("site-images")),
  );

  const fetchImages = useCallback(() => {
    contentApi
      .getSiteImages()
      .then((res) => {
        const merged = mergeSiteImages(res.data);
        setImages(merged);
        writeCache("site-images", merged);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const onUpdated = () => fetchImages();
    const onStorage = (event) => {
      if (event.key === "karyor:site-images:updated") {
        onUpdated();
      }
    };

    window.addEventListener("site-images-updated", onUpdated);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("site-images-updated", onUpdated);
      window.removeEventListener("storage", onStorage);
    };
  }, [fetchImages]);

  useLiveData(fetchImages);

  const value = useMemo(() => {
    const showcase = images.distributorShowcase?.length
      ? images.distributorShowcase
      : DEFAULT_SITE_IMAGES.distributorShowcase;

    const benefits = images.distributorBenefits?.length
      ? images.distributorBenefits
      : DEFAULT_SITE_IMAGES.distributorBenefits;

    const processSteps = images.processSteps?.length
      ? images.processSteps
      : DEFAULT_SITE_IMAGES.processSteps;

    return {
      images,
      logo: resolveWithFallback(images.logo, DEFAULT_SITE_IMAGES.logo),
      heroDesktop: resolveWithFallback(
        images.heroDesktop,
        DEFAULT_SITE_IMAGES.heroDesktop,
      ),
      heroMobile: resolveWithFallback(
        images.heroMobile,
        DEFAULT_SITE_IMAGES.heroMobile,
      ),
      aboutImage: resolveWithFallback(
        images.aboutImage,
        DEFAULT_SITE_IMAGES.aboutImage,
      ),
      distributorHero: resolveWithFallback(
        images.distributorHero,
        DEFAULT_SITE_IMAGES.distributorHero,
      ),
      distributorBanner: resolveWithFallback(
        images.distributorBanner,
        DEFAULT_SITE_IMAGES.distributorBanner,
      ),
      distributorShowcase: showcase.map((item, index) => ({
        ...item,
        image: resolveWithFallback(
          item.image,
          DEFAULT_SITE_IMAGES.distributorShowcase[index]?.image,
        ),
      })),
      distributorBenefits: benefits.map((item, index) => ({
        ...item,
        image: resolveWithFallback(
          item.image,
          DEFAULT_SITE_IMAGES.distributorBenefits[index]?.image,
        ),
      })),
      processSteps: processSteps.map((item, index) => ({
        ...item,
        image: resolveWithFallback(
          item.image,
          DEFAULT_SITE_IMAGES.processSteps[index]?.image,
        ),
      })),
    };
  }, [images]);

  return (
    <SiteImagesContext.Provider value={value}>
      {children}
    </SiteImagesContext.Provider>
  );
}

export function useSiteImages() {
  const context = useContext(SiteImagesContext);
  if (!context) {
    throw new Error("useSiteImages must be used within SiteImagesProvider");
  }
  return context;
}
