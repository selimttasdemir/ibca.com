import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Checkbox } from '../components/ui/checkbox';
import api from '../services/api';

function StudentRegisterPage() {
  const navigate = useNavigate();
  const { student } = useAuth();
  const [formData, setFormData] = useState({
    student_number: '',
    full_name: '',
    password: '',
    password_confirm: '',
    course_ids: []
  });
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(true);

  // Eğer öğrenci zaten giriş yapmışsa dashboard'a yönlendir
  useEffect(() => {
    if (student) {
      navigate('/student-dashboard', { replace: true });
    }
  }, [student, navigate]);

  // Dersleri yükle
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await api.get('/courses');
        setCourses(response.data);
      } catch (err) {
        console.error('Dersler yüklenirken hata:', err);
        setError('Dersler yüklenemedi. Lütfen sayfayı yenileyin.');
      } finally {
        setLoadingCourses(false);
      }
    };
    fetchCourses();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleCourseToggle = (courseId) => {
    setFormData(prev => {
      const currentCourses = prev.course_ids;
      const isSelected = currentCourses.includes(courseId);
      
      return {
        ...prev,
        course_ids: isSelected
          ? currentCourses.filter(id => id !== courseId)
          : [...currentCourses, courseId]
      };
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validasyonlar
    if (!formData.student_number.trim()) {
      setError('Öğrenci numarası gereklidir');
      return;
    }

    if (!formData.full_name.trim()) {
      setError('Ad Soyad gereklidir');
      return;
    }

    if (formData.password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır');
      return;
    }

    if (formData.password !== formData.password_confirm) {
      setError('Şifreler eşleşmiyor');
      return;
    }

    if (formData.course_ids.length === 0) {
      setError('En az bir ders seçmelisiniz');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/students/self-register', formData);
      
      // Başarılı kayıt
      alert('Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz...');
      navigate('/student-login');
    } catch (err) {
      console.error('Kayıt hatası:', err);
      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Öğrenci Kayıt
          </CardTitle>
          <CardDescription className="text-center">
            Bilgilerinizi girerek sisteme kayıt olun
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="student_number">Öğrenci Numarası</Label>
              <Input
                id="student_number"
                name="student_number"
                type="text"
                placeholder="Örn: 2025000001"
                value={formData.student_number}
                onChange={handleInputChange}
                disabled={loading}
                required
              />
              <p className="text-xs text-gray-500">
                10 haneli öğrenci numaranız
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="full_name">Ad Soyad</Label>
              <Input
                id="full_name"
                name="full_name"
                type="text"
                placeholder="Örn: Ahmet Yılmaz"
                value={formData.full_name}
                onChange={handleInputChange}
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Şifre</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="En az 6 karakter"
                value={formData.password}
                onChange={handleInputChange}
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password_confirm">Şifre Tekrar</Label>
              <Input
                id="password_confirm"
                name="password_confirm"
                type="password"
                placeholder="Şifrenizi tekrar girin"
                value={formData.password_confirm}
                onChange={handleInputChange}
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-3">
              <Label>Dersler (En az 1 ders seçin)</Label>
              {loadingCourses ? (
                <div className="text-sm text-gray-500">Dersler yükleniyor...</div>
              ) : courses.length === 0 ? (
                <div className="text-sm text-red-500">Henüz ders tanımlanmamış</div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto border rounded-md p-3">
                  {courses.map((course) => (
                    <div key={course.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`course-${course.id}`}
                        checked={formData.course_ids.includes(course.id)}
                        onCheckedChange={() => handleCourseToggle(course.id)}
                        disabled={loading}
                      />
                      <label
                        htmlFor={`course-${course.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {course.name} {course.code && `(${course.code})`}
                      </label>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-gray-500">
                Kayıt olduğunuz dersler için ödev yükleyebileceksiniz
              </p>
            </div>

            {formData.course_ids.length > 0 && (
              <Alert>
                <AlertDescription>
                  <strong>{formData.course_ids.length} ders</strong> seçildi
                </AlertDescription>
              </Alert>
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            <Button
              type="submit"
              className="w-full"
              disabled={loading || loadingCourses}
            >
              {loading ? 'Kaydediliyor...' : 'Kayıt Ol'}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => navigate('/student-login')}
              disabled={loading}
            >
              Zaten hesabım var, Giriş Yap
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

export default StudentRegisterPage;
