import {create} from 'zustand';

import {
  fetchCloudNotes,
  upsertCloudNote,
} from '../../data/remote/notesRepository';
import {isSupabaseConfigured} from '../../data/remote/supabaseClient';
import type {CreateNoteInput, Note} from '../../models/note';

type SyncStatus = 'idle' | 'syncing' | 'offline' | 'error';

type NotesState = {
  notes: Note[];
  syncStatus: SyncStatus;
  syncError: string | null;
  loadNotes: () => Promise<void>;
  addNote: (input: CreateNoteInput) => Promise<void>;
  toggleNote: (id: string) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
};

const now = () => new Date().toISOString();

const createId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

const initialNotes: Note[] = [
  {
    id: createId(),
    title: 'Create your first synced note',
    content: 'Next, fill Supabase config and run the SQL migration.',
    isDone: false,
    createdAt: now(),
    updatedAt: now(),
    deletedAt: null,
  },
];

async function syncNote(note: Note, set: (state: Partial<NotesState>) => void) {
  if (!isSupabaseConfigured) {
    set({syncStatus: 'offline', syncError: 'Supabase config is not set yet.'});
    return;
  }

  try {
    set({syncStatus: 'syncing', syncError: null});
    await upsertCloudNote(note);
    set({syncStatus: 'idle', syncError: null});
  } catch (error) {
    set({
      syncStatus: 'error',
      syncError: error instanceof Error ? error.message : 'Sync failed.',
    });
  }
}

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: initialNotes,
  syncStatus: isSupabaseConfigured ? 'idle' : 'offline',
  syncError: isSupabaseConfigured ? null : 'Supabase config is not set yet.',
  loadNotes: async () => {
    if (!isSupabaseConfigured) {
      set({syncStatus: 'offline', syncError: 'Supabase config is not set yet.'});
      return;
    }

    try {
      set({syncStatus: 'syncing', syncError: null});
      const notes = await fetchCloudNotes();
      set({
        notes: notes.length > 0 ? notes : get().notes,
        syncStatus: 'idle',
        syncError: null,
      });
    } catch (error) {
      set({
        syncStatus: 'error',
        syncError: error instanceof Error ? error.message : 'Sync failed.',
      });
    }
  },
  addNote: async input => {
    const timestamp = now();
    const title = input.title.trim();

    if (!title) {
      return;
    }

    const note: Note = {
      id: createId(),
      title,
      content: input.content?.trim() ?? '',
      isDone: false,
      createdAt: timestamp,
      updatedAt: timestamp,
      deletedAt: null,
    };

    set(state => ({notes: [note, ...state.notes]}));
    await syncNote(note, set);
  },
  toggleNote: async id => {
    const timestamp = now();
    let changedNote: Note | null = null;

    set(state => ({
      notes: state.notes.map(note => {
        if (note.id !== id) {
          return note;
        }

        changedNote = {...note, isDone: !note.isDone, updatedAt: timestamp};
        return changedNote;
      }),
    }));

    if (changedNote) {
      await syncNote(changedNote, set);
    }
  },
  deleteNote: async id => {
    const timestamp = now();
    let changedNote: Note | null = null;

    set(state => ({
      notes: state.notes.map(note => {
        if (note.id !== id) {
          return note;
        }

        changedNote = {...note, deletedAt: timestamp, updatedAt: timestamp};
        return changedNote;
      }),
    }));

    if (changedNote) {
      await syncNote(changedNote, set);
    }
  },
}));
