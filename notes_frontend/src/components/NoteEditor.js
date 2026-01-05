import React, { useEffect, useMemo, useState } from 'react';
import styles from './NoteEditor.module.css';

// PUBLIC_INTERFACE
function NoteEditor({ note, onSave, saving }) {
  /** Controlled note editor for title/content. */
  const [title, setTitle] = useState(note.title || '');
  const [content, setContent] = useState(note.content || '');
  const [localError, setLocalError] = useState(null);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setTitle(note.title || '');
    setContent(note.content || '');
    setLocalError(null);
    setDirty(false);
  }, [note.id, note.title, note.content]);

  const meta = useMemo(() => {
    const created = note.created_at ? new Date(note.created_at).toLocaleString() : '—';
    const updated = note.updated_at ? new Date(note.updated_at).toLocaleString() : '—';
    return { created, updated };
  }, [note.created_at, note.updated_at]);

  function validate() {
    if (!title.trim()) {
      return 'Title is required.';
    }
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const err = validate();
    if (err) {
      setLocalError(err);
      return;
    }
    setLocalError(null);
    await onSave({ id: note.id, title: title.trim(), content });
    setDirty(false);
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.top}>
        <div className={styles.meta} aria-label="Note metadata">
          <div>
            <span className={styles.metaLabel}>Created:</span> {meta.created}
          </div>
          <div>
            <span className={styles.metaLabel}>Updated:</span> {meta.updated}
          </div>
        </div>

        <button
          type="submit"
          form="note-form"
          className={styles.save}
          disabled={saving || !dirty}
          aria-label="Save note"
        >
          {saving ? 'Saving…' : dirty ? 'Save' : 'Saved'}
        </button>
      </div>

      {localError ? <div className={styles.error}>{localError}</div> : null}

      <form id="note-form" className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.label} htmlFor="title">
          Title
        </label>
        <input
          id="title"
          className={styles.title}
          value={title}
          onChange={e => {
            setTitle(e.target.value);
            setDirty(true);
          }}
          placeholder="Note title"
          autoComplete="off"
        />

        <label className={styles.label} htmlFor="content">
          Content
        </label>
        <textarea
          id="content"
          className={styles.content}
          value={content}
          onChange={e => {
            setContent(e.target.value);
            setDirty(true);
          }}
          placeholder="Write something…"
          rows={12}
        />
      </form>
    </div>
  );
}

export default NoteEditor;
