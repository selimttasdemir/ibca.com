import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from './components/ui/toaster';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import CVPage from './pages/CVPage';
import CoursesPage from './pages/CoursesPage';
import CourseDetailPage from './pages/CourseDetailPage';
import PublicationsPage from './pages/PublicationsPage';
import GalleryPage from './pages/GalleryPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <BrowserRouter>
            <div className="App min-h-screen flex flex-col">
              <Header />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/cv" element={<CVPage />} />
                  <Route path="/courses" element={<CoursesPage />} />
                  <Route path="/courses/:courseId" element={<CourseDetailPage />} />
                  <Route path="/publications" element={<PublicationsPage />} />
                  <Route path="/gallery" element={<GalleryPage />} />
                  <Route path="/admin" element={<AdminLoginPage />} />
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                </Routes>
              </main>
              <Footer />
              <Toaster />
            </div>
          </BrowserRouter>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
