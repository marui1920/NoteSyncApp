import type {User} from '@supabase/supabase-js';

import type {Note} from '../../models/note';
import {getSupabaseClient} from './supabaseClient';
import type {NotesRow} from './schema';

function toNote(row: NotesRow): Note {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    isDone: row.is_done,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  };
}

function toRow(note: Note, user: User): NotesRow {
  return {
    id: note.id,
    user_id: user.id,
    title: note.title,
    content: note.content,
    is_done: note.isDone,
    created_at: note.createdAt,
    updated_at: note.updatedAt,
    deleted_at: note.deletedAt,
  };
}

export async function ensureCloudUser() {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return null;
  }

  const sessionResult = await supabase.auth.getSession();
  const sessionUser = sessionResult.data.session?.user;

  if (sessionUser) {
    return sessionUser;
  }

  const signInResult = await supabase.auth.signInAnonymously();

  if (signInResult.error) {
    throw signInResult.error;
  }

  return signInResult.data.user;
}

export async function fetchCloudNotes() {
  const supabase = getSupabaseClient();
  const user = await ensureCloudUser();

  if (!supabase || !user) {
    return [];
  }

  const result = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', {ascending: false});

  if (result.error) {
    throw result.error;
  }

  return (result.data as NotesRow[]).map(toNote);
}

export async function upsertCloudNote(note: Note) {
  const supabase = getSupabaseClient();
  const user = await ensureCloudUser();

  if (!supabase || !user) {
    return;
  }

  const result = await supabase.from('notes').upsert(toRow(note, user), {
    onConflict: 'id',
  });

  if (result.error) {
    throw result.error;
  }
}
