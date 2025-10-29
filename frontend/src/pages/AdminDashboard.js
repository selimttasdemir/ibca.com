import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { announcementAPI, courseAPI, analyticsAPI } from '../services/api';
import { Card, CardContent } from '../components/ui/card';
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
  BarChart
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';

const AdminDashboard = () => {
  const { currentTheme } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('announcements');
  const [announcements, setAnnouncements] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);

  // Announcement state
  const [announcementDialog, setAnnouncementDialog] = useState(false);
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    content: '',
    announcement_type: 'course',
    date: new Date().toLocaleDateString('tr-TR'),
    is_published: true,
    image_url: ''
  });
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Course state
  const [courseDialog, setCourseDialog] = useState(false);
  const [courseForm, setCourseForm] = useState({
    code: '',
    name: '',
    level: 'Lisans',
    semester: 'Güz',
    credits: 3,
    description: '',
    is_active: true,
    content: { videos: [], pdfs: [], notes: '' }
  });
  const [editingCourse, setEditingCourse] = useState(null);
  const [newVideo, setNewVideo] = useState({ title: '', description: '', url: '' });
  const [uploadingPDF, setUploadingPDF] = useState(false);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
      loadAnalytics();
    }
  }, [isAuthenticated, activeTab]);

  // Update form when editing item changes
  useEffect(() => {
    if (editingAnnouncement) {
      setAnnouncementForm({
        title: editingAnnouncement.title,
        content: editingAnnouncement.content,
        announcement_type: editingAnnouncement.announcement_type,
        date: editingAnnouncement.date,
        is_published: editingAnnouncement.is_published,
        image_url: editingAnnouncement.image_url || ''
      });
    }
  }, [editingAnnouncement]);

  useEffect(() => {
    if (editingCourse) {
      let parsedContent = { videos: [], pdfs: [], notes: '' };
      if (editingCourse.content) {
        try {
          parsedContent = JSON.parse(editingCourse.content);
        } catch (e) {
          console.error('Error parsing course content:', e);
        }
      }
      
      setCourseForm({
        code: editingCourse.code,
        name: editingCourse.name,
        level: editingCourse.level,
        semester: editingCourse.semester,
        credits: editingCourse.credits,
        description: editingCourse.description,
        is_active: editingCourse.is_active,
        content: parsedContent
      });
    }
  }, [editingCourse]);

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

  // Announcement functions
  const openNewAnnouncementDialog = () => {
    setEditingAnnouncement(null);
    setAnnouncementForm({
      title: '',
      content: '',
      announcement_type: 'course',
      date: new Date().toLocaleDateString('tr-TR'),
      is_published: true,
      image_url: ''
    });
    setAnnouncementDialog(true);
  };

  const openEditAnnouncementDialog = (announcement) => {
    setEditingAnnouncement(announcement);
    setAnnouncementDialog(true);
  };

  const handleAnnouncementImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const result = await announcementAPI.uploadImage(file);
      setAnnouncementForm(prev => ({ ...prev, image_url: result.url }));
      toast({ title: 'Başarılı', description: 'Fotoğraf yüklendi!' });
    } catch (error) {
      toast({ title: 'Hata', description: 'Fotoğraf yüklenirken hata oluştu', variant: 'destructive' });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAnnouncementSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAnnouncement) {
        await announcementAPI.update(editingAnnouncement.id, announcementForm);
        toast({ title: 'Başarılı', description: 'Duyuru güncellendi!' });
      } else {
        await announcementAPI.create(announcementForm);
        toast({ title: 'Başarılı', description: 'Duyuru oluşturuldu!' });
      }
      setAnnouncementDialog(false);
      loadData();
    } catch (error) {
      toast({ title: 'Hata', description: error.response?.data?.detail || 'Bir hata oluştu', variant: 'destructive' });
    }
  };

  const handleAnnouncementDelete = async (id) => {
    if (!window.confirm('Bu duyuruyu silmek istediğinize emin misiniz?')) return;
    try {
      await announcementAPI.delete(id);
      toast({ title: 'Başarılı', description: 'Duyuru silindi!' });
      loadData();
    } catch (error) {
      toast({ title: 'Hata', description: 'Silme işlemi başarısız', variant: 'destructive' });
    }
  };

  // Course functions
  const openNewCourseDialog = () => {
    setEditingCourse(null);
    setCourseForm({
      code: '',
      name: '',
      level: 'Lisans',
      semester: 'Güz',
      credits: 3,
      description: '',
      is_active: true,
      content: { videos: [], pdfs: [], notes: '' }
    });
    setNewVideo({ title: '', description: '', url: '' });
    setCourseDialog(true);
  };

  const openEditCourseDialog = (course) => {
    setEditingCourse(course);
    setCourseDialog(true);
  };

  const handleCourseSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCourse) {
        await courseAPI.update(editingCourse.id, courseForm);
        toast({ title: 'Başarılı', description: 'Ders güncellendi!' });
      } else {
        await courseAPI.create(courseForm);
        toast({ title: 'Başarılı', description: 'Ders oluşturuldu!' });
      }
      setCourseDialog(false);
      loadData();
    } catch (error) {
      toast({ title: 'Hata', description: error.response?.data?.detail || 'Bir hata oluştu', variant: 'destructive' });
    }
  };

  const handleCourseDelete = async (id) => {
    if (!window.confirm('Bu dersi silmek istediğinize emin misiniz?')) return;
    try {
      await courseAPI.delete(id);
      toast({ title: 'Başarılı', description: 'Ders silindi!' });
      loadData();
    } catch (error) {
      toast({ title: 'Hata', description: 'Silme işlemi başarısız', variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen py-8" style={{ backgroundColor: currentTheme.background }}>
      <div className="container mx-auto px-4">
        {/* Header */}
        <div 
          className="mb-8 p-6 rounded-xl shadow-lg"
          style={{ backgroundColor: currentTheme.card, borderColor: currentTheme.border, borderWidth: '2px' }}
        >
          <h1 className="text-3xl font-bold" style={{ color: currentTheme.primary }}>Kontrol Paneli</h1>
          <p className="text-sm mt-2" style={{ color: currentTheme.text, opacity: 0.7 }}>
            Hoş geldiniz, {user?.username}
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full md:w-auto grid-cols-3 mb-6">
            <TabsTrigger value="announcements">
              <FileText className="h-4 w-4 mr-2" />
              Duyurular
            </TabsTrigger>
            <TabsTrigger value="courses">
              <BookOpen className="h-4 w-4 mr-2" />
              Dersler
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart className="h-4 w-4 mr-2" />
              İstatistikler
            </TabsTrigger>
          </TabsList>

          {/* Announcements Tab */}
          <TabsContent value="announcements">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold" style={{ color: currentTheme.text }}>
                  Duyurular ({announcements.length})
                </h2>
                <Button onClick={openNewAnnouncementDialog} style={{ backgroundColor: currentTheme.accent }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Yeni Duyuru
                </Button>
              </div>

              {loading ? (
                <div className="text-center py-8">Yükleniyor...</div>
              ) : (
                <div className="space-y-3">
                  {announcements.map((announcement) => (
                    <Card key={announcement.id} style={{ backgroundColor: currentTheme.card, borderColor: currentTheme.border }}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="text-xs px-2 py-1 rounded text-white" style={{ 
                                backgroundColor: announcement.announcement_type === 'department' ? '#DC2626' : 
                                               announcement.announcement_type === 'course' ? '#2563EB' : '#16A34A'
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
                            <Button size="icon" variant="ghost" onClick={() => openEditAnnouncementDialog(announcement)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => handleAnnouncementDelete(announcement.id)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Courses Tab */}
          <TabsContent value="courses">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold" style={{ color: currentTheme.text }}>
                  Dersler ({courses.length})
                </h2>
                <Button onClick={openNewCourseDialog} style={{ backgroundColor: currentTheme.accent }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Yeni Ders
                </Button>
              </div>

              {loading ? (
                <div className="text-center py-8">Yükleniyor...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {courses.map((course) => (
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
                            <Button size="icon" variant="ghost" onClick={() => openEditCourseDialog(course)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => handleCourseDelete(course.id)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold mb-6" style={{ color: currentTheme.text }}>İstatistikler</h2>
              {analytics && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Duyurular', value: analytics.total_announcements, icon: FileText },
                    { label: 'Dersler', value: analytics.total_courses, icon: BookOpen },
                    { label: 'Yayınlar', value: analytics.total_publications, icon: FileText },
                    { label: 'Galeri', value: analytics.total_gallery_items, icon: ImageIcon }
                  ].map((stat, idx) => (
                    <Card key={idx} style={{ backgroundColor: currentTheme.card }}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm" style={{ color: currentTheme.text, opacity: 0.7 }}>{stat.label}</p>
                            <p className="text-3xl font-bold" style={{ color: currentTheme.text }}>{stat.value}</p>
                          </div>
                          <stat.icon className="h-8 w-8" style={{ color: currentTheme.accent }} />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Announcement Dialog */}
        <Dialog open={announcementDialog} onOpenChange={setAnnouncementDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingAnnouncement ? 'Duyuru Düzenle' : 'Yeni Duyuru Ekle'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAnnouncementSubmit} className="space-y-4">
              <div>
                <Label>Başlık *</Label>
                <Input 
                  required
                  value={announcementForm.title}
                  onChange={(e) => setAnnouncementForm(prev => ({...prev, title: e.target.value}))}
                />
              </div>
              <div>
                <Label>İçerik *</Label>
                <Textarea 
                  required
                  rows={6}
                  value={announcementForm.content}
                  onChange={(e) => setAnnouncementForm(prev => ({...prev, content: e.target.value}))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tip</Label>
                  <select 
                    className="w-full p-2 border rounded"
                    value={announcementForm.announcement_type}
                    onChange={(e) => setAnnouncementForm(prev => ({...prev, announcement_type: e.target.value}))}
                  >
                    <option value="department">Bölüm</option>
                    <option value="course">Ders</option>
                    <option value="event">Etkinlik</option>
                  </select>
                </div>
                <div>
                  <Label>Tarih</Label>
                  <Input 
                    value={announcementForm.date}
                    onChange={(e) => setAnnouncementForm(prev => ({...prev, date: e.target.value}))}
                  />
                </div>
              </div>
              <div>
                <Label>Fotoğraf</Label>
                <Input type="file" accept="image/*" onChange={handleAnnouncementImageUpload} disabled={uploadingImage} />
                {uploadingImage && <p className="text-sm mt-1">Yükleniyor...</p>}
                {announcementForm.image_url && (
                  <img src={`${BACKEND_URL}${announcementForm.image_url}`} alt="Preview" className="w-32 h-32 object-cover rounded mt-2" />
                )}
              </div>
              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  id="published"
                  checked={announcementForm.is_published}
                  onChange={(e) => setAnnouncementForm(prev => ({...prev, is_published: e.target.checked}))}
                />
                <Label htmlFor="published">Yayınla</Label>
              </div>
              <div className="flex space-x-2">
                <Button type="submit" className="flex-1" style={{ backgroundColor: currentTheme.accent }}>
                  {editingAnnouncement ? 'Güncelle' : 'Kaydet'}
                </Button>
                <Button type="button" variant="outline" className="flex-1" onClick={() => setAnnouncementDialog(false)}>
                  İptal
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Course Dialog */}
        <Dialog open={courseDialog} onOpenChange={setCourseDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingCourse ? 'Ders Düzenle' : 'Yeni Ders Ekle'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCourseSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Ders Kodu *</Label>
                  <Input 
                    required
                    value={courseForm.code}
                    onChange={(e) => setCourseForm(prev => ({...prev, code: e.target.value}))}
                  />
                </div>
                <div>
                  <Label>Kredi</Label>
                  <Input 
                    type="number"
                    value={courseForm.credits}
                    onChange={(e) => setCourseForm(prev => ({...prev, credits: parseInt(e.target.value)}))}
                  />
                </div>
              </div>
              <div>
                <Label>Ders Adı *</Label>
                <Input 
                  required
                  value={courseForm.name}
                  onChange={(e) => setCourseForm(prev => ({...prev, name: e.target.value}))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Seviye</Label>
                  <select 
                    className="w-full p-2 border rounded"
                    value={courseForm.level}
                    onChange={(e) => setCourseForm(prev => ({...prev, level: e.target.value}))}
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
                    value={courseForm.semester}
                    onChange={(e) => setCourseForm(prev => ({...prev, semester: e.target.value}))}
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
                  value={courseForm.description}
                  onChange={(e) => setCourseForm(prev => ({...prev, description: e.target.value}))}
                />
              </div>
              <div className="flex space-x-2">
                <Button type="submit" className="flex-1" style={{ backgroundColor: currentTheme.accent }}>
                  {editingCourse ? 'Güncelle' : 'Kaydet'}
                </Button>
                <Button type="button" variant="outline" className="flex-1" onClick={() => setCourseDialog(false)}>
                  İptal
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminDashboard;
