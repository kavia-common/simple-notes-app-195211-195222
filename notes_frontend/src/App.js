import React, { useEffect, useMemo, useState } from 'react';
import Header from './components/Header';
import NotesList from './components/NotesList';
import NoteEditor from './components/NoteEditor';
import EmptyState from './components/EmptyState';
import styles from './App.module.css';

const API_BASE_URL = 'http://localhost:3001';

/**
 * Map backend note to local shape (keep as-is but ensures timestamps are comparable).
 */
function normalizeNote(note) {
  return {
    ...note,
    created_at: note.created_at ? new Date(note.created_at).toISOString() : null,
    updated_at: note.updated_at ? new Date(note.updated_at).toISOString() : null,
  };
}

// PUBLIC_INTERFACE
function App() {
  /** Core data */
  const [notes, setNotes] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  /** UI state */
  const [query, setQuery] = useState('');
  const [loadingList, setLoadingList] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  const selectedNote = useMemo(
    () => notes.find(n => n.id === selectedId) || null,
    [notes, selectedId]
  );

  const filteredNotes = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return notes;
    return notes.filter(n => {
      const t = (n.title || '').toLowerCase();
      const c = (n.content || '').toLowerCase();
      return t.includes(q) || c.includes(q);
    });
  }, [notes, query]);

  async function apiFetch(path, options) {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });

    if (!res.ok) {
      let detail = `Request failed (${res.status})`;
      try {
        const data = await res.json();
        if (data && data.detail) detail = typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail);
      } catch (e) {
        // ignore JSON parse errors
      }
      const err = new Error(detail);
      err.status = res.status;
      throw err;
    }

    if (res.status === 204) return null;
    return res.json();
  }

  async function loadNotes({ keepSelection = true } = {}) {
    setError(null);
    setLoadingList(true);
    try {
      const data = await apiFetch('/notes', { method: 'GET' });
      const normalized = (data || []).map(normalizeNote);

      setNotes(normalized);

      if (!keepSelection) {
        setSelectedId(null);
      } else if (selectedId && !normalized.some(n => n.id === selectedId)) {
        setSelectedId(null);
      } else if (!selectedId && normalized.length > 0) {
        setSelectedId(normalized[0].id);
      }
    } catch (e) {
      setError(e.message || 'Failed to load notes');
    } finally {
      setLoadingList(false);
    }
  }

  useEffect(() => {
    loadNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCreateNew() {
    setError(null);
    setSaving(true);
    try {
      // Create with a valid non-empty title; user can immediately rename after.
      const created = await apiFetch('/notes', {
        method: 'POST',
        body: JSON.stringify({ title: 'Untitled', content: '' }),
      });
      const note = normalizeNote(created);

      setNotes(prev => [note, ...prev]);
      setSelectedId(note.id);
    } catch (e) {
      setError(e.message || 'Failed to create note');
    } finally {
      setSaving(false);
    }
  }

  async function handleSave({ id, title, content }) {
    if (!id) return;
    setError(null);
    setSaving(true);

    // Optimistic UI update
    const optimisticUpdatedAt = new Date().toISOString();
    setNotes(prev =>
      prev.map(n =>
        n.id === id
          ? {
              ...n,
              title,
              content,
              updated_at: optimisticUpdatedAt,
            }
          : n
      )
    );

    try {
      const updated = await apiFetch(`/notes/${encodeURIComponent(id)}`, {
        method: 'PUT',
        body: JSON.stringify({ title, content }),
      });
      const note = normalizeNote(updated);

      setNotes(prev => prev.map(n => (n.id === id ? note : n)));
    } catch (e) {
      setError(e.message || 'Failed to save note');
      // Refresh list to revert optimistic update to server truth
      await loadNotes();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!id) return;
    setError(null);
    setDeleting(true);

    const prevNotes = notes;
    const idx = prevNotes.findIndex(n => n.id === id);

    // Optimistic remove
    const nextNotes = prevNotes.filter(n => n.id !== id);
    setNotes(nextNotes);

    const nextSelection =
      selectedId === id
        ? nextNotes.length > 0
          ? nextNotes[Math.max(0, idx - 1)].id
          : null
        : selectedId;

    setSelectedId(nextSelection);

    try {
      await apiFetch(`/notes/${encodeURIComponent(id)}`, { method: 'DELETE' });
    } catch (e) {
      setError(e.message || 'Failed to delete note');
      // Revert
      setNotes(prevNotes);
      setSelectedId(selectedId);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className={styles.app}>
      <Header title="Notes" />
      <div className={styles.body}>
        <aside className={styles.sidebar} aria-label="Notes list">
          <div className={styles.sidebarTop}>
            <div className={styles.searchWrap}>
              <label className={styles.srOnly} htmlFor="search">
                Search notes
              </label>
              <input
                id="search"
                className={styles.search}
                placeholder="Search…"
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
            </div>

            <button
              className={styles.primaryButton}
              onClick={handleCreateNew}
              disabled={saving || loadingList}
              type="button"
            >
              New note
            </button>
          </div>

          {error ? <div className={styles.errorBanner}>{error}</div> : null}

          <NotesList
            notes={filteredNotes}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onDelete={handleDelete}
            loading={loadingList}
            deleting={deleting}
          />
        </aside>

        <main className={styles.main} aria-label="Editor">
          {!selectedNote ? (
            <EmptyState
              title="No note selected"
              description={notes.length === 0 ? 'Create your first note to get started.' : 'Select a note from the sidebar.'}
              actionLabel="Create a note"
              onAction={handleCreateNew}
              disabled={saving || loadingList}
            />
          ) : (
            <NoteEditor note={selectedNote} onSave={handleSave} saving={saving} />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
