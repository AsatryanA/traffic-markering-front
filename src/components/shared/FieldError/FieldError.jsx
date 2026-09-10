import React from 'react';
import styles from './FieldError.module.css';

const FieldError = ({ children }) =>
  children ? (
    <span className={styles.message} role="alert">
      {children}
    </span>
  ) : null;

export default FieldError;
