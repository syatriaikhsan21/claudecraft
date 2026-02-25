import path from "node:path";
import { fileURLToPath } from "node:url";

export function packageRootFromMeta(metaUrl: string): string {
  const currentFile = fileURLToPath(metaUrl);
  return path.resolve(path.dirname(currentFile), "..");
}
