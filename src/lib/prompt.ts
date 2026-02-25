import { confirm, select } from "@inquirer/prompts";

interface Choice<T extends string> {
  label: string;
  value: T;
}

export async function selectPrompt<T extends string>(
  question: string,
  choices: Choice<T>[]
): Promise<T> {
  return select({
    message: question,
    choices: choices.map((choice) => ({ name: choice.label, value: choice.value }))
  });
}

export async function confirmPrompt(question: string): Promise<boolean> {
  return confirm({
    message: question,
    default: false
  });
}
