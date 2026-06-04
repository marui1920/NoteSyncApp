export type NotesRow = {
  id: string;
  user_id: string;
  title: string;
  content: string;
  is_done: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};
