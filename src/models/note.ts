export type Note = {
  id: string;
  title: string;
  content: string;
  isDone: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type CreateNoteInput = {
  title: string;
  content?: string;
};
