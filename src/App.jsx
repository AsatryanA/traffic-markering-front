import React, { useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import apiClient from './apiClient';
import styles from './App.module.css';
import Board from './components/Board/Board';
import CampaignPage from './components/CampaignPage/CampaignPage';
import Login from './components/Login/Login';
import Register from './components/Register/Register';
import NotFound from './components/NotFound/NotFound';
import AppLayout from './components/AppLayout/AppLayout';
import AppHome from './components/AppHome/AppHome';
import CustomerCampaigns from './components/CustomerCampaigns/CustomerCampaigns';
import CampaignEditor from './components/CampaignEditor/CampaignEditor';
import CreatorApplications from './components/CreatorApplications/CreatorApplications';
import Profile from './components/Profile/Profile';

// Статические пути приложения. Всё, чего здесь нет и что не подошло под
// динамические шаблоны ниже, — 404 (и такие страницы закрываем от индексации).
const KNOWN_PATHS = new Set([
  '/',
  '/login',
  '/register',
  '/app',
  '/app/board',
  '/app/campaigns',
  '/app/applications',
  '/app/profile',
]);

// Динамические маршруты: карточка объявления и редактор объявления.
const DYNAMIC_PATHS = [/^\/campaigns\/[^/]+$/, /^\/app\/campaigns\/[^/]+$/];

// Заголовок и описание вкладки по пути. Ключ — уже нормализованный pathname.
const PAGE_SEO = {
  '/': {
    title: 'traffic markering — доска рекламных объявлений',
    description:
      'Объявления на рекламные интеграции: ставка за 1000 просмотров и бюджет заказчика. Берите заказ в работу и зарабатывайте на просмотрах.',
  },
  '/login': {
    title: 'вход — traffic markering',
    description: 'Вход в личный кабинет traffic markering.',
  },
  '/register': {
    title: 'регистрация — traffic markering',
    description: 'Регистрация заказчика или криатора в traffic markering.',
  },
};

const upsertMetaTag = (selector, attributes) => {
  let tag = document.head.querySelector(selector);
  if (!tag) {
    tag = document.createElement('meta');
    document.head.appendChild(tag);
  }
  Object.entries(attributes).forEach(([key, value]) => {
    tag.setAttribute(key, value);
  });
};

function App() {
  const location = useLocation();
  // Хвостовой слэш ломает совпадение с KNOWN_PATHS и плодит дубли адресов,
  // поэтому /app/campaigns/ редиректим на /app/campaigns.
  const normalizedPathname =
    location.pathname.length > 1
      ? location.pathname.replace(/\/+$/, '')
      : location.pathname;
  const isKnownPage =
    KNOWN_PATHS.has(normalizedPathname) ||
    DYNAMIC_PATHS.some((pattern) => pattern.test(normalizedPathname));

  useEffect(() => {
    const seo = PAGE_SEO[normalizedPathname] || {
      title: 'traffic markering',
      description: 'Платформа рекламных интеграций traffic markering.',
    };
    // Личный кабинет и несуществующие адреса в выдаче не нужны.
    const isPrivatePage = !isKnownPage || normalizedPathname.startsWith('/app');

    document.title = seo.title;
    upsertMetaTag('meta[name="description"]', {
      name: 'description',
      content: seo.description,
    });
    upsertMetaTag('meta[name="robots"]', {
      name: 'robots',
      content: isPrivatePage ? 'noindex,nofollow' : 'index,follow',
    });
  }, [normalizedPathname, isKnownPage]);

  if (location.pathname !== normalizedPathname) {
    return (
      <Navigate
        to={{ pathname: normalizedPathname, search: location.search, hash: location.hash }}
        replace
      />
    );
  }

  return (
    <div className={styles.app}>
      <Routes>
        <Route
          path="/"
          element={apiClient.hasLiveToken() ? <Navigate to="/app" replace /> : <Board />}
        />
        <Route path="/campaigns/:publicId" element={<CampaignPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<AppLayout />}>
          <Route path="/app" element={<AppHome />} />
          <Route path="/app/board" element={<Board embedded />} />
          <Route path="/app/campaigns" element={<CustomerCampaigns />} />
          {/* campaignId = "new" — создание объявления, uuid — правка и отклики. */}
          <Route path="/app/campaigns/:campaignId" element={<CampaignEditor />} />
          <Route path="/app/applications" element={<CreatorApplications />} />
          <Route path="/app/profile" element={<Profile />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
