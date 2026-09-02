import React from 'react';
import styles from './Logo.module.css';

const Logo = ({ withText = false, light = false, className = '' }) => (
  <span className={`${styles.logo} ${light ? styles.light : ''} ${className}`}>
    <svg
      className={styles.mark}
      viewBox="0 0 100 100"
      role="img"
      aria-label="social traffic"
    >
      <rect x="54" y="14" width="36" height="16" rx="8" />
      <rect x="32" y="42" width="58" height="16" rx="8" />
      <rect className={styles.accent} x="10" y="70" width="80" height="16" rx="8" />
    </svg>
    {withText && <span className={styles.text}>social traffic</span>}
  </span>
);

export default Logo;
