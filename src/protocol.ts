/**
 * Socket protocol — mirror utils/protocol.py.
 *
 * Wire format: one JSON object per line ('\n' framed), bytes carried as
 * base64-encoded strings. The Python server uses the same envelope.
 */

import { randomUUID } from "node:crypto";

export const MessageType = {
  INPUT: "input",
  OUTPUT: "output",
  HISTORY: "history",
  ERROR: "error",
  RESIZE: "resize",
} as const;
export type MessageType = (typeof MessageType)[keyof typeof MessageType];

interface InputWire {
  type: "input";
  data: string;
  client_id: string;
}
interface OutputWire {
  type: "output";
  data: string;
}
interface ResizeWire {
  type: "resize";
  cols: number;
  rows: number;
}
interface ErrorWire {
  type: "error";
  message: string;
}
interface HistoryWire {
  type: "history";
  data: string;
}
export type AnyWire = InputWire | OutputWire | ResizeWire | ErrorWire | HistoryWire;

/** Encode raw input bytes for the daemon. */
export function encodeInput(data: Uint8Array, clientId: string): string {
  const wire: InputWire = {
    type: "input",
    data: Buffer.from(data).toString("base64"),
    client_id: clientId,
  };
  return JSON.stringify(wire) + "\n";
}

export function encodeResize(cols: number, rows: number): string {
  const wire: ResizeWire = { type: "resize", cols, rows };
  return JSON.stringify(wire) + "\n";
}

export function decodeMessage(line: string): AnyWire | null {
  try {
    return JSON.parse(line) as AnyWire;
  } catch {
    return null;
  }
}

/** Decode a base64 payload (output / history data) into raw bytes. */
export function decodeData(b64: string): Uint8Array {
  return Buffer.from(b64, "base64");
}

export function newClientId(prefix = "sdk"): string {
  return `${prefix}-${randomUUID().slice(0, 8)}`;
}
