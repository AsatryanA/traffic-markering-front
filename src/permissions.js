// Карта прав личного кабинета: роль → доступные секции.
// Должна совпадать с правилами в WebSecurityConfig на бэке.
export const SECTIONS = {
  CAMPAIGNS: 'CAMPAIGNS',
  APPLICATIONS: 'APPLICATIONS',
  PROFILE: 'PROFILE',
  SOCIALS: 'SOCIALS',
};

const ROLE_SECTIONS = {
  CUSTOMER: [SECTIONS.CAMPAIGNS, SECTIONS.PROFILE],
  CREATOR: [SECTIONS.APPLICATIONS, SECTIONS.PROFILE, SECTIONS.SOCIALS],
  ADMIN: [SECTIONS.CAMPAIGNS, SECTIONS.APPLICATIONS, SECTIONS.PROFILE, SECTIONS.SOCIALS],
};

export const getAllowedSections = (role) => ROLE_SECTIONS[role] || [];

// Какой секции принадлежит путь кабинета. null — общая страница (/app).
export const sectionForPath = (pathname) => {
  if (pathname.startsWith('/app/campaigns')) return SECTIONS.CAMPAIGNS;
  if (pathname.startsWith('/app/applications')) return SECTIONS.APPLICATIONS;
  if (pathname.startsWith('/app/profile/socials')) return SECTIONS.SOCIALS;
  if (pathname.startsWith('/app/profile')) return SECTIONS.PROFILE;
  return null;
};
