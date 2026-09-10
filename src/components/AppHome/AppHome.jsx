import React from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../apiClient';
import { SECTIONS, getAllowedSections } from '../../permissions';
import { ROLE_LABELS } from '../../shared/dictionaries';
import styles from './AppHome.module.css';

// Плитки быстрых действий. Секция у плитки — та же, что в permissions.js,
// поэтому заказчику и криатору кабинет открывается разными наборами ссылок.
const TILES = [
  {
    section: SECTIONS.CAMPAIGNS,
    to: '/app/campaigns',
    title: 'мои объявления',
    text: 'Статусы, бюджеты и отклики по каждому объявлению.',
  },
  {
    section: SECTIONS.CAMPAIGNS,
    to: '/app/campaigns/new',
    title: 'новое объявление',
    text: 'Опишите задачу, задайте ставку за 1000 просмотров и бюджет.',
  },
  {
    section: SECTIONS.APPLICATIONS,
    to: '/app/applications',
    title: 'мои отклики',
    text: 'Что взято в работу, сколько просмотров и сколько заработано.',
  },
  {
    section: SECTIONS.APPLICATIONS,
    to: '/app/board',
    title: 'доска объявлений',
    text: 'Свежие заказы от заказчиков — выберите, что снять.',
  },
  {
    section: SECTIONS.PROFILE,
    to: '/app/profile',
    title: 'о себе',
    text: 'Контакты и описание — их видит вторая сторона сделки.',
  },
  {
    section: SECTIONS.SOCIALS,
    to: '/app/profile/socials',
    title: 'соцсети',
    text: 'Подключённые аккаунты площадок, по которым считаются просмотры.',
  },
];

const AppHome = () => {
  const jwtMeta = apiClient.getJwtMetadata();
  const role = jwtMeta?.role;
  const userName = jwtMeta?.name || jwtMeta?.username;
  const allowedSections = getAllowedSections(role);
  const tiles = TILES.filter((tile) => allowedSections.includes(tile.section));

  return (
    <div className={styles.wrap}>
      <h1 className={styles.title}>
        {userName ? `Привет, ${userName}` : 'Привет'}
      </h1>
      <p className={styles.subtitle}>
        {role === 'CREATOR'
          ? 'Вы вошли как криатор: берите объявления в работу и получайте за просмотры.'
          : role === 'CUSTOMER'
            ? 'Вы вошли как заказчик: публикуйте объявления и одобряйте отклики криаторов.'
            : `Вы вошли как ${ROLE_LABELS[role] || role || 'пользователь'}.`}
      </p>

      <div className={styles.tiles}>
        {tiles.map((tile) => (
          <Link key={tile.to} to={tile.to} className={styles.tile}>
            <span className={styles.tileTitle}>{tile.title}</span>
            <span className={styles.tileText}>{tile.text}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AppHome;
