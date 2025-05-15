import type { Route } from "./+types/route";

export { action } from "../create_.$storySlug.$chapterId/route";

export async function clientAction({
  request,
  serverAction,
}: Route.ClientActionArgs) {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      serverAction().then(resolve).catch(reject);
    }, 1000);

    request.signal.addEventListener("abort", () => {
      clearTimeout(timeoutId);
      reject(new Error("Request aborted"));
    });
  });
}
