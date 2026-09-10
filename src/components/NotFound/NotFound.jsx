import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../shared/Logo/Logo';
import styles from './NotFound.module.css';

const NotFound = () => (
  <div className={styles.page}>
    <Link to="/" className={styles.brand} aria-label="На доску объявлений">
      <Logo withText />
    </Link>
    <main className={styles.body}>
      <p className={styles.code}>404</p>
      <h1 className={styles.title}>Страница не найдена</h1>
      <p className={styles.text}>
        Возможно, ссылка устарела или объявление сняли с публикации. Вернитесь на доску,
        там только активные заказы.
      </p>
      <div className={styles.actions}>
        <Link to="/" className={styles.primaryLink}>
          на доску объявлений
        </Link>
        <Link to="/app" className={styles.secondaryLink}>
          в личный кабинет
        </Link>
      </div>
    </main>
    <div className={styles.bars} aria-hidden="true">
      <span />
      <span />
      <span />
    </div>
  </div>
);

export default NotFound;
