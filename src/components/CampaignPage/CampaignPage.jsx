import React, { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import apiClient from '../../apiClient';
import BudgetBar from '../shared/BudgetBar/BudgetBar';
import FieldError from '../shared/FieldError/FieldError';
import { formatRubles, formatViews } from '../../shared/money';
import { CAMPAIGN_STATUS_LABELS, PLATFORM_LABELS, formatDate } from '../../shared/dictionaries';
import { detectPlatform } from '../../shared/video';
import styles from './CampaignPage.module.css';

const emptyForm = {
  videoUrl: '',
  comment: '',
};

const CampaignPage = () => {
  const { publicId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [videoUrlError, setVideoUrlError] = useState('');
  const [sending, setSending] = useState(false);
  const [accounts, setAccounts] = useState(null);

  // Роль берём прямо из токена: лишний запрос /api/auth/me публичной странице не нужен.
  const authorized = apiClient.hasLiveToken();
  const role = authorized ? apiClient.getJwtMetadata()?.role : null;
  const isCreator = role === 'CREATOR';

  const loadCampaign = useCallback(async () => {
    try {
      const res = await apiClient.api.boardCampaign(publicId);
      setCampaign(res.data);
      setPageError('');
    } catch (err) {
      setPageError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          'Не удалось загрузить объявление'
      );
    } finally {
      setLoading(false);
    }
  }, [publicId]);

  useEffect(() => {
    loadCampaign();
  }, [loadCampaign]);

  useEffect(() => {
    if (!isCreator) return;
    apiClient.instance
      .get('/api/social/accounts')
      .then((res) => setAccounts(Array.isArray(res.data) ? res.data : []))
      .catch(() => setAccounts(null));
  }, [isCreator]);

  const platform = detectPlatform(form.videoUrl);
  const hasAccount =
    accounts === null ||
    accounts.some((account) => account.platform === platform && account.status === 'ACTIVE');

  const setField = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === 'videoUrl') setVideoUrlError('');
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const videoUrl = form.videoUrl.trim();
    if (!videoUrl) {
      setVideoUrlError('Укажите ссылку на ролик');
      return;
    }
    if (!platform) {
      setVideoUrlError('Площадка не распознана: принимаются YouTube, TikTok и Instagram');
      return;
    }

    setSending(true);
    setFormError('');
    try {
      await apiClient.api.apply({
        campaignId: campaign.id,
        videoUrl,
        // Пустой комментарий отправлять нечего — на бэке поле необязательное.
        comment: form.comment.trim() || null,
      });
      toast.success('Отклик отправлен — ждём решения заказчика');
      navigate('/app/applications');
    } catch (err) {
      // 409 «вы уже откликались» бэк объясняет текстом — показываем его как есть.
      setFormError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          'Не удалось отправить отклик'
      );
    } finally {
      setSending(false);
    }
  };

  const renderApplyBlock = () => {
    if (!authorized) {
      const from = encodeURIComponent(location.pathname);
      return (
        <div className={styles.applyNotice}>
          <p className={styles.noticeText}>
            чтобы взять заказ в работу, войдите как криатор или заведите аккаунт — это минута.
          </p>
          <div className={styles.noticeActions}>
            <Link to={`/login?from=${from}`} className={styles.primaryLink}>
              войти
            </Link>
            <Link to="/register" className={styles.secondaryLink}>
              зарегистрироваться
            </Link>
          </div>
        </div>
      );
    }

    if (!isCreator) {
      return (
        <div className={styles.applyNotice}>
          <p className={styles.noticeText}>
            отклики оставляют криаторы. вы вошли как {role === 'CUSTOMER' ? 'заказчик' : 'администратор'} —
            своё объявление можно вести в личном кабинете.
          </p>
          <div className={styles.noticeActions}>
            <Link to="/app" className={styles.secondaryLink}>
              личный кабинет
            </Link>
          </div>
        </div>
      );
    }

    const inactive = campaign.status !== 'ACTIVE';

    return (
      <form className={styles.applyForm} onSubmit={handleSubmit} noValidate>
        <h2 className={styles.blockTitle}>взять в работу</h2>
        {inactive && (
          <p className={styles.hintBanner}>
            объявление сейчас {CAMPAIGN_STATUS_LABELS[campaign.status] || campaign.status} —
            новые отклики заказчик не принимает.
          </p>
        )}
        <label className={styles.label}>
          Ссылка на ролик *
          <input
            type="url"
            name="videoUrl"
            value={form.videoUrl}
            onChange={setField}
            className={styles.input}
            aria-invalid={videoUrlError ? 'true' : undefined}
            placeholder="https://youtube.com/shorts/…"
            maxLength={1024}
            disabled={sending || inactive}
          />
          <FieldError>{videoUrlError}</FieldError>
          <span className={styles.hint}>
            по этой ссылке считаются просмотры, за которые начисляются деньги. площадка
            определяется автоматически: YouTube, TikTok или Instagram.
          </span>
          {form.videoUrl.trim() && !platform && !videoUrlError && (
            <span className={styles.platformWarn}>
              площадка по ссылке не распознана.
            </span>
          )}
          {platform && hasAccount && (
            <span className={styles.platformOk}>площадка: {PLATFORM_LABELS[platform]}</span>
          )}
          {platform && !hasAccount && (
            <span className={styles.platformWarn}>
              {PLATFORM_LABELS[platform]} не привязан в профиле, отклик не примется.{' '}
              <Link to="/app/profile" className={styles.inlineLink}>
                привязать аккаунт
              </Link>
            </span>
          )}
        </label>
        <label className={styles.label}>
          Комментарий заказчику
          <textarea
            name="comment"
            value={form.comment}
            onChange={setField}
            className={`${styles.input} ${styles.textarea}`}
            rows={3}
            placeholder="Что за формат, когда выйдет ролик"
            disabled={sending || inactive}
          />
        </label>
        {formError && <p className={styles.error}>{formError}</p>}
        <button type="submit" className={styles.submit} disabled={sending || inactive}>
          {sending ? 'Отправка…' : 'Взять в работу'}
        </button>
      </form>
    );
  };

  return (
    <div className={styles.wrap}>
      <Link to="/" className={styles.backLink}>
        ← к доске объявлений
      </Link>

      {loading ? (
        <p className={styles.message}>Загрузка объявления…</p>
      ) : pageError ? (
        <p className={styles.errorBanner}>{pageError}</p>
      ) : !campaign ? (
        <p className={styles.message}>Объявление не найдено.</p>
      ) : (
        <div className={styles.layout}>
          <article className={styles.card}>
            <h1 className={styles.title}>{campaign.title}</h1>
            <p className={styles.cardMeta}>
              {campaign.customerCompany || campaign.customerName}
              {campaign.createdAt ? ` · ${formatDate(campaign.createdAt)}` : ''}
              {campaign.statusDescription ? ` · ${campaign.statusDescription}` : ''}
            </p>

            {campaign.photoUrl && (
              <div className={styles.media}>
                <img
                  className={styles.mediaBackdrop}
                  src={campaign.photoUrl}
                  alt=""
                  aria-hidden="true"
                />
                <img className={styles.mediaPhoto} src={campaign.photoUrl} alt={campaign.title} />
              </div>
            )}

            <p className={styles.rate}>
              {formatRubles(campaign.ratePerThousandKopecks)}
              <span className={styles.rateUnit}> / 1000 просмотров</span>
            </p>

            <p className={styles.description}>{campaign.description}</p>

            <div className={styles.budgetBlock}>
              <BudgetBar
                budgetKopecks={campaign.budgetKopecks}
                spentKopecks={campaign.spentKopecks}
              />
              <p className={styles.remaining}>
                на объявлении лежит{' '}
                <strong className={styles.remainingValue}>
                  {formatRubles(campaign.remainingKopecks)}
                </strong>{' '}
                — столько ещё можно заработать на просмотрах.
              </p>
            </div>

            <dl className={styles.facts}>
              <div className={styles.fact}>
                <dt className={styles.factKey}>заказчик</dt>
                <dd className={styles.factValue}>
                  {campaign.customerCompany || campaign.customerName || '—'}
                </dd>
              </div>
              <div className={styles.fact}>
                <dt className={styles.factKey}>откликов</dt>
                <dd className={styles.factValue}>{campaign.applicationsCount ?? 0}</dd>
              </div>
              <div className={styles.fact}>
                <dt className={styles.factKey}>просмотров набрано</dt>
                <dd className={styles.factValue}>{formatViews(campaign.totalViews ?? 0)}</dd>
              </div>
            </dl>
          </article>

          <aside className={styles.side}>{renderApplyBlock()}</aside>
        </div>
      )}
    </div>
  );
};

export default CampaignPage;
