import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import apiClient from '../../apiClient';
import Logo from '../shared/Logo/Logo';
import SocialIcon from '../shared/SocialIcon/SocialIcon';
import FieldError from '../shared/FieldError/FieldError';
import {
  clearFieldError,
  hasErrors,
  validateEmail,
  validatePassword,
  validateRequired,
  validateTelegram,
} from '../../shared/validation';
import styles from './Register.module.css';

const ROLE_OPTIONS = [
  {
    value: 'CREATOR',
    label: 'я криатор',
    hint: 'снимаю ролики и зарабатываю на просмотрах',
  },
  {
    value: 'CUSTOMER',
    label: 'я заказчик',
    hint: 'публикую объявления и плачу за просмотры',
  },
];

const STEPS = [
  { title: 'кто вы', caption: 'выберите роль в сервисе' },
  { title: 'как вас зовут', caption: 'имя увидит вторая сторона сделки' },
  { title: 'вход в кабинет', caption: 'почта станет логином' },
];

const saveTelegram = (role, telegram) => {
  const body = { telegram };
  return role === 'CUSTOMER'
    ? apiClient.api.updateCustomerProfile(body)
    : apiClient.api.updateCreatorProfile(body);
};

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    role: '',
    name: '',
    telegram: '',
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const setField = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    clearFieldError(setErrors, name);
    setError('');
  };

  const invalid = (name) => (errors[name] ? 'true' : undefined);

  const selectRole = (role) => {
    setForm((prev) => ({ ...prev, role }));
    setError('');
    setStep(1);
  };

  const goBack = () => {
    setError('');
    setStep((prev) => Math.max(0, prev - 1));
  };

  const goNext = () => {
    if (step === 1) {
      const nextErrors = {
        name: validateRequired(form.name, 'Укажите имя'),
        telegram: validateTelegram(form.telegram),
      };
      setErrors(nextErrors);
      if (hasErrors(nextErrors)) return;
    }
    setError('');
    setStep((prev) => prev + 1);
  };

  const register = async () => {
    const username = form.username.trim();
    const nextErrors = {
      username: validateEmail(username),
      password: validatePassword(form.password),
    };
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;

    setLoading(true);
    setError('');
    try {
      const response = await apiClient.api.register({
        username,
        password: form.password,
        name: form.name.trim(),
        role: form.role,
      });
      const token = response.data.token;
      if (!token) {
        throw new Error('В ответе сервера нет токена');
      }
      apiClient.setToken(token);

      const telegram = form.telegram.trim();
      if (telegram) {
        try {
          await saveTelegram(form.role, telegram);
        } catch {
          toast.error('Аккаунт создан, но Telegram не сохранился — добавьте его в профиле.');
        }
      }
      navigate('/app', { replace: true });
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Не удалось зарегистрироваться';
      if (err?.response?.status === 409) {
        setErrors({ username: message });
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (step === 2) {
      register();
    } else {
      goNext();
    }
  };

  const current = STEPS[step];

  return (
    <div className={styles.page}>
      <div className={styles.headerSafeArea} aria-hidden="true" />
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link to="/" className={styles.logoLink} aria-label="На доску объявлений">
            <Logo light withText />
          </Link>
        </div>
      </header>

      <main className={styles.wrap}>
        <div className={styles.card}>
          <div className={styles.progress} aria-label={`Шаг ${step + 1} из ${STEPS.length}`}>
            {STEPS.map((item, index) => (
              <span
                key={item.title}
                className={`${styles.progressBar} ${index <= step ? styles.progressBarDone : ''}`}
              />
            ))}
          </div>
          <p className={styles.stepLabel}>
            шаг {step + 1} из {STEPS.length}
          </p>
          <h1 className={styles.title}>{current.title}</h1>
          <p className={styles.caption}>{current.caption}</p>

          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            {step === 0 && (
              <div className={styles.roleList} role="group" aria-label="Роль в сервисе">
                {ROLE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={
                      form.role === option.value
                        ? `${styles.roleCard} ${styles.roleCardActive}`
                        : styles.roleCard
                    }
                    onClick={() => selectRole(option.value)}
                    aria-pressed={form.role === option.value}
                  >
                    <span className={styles.roleLabel}>{option.label}</span>
                    <span className={styles.roleHint}>{option.hint}</span>
                  </button>
                ))}
              </div>
            )}

            {step === 1 && (
              <>
                <label className={styles.label}>
                  Имя
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={setField}
                    className={styles.input}
                    aria-invalid={invalid('name')}
                    autoComplete="name"
                    placeholder="Как к вам обращаться"
                    autoFocus
                  />
                  <FieldError>{errors.name}</FieldError>
                </label>
                <label className={styles.label}>
                  <span className={styles.labelRow}>
                    <SocialIcon name="telegram" className={styles.labelIcon} />
                    Telegram для связи
                    <span className={styles.optional}>можно пропустить</span>
                  </span>
                  <input
                    type="text"
                    name="telegram"
                    value={form.telegram}
                    onChange={setField}
                    className={styles.input}
                    aria-invalid={invalid('telegram')}
                    placeholder="@username"
                  />
                  <FieldError>{errors.telegram}</FieldError>
                </label>
              </>
            )}

            {step === 2 && (
              <>
                <label className={styles.label}>
                  Почта (она же логин)
                  <input
                    type="email"
                    name="username"
                    value={form.username}
                    onChange={setField}
                    className={styles.input}
                    aria-invalid={invalid('username')}
                    autoComplete="username"
                    placeholder="you@mail.ru"
                    disabled={loading}
                    autoFocus
                  />
                  <FieldError>{errors.username}</FieldError>
                </label>
                <label className={styles.label}>
                  Пароль
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={setField}
                    className={styles.input}
                    aria-invalid={invalid('password')}
                    autoComplete="new-password"
                    disabled={loading}
                  />
                  {errors.password ? (
                    <FieldError>{errors.password}</FieldError>
                  ) : (
                    <span className={styles.hint}>минимум 6 символов</span>
                  )}
                </label>
              </>
            )}

            {error && <p className={styles.error}>{error}</p>}

            {step > 0 && (
              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.back}
                  onClick={goBack}
                  disabled={loading}
                >
                  назад
                </button>
                <button type="submit" className={styles.submit} disabled={loading}>
                  {step === 2 ? (loading ? 'Создаём аккаунт…' : 'Зарегистрироваться') : 'Дальше'}
                </button>
              </div>
            )}
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
      </main>
    </div>
  );
};

export default Register;
