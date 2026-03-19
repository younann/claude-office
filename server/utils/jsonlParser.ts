import { open } from "fs/promises";

const TAIL_BYTES = 8192;

export async function tailReadJsonl(
  filePath: string
): Promise<Record<string, any>[]> {
  const fileHandle = await open(filePath, "r");
  try {
    const stats = await fileHandle.stat();
    const fileSize = stats.size;
    if (fileSize === 0) return [];

    const readStart = Math.max(0, fileSize - TAIL_BYTES);
    const readLength = fileSize - readStart;
    const buffer = Buffer.alloc(readLength);
    await fileHandle.read(buffer, 0, readLength, readStart);

    const text = buffer.toString("utf-8");
    const lines = text.split("\n");

    // If we seeked into the middle of the file, discard the first partial line
    if (readStart > 0) {
      lines.shift();
    }

    const results: Record<string, any>[] = [];
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      try {
        results.push(JSON.parse(trimmed));
      } catch {
        // Skip malformed lines
      }
    }
    return results;
  } finally {
    await fileHandle.close();
  }
}
