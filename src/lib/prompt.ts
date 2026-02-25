import { cancel, confirm, isCancel, select } from "@clack/prompts";

interface Choice<T extends string> {
  label: string;
  value: T;
  hint?: string;
}

export async function selectPrompt<T extends string>(
  question: string,
  choices: Choice<T>[]
): Promise<T> {
  const response = await select<string>({
    message: question,
    options: choices.map((choice) => ({
      label: choice.label,
      value: choice.value,
      hint: choice.hint
    }))
  });

  if (isCancel(response)) {
    cancel("Cancelled.");
    throw new Error("Cancelled");
  }

  return response as T;
}

export async function confirmPrompt(question: string): Promise<boolean> {
  const response = await confirm({
    message: question,
    initialValue: true
  });

  if (isCancel(response)) {
    cancel("Cancelled.");
    throw new Error("Cancelled");
  }

  return response;
}
