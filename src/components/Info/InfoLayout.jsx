import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../shared/Logo/Logo';
import { CONTACT_EMAIL, UPDATED_AT } from './legal';
import styles from './Info.module.css';

const InfoLayout = ({ title, lead, showUpdated = true, children }) => (
  <div className={styles.page}>
    <header className={styles.header}>
      <Link to="/" className={styles.home} aria-label="На доску объявлений">
        <Logo withText />
      </Link>
      <nav className={styles.nav}>
        <Link to="/info" className={styles.navLink}>
          О сервисе
        </Link>
        <Link to="/info/privacy" className={styles.navLink}>
          Конфиденциальность
        </Link>
        <Link to="/info/terms" className={styles.navLink}>
          Условия
        </Link>
      </nav>
    </header>

    <main className={styles.main}>
      <h1 className={styles.title}>{title}</h1>
      {lead && <p className={styles.lead}>{lead}</p>}
      {showUpdated && <p className={styles.updated}>Редакция от {UPDATED_AT}</p>}
      {children}
    </main>

    <footer className={styles.footer}>
      <span>
        Вопросы: <a className={styles.link} href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
      </span>
    </footer>
  </div>
);

export default InfoLayout;
