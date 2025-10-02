// Breakpoints para responsive design
export const breakpoints = {
  mobile: '480px',
  tablet: '768px',
  desktop: '1024px',
  largeDesktop: '1200px'
};

// Media queries helpers
export const media = {
  mobile: `@media (max-width: ${breakpoints.mobile})`,
  tablet: `@media (max-width: ${breakpoints.tablet})`,
  desktop: `@media (max-width: ${breakpoints.desktop})`,
  largeDesktop: `@media (max-width: ${breakpoints.largeDesktop})`,
  
  // Min-width queries
  mobileUp: `@media (min-width: ${breakpoints.mobile})`,
  tabletUp: `@media (min-width: ${breakpoints.tablet})`,
  desktopUp: `@media (min-width: ${breakpoints.desktop})`,
  largeDesktopUp: `@media (min-width: ${breakpoints.largeDesktop})`
};