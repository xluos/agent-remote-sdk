/**
 * ClaudeWindow snapshot types — mirror server-side Python dataclasses.
 *
 * `_type` discriminator matches what utils/components.py serializes via
 * dataclasses.asdict + class name injection.
 */

export type BlockType =
  | "OutputBlock"
  | "UserInput"
  | "PlanBlock"
  | "SystemBlock"
  | "TextBlock"
  | "ToolCall"
  | "AgentBlock";

export interface BaseBlock {
  _type: BlockType;
  block_id?: string;
  is_streaming?: boolean;
  start_row?: number;
}

export interface OutputBlock extends BaseBlock {
  _type: "OutputBlock";
  content: string;
  ansi_content?: string;
  indicator?: string;
  ansi_indicator?: string;
}

export interface UserInput extends BaseBlock {
  _type: "UserInput";
  text: string;
  ansi_text?: string;
  indicator?: string;
}

export interface PlanBlock extends BaseBlock {
  _type: "PlanBlock";
  title: string;
  content: string;
  ansi_content?: string;
}

export interface SystemBlock extends BaseBlock {
  _type: "SystemBlock";
  content: string;
  ansi_content?: string;
  indicator?: string;
}

export type Block = OutputBlock | UserInput | PlanBlock | SystemBlock | BaseBlock;

export interface StatusLine {
  _type?: "StatusLine";
  action?: string;
  elapsed?: string;
  tokens?: string;
  ansi_text?: string;
  text?: string;
}

export interface BottomBar {
  _type?: "BottomBar";
  text?: string;
  ansi_text?: string;
  has_background_agents?: boolean;
  agent_count?: number;
  agent_summary?: string;
}

export interface OptionItem {
  label: string;
  value: string;
  description?: string;
}

export interface OptionBlock {
  _type?: "OptionBlock";
  block_id?: string;
  sub_type: "option" | "permission";
  title?: string;
  content?: string;
  question?: string;
  options?: OptionItem[];
  selected_value?: string;
}

export interface AgentPanelBlock {
  _type?: "AgentPanelBlock";
  panel_type?: "summary" | "list" | "detail";
  agent_count?: number;
  agent_name?: string;
  agent_type?: string;
  agents?: Array<{ name: string; status: string; selected?: boolean }>;
  progress?: string;
  prompt?: string;
}

export type LayoutMode =
  | "normal"
  | "option"
  | "detail"
  | "agent_list"
  | "agent_detail";

/**
 * Top-level snapshot pushed by the daemon every flush. Matches the JSON
 * written by SharedStateWriter.write_snapshot in shared_state.py.
 */
export interface ClaudeWindow {
  blocks: Block[];
  status_line: StatusLine | null;
  bottom_bar: BottomBar | null;
  agent_panel: AgentPanelBlock | null;
  option_block: OptionBlock | null;
  input_area_text: string;
  timestamp: number;
  layout_mode: LayoutMode;
  cli_type: "claude" | "codex" | "unknown";
}

/** Empty snapshot returned when the mq file is missing or unreadable. */
export const EMPTY_SNAPSHOT: ClaudeWindow = {
  blocks: [],
  status_line: null,
  bottom_bar: null,
  agent_panel: null,
  option_block: null,
  input_area_text: "",
  timestamp: 0,
  layout_mode: "normal",
  cli_type: "unknown",
};
