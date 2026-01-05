import React from 'react';
import styles from './Header.module.css';

// PUBLIC_INTERFACE
function Header({ title }) {
  /** App header with title. */
  return (
    <header className={styles.header}>
      <div className={styles.brand} aria-label="Application title">
        <div className={styles.mark} aria-hidden="true" />
        <div className={styles.title}>{title}</div>
      </div>
      <div className={styles.right} aria-label="Header actions">
        <a className={styles.docsLink} href="http://localhost:3001/docs" target="_blank" rel="noreferrer">
          API Docs
        </a>
      </div>
    </header>
  );
}

export default Header;
