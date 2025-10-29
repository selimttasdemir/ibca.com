import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { announcementAPI, courseAPI, analyticsAPI } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { useToast } from '../hooks/use-toast';
import { 
  FileText, 
  BookOpen, 
  Image as ImageIcon, 
  Plus,
  Edit,
  Trash2,
  Upload,
  Settings,
  BarChart
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from '../components/ui/dialog';

const AdminDashboard = () => {
  const { t } = useLanguage();
  const { currentTheme } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('announcements');
  const [announcements, setAnnouncements] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
      loadAnalytics();
    }
  }, [isAuthenticated, activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'announcements') {
        const data = await announcementAPI.getAll();
        setAnnouncements(data);
      } else if (activeTab === 'courses') {
        const data = await courseAPI.getAll();
        setCourses(data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Hata',
        description: 'Veri yüklenirken hata oluştu',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      const data = await analyticsAPI.get();
      setAnalytics(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  if (!isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  // Announcement Manager Component
  const AnnouncementManager = () => {
    const [formData, setFormData] = useState({
      title: '',
      content: '',
      announcement_type: 'course',
      date: new Date().toLocaleDateString('tr-TR'),
      is_published: true,
      image_url: ''
    });
    const [uploading, setUploading] = useState(false);

    const handleImageUpload = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        setUploading(true);
        const result = await announcementAPI.uploadImage(file);
        setFormData({ ...formData, image_url: result.url });
        toast({
          title: 'Başarılı',
          description: 'Fotoğraf yüklendi!',
        });
      } catch (error) {
        toast({
          title: 'Hata',
          description: 'Fotoğraf yüklenirken hata oluştu',
          variant: 'destructive',
        });
      } finally {
        setUploading(false);
      }
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        if (editingItem) {
          await announcementAPI.update(editingItem.id, formData);
          toast({ title: 'Başarılı', description: 'Duyuru güncellendi!' });
        } else {
          await announcementAPI.create(formData);
          toast({ title: 'Başarılı', description: 'Duyuru oluşturuldu!' });
        }
        setDialogOpen(false);
        setEditingItem(null);
        setFormData({
          title: '',
          content: '',
          announcement_type: 'course',
          date: new Date().toLocaleDateString('tr-TR'),
          is_published: true,
          image_url: ''
        });
        loadData();
      } catch (error) {
        toast({
          title: 'Hata',
          description: error.response?.data?.detail || 'Bir hata oluştu',
          variant: 'destructive',
        });
      }
    };

    const handleEdit = (announcement) => {
      setEditingItem(announcement);
      setFormData({
        title: announcement.title,
        content: announcement.content,
        announcement_type: announcement.announcement_type,
        date: announcement.date,
        is_published: announcement.is_published,
        image_url: announcement.image_url || ''
      });
      setDialogOpen(true);
    };

    const handleDelete = async (id) => {
      if (!window.confirm('Bu duyuruyu silmek istediğinize emin misiniz?')) return;
      
      try {
        await announcementAPI.delete(id);
        toast({ title: 'Başarılı', description: 'Duyuru silindi!' });
        loadData();
      } catch (error) {
        toast({
          title: 'Hata',
          description: 'Silme işlemi başarısız',
          variant: 'destructive',
        });
      }
    };

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold" style={{ color: currentTheme.text }}>
            Duyurular ({announcements.length})
          </h2>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                style={{ backgroundColor: currentTheme.accent }}
                onClick={() => {
                  setEditingItem(null);
                  setFormData({
                    title: '',
                    content: '',
                    announcement_type: 'course',
                    date: new Date().toLocaleDateString('tr-TR'),
                    is_published: true,
                    image_url: ''
                  });
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Yeni Duyuru
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingItem ? 'Duyuru Düzenle' : 'Yeni Duyuru Ekle'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Başlık *</Label>
                  <Input 
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Duyuru başlığı..." 
                  />
                </div>
                <div>
                  <Label>İçerik *</Label>
                  <Textarea 
                    required
                    rows={6} 
                    value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                    placeholder="Duyuru içeriği..." 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Tip</Label>
                    <select 
                      className="w-full p-2 border rounded"
                      value={formData.announcement_type}
                      onChange={(e) => setFormData({...formData, announcement_type: e.target.value})}
                    >
                      <option value="department">Bölüm</option>
                      <option value="course">Ders</option>
                      <option value="event">Etkinlik</option>
                    </select>
                  </div>
                  <div>
                    <Label>Tarih</Label>
                    <Input 
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      placeholder="25.10.2025" 
                    />
                  </div>
                </div>
                <div>
                  <Label>Fotoğraf</Label>
                  <Input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                  {uploading && <p className="text-sm text-gray-500 mt-1">Yükleniyor...</p>}
                  {formData.image_url && (
                    <div className="mt-2">
                      <img 
                        src={`${BACKEND_URL}${formData.image_url}`} 
                        alt="Preview" 
                        className="w-32 h-32 object-cover rounded"
                      />
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="published"
                    checked={formData.is_published}
                    onChange={(e) => setFormData({...formData, is_published: e.target.checked})}
                  />
                  <Label htmlFor="published">Yayınla</Label>
                </div>
                <div className="flex space-x-2">
                  <Button type="submit" className="flex-1" style={{ backgroundColor: currentTheme.accent }}>
                    {editingItem ? 'Güncelle' : 'Kaydet'}
                  </Button>
                  <DialogClose asChild>
                    <Button type="button" variant="outline" className="flex-1">
                      İptal
                    </Button>
                  </DialogClose>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="text-center py-8">Yükleniyor...</div>
        ) : (
          <div className="space-y-3">
            {announcements.length === 0 ? (
              <p style={{ color: currentTheme.text }}>Henüz duyuru yok.</p>
            ) : (
              announcements.map((announcement) => (
                <Card key={announcement.id} style={{ backgroundColor: currentTheme.card, borderColor: currentTheme.border }}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-xs px-2 py-1 rounded" style={{ 
                            backgroundColor: announcement.announcement_type === 'department' ? '#DC2626' : 
                                           announcement.announcement_type === 'course' ? '#2563EB' : '#16A34A',
                            color: 'white'
                          }}>
                            {announcement.announcement_type === 'department' ? 'Bölüm' : 
                             announcement.announcement_type === 'course' ? 'Ders' : 'Etkinlik'}
                          </span>
                          <span className="text-xs" style={{ color: currentTheme.text, opacity: 0.6 }}>
                            {announcement.date}
                          </span>
                        </div>
                        <h3 className="font-bold" style={{ color: currentTheme.text }}>{announcement.title}</h3>
                        <p className="text-sm mt-1 line-clamp-2" style={{ color: currentTheme.text, opacity: 0.7 }}>
                          {announcement.content}
                        </p>
                        {announcement.image_url && (
                          <img 
                            src={`${BACKEND_URL}${announcement.image_url}`} 
                            alt={announcement.title}
                            className="w-24 h-24 object-cover rounded mt-2"
                          />
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          size="icon" 
                          variant="ghost"
                          onClick={() => handleEdit(announcement)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost"
                          onClick={() => handleDelete(announcement.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    );
  };

  // Course Manager Component
  const CourseManager = () => {
    const [formData, setFormData] = useState({
      code: '',
      name: '',
      level: 'Lisans',
      semester: 'Güz',
      credits: 3,
      description: '',
      is_active: true
    });

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        if (editingItem) {
          await courseAPI.update(editingItem.id, formData);
          toast({ title: 'Başarılı', description: 'Ders güncellendi!' });
        } else {
          await courseAPI.create(formData);
          toast({ title: 'Başarılı', description: 'Ders oluşturuldu!' });
        }
        setDialogOpen(false);
        setEditingItem(null);
        setFormData({
          code: '',
          name: '',
          level: 'Lisans',
          semester: 'Güz',
          credits: 3,
          description: '',
          is_active: true
        });
        loadData();
      } catch (error) {
        toast({
          title: 'Hata',
          description: error.response?.data?.detail || 'Bir hata oluştu',
          variant: 'destructive',
        });
      }
    };

    const handleEdit = (course) => {
      setEditingItem(course);
      setFormData({
        code: course.code,
        name: course.name,
        level: course.level,
        semester: course.semester,
        credits: course.credits,
        description: course.description,
        is_active: course.is_active
      });
      setDialogOpen(true);
    };

    const handleDelete = async (id) => {
      if (!window.confirm('Bu dersi silmek istediğinize emin misiniz?')) return;
      
      try {
        await courseAPI.delete(id);
        toast({ title: 'Başarılı', description: 'Ders silindi!' });
        loadData();
      } catch (error) {
        toast({
          title: 'Hata',
          description: 'Silme işlemi başarısız',
          variant: 'destructive',
        });
      }
    };

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold" style={{ color: currentTheme.text }}>
            Dersler ({courses.length})
          </h2>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                style={{ backgroundColor: currentTheme.accent }}
                onClick={() => {
                  setEditingItem(null);
                  setFormData({
                    code: '',
                    name: '',
                    level: 'Lisans',
                    semester: 'Güz',
                    credits: 3,
                    description: '',
                    is_active: true
                  });
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Yeni Ders
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingItem ? 'Ders Düzenle' : 'Yeni Ders Ekle'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Ders Kodu *</Label>
                    <Input 
                      required
                      value={formData.code}
                      onChange={(e) => setFormData({...formData, code: e.target.value})}
                      placeholder="MEM215" 
                    />
                  </div>
                  <div>
                    <Label>Kredi</Label>
                    <Input 
                      type="number"
                      value={formData.credits}
                      onChange={(e) => setFormData({...formData, credits: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
                <div>
                  <Label>Ders Adı *</Label>
                  <Input 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="İnternet Tabanlı Programlama" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Seviye</Label>
                    <select 
                      className="w-full p-2 border rounded"
                      value={formData.level}
                      onChange={(e) => setFormData({...formData, level: e.target.value})}
                    >
                      <option value="Lisans">Lisans</option>
                      <option value="Yüksek Lisans">Yüksek Lisans</option>
                      <option value="Doktora">Doktora</option>
                    </select>
                  </div>
                  <div>
                    <Label>Dönem</Label>
                    <select 
                      className="w-full p-2 border rounded"
                      value={formData.semester}
                      onChange={(e) => setFormData({...formData, semester: e.target.value})}
                    >
                      <option value="Güz">Güz</option>
                      <option value="Bahar">Bahar</option>
                    </select>
                  </div>
                </div>
                <div>
                  <Label>Açıklama</Label>
                  <Textarea 
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Ders açıklaması..." 
                  />
                </div>
                <div className="flex space-x-2">
                  <Button type="submit" className="flex-1" style={{ backgroundColor: currentTheme.accent }}>
                    {editingItem ? 'Güncelle' : 'Kaydet'}
                  </Button>
                  <DialogClose asChild>
                    <Button type="button" variant="outline" className="flex-1">
                      İptal
                    </Button>
                  </DialogClose>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="text-center py-8">Yükleniyor...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {courses.length === 0 ? (
              <p style={{ color: currentTheme.text }}>Henüz ders yok.</p>
            ) : (
              courses.map((course) => (
                <Card key={course.id} style={{ backgroundColor: currentTheme.card, borderColor: currentTheme.border }}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-xs px-2 py-1 rounded bg-blue-500 text-white">
                            {course.code}
                          </span>
                          <span className="text-xs" style={{ color: currentTheme.text, opacity: 0.6 }}>
                            {course.level}
                          </span>
                        </div>
                        <h3 className="font-bold" style={{ color: currentTheme.text }}>{course.name}</h3>
                        <p className="text-sm mt-1" style={{ color: currentTheme.text, opacity: 0.7 }}>
                          {course.description?.substring(0, 100)}...
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          size="icon" 
                          variant="ghost"
                          onClick={() => handleEdit(course)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost"
                          onClick={() => handleDelete(course.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    );
  };

  // Analytics Component
  const AnalyticsView = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-6" style={{ color: currentTheme.text }}>
        İstatistikler
      </h2>
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card style={{ backgroundColor: currentTheme.card }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm" style={{ color: currentTheme.text, opacity: 0.7 }}>Duyurular</p>
                  <p className="text-3xl font-bold" style={{ color: currentTheme.text }}>
                    {analytics.total_announcements}
                  </p>
                </div>
                <FileText className="h-8 w-8" style={{ color: currentTheme.accent }} />
              </div>
            </CardContent>
          </Card>
          <Card style={{ backgroundColor: currentTheme.card }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm" style={{ color: currentTheme.text, opacity: 0.7 }}>Dersler</p>
                  <p className="text-3xl font-bold" style={{ color: currentTheme.text }}>
                    {analytics.total_courses}
                  </p>
                </div>
                <BookOpen className="h-8 w-8" style={{ color: currentTheme.accent }} />
              </div>
            </CardContent>
          </Card>
          <Card style={{ backgroundColor: currentTheme.card }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm" style={{ color: currentTheme.text, opacity: 0.7 }}>Yayınlar</p>
                  <p className="text-3xl font-bold" style={{ color: currentTheme.text }}>
                    {analytics.total_publications}
                  </p>
                </div>
                <FileText className="h-8 w-8" style={{ color: currentTheme.accent }} />
              </div>
            </CardContent>
          </Card>
          <Card style={{ backgroundColor: currentTheme.card }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm" style={{ color: currentTheme.text, opacity: 0.7 }}>Galeri</p>
                  <p className="text-3xl font-bold" style={{ color: currentTheme.text }}>
                    {analytics.total_gallery_items}
                  </p>
                </div>
                <ImageIcon className="h-8 w-8" style={{ color: currentTheme.accent }} />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen py-8" style={{ backgroundColor: currentTheme.background }}>
      <div className="container mx-auto px-4">
        {/* Header */}
        <div 
          className="mb-8 p-6 rounded-xl shadow-lg"
          style={{ 
            backgroundColor: currentTheme.card,
            borderColor: currentTheme.border,
            borderWidth: '2px'
          }}
        >
          <h1 className="text-3xl font-bold" style={{ color: currentTheme.primary }}>
            Kontrol Paneli
          </h1>
          <p className="text-sm mt-2" style={{ color: currentTheme.text, opacity: 0.7 }}>
            Hoş geldiniz, {user?.username}
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full md:w-auto grid-cols-3 mb-6">
            <TabsTrigger value="announcements" className="flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Duyurular
            </TabsTrigger>
            <TabsTrigger value="courses" className="flex items-center">
              <BookOpen className="h-4 w-4 mr-2" />
              Dersler
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center">
              <BarChart className="h-4 w-4 mr-2" />
              İstatistikler
            </TabsTrigger>
          </TabsList>

          <TabsContent value="announcements">
            <AnnouncementManager />
          </TabsContent>

          <TabsContent value="courses">
            <CourseManager />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsView />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
