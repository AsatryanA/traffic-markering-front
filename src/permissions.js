// Карта прав личного кабинета: роль → доступные секции.
// Должна совпадать с правилами в WebSecurityConfig на бэке.
export const SECTIONS = {
  CAMPAIGNS: 'CAMPAIGNS',
  APPLICATIONS: 'APPLICATIONS',
  PROFILE: 'PROFILE',
};

const ROLE_SECTIONS = {
  CUSTOMER: [SECTIONS.CAMPAIGNS, SECTIONS.PROFILE],
  CREATOR: [SECTIONS.APPLICATIONS, SECTIONS.PROFILE],
  ADMIN: [SECTIONS.CAMPAIGNS, SECTIONS.APPLICATIONS, SECTIONS.PROFILE],
};

export const getAllowedSections = (role) => ROLE_SECTIONS[role] || [];

// Какой секции принадлежит путь кабинета. null — общая страница (/app).
export const sectionForPath = (pathname) => {
  if (pathname.startsWith('/app/campaigns')) return SECTIONS.CAMPAIGNS;
  if (pathname.startsWith('/app/applications')) return SECTIONS.APPLICATIONS;
  if (pathname.startsWith('/app/profile')) return SECTIONS.PROFILE;
  return null;
};
