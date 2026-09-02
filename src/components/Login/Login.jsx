import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import apiClient from '../../apiClient';
import Logo from '../shared/Logo/Logo';
import styles from './Login.module.css';

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loginValue, setLoginValue] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function login(username, pass) {
    const response = await apiClient.api.login({ username, password: pass });
    const token = response.data.token;
    if (!token) {
      throw new Error('В ответе сервера нет токена');
    }
    apiClient.setToken(token);
    return token;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!loginValue.trim() || !password) {
      setError('Введите логин и пароль');
      return;
    }
    setLoading(true);
    try {
      await login(loginValue.trim(), password);
      // Возвращаем туда, куда человек шёл до логина; иначе — на главную кабинета.
      // Чужие абсолютные адреса в `from` не пускаем, чтобы не увести пользователя с сайта.
      const from = searchParams.get('from');
      const target = from && from.startsWith('/') && !from.startsWith('//') ? from : '/app';
      navigate(target, { replace: true });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          'Ошибка входа. Проверьте логин и пароль.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <h1 className={styles.title}>вход</h1>
        <p className={styles.subtitle}>
          <Logo withText />
        </p>
        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.label}>
            Логин
            <input
              type="email"
              value={loginValue}
              onChange={(e) => setLoginValue(e.target.value)}
              className={styles.input}
              autoComplete="username"
              placeholder="you@mail.ru"
              disabled={loading}
              autoFocus
            />
          </label>
          <label className={styles.label}>
            Пароль
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              autoComplete="current-password"
              disabled={loading}
            />
          </label>
          {error && <p className={styles.error}>{error}</p>}
          <button type="submit" className={styles.submit} disabled={loading}>
            {loading ? 'Вход…' : 'Войти'}
          </button>
        </form>
        <p className={styles.footer}>
          нет аккаунта?{' '}
          <Link to="/register" className={styles.footerLink}>
            зарегистрироваться
          </Link>
        </p>
        <p className={styles.footer}>
          <Link to="/" className={styles.footerLink}>
            вернуться на доску объявлений
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
