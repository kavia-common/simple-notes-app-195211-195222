import React from 'react';
import styles from './EmptyState.module.css';

// PUBLIC_INTERFACE
function EmptyState({ title, description, actionLabel, onAction, disabled }) {
  /** Simple empty state for main panel. */
  return (
    <div className={styles.wrap} role="status" aria-live="polite">
      <div className={styles.card}>
        <div className={styles.title}>{title}</div>
        <div className={styles.desc}>{description}</div>
        {actionLabel ? (
          <button className={styles.action} type="button" onClick={onAction} disabled={disabled}>
            {actionLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
}

export default EmptyState;
