import React from 'react';
import { Link } from 'react-router-dom';
import styles from './NotFound.module.css';

const NotFound = () => (
  <div className={styles.wrap}>
    <div className={styles.card}>
      <p className={styles.code}>404</p>
      <h1 className={styles.title}>страница не найдена</h1>
      <p className={styles.text}>
        Возможно, ссылка устарела или объявление сняли с публикации.
        <br />
        Вернитесь на доску — там только активные заказы.
      </p>
      <div className={styles.actions}>
        <Link to="/" className={styles.primaryLink}>
          на доску объявлений
        </Link>
        <Link to="/app" className={styles.secondaryLink}>
          в личный кабинет
        </Link>
      </div>
    </div>
  </div>
);

export default NotFound;
