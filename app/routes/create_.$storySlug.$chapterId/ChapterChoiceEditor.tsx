import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint } from "@conform-to/zod";
import { useFetcher } from "react-router";
import { ErrorList } from "~/components/ErrorsList";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import type { Choice } from "~/generated/prisma";
import { ChoiceSchema } from "./schemas";

export function ChapterChoiceEditor({ choices }: { choices: Choice[] }) {
  const fetcher = useFetcher();

  const [form, fields] = useForm({
    defaultValue: {
      choices,
    },
    constraint: getZodConstraint(ChoiceSchema),
  });

  const list = fields.choices.getFieldList();

  return (
    <fetcher.Form method="post" {...getFormProps(form)} className="w-full p-1">
      <input name="intent" value="chapter-choice" type="hidden" />
      {list.map((choice, index) => {
        const choiceFields = choice.getFieldset();
        return (
          <div key={choice.id}>
            <Label className="text-xs" htmlFor={choiceFields.content.id}>
              Choice {index + 1}
            </Label>
            <Input {...getInputProps(choiceFields.content, { type: "text" })} />
            <ErrorList
              errors={choiceFields.content.errors}
              id={choiceFields.content.errorId}
            />
            <Button
              {...form.remove.getButtonProps({
                name: fields.choices.name,
                index,
              })}
            >
              Remove Choice
            </Button>
          </div>
        );
      })}
      <Button {...form.insert.getButtonProps({ name: fields.choices.name })}>
        Add Choice
      </Button>
    </fetcher.Form>
  );
}
