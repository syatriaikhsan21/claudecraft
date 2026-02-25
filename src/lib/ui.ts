import { intro, outro, spinner } from "@clack/prompts";

type DoneMessage<T> = string | ((result: T) => string);

function shouldUseInteractiveUi(): boolean {
  return process.stdin.isTTY && process.stdout.isTTY;
}

export function showIntro(message: string): void {
  if (!shouldUseInteractiveUi()) {
    return;
  }
  intro(message);
}

export function showOutro(message: string): void {
  if (!shouldUseInteractiveUi()) {
    return;
  }
  outro(message);
}

export async function withSpinner<T>(
  startMessage: string,
  task: () => Promise<T>,
  doneMessage?: DoneMessage<T>
): Promise<T> {
  if (!shouldUseInteractiveUi()) {
    return task();
  }

  const loader = spinner();
  loader.start(startMessage);
  try {
    const result = await task();
    if (typeof doneMessage === "function") {
      loader.stop(doneMessage(result));
    } else {
      loader.stop(doneMessage);
    }
    return result;
  } catch (error) {
    loader.error((error as Error).message);
    throw error;
  }
}
