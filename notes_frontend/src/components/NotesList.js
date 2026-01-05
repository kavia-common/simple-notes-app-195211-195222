import React from 'react';
import styles from './NotesList.module.css';

function formatPreview(content) {
  const text = (content || '').replace(/\s+/g, ' ').trim();
  return text.length > 80 ? `${text.slice(0, 80)}…` : text;
}

// PUBLIC_INTERFACE
function NotesList({ notes, selectedId, onSelect, onDelete, loading, deleting }) {
  /** Sidebar list of notes with selection + delete. */
  if (loading) {
    return (
      <div className={styles.state} role="status" aria-live="polite">
        Loading notes…
      </div>
    );
  }

  if (!notes || notes.length === 0) {
    return <div className={styles.state}>No notes yet.</div>;
  }

  return (
    <ul className={styles.list} aria-label="Notes">
      {notes.map(note => {
        const isSelected = note.id === selectedId;
        return (
          <li key={note.id} className={styles.item}>
            <button
              type="button"
              className={`${styles.row} ${isSelected ? styles.selected : ''}`}
              onClick={() => onSelect(note.id)}
              aria-current={isSelected ? 'true' : 'false'}
            >
              <div className={styles.titleRow}>
                <div className={styles.title} title={note.title}>
                  {note.title}
                </div>
                <span className={styles.pill} aria-label="Updated time">
                  {note.updated_at ? new Date(note.updated_at).toLocaleDateString() : ''}
                </span>
              </div>
              <div className={styles.preview}>{formatPreview(note.content)}</div>
            </button>

            <button
              type="button"
              className={styles.delete}
              onClick={() => onDelete(note.id)}
              disabled={deleting}
              aria-label={`Delete note ${note.title}`}
              title="Delete note"
            >
              Delete
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export default NotesList;
