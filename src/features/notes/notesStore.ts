import {create} from 'zustand';

import type {CreateNoteInput, Note} from '../../models/note';

type NotesState = {
  notes: Note[];
  addNote: (input: CreateNoteInput) => void;
  toggleNote: (id: string) => void;
  deleteNote: (id: string) => void;
};

const now = () => new Date().toISOString();

const createId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

export const useNotesStore = create<NotesState>(set => ({
  notes: [
    {
      id: createId(),
      title: '创建第一个同步记事本',
      content: '下一步会接入 Supabase Auth 和云端 notes 表。',
      isDone: false,
      createdAt: now(),
      updatedAt: now(),
      deletedAt: null,
    },
  ],
  addNote: input =>
    set(state => {
      const timestamp = now();
      const title = input.title.trim();

      if (!title) {
        return state;
      }

      return {
        notes: [
          {
            id: createId(),
            title,
            content: input.content?.trim() ?? '',
            isDone: false,
            createdAt: timestamp,
            updatedAt: timestamp,
            deletedAt: null,
          },
          ...state.notes,
        ],
      };
    }),
  toggleNote: id =>
    set(state => ({
      notes: state.notes.map(note =>
        note.id === id
          ? {...note, isDone: !note.isDone, updatedAt: now()}
          : note,
      ),
    })),
  deleteNote: id =>
    set(state => ({
      notes: state.notes.map(note =>
        note.id === id ? {...note, deletedAt: now(), updatedAt: now()} : note,
      ),
    })),
}));
