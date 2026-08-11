import React, { type ReactNode } from 'react';

import Header from './Header';
import Footer from './Footer';
import CookieConsent from '../integrations/CookieConsent';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => (
  <div className="min-h-screen flex flex-col">
    <Header />
    <main className="flex-1 pt-[var(--header-height)]">{children}</main>
    <Footer />
    <CookieConsent />
  </div>
);

export default Layout;
