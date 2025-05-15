import {
  getFormProps,
  getInputProps,
} from "node_modules/@conform-to/react/helpers";

import { useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { invariant } from "@epic-web/invariant";
import { useState } from "react";
import { useFetcher, useSubmit } from "react-router";
import { ErrorList } from "~/components/ErrorsList";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import type { Choice } from "~/generated/prisma";
import { cn } from "~/lib/utils";
import { ChoiceContentSchema } from "./schemas";

type ChoiceProps = {
  choice: Choice;
};

export function ChoiceEditor({ choice }: ChoiceProps) {
  const fetcher = useFetcher();
  const submit = useSubmit();
  const [acceptDrop, setAcceptDrop] = useState<"none" | "top" | "bottom">(
    "none",
  );
  const [form, fields] = useForm({
    defaultValue: choice,
    constraint: getZodConstraint(ChoiceContentSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, {
        schema: ChoiceContentSchema,
      });
    },
  });
  return (
    <li
      className={cn(
        "flex items-center gap-2 border-y",
        acceptDrop === "top"
          ? "border-t-red-500 border-b-transparent"
          : acceptDrop === "bottom"
            ? "border-t-transparent border-b-red-500"
            : "border-t-transparent border-b-transparent",
      )}
      onDragOver={(event) => {
        if (event.dataTransfer.types.includes("choice")) {
          event.preventDefault();
          event.stopPropagation();
          const rect = event.currentTarget.getBoundingClientRect();
          const midpoint = (rect.top + rect.bottom) / 2;
          setAcceptDrop(event.clientY <= midpoint ? "top" : "bottom");
        }
      }}
      onDragLeave={() => {
        setAcceptDrop("none");
      }}
      onDrop={(event) => {
        event.stopPropagation();

        const transfer = JSON.parse(event.dataTransfer.getData("choice"));
        invariant(transfer.id, "missing choice id");
        invariant(transfer.order != null, "missing choice order");
        const droppedOrder =
          acceptDrop === "top"
            ? transfer.order < choice.order
              ? choice.order - 1
              : choice.order
            : transfer.order > choice.order
              ? choice.order + 1
              : choice.order;
        const payload = {
          intent: "choice-order",
          id: transfer.id,
          order: droppedOrder,
        };
        console.log("payload", payload);
        submit(payload, {
          method: "post",
          navigate: false,
        });

        setAcceptDrop("none");
      }}
    >
      {choice.order}
      <div
        draggable
        onDragStart={(event) => {
          event.dataTransfer.effectAllowed = "move";
          event.dataTransfer.setData(
            "choice",
            JSON.stringify({ id: choice.id, order: choice.order }),
          );
        }}
      >
        <fetcher.Form
          method="post"
          {...getFormProps(form)}
          className="w-full p-1"
        >
          <input name="intent" value="choice-content" type="hidden" />
          <input name="id" value={choice.id} type="hidden" />
          <Input
            placeholder="Choice"
            {...getInputProps(fields.content, { type: "text" })}
            onChange={(e) => {
              fetcher.submit(e.currentTarget.form, { method: "post" });
            }}
          />
          <ErrorList
            errors={fields.content.errors}
            id={fields.content.errorId}
          />
        </fetcher.Form>
      </div>
      <Button
        type="button"
        tabIndex={-1}
        onClick={() => {
          submit(
            { intent: "remove-choice", id: choice.id },
            {
              navigate: false,
              method: "post",
            },
          );
        }}
      >
        Remove
      </Button>
    </li>
  );
}
