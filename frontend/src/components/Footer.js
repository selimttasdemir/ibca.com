import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

const Footer = () => {
  const { t } = useLanguage();
  const { currentTheme } = useTheme();
  const currentYear = new Date().getFullYear();

  return (
    <footer 
      className="mt-auto py-8 transition-all duration-300"
      style={{ 
        backgroundColor: currentTheme.primary,
        color: currentTheme.secondary 
      }}
    >
      <div className="container mx-auto px-4">
        <div className="text-center space-y-2">
          <p className="text-sm">
            {t('footer.copyright')} © {currentYear} Prof. Dr. İbrahim ÇAYIROĞLU
          </p>
          <p className="text-xs opacity-80">
            {t('footer.allRightsReserved')}
          </p>
          <p className="text-xs opacity-70">
            E-mail: icayiroglu@karabuk.edu.tr | Tel: +90 370 418 7440
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;