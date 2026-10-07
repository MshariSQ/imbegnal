/**
 * Bounded capture of a process stream.
 *
 * - keeps the first `keepBytes` bytes (the rest is counted and dropped),
 * - counts every byte,
 * - tells the caller when `killBytes` is exceeded so it can kill the job.
 * Memory use is bounded by `keepBytes` no matter how much the program prints.
 */
export class OutputCollector {
  private chunks: Buffer[] = [];
  private kept = 0;
  total = 0;

  constructor(
    readonly keepBytes: number,
    readonly killBytes: number,
  ) {}

  /** Add a chunk. Returns true once the kill cap has been exceeded. */
  push(chunk: Buffer): boolean {
    this.total += chunk.length;
    const room = this.keepBytes - this.kept;
    if (room > 0) {
      const part = chunk.length <= room ? chunk : chunk.subarray(0, room);
      this.chunks.push(Buffer.from(part)); // copy: the source chunk may be reused
      this.kept += part.length;
    }
    return this.total > this.killBytes;
  }

  get truncated(): boolean {
    return this.total > this.kept;
  }

  get exceededKillCap(): boolean {
    return this.total > this.killBytes;
  }

  /** Decoded text (UTF-8, invalid sequences replaced). A cut inside a multi-byte character is trimmed. */
  text(): string {
    let buf = Buffer.concat(this.chunks, this.kept);
    if (this.truncated) buf = buf.subarray(0, completeUtf8Length(buf));
    return buf.toString("utf8");
  }
}

/** Length of the longest prefix of `buf` that does not end inside a UTF-8 multi-byte sequence. */
export function completeUtf8Length(buf: Buffer): number {
  const n = buf.length;
  // Look back at most 3 bytes for the lead byte of a sequence that may be cut off.
  for (let back = 1; back <= Math.min(3, n); back++) {
    const b = buf[n - back];
    if ((b & 0xc0) === 0x80) continue; // continuation byte, keep looking for the lead
    const need = b >= 0xf0 ? 4 : b >= 0xe0 ? 3 : b >= 0xc0 ? 2 : 1;
    return need > back ? n - back : n;
  }
  return n;
}
