import "server-only";
import { cache } from "react";
import { getPayloadClient } from "@/lib/payload";

export const getShopPhone = cache(async (): Promise<string | undefined> => {
  try {
    const payload = await getPayloadClient();
    const settings = await payload.findGlobal({ slug: "shop-settings" });
    const phone = typeof settings.phone === "string" ? settings.phone.trim() : "";
    return phone || undefined;
  } catch {
    return undefined;
  }
});
