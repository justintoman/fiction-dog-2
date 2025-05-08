import { parseWithZod } from "@conform-to/zod";
import { useFetcher } from "react-router";
import { z } from "zod";
import { useHints } from "~/lib/client-hints";
import { useRequestInfo } from "~/lib/request-info";

export const THEME_FETCHER_KEY = "THEME_FETCHER";

export const ThemeFormSchema = z.object({
  theme: z.enum(["system", "light", "dark"]),
});
/**
 * @returns the user's theme preference, or the client hint theme if the user
 * has not set a preference.
 */
export function useTheme() {
  const hints = useHints();
  const requestInfo = useRequestInfo();
  const optimisticMode = useOptimisticThemeMode();
  if (optimisticMode) {
    return optimisticMode === "system" ? hints.theme : optimisticMode;
  }
  return requestInfo.theme ?? hints.theme;
}

/**
 * If the user's changing their theme mode preference, this will return the
 * value it's being changed to.
 */
export function useOptimisticThemeMode() {
  const themeFetcher = useFetcher({ key: THEME_FETCHER_KEY });

  if (themeFetcher.formData) {
    const submission = parseWithZod(themeFetcher.formData, {
      schema: ThemeFormSchema,
    });
    if (submission.status === "success") return submission.value.theme;
    return null;
  }
}
