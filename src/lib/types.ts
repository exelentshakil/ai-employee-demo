export type DocumentRecord = {
  id: string;
  title: string;
  source_type: string;
  content: string;
  created_at: string;
};

export type ChunkRecord = {
  id: string;
  document_id: string;
  document_title: string;
  chunk_text: string;
  chunk_index: number;
};

export type ActionType = "email_reply" | "crm_update" | "calendar_note";

export type ActionRecord = {
  id: string;
  request_text: string;
  action_type: ActionType;
  draft_output: string;
  status: "pending" | "approved" | "rejected";
  citations: string[];
  created_at: string;
  decided_at: string | null;
};

export type Citation = { document_id: string; title: string; snippet: string };
