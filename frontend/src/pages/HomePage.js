import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import AnnouncementList from '../components/AnnouncementList';
import ImageSlider from '../components/ImageSlider';
import { Facebook, Twitter, Instagram, Linkedin, Youtube, ExternalLink, Upload, GraduationCap, Users, Building2, LogIn } from 'lucide-react';
import { Button } from '../components/ui/button';

const HomePage = () => {
  const { t } = useLanguage();
  const { currentTheme } = useTheme();
  const navigate = useNavigate();

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
                <p className="text-sm font-semibold mt-3" style={{ color: currentTheme.accent }}>
                  Karabük Üniversitesi
                </p>
              </div>
            </div>

            {/* University Social Media Links */}
            <div 
              className="rounded-xl shadow-lg p-4 transition-all duration-300 hover:shadow-2xl"
              style={{ 
                backgroundColor: currentTheme.card,
                borderColor: currentTheme.border,
                borderWidth: '2px'
              }}
            >
              <h3 className="text-lg font-bold mb-3 text-center" style={{ color: currentTheme.text }}>
                Üniversite Sosyal Medya
              </h3>
              <div className="space-y-2">
                <a 
                  href="https://www.facebook.com/krbkuni/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center p-2 rounded-lg transition-all duration-200 hover:scale-105"
                  style={{ backgroundColor: currentTheme.background }}
                >
                  <Facebook className="h-5 w-5 mr-3 text-blue-600" />
                  <span className="text-sm" style={{ color: currentTheme.text }}>Facebook</span>
                  <ExternalLink className="h-3 w-3 ml-auto" style={{ color: currentTheme.text, opacity: 0.5 }} />
                </a>
                
                <a 
                  href="https://twitter.com/krbkuni" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center p-2 rounded-lg transition-all duration-200 hover:scale-105"
                  style={{ backgroundColor: currentTheme.background }}
                >
                  <Twitter className="h-5 w-5 mr-3 text-sky-500" />
                  <span className="text-sm" style={{ color: currentTheme.text }}>Twitter</span>
                  <ExternalLink className="h-3 w-3 ml-auto" style={{ color: currentTheme.text, opacity: 0.5 }} />
                </a>
                
                <a 
                  href="https://www.instagram.com/karabukuniv/?hl=tr" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center p-2 rounded-lg transition-all duration-200 hover:scale-105"
                  style={{ backgroundColor: currentTheme.background }}
                >
                  <Instagram className="h-5 w-5 mr-3 text-pink-600" />
                  <span className="text-sm" style={{ color: currentTheme.text }}>Instagram</span>
                  <ExternalLink className="h-3 w-3 ml-auto" style={{ color: currentTheme.text, opacity: 0.5 }} />
                </a>
                
                <a 
                  href="https://www.linkedin.com/in/karabuk-universitesi-2007/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center p-2 rounded-lg transition-all duration-200 hover:scale-105"
                  style={{ backgroundColor: currentTheme.background }}
                >
                  <Linkedin className="h-5 w-5 mr-3 text-blue-700" />
                  <span className="text-sm" style={{ color: currentTheme.text }}>LinkedIn</span>
                  <ExternalLink className="h-3 w-3 ml-auto" style={{ color: currentTheme.text, opacity: 0.5 }} />
                </a>
                
                <a 
                  href="https://www.youtube.com/user/kbu3nisantv" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center p-2 rounded-lg transition-all duration-200 hover:scale-105"
                  style={{ backgroundColor: currentTheme.background }}
                >
                  <Youtube className="h-5 w-5 mr-3 text-red-600" />
                  <span className="text-sm" style={{ color: currentTheme.text }}>YouTube</span>
                  <ExternalLink className="h-3 w-3 ml-auto" style={{ color: currentTheme.text, opacity: 0.5 }} />
                </a>
              </div>
            </div>

            {/* Quick Links / Hızlı Erişim */}
            <div 
              className="rounded-xl shadow-lg p-4 transition-all duration-300 hover:shadow-2xl"
              style={{ 
                backgroundColor: currentTheme.card,
                borderColor: currentTheme.border,
                borderWidth: '2px'
              }}
            >
              <h3 className="text-lg font-bold mb-3 text-center" style={{ color: currentTheme.text }}>
                Hızlı Erişim
              </h3>
              <div className="space-y-2">
                <a 
                  href="https://muh.karabuk.edu.tr/mekatronik" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center p-2 rounded-lg transition-all duration-200 hover:scale-105"
                  style={{ backgroundColor: currentTheme.background }}
                >
                  <GraduationCap className="h-5 w-5 mr-3" style={{ color: currentTheme.accent }} />
                  <span className="text-sm" style={{ color: currentTheme.text }}>Mekatronik Bölümü</span>
                  <ExternalLink className="h-3 w-3 ml-auto" style={{ color: currentTheme.text, opacity: 0.5 }} />
                </a>
                
                <a 
                  href="https://obs.karabuk.edu.tr/oibs/std/login.aspx" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center p-2 rounded-lg transition-all duration-200 hover:scale-105"
                  style={{ backgroundColor: currentTheme.background }}
                >
                  <Upload className="h-5 w-5 mr-3" style={{ color: currentTheme.accent }} />
                  <span className="text-sm" style={{ color: currentTheme.text }}>OBS Giriş</span>
                  <ExternalLink className="h-3 w-3 ml-auto" style={{ color: currentTheme.text, opacity: 0.5 }} />
                </a>
                
                <a 
                  href="https://muh.karabuk.edu.tr/index.aspx" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center p-2 rounded-lg transition-all duration-200 hover:scale-105"
                  style={{ backgroundColor: currentTheme.background }}
                >
                  <Building2 className="h-5 w-5 mr-3" style={{ color: currentTheme.accent }} />
                  <span className="text-sm" style={{ color: currentTheme.text }}>Mühendislik Fakültesi</span>
                  <ExternalLink className="h-3 w-3 ml-auto" style={{ color: currentTheme.text, opacity: 0.5 }} />
                </a>
                
                <a 
                  href="https://muh.karabuk.edu.tr/akademikPersonel.aspx?BA=mekatronik" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center p-2 rounded-lg transition-all duration-200 hover:scale-105"
                  style={{ backgroundColor: currentTheme.background }}
                >
                  <Users className="h-5 w-5 mr-3" style={{ color: currentTheme.accent }} />
                  <span className="text-sm" style={{ color: currentTheme.text }}>Akademik Kadro</span>
                  <ExternalLink className="h-3 w-3 ml-auto" style={{ color: currentTheme.text, opacity: 0.5 }} />
                </a>

                {/* Öğrenci Girişi */}
                <div
                  onClick={() => navigate('/student-login')}
                  className="flex items-center p-2 rounded-lg transition-all duration-200 hover:scale-105 cursor-pointer"
                  style={{ backgroundColor: currentTheme.accent, color: 'white' }}
                >
                  <LogIn className="h-5 w-5 mr-3" />
                  <span className="text-sm font-semibold">Öğrenci Girişi</span>
                </div>
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