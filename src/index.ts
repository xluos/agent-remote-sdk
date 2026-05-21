/**
 * @agent-remote/sdk
 *
 * TypeScript client for agent-remote-core. Read structured
 * ClaudeWindow snapshots from a daemon, send input over its Unix
 * socket, and manage daemon lifecycle.
 *
 * Example:
 *
 * ```ts
 * import { SessionManager, SessionReader, SessionWriter } from "@agent-remote/sdk";
 *
 * const sm = new SessionManager();
 * await sm.mirror("claudesquad_abc123");
 *
 * const reader = new SessionReader("claudesquad_abc123");
 * for await (const snap of reader.subscribe()) {
 *   for (const block of snap.blocks) console.log(block);
 * }
 *
 * const writer = new SessionWriter("claudesquad_abc123");
 * await writer.sendText("refactor this");
 * await writer.sendEnter();
 * ```
 */

export { SessionReader, type SubscribeOptions } from "./reader.js";
export { SessionWriter, type SendOptionOpts } from "./writer.js";
export {
  SessionManager,
  type SessionInfo,
  type StartOptions,
  type MirrorOptions,
} from "./manager.js";
export * from "./types.js";
export { SOCKET_DIR, socketPath, mqPath, pidPath, safeFilename } from "./paths.js";
