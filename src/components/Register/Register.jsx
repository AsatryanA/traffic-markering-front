import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../../apiClient';
import Logo from '../shared/Logo/Logo';
import styles from './Register.module.css';

// Регистрируются только люди: заказчик публикует объявления, криатор их берёт.
// Роли ADMIN и SERVICE выдаются вручную и в форме не предлагаются.
const ROLE_OPTIONS = [
  { value: 'CUSTOMER', label: 'я заказчик', hint: 'публикую объявления и плачу за просмотры' },
  { value: 'CREATOR', label: 'я криатор', hint: 'снимаю ролики и зарабатываю на просмотрах' },
];

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '',
    password: '',
    name: '',
    // По умолчанию криатор: с доски объявлений сюда приходят прежде всего за заказами.
    role: 'CREATOR',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const setField = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const selectRole = (role) => {
    setForm((prev) => ({ ...prev, role }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const username = form.username.trim();
    const name = form.name.trim();

    if (!username) return setError('Укажите почту — она же логин.');
    if (!name) return setError('Укажите имя: его увидит вторая сторона сделки.');
    if (form.password.length < 6) return setError('Пароль — минимум 6 символов.');

    setLoading(true);
    setError('');
    try {
      const response = await apiClient.api.register({
        username,
        password: form.password,
        name,
        role: form.role,
      });
      const token = response.data.token;
      if (!token) {
        throw new Error('В ответе сервера нет токена');
      }
      // Бэк логинит сразу при регистрации — второй заход через форму входа не нужен.
      apiClient.setToken(token);
      navigate('/app', { replace: true });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          'Не удалось зарегистрироваться'
      );
    } finally {
      setLoading(false);
    }
  };

  const activeRole = ROLE_OPTIONS.find((option) => option.value === form.role);

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <h1 className={styles.title}>регистрация</h1>
        <p className={styles.subtitle}>
          <Logo withText />
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.roleBlock}>
            <span className={styles.roleCaption}>кто вы</span>
            <div className={styles.roleRow} role="group" aria-label="Роль в сервисе">
              {ROLE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={
                    form.role === option.value
                      ? `${styles.rolePill} ${styles.rolePillActive}`
                      : styles.rolePill
                  }
                  onClick={() => selectRole(option.value)}
                  aria-pressed={form.role === option.value}
                  disabled={loading}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <span className={styles.hint}>{activeRole?.hint}</span>
          </div>

          <label className={styles.label}>
            Почта (она же логин)
            <input
              type="email"
              name="username"
              value={form.username}
              onChange={setField}
              className={styles.input}
              autoComplete="username"
              placeholder="you@mail.ru"
              disabled={loading}
              autoFocus
            />
          </label>
          <label className={styles.label}>
            Имя
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={setField}
              className={styles.input}
              autoComplete="name"
              placeholder="Как к вам обращаться"
              disabled={loading}
            />
          </label>
          <label className={styles.label}>
            Пароль
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={setField}
              className={styles.input}
              autoComplete="new-password"
              disabled={loading}
            />
            <span className={styles.hint}>минимум 6 символов</span>
          </label>

          {error && <p className={styles.error}>{error}</p>}
          <button type="submit" className={styles.submit} disabled={loading}>
            {loading ? 'Создаём аккаунт…' : 'Зарегистрироваться'}
          </button>
        </form>

        <p className={styles.footer}>
          уже есть аккаунт?{' '}
          <Link to="/login" className={styles.footerLink}>
            войти
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

export default Register;
