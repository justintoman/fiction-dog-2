import { invariant } from "@epic-web/invariant";
import { useFetchers } from "react-router";
import type { Choice } from "~/generated/prisma";

export function usePendingChoices(choices: Omit<Choice, "chapterId">[]) {
  const fetchers = useFetchers();
  const pendingChoices = fetchers
    .filter((fetcher) => fetcher.key.startsWith("choice:") && fetcher.formData)
    .map((fetcher) => {
      const id = fetcher.formData?.get("id");
      invariant(typeof id === "string", "id is required");

      const content = fetcher.formData?.get("content");
      invariant(typeof content === "string", "content is required");

      const order = fetcher.formData?.get("order");
      invariant(typeof order === "string", "order is required");
      invariant(!isNaN(Number(order)), "order must be a number");

      const toChapterId = fetcher.formData?.get("toChapterId");
      invariant(
        typeof toChapterId === "string" || toChapterId === null,
        "toChapterId has to be a string or null",
      );

      return { id, content, order: Number(order), toChapterId };
    });
  const removedChoices = fetchers
    .filter((fetcher) => fetcher.formData?.get("intent") === "remove-choice")
    .map((fetcher) => {
      const id = fetcher.formData?.get("id");
      invariant(typeof id === "string", "id is required");
      return { id };
    });
  const choicesById = new Map<string, Omit<Choice, "chapterId">>(
    choices.map((choice) => [choice.id, choice]),
  );
  for (const pendingChoice of pendingChoices) {
    const choice = choicesById.get(pendingChoice.id);
    if (choice) {
      choicesById.set(pendingChoice.id, {
        ...choice,
        ...pendingChoice,
      });
    } else {
      choicesById.set(pendingChoice.id, pendingChoice);
    }
  }

  for (const removedChoice of removedChoices) {
    choicesById.delete(removedChoice.id);
  }

  const mergedChoices = Array.from(choicesById.values()).sort(
    (a, b) => a.order - b.order,
  );
  return mergedChoices;
}
