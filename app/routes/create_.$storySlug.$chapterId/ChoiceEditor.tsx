import {
  getFormProps,
  getInputProps,
} from "node_modules/@conform-to/react/helpers";

import { useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { invariant } from "@epic-web/invariant";
import { GripVertical } from "lucide-react";
import { useState } from "react";
import { Form, useParams, useSubmit } from "react-router";
import { ErrorList } from "~/components/ErrorsList";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import type { Choice } from "~/generated/prisma";
import { cn } from "~/lib/utils";
import { ChoiceContentSchema } from "./schemas";

type ChoiceProps = {
  choice: Omit<Choice, "chapterId">;
  previousOrder: number;
  nextOrder: number;
};

export function ChoiceEditor({
  choice,
  previousOrder,
  nextOrder,
}: ChoiceProps) {
  const submit = useSubmit();
  const { storySlug, chapterId } = useParams();
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
        invariant(
          transfer.toChapterId !== undefined,
          "missing choice toChapterId",
        );
        invariant(transfer.content != null, "missing choice content");
        const droppedOrder = acceptDrop === "top" ? previousOrder : nextOrder;
        const moveOrder = (droppedOrder + choice.order) / 2;

        submit(
          {
            intent: "choice-order",
            id: transfer.id,
            order: moveOrder,
            content: transfer.content,
            toChapterId: transfer.toChapterId,
          },
          {
            method: "post",
            navigate: false,
            flushSync: true,
            fetcherKey: `choice:${transfer.id}`,
          },
        );

        setAcceptDrop("none");
      }}
    >
      <div
        className="flex items-center gap-2"
        draggable
        onDragStart={(event) => {
          event.dataTransfer.effectAllowed = "move";
          event.dataTransfer.setData(
            "choice",
            JSON.stringify({
              id: choice.id,
              order: choice.order,
              content: choice.content,
              toChapterId: choice.toChapterId,
            }),
          );
        }}
      >
        <GripVertical className="size-4 cursor-pointer" />
        <Form method="post" {...getFormProps(form)} className="w-full p-1">
          <input name="intent" value="choice-content" type="hidden" />
          <input name="id" value={choice.id} type="hidden" />
          <input name="order" value={choice.order} type="hidden" />
          <Input
            placeholder="Choice"
            {...getInputProps(fields.content, { type: "text" })}
            onChange={(e) => {
              const formData = new FormData(e.currentTarget.form!);
              formData.set("intent", "choice-content");
              formData.set("id", choice.id);
              formData.set("order", choice.order.toString());
              if (choice.toChapterId) {
                formData.set("toChapterId", choice.toChapterId);
              }
              submit(formData, {
                method: "post",
                action: `/create/${storySlug}/${chapterId}/d`,
                fetcherKey: `choice:${choice.id}`,
              });
            }}
            onBlur={(e) => {
              const formData = new FormData(e.currentTarget.form!);
              formData.set("intent", "choice-content");
              formData.set("id", choice.id);
              formData.set("order", choice.order.toString());
              if (choice.toChapterId) {
                formData.set("toChapterId", choice.toChapterId);
              }
              submit(formData, {
                method: "post",
                fetcherKey: `choice:${choice.id}`,
              });
            }}
          />
          <ErrorList
            errors={fields.content.errors}
            id={fields.content.errorId}
          />
        </Form>
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
              fetcherKey: `choice:${choice.id}`,
            },
          );
        }}
      >
        Remove
      </Button>
    </li>
  );
}
