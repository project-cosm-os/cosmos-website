import React from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';

import { ROUTES } from '../config/navigation';
import SEO from '../components/shared/SEO';
import Button from '../components/shared/Button';
import GridBackground from '../components/shared/GridBackground';

const NotFound: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="relative overflow-hidden min-h-[70vh] flex items-center justify-center">
      {/* noIndex: a 404 in the index is a result that wastes a click. */}
      <SEO
        title="Page not found"
        path="/404"
        description="That page does not exist or has been moved."
        noIndex
      />
      <GridBackground />
      <div className="relative text-center px-6" style={{ zIndex: 1 }}>
        <div className="animate-in">
          <p className="tnum text-8xl font-bold text-[var(--text-muted)] mb-4">404</p>
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-3">
            {t('notFound.title')}
          </h1>
          <p className="text-[var(--text-secondary)] mb-8 max-w-md mx-auto">
            {t('notFound.description')}
          </p>
          <Link to={ROUTES.home}>
            <Button variant="primary" size="lg">
              <ArrowLeft size={16} className="mr-2" />
              {t('notFound.backHome')}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
