# @agents-remote/sdk

TypeScript client for [`agents-remote-core`](https://github.com/xluos/agents-remote-core) — read structured snapshots of a Claude Code / Codex CLI terminal session, send input over a Unix socket, and manage the daemon's lifecycle.

## What this is for

The daemon wraps a TUI agent CLI in a PTY (or mirrors an existing tmux session), reverse-parses its ANSI output into a structured `ClaudeWindow` snapshot, and publishes it to a shared-memory file. This SDK lets your TS / JS code (Bun, Node) **consume** that snapshot in real time and **drive** the agent without learning a single ANSI escape.

Typical consumers:
- Chat bots forwarding agent state into Slack / Feishu / Discord
- Custom TUIs / dashboards displaying multiple agent sessions side-by-side
- Multi-agent orchestrators that need to detect "agent is ready" / "agent is waiting on permission"

## Install

```bash
bun add @agents-remote/sdk
# or npm / pnpm
```

Also requires the daemon binary on PATH:
```bash
pip install agents-remote-core
# or: uv tool install agents-remote-core
```

## Quick start

### Read a session's live state

```ts
import { SessionReader } from "@agents-remote/sdk";

const reader = new SessionReader("mywork");
for await (const snap of reader.subscribe()) {
  for (const block of snap.blocks) {
    if (block._type === "OutputBlock") {
      console.log(block.content);
    }
  }
  if (snap.option_block) {
    console.log("Waiting on input:", snap.option_block.question);
  }
}
```

### Send input

```ts
import { SessionWriter } from "@agents-remote/sdk";

const writer = new SessionWriter("mywork");

// Plain text
await writer.sendText("refactor the auth middleware");
await writer.sendEnter();

// Control keys
await writer.sendEsc();
await writer.sendArrow("down");

// Closed-loop option selection (navigates the ❯ cursor and presses Enter)
await writer.sendOption("2", { total: 4 });
```

### Manage the daemon

```ts
import { SessionManager } from "@agents-remote/sdk";

const sm = new SessionManager();

// Start a fresh PTY-backed session
await sm.start("mywork", { cliType: "claude", cwd: "/path/to/repo" });

// Or mirror an existing tmux session (e.g. one claude-squad created)
const sessionName = await sm.mirror("claudesquad_a1b2c3");

// List, kill
const active = await sm.list();
await sm.kill("mywork");
```

## API surface

| Class | Purpose |
|---|---|
| `SessionReader` | Read `ClaudeWindow` snapshots; `read()` one-shot or `subscribe()` async iterator |
| `SessionWriter` | Lazy-connect Unix socket; `sendRaw` / `sendText` / `sendEnter` / `sendEsc` / `sendArrow` / `sendOption` / `resize` |
| `SessionManager` | `start` / `mirror` / `list` / `kill` / `paths`, plus `exists()` |

### Types

`ClaudeWindow` is the snapshot shape. See `src/types.ts`. Key fields:
- `blocks: Block[]` — accumulating history (OutputBlock / UserInput / PlanBlock / SystemBlock)
- `status_line: StatusLine | null` — current "Thinking..." status
- `option_block: OptionBlock | null` — interactive prompt (sub_type: "option" | "permission")
- `bottom_bar`, `agent_panel`, `input_area_text`, `layout_mode`, `cli_type`

## Protocol

The daemon publishes `ClaudeWindow` JSON snapshots over a 200 MB mmap file (`/tmp/remote-claude/<name>.mq`); input is sent over a Unix socket (`<name>.sock`). The wire format is plain JSON, so anyone can implement a reader in another language — see [`agents-remote-core/shared_state.py`](https://github.com/xluos/agents-remote-core/blob/main/src/agents_remote_daemon/server/shared_state.py) for the binary header layout.

## License

MIT
