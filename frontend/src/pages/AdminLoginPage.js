import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { useToast } from '../hooks/use-toast';
import { Lock, User } from 'lucide-react';

const AdminLoginPage = () => {
  const { t } = useLanguage();
  const { currentTheme } = useTheme();
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(formData.username, formData.password);

    if (result.success) {
      toast({
        title: 'Başarılı',
        description: 'Giriş başarılı!',
      });
      navigate('/admin/dashboard');
    } else {
      toast({
        title: 'Hata',
        description: result.error || 'Giriş başarısız',
        variant: 'destructive',
      });
    }

    setLoading(false);
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center py-12 px-4"
      style={{ backgroundColor: currentTheme.background }}
    >
      <Card 
        className="w-full max-w-md shadow-2xl"
        style={{ 
          backgroundColor: currentTheme.card,
          borderColor: currentTheme.border,
          borderWidth: '2px'
        }}
      >
        <CardHeader className="text-center">
          <div 
            className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{ backgroundColor: currentTheme.primary }}
          >
            <Lock className="h-8 w-8" style={{ color: currentTheme.secondary }} />
          </div>
          <CardTitle className="text-2xl" style={{ color: currentTheme.primary }}>
            {t('admin.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" style={{ color: currentTheme.text }}>
                {t('admin.username')}
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5" style={{ color: currentTheme.accent, opacity: 0.5 }} />
                <Input
                  id="username"
                  type="text"
                  placeholder="admin"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" style={{ color: currentTheme.text }}>
                {t('admin.password')}
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5" style={{ color: currentTheme.accent, opacity: 0.5 }} />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full transition-all duration-300 hover:scale-105"
              disabled={loading}
              style={{ backgroundColor: currentTheme.primary, color: currentTheme.secondary }}
            >
              {loading ? 'Yükleniyor...' : t('admin.login')}
            </Button>

            <p className="text-xs text-center" style={{ color: currentTheme.text, opacity: 0.6 }}>
              Demo: admin / admin123
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLoginPage;