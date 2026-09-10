import React from 'react';
import styles from './SocialIcon.module.css';

const ICONS = {
  telegram: (
    <g fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.5 3.5 3 11l6.5 2.5L18 7l-6 8 6.5 4.5z" />
    </g>
  ),
  instagram: (
    <g fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.3" cy="6.7" r="0.6" fill="currentColor" />
    </g>
  ),
  tiktok: (
    <path
      fill="currentColor"
      d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"
    />
  ),
  youtube: (
    <g>
      <rect x="2" y="5" width="20" height="14" rx="4" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M10 9l6 3-6 3z" fill="currentColor" />
    </g>
  ),
};

const ALIASES = {
  youtubeShorts: 'youtube',
  youtube_shorts: 'youtube',
  INSTAGRAM: 'instagram',
  TIKTOK: 'tiktok',
  YOUTUBE_SHORTS: 'youtube',
  TELEGRAM: 'telegram',
};

const SocialIcon = ({ name, className = '' }) => {
  const key = ALIASES[name] || name;
  const glyph = ICONS[key];
  if (!glyph) return null;
  return (
    <svg className={`${styles.icon} ${className}`} viewBox="0 0 24 24" aria-hidden="true">
      {glyph}
    </svg>
  );
};

export default SocialIcon;
