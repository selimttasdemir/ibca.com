/**
 * Ana Uygulama Bileşeni
 * 
 * Bu bileşen, uygulamanın ana yapısını ve yönlendirmesini (routing) yönetir.
 * Tüm sayfalar ve context provider'lar burada tanımlanır.
 */

import React, { useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Context Provider'lar
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';

// UI Bileşenleri
import { Toaster } from './components/ui/toaster';
import Header from './components/Header';
import Footer from './components/Footer';

// Sayfa Bileşenleri
import HomePage from './pages/HomePage';
import CVPage from './pages/CVPage';
import CoursesPage from './pages/CoursesPage';
import CourseDetailPage from './pages/CourseDetailPage';
import PublicationsPage from './pages/PublicationsPage';
import GalleryPage from './pages/GalleryPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboard from './pages/AdminDashboard';
import StudentLoginPage from './pages/StudentLoginPage';
import StudentRegisterPage from './pages/StudentRegisterPage';
import StudentDashboard from './pages/StudentDashboard';


function App() {
  // Sağ tıklama, metin seçimi ve kopyalamayı engelle (admin panel hariç)
  useEffect(() => {
    // Admin panelinde veya editable elementlerde bu kısıtlamaları uygulama
    const isAdminPanel = (element) => {
      if (!element) return false;
      // Element veya parent'larında admin-panel class'ı var mı kontrol et
      let current = element;
      while (current) {
        if (current.classList && current.classList.contains('admin-panel')) {
          return true;
        }
        // Quill editor içindeyse izin ver
        if (current.classList && (current.classList.contains('ql-editor') || current.classList.contains('ql-container'))) {
          return true;
        }
        current = current.parentElement;
      }
      return false;
    };

    // Sağ tıklamayı engelle (admin panel hariç)
    const handleContextMenu = (e) => {
      if (isAdminPanel(e.target)) return true;
      e.preventDefault();
      return false;
    };

    // Ctrl+C, Ctrl+U, Ctrl+S gibi kısayolları engelle (admin panel hariç)
    const handleKeyDown = (e) => {
      // Admin panelindeyse izin ver
      if (isAdminPanel(document.activeElement)) return true;
      
      // Ctrl+C (kopyalama)
      if (e.ctrlKey && e.key === 'c') {
        e.preventDefault();
        return false;
      }
      // Ctrl+U (kaynak kodu görüntüleme)
      if (e.ctrlKey && e.key === 'u') {
        e.preventDefault();
        return false;
      }
      // Ctrl+S (sayfa kaydetme)
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        return false;
      }
      // F12 (developer tools)
      if (e.key === 'F12') {
        e.preventDefault();
        return false;
      }
    };

    // Metin seçimini engelle (admin panel hariç)
    const handleSelectStart = (e) => {
      if (isAdminPanel(e.target)) return true;
      e.preventDefault();
      return false;
    };

    // Event listener'ları ekle
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('selectstart', handleSelectStart);

    // Cleanup: Component unmount olduğunda listener'ları kaldır
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('selectstart', handleSelectStart);
    };
  }, []);

  return (
    // Context Provider'ları sırası önemli: Theme > Language > Auth
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <BrowserRouter>
            <div className="App min-h-screen flex flex-col">
              {/* Üst Menü */}
              <Header />
              
              {/* Ana İçerik Alanı */}
              <main className="flex-1">
                <Routes>
                  {/* Genel Sayfalar */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/cv" element={<CVPage />} />
                  <Route path="/courses" element={<CoursesPage />} />
                  <Route path="/courses/:courseId" element={<CourseDetailPage />} />
                  <Route path="/publications" element={<PublicationsPage />} />
                  <Route path="/gallery" element={<GalleryPage />} />
                  
                  {/* Admin Sayfaları */}
                  <Route path="/admin" element={<AdminLoginPage />} />
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  
                  {/* Öğrenci Sayfaları */}
                  <Route path="/student-login" element={<StudentLoginPage />} />
                  <Route path="/student-register" element={<StudentRegisterPage />} />
                  <Route path="/student-dashboard" element={<StudentDashboard />} />
                </Routes>
              </main>
              
              {/* Alt Bilgi */}
              <Footer />
              
              {/* Toast Bildirimleri */}
              <Toaster />
            </div>
          </BrowserRouter>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
