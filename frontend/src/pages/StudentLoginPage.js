/**
 * Öğrenci Giriş Sayfası
 * 
 * Bu sayfa öğrencilerin sisteme giriş yapmalarını sağlar.
 * Öğrenci numarası ve şifre ile kimlik doğrulama yapar.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription } from '../components/ui/alert';
import { GraduationCap, User, Lock, AlertCircle, Info } from 'lucide-react';

export default function StudentLoginPage() {
  const [studentNumber, setStudentNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { studentLogin, student } = useAuth();
  const { t } = useLanguage();

  const redirectMessage = location.state?.message;
  const redirectFrom = location.state?.from;

  // Eğer öğrenci zaten giriş yapmışsa dashboard'a yönlendir
  useEffect(() => {
    if (student) {
      navigate('/student-dashboard', { replace: true });
    }
  }, [student, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await studentLogin(studentNumber, password);
      // Eğer bir redirect varsa oraya git, yoksa dashboard'a
      navigate(redirectFrom || '/student-dashboard');
    } catch (err) {
      console.error('Giriş hatası:', err);
      setError(err.response?.data?.detail || 'Öğrenci numarası veya şifre hatalı');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md">
        {/* Logo ve Başlık */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-600 text-white mb-4">
            <GraduationCap size={40} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Öğrenci Giriş Sistemi
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Karabük Üniversitesi - Mekatronik Mühendisliği
          </p>
        </div>

        {/* Giriş Formu */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>Giriş Yap</CardTitle>
            <CardDescription>
              Öğrenci numaranız ve şifreniz ile giriş yapın
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {/* Redirect Mesajı */}
              {redirectMessage && (
                <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-700 dark:text-blue-300">
                    {redirectMessage}
                  </AlertDescription>
                </Alert>
              )}

              {/* Hata Mesajı */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Öğrenci Numarası */}
              <div className="space-y-2">
                <Label htmlFor="student-number">Öğrenci Numarası</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="student-number"
                    type="text"
                    placeholder="2024001001"
                    value={studentNumber}
                    onChange={(e) => setStudentNumber(e.target.value)}
                    className="pl-10"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Şifre */}
              <div className="space-y-2">
                <Label htmlFor="password">Şifre</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Bilgi Mesajı */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <strong>Test Giriş Bilgileri:</strong><br/>
                  • Öğrenci No: 2025000001<br/>
                  • Şifre: 000001<br/>
                  <br/>
                  <strong>Not:</strong> Şifreniz öğrenci numaranızın son 6 hanesidir.
                </p>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              {/* Giriş Butonu */}
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
              </Button>

              {/* Kayıt Ol Butonu */}
              <Button
                type="button"
                variant="secondary"
                className="w-full"
                onClick={() => navigate('/student-register')}
                disabled={loading}
              >
                Hesabınız yok mu? Kayıt Ol
              </Button>

              {/* Ana Sayfaya Dön */}
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => navigate('/')}
                disabled={loading}
              >
                Ana Sayfaya Dön
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Yardım Metni */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Şifrenizi mi unuttunuz? Bölüm sekreterliği ile iletişime geçin.
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
            © 2024 Karabük Üniversitesi - Tüm hakları saklıdır
          </p>
        </div>
      </div>
    </div>
  );
}
