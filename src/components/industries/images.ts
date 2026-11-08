import type { Industry } from "./data";
import accounting from "@/assets/industries/accounting.webp";
import manufacturing from "@/assets/industries/manufacturing.webp";
import ecommerce from "@/assets/industries/ecommerce.webp";
import realestate from "@/assets/industries/realestate.webp";
import medical from "@/assets/industries/medical.webp";
import construction from "@/assets/industries/construction.webp";

// Each industry's own picture, shown behind its scene so that switching
// industry visibly changes the setting while the Xeda system in front stays
// the same.
export const industryImages: Record<Industry["key"], string> = {
  accounting,
  manufacturing,
  ecommerce,
  realestate,
  medical,
  construction,
};

/** Fetch all six once the section is near, so switching never waits on the
 *  network. About 100 KB together. */
export const preloadIndustryImages = () => {
  Object.values(industryImages).forEach((src) => {
    const img = new Image();
    img.decoding = "async";
    img.src = src;
  });
};
