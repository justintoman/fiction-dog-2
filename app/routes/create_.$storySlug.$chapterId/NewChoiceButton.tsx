import { useSubmit } from "react-router";
import { Button } from "~/components/ui/button";

type NewChoiceButtonProps = {
  choiceCount: number;
};

export function NewChoiceButton({ choiceCount }: NewChoiceButtonProps) {
  const submit = useSubmit();
  return (
    <Button
      type="submit"
      name="intent"
      value="new-choice"
      onClick={() => {
        const id = crypto.randomUUID();
        submit(
          {
            intent: "new-choice",
            id,
            content: "",
            order: choiceCount + 1,
          },
          {
            navigate: false,
            method: "post",
            flushSync: true,
            fetcherKey: `choice:${id}`,
          },
        );
      }}
    >
      Add Choice
    </Button>
  );
}
