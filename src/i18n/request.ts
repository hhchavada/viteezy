import { getUserLocale } from "@/lib/services/locale";
import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async (params) => {
  const locale = await getUserLocale();
  // const locale = "en";
  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
