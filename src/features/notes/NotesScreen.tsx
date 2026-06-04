import {useEffect, useMemo, useState} from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import type {Note} from '../../models/note';
import {useNotesStore} from './notesStore';

export function NotesScreen() {
  const insets = useSafeAreaInsets();
  const [title, setTitle] = useState('');
  const notes = useNotesStore(state => state.notes);
  const syncStatus = useNotesStore(state => state.syncStatus);
  const syncError = useNotesStore(state => state.syncError);
  const loadNotes = useNotesStore(state => state.loadNotes);
  const addNote = useNotesStore(state => state.addNote);
  const toggleNote = useNotesStore(state => state.toggleNote);
  const deleteNote = useNotesStore(state => state.deleteNote);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const visibleNotes = useMemo(
    () => notes.filter(note => note.deletedAt === null),
    [notes],
  );

  const activeCount = visibleNotes.filter(note => !note.isDone).length;

  const handleAdd = async () => {
    const nextTitle = title;
    setTitle('');
    await addNote({title: nextTitle});
  };

  return (
    <View style={[styles.screen, {paddingTop: insets.top + 16}]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>NoteSync</Text>
          <Text style={styles.title}>Notes</Text>
        </View>
        <View style={styles.counter}>
          <Text style={styles.counterValue}>{activeCount}</Text>
          <Text style={styles.counterLabel}>active</Text>
        </View>
      </View>

      <Text style={[styles.syncText, syncStatus === 'error' && styles.errorText]}>
        {syncStatus === 'idle'
          ? 'Cloud sync ready'
          : syncStatus === 'syncing'
            ? 'Syncing...'
            : syncError}
      </Text>

      <View style={styles.composer}>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Add a task or note"
          placeholderTextColor="#7a869a"
          returnKeyType="done"
          onSubmitEditing={handleAdd}
          style={styles.input}
        />
        <Pressable
          accessibilityRole="button"
          disabled={!title.trim()}
          onPress={handleAdd}
          style={({pressed}) => [
            styles.addButton,
            !title.trim() && styles.addButtonDisabled,
            pressed && styles.pressed,
          ]}>
          <Text style={styles.addButtonText}>Add</Text>
        </Pressable>
      </View>

      <FlatList
        data={visibleNotes}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({item}) => (
          <NoteRow note={item} onToggle={toggleNote} onDelete={deleteNote} />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No notes yet</Text>
            <Text style={styles.emptyText}>
              Add one note, then sync it to Supabase.
            </Text>
          </View>
        }
      />
    </View>
  );
}

type NoteRowProps = {
  note: Note;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
};

function NoteRow({note, onToggle, onDelete}: NoteRowProps) {
  return (
    <View style={styles.noteRow}>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{checked: note.isDone}}
        onPress={() => onToggle(note.id)}
        style={({pressed}) => [
          styles.checkbox,
          note.isDone && styles.checkboxChecked,
          pressed && styles.pressed,
        ]}>
        <Text style={styles.checkboxText}>{note.isDone ? '✓' : ''}</Text>
      </Pressable>

      <Pressable
        onPress={() => onToggle(note.id)}
        style={({pressed}) => [styles.noteBody, pressed && styles.pressed]}>
        <Text style={[styles.noteTitle, note.isDone && styles.noteDone]}>
          {note.title}
        </Text>
        {note.content ? <Text style={styles.noteContent}>{note.content}</Text> : null}
      </Pressable>

      <Pressable
        accessibilityRole="button"
        onPress={() => onDelete(note.id)}
        style={({pressed}) => [styles.deleteButton, pressed && styles.pressed]}>
        <Text style={styles.deleteButtonText}>Delete</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f5f7fb',
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  eyebrow: {
    color: '#4d6380',
    fontSize: 13,
    fontWeight: '700',
  },
  title: {
    color: '#162033',
    fontSize: 34,
    fontWeight: '800',
    marginTop: 2,
  },
  syncText: {
    color: '#627087',
    fontSize: 13,
    marginBottom: 14,
  },
  errorText: {
    color: '#b33f3f',
  },
  counter: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#d9e0ea',
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 76,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  counterValue: {
    color: '#17685f',
    fontSize: 22,
    fontWeight: '800',
  },
  counterLabel: {
    color: '#627087',
    fontSize: 12,
    marginTop: 2,
  },
  composer: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#d9e0ea',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
    padding: 10,
  },
  input: {
    color: '#162033',
    flex: 1,
    fontSize: 16,
    minHeight: 44,
    paddingHorizontal: 8,
  },
  addButton: {
    alignItems: 'center',
    backgroundColor: '#17685f',
    borderRadius: 8,
    justifyContent: 'center',
    minHeight: 44,
    minWidth: 68,
    paddingHorizontal: 14,
  },
  addButtonDisabled: {
    backgroundColor: '#a9b7c7',
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  list: {
    gap: 10,
    paddingBottom: 24,
  },
  noteRow: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#d9e0ea',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 12,
  },
  checkbox: {
    alignItems: 'center',
    borderColor: '#17685f',
    borderRadius: 8,
    borderWidth: 2,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  checkboxChecked: {
    backgroundColor: '#17685f',
  },
  checkboxText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 22,
  },
  noteBody: {
    flex: 1,
    justifyContent: 'center',
    minHeight: 38,
  },
  noteTitle: {
    color: '#162033',
    fontSize: 16,
    fontWeight: '700',
  },
  noteDone: {
    color: '#7a869a',
    textDecorationLine: 'line-through',
  },
  noteContent: {
    color: '#627087',
    fontSize: 13,
    marginTop: 4,
  },
  deleteButton: {
    alignItems: 'center',
    borderColor: '#d65c5c',
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 36,
    paddingHorizontal: 10,
  },
  deleteButtonText: {
    color: '#b33f3f',
    fontSize: 13,
    fontWeight: '700',
  },
  empty: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 54,
  },
  emptyTitle: {
    color: '#162033',
    fontSize: 18,
    fontWeight: '800',
  },
  emptyText: {
    color: '#627087',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.72,
  },
});
