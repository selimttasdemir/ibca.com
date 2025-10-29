import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import AnnouncementList from '../components/AnnouncementList';
import ImageSlider from '../components/ImageSlider';

const HomePage = () => {
  const { t } = useLanguage();
  const { currentTheme } = useTheme();

  return (
    <div className="min-h-screen" style={{ backgroundColor: currentTheme.background }}>
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div 
          className="text-center py-12 rounded-xl shadow-lg mb-8 transition-all duration-300"
          style={{ 
            backgroundColor: currentTheme.card,
            borderColor: currentTheme.border,
            borderWidth: '2px'
          }}
        >
          <h1 
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ color: currentTheme.primary }}
          >
            {t('home.title')}
          </h1>
          <div className="w-24 h-1 mx-auto rounded-full" style={{ backgroundColor: currentTheme.accent }}></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Announcements - Takes 2 columns */}
          <div className="lg:col-span-2">
            <AnnouncementList />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Image */}
            <div 
              className="rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl"
              style={{ 
                backgroundColor: currentTheme.card,
                borderColor: currentTheme.border,
                borderWidth: '2px'
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400"
                alt="Prof. Dr. İbrahim Çayıroğlu"
                className="w-full h-auto"
              />
              <div className="p-4 text-center">
                <h3 className="text-xl font-bold" style={{ color: currentTheme.text }}>
                  Prof. Dr. İbrahim ÇAYIROĞLU
                </h3>
                <p className="text-sm mt-2" style={{ color: currentTheme.text, opacity: 0.8 }}>
                  Bölüm Başkanı
                </p>
                <p className="text-sm" style={{ color: currentTheme.text, opacity: 0.8 }}>
                  Mekatronik Mühendisliği
                </p>
              </div>
            </div>

            {/* Image Slider */}
            <div>
              <h3 
                className="text-xl font-bold mb-4"
                style={{ color: currentTheme.text }}
              >
                {t('home.photoGallery')}
              </h3>
              <ImageSlider />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;