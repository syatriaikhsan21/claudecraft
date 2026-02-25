import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

interface Choice<T extends string> {
  label: string;
  value: T;
}

export async function selectPrompt<T extends string>(
  question: string,
  choices: Choice<T>[]
): Promise<T> {
  const rl = readline.createInterface({ input, output });
  try {
    output.write(`${question}\n`);
    choices.forEach((choice, index) => {
      output.write(`  ${index + 1}. ${choice.label}\n`);
    });

    while (true) {
      const answer = await rl.question("> ");
      const picked = Number.parseInt(answer.trim(), 10);
      if (!Number.isNaN(picked) && picked >= 1 && picked <= choices.length) {
        return choices[picked - 1].value;
      }
      output.write(`Choose a number between 1 and ${choices.length}.\n`);
    }
  } finally {
    rl.close();
  }
}

export async function confirmPrompt(question: string): Promise<boolean> {
  const rl = readline.createInterface({ input, output });
  try {
    const answer = await rl.question(`${question} [y/N] `);
    const normalized = answer.trim().toLowerCase();
    return normalized === "y" || normalized === "yes";
  } finally {
    rl.close();
  }
}
