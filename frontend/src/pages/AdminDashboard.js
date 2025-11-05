import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import api, { announcementAPI, courseAPI, publicationAPI, galleryAPI, cvAPI, analyticsAPI } from '../services/api';
import { Card, CardContent } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { useToast } from '../hooks/use-toast';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import '../styles/admin.css';
import { 
  FileText, 
  BookOpen, 
  Image as ImageIcon, 
  Plus,
  Edit,
  Trash2,
  BarChart,
  User,
  GraduationCap,
  Briefcase
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';

// Hata mesajını düzgün formatlama yardımcı fonksiyonu
const getErrorMessage = (error) => {
  if (typeof error.response?.data?.detail === 'string') {
    return error.response.data.detail;
  }
  if (Array.isArray(error.response?.data?.detail)) {
    return error.response.data.detail.map(e => e.msg || e.message || JSON.stringify(e)).join(', ');
  }
  return error.message || 'Bir hata oluştu';
};

// Homeworks Tab Component
const HomeworksTab = ({ currentTheme, toast }) => {
  const [homeworks, setHomeworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    loadHomeworks();
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const response = await api.get('/courses');
      setCourses(response.data);
    } catch (error) {
      console.error('Ders yükleme hatası:', error);
    }
  };

  const loadHomeworks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/homeworks');
      setHomeworks(response.data);
      
      // Benzersiz öğrenci sayısını hesapla
      const uniqueStudents = [...new Set(response.data.map(h => h.student_number))];
      setStudents(uniqueStudents);
    } catch (error) {
      console.error('Ödev yükleme hatası:', error);
      toast({
        title: 'Hata',
        description: 'Ödevler yüklenirken bir hata oluştu',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteHomework = async (id) => {
    if (!window.confirm('Bu ödevi silmek istediğinize emin misiniz?')) return;
    
    try {
      await api.delete(`/homeworks/${id}`);
      toast({ title: 'Başarılı', description: 'Ödev silindi!' });
      loadHomeworks();
    } catch (error) {
      toast({
        title: 'Hata',
        description: getErrorMessage(error),
        variant: 'destructive'
      });
    }
  };

  const deleteAllHomeworks = async () => {
    if (!window.confirm(`${homeworks.length} ödevin tamamını silmek istediğinize emin misiniz? Bu işlem geri alınamaz!`)) return;
    
    try {
      await Promise.all(homeworks.map(h => api.delete(`/homeworks/${h.id}`)));
      toast({ title: 'Başarılı', description: `${homeworks.length} ödev silindi!` });
      loadHomeworks();
    } catch (error) {
      toast({
        title: 'Hata',
        description: 'Toplu silme sırasında hata oluştu',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card style={{ backgroundColor: currentTheme.card }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ color: currentTheme.text, opacity: 0.7 }}>Toplam Ödev</p>
                <p className="text-3xl font-bold" style={{ color: currentTheme.text }}>{homeworks.length}</p>
              </div>
              <FileText className="h-8 w-8" style={{ color: currentTheme.accent }} />
            </div>
          </CardContent>
        </Card>
        
        <Card style={{ backgroundColor: currentTheme.card }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ color: currentTheme.text, opacity: 0.7 }}>Ödev Yükleyen</p>
                <p className="text-3xl font-bold" style={{ color: currentTheme.text }}>{students.length}</p>
              </div>
              <GraduationCap className="h-8 w-8" style={{ color: currentTheme.accent }} />
            </div>
          </CardContent>
        </Card>
        
        <Card style={{ backgroundColor: currentTheme.card }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ color: currentTheme.text, opacity: 0.7 }}>Toplam Ders</p>
                <p className="text-3xl font-bold" style={{ color: currentTheme.text }}>{courses.length}</p>
              </div>
              <BookOpen className="h-8 w-8" style={{ color: currentTheme.accent }} />
            </div>
          </CardContent>
        </Card>
        
        <Card style={{ backgroundColor: currentTheme.card }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ color: currentTheme.text, opacity: 0.7 }}>Ortalama/Öğrenci</p>
                <p className="text-3xl font-bold" style={{ color: currentTheme.text }}>
                  {students.length > 0 ? (homeworks.length / students.length).toFixed(1) : 0}
                </p>
              </div>
              <BarChart className="h-8 w-8" style={{ color: currentTheme.accent }} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold" style={{ color: currentTheme.text }}>
          Yüklenen Ödevler ({homeworks.length})
        </h2>
        {homeworks.length > 0 && (
          <Button 
            onClick={deleteAllHomeworks}
            variant="destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Tümünü Sil
          </Button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-8">Yükleniyor...</div>
      ) : homeworks.length === 0 ? (
        <Card style={{ backgroundColor: currentTheme.card }}>
          <CardContent className="p-8 text-center" style={{ color: currentTheme.text }}>
            <p>Henüz ödev yüklenmedi</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {homeworks.map((homework) => (
            <Card key={homework.id} style={{ backgroundColor: currentTheme.card }}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <GraduationCap className="h-5 w-5" style={{ color: currentTheme.accent }} />
                      <h3 className="font-semibold" style={{ color: currentTheme.text }}>
                        {homework.student_name} ({homework.student_number})
                      </h3>
                    </div>
                    <div className="space-y-1 text-sm" style={{ color: currentTheme.text }}>
                      <p>
                        <strong>Ders:</strong> {homework.course_code} - {homework.course_name}
                      </p>
                      <p>
                        <strong>Yükleme Tarihi:</strong>{' '}
                        {new Date(homework.upload_date).toLocaleString('tr-TR')}
                      </p>
                      {homework.notes && (
                        <p>
                          <strong>Not:</strong> {homework.notes}
                        </p>
                      )}
                      <a
                        href={`http://localhost:8000${homework.file_url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline inline-block mt-2"
                      >
                        Dosyayı Görüntüle →
                      </a>
                    </div>
                  </div>
                  <Button
                    onClick={() => deleteHomework(homework.id)}
                    variant="ghost"
                    size="sm"
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

const AdminDashboard = () => {
  const { currentTheme } = useTheme();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('announcements');
  const [announcements, setAnnouncements] = useState([]);
  const [courses, setCourses] = useState([]);
  const [publications, setPublications] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [cvData, setCvData] = useState(null);
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

  // Publication state
  const [publicationDialog, setPublicationDialog] = useState(false);
  const [publicationForm, setPublicationForm] = useState({
    title: '',
    authors: '',
    year: new Date().getFullYear(),
    type: 'article',
    journal: '',
    conference: '',
    location: '',
    doi: '',
    external_url: '',
    file_url: '',
    abstract: ''
  });
  const [editingPublication, setEditingPublication] = useState(null);
  const [uploadingPublicationPDF, setUploadingPublicationPDF] = useState(false);

  // Gallery state
  const [galleryDialog, setGalleryDialog] = useState(false);
  const [galleryForm, setGalleryForm] = useState({
    title: '',
    description: '',
    type: 'photo',
    image_url: '',
    video_url: ''
  });
  const [uploadingGalleryImage, setUploadingGalleryImage] = useState(false);

  // CV state
  const [cvDialog, setCvDialog] = useState(false);
  const [cvForm, setCvForm] = useState({
    name: '',
    title: '',
    email: '',
    phone: '',
    office: '',
    education: [],
    experience: [],
    photo_url: '',
    file_url: ''
  });
  const [newEducation, setNewEducation] = useState({ degree: '', field: '', university: '', year: '' });
  const [newExperience, setNewExperience] = useState({ position: '', department: '', institution: '', startYear: '', endYear: '' });
  const [uploadingCVPhoto, setUploadingCVPhoto] = useState(false);
  const [uploadingCVPDF, setUploadingCVPDF] = useState(false);

  // Homework Assignment state
  const [homeworkAssignmentDialog, setHomeworkAssignmentDialog] = useState(false);
  const [homeworkAssignmentForm, setHomeworkAssignmentForm] = useState({
    course_id: null,
    title: '',
    description: '',
    start_date: '',
    due_date: '',
    is_active: true
  });
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [courseAssignments, setCourseAssignments] = useState({});

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
      loadAnalytics();
      loadHomeworkAssignments();
    }
  }, [isAuthenticated, activeTab]);

  const loadAnalytics = async () => {
    try {
      const data = await analyticsAPI.get();
      setAnalytics(data);
    } catch (error) {
      console.error('Analytics yükleme hatası:', error);
    }
  };

  const loadHomeworkAssignments = async () => {
    try {
      const response = await api.get('/homework-assignments');
      const assignments = response.data;
      
      // Derslere göre grupla
      const grouped = {};
      assignments.forEach(assignment => {
        if (!grouped[assignment.course_id]) {
          grouped[assignment.course_id] = [];
        }
        grouped[assignment.course_id].push(assignment);
      });
      
      setCourseAssignments(grouped);
    } catch (error) {
      console.error('Ödev tanımları yükleme hatası:', error);
    }
  };

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
      } else if (activeTab === 'publications') {
        const data = await publicationAPI.getAll();
        setPublications(data);  // Backend artık field mapping yapıyor
      } else if (activeTab === 'gallery') {
        const data = await galleryAPI.getAll();
        setGallery(data);
      } else if (activeTab === 'cv') {
        const data = await cvAPI.get();
        if (data.length > 0) {
          setCvData(data[0]);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user || user.role !== 'admin') {
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
      toast({ title: 'Hata', description: getErrorMessage(error), variant: 'destructive' });
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
      const dataToSend = {
        ...courseForm,
        content: JSON.stringify(courseForm.content)
      };
      
      if (editingCourse) {
        await courseAPI.update(editingCourse.id, dataToSend);
        toast({ title: 'Başarılı', description: 'Ders güncellendi!' });
      } else {
        await courseAPI.create(dataToSend);
        toast({ title: 'Başarılı', description: 'Ders oluşturuldu!' });
      }
      setCourseDialog(false);
      loadData();
    } catch (error) {
      toast({ title: 'Hata', description: getErrorMessage(error), variant: 'destructive' });
    }
  };

  const handleAddVideo = () => {
    if (!newVideo.title || !newVideo.url) {
      toast({ title: 'Uyarı', description: 'Video başlığı ve URL gerekli', variant: 'destructive' });
      return;
    }
    
    setCourseForm(prev => ({
      ...prev,
      content: {
        ...prev.content,
        videos: [...(prev.content.videos || []), { ...newVideo }]
      }
    }));
    setNewVideo({ title: '', description: '', url: '' });
    toast({ title: 'Başarılı', description: 'Video eklendi!' });
  };

  const handleRemoveVideo = (index) => {
    setCourseForm(prev => ({
      ...prev,
      content: {
        ...prev.content,
        videos: prev.content.videos.filter((_, i) => i !== index)
      }
    }));
  };

  const handlePDFUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploadingPDF(true);
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/publications/upload-pdf`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: formData
      });
      
      const result = await response.json();
      
      setCourseForm(prev => ({
        ...prev,
        content: {
          ...prev.content,
          pdfs: [...(prev.content.pdfs || []), {
            title: file.name,
            description: '',
            url: result.url
          }]
        }
      }));
      
      toast({ title: 'Başarılı', description: 'PDF yüklendi!' });
    } catch (error) {
      toast({ title: 'Hata', description: 'PDF yüklenirken hata oluştu', variant: 'destructive' });
    } finally {
      setUploadingPDF(false);
    }
  };

  const handleRemovePDF = (index) => {
    setCourseForm(prev => ({
      ...prev,
      content: {
        ...prev.content,
        pdfs: prev.content.pdfs.filter((_, i) => i !== index)
      }
    }));
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

  // Homework Assignment functions
  const openNewHomeworkAssignmentDialog = (courseId) => {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    setHomeworkAssignmentForm({
      course_id: courseId,
      title: '',
      description: '',
      start_date: now.toISOString().slice(0, 16),
      due_date: nextWeek.toISOString().slice(0, 16),
      is_active: true
    });
    setEditingAssignment(null);
    setHomeworkAssignmentDialog(true);
  };

  const openEditHomeworkAssignmentDialog = (assignment) => {
    setHomeworkAssignmentForm({
      course_id: assignment.course_id,
      title: assignment.title,
      description: assignment.description || '',
      start_date: new Date(assignment.start_date).toISOString().slice(0, 16),
      due_date: new Date(assignment.due_date).toISOString().slice(0, 16),
      is_active: assignment.is_active
    });
    setEditingAssignment(assignment);
    setHomeworkAssignmentDialog(true);
  };

  const handleHomeworkAssignmentSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const dataToSend = {
        ...homeworkAssignmentForm,
        start_date: new Date(homeworkAssignmentForm.start_date).toISOString(),
        due_date: new Date(homeworkAssignmentForm.due_date).toISOString()
      };
      
      if (editingAssignment) {
        await api.put(`/homework-assignments/${editingAssignment.id}`, dataToSend);
        toast({ title: 'Başarılı', description: 'Ödev tanımı güncellendi!' });
      } else {
        await api.post('/homework-assignments', dataToSend);
        toast({ title: 'Başarılı', description: 'Ödev tanımı oluşturuldu!' });
      }
      
      setHomeworkAssignmentDialog(false);
      loadHomeworkAssignments();
    } catch (error) {
      toast({ 
        title: 'Hata', 
        description: getErrorMessage(error), 
        variant: 'destructive' 
      });
    }
  };

  const handleHomeworkAssignmentDelete = async (id) => {
    if (!window.confirm('Bu ödev tanımını silmek istediğinize emin misiniz?')) return;
    
    try {
      await api.delete(`/homework-assignments/${id}`);
      toast({ title: 'Başarılı', description: 'Ödev tanımı silindi!' });
      loadHomeworkAssignments();
    } catch (error) {
      toast({ 
        title: 'Hata', 
        description: 'Silme işlemi başarısız', 
        variant: 'destructive' 
      });
    }
  };

  return (
    <div className="admin-panel min-h-screen py-8" style={{ backgroundColor: currentTheme.background }}>
      <div className="container mx-auto px-4">
        {/* Header */}
        <div 
          className="mb-8 p-6 rounded-xl shadow-lg"
          style={{ backgroundColor: currentTheme.card, borderColor: currentTheme.border, borderWidth: '2px' }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold" style={{ color: currentTheme.primary }}>Kontrol Paneli</h1>
              <p className="text-sm mt-2" style={{ color: currentTheme.text, opacity: 0.7 }}>
                Hoş geldiniz, {user?.username}
              </p>
            </div>
            {analytics && (
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm" style={{ color: currentTheme.text, opacity: 0.7 }}>
                    Toplam Öğrenci
                  </p>
                  <p className="text-2xl font-bold" style={{ color: currentTheme.primary }}>
                    {analytics.total_students}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm" style={{ color: currentTheme.text, opacity: 0.7 }}>
                    Aktif Öğrenci
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {analytics.active_students}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 mb-6">
            <TabsTrigger value="announcements">
              <FileText className="h-4 w-4 mr-2" />
              Duyurular
            </TabsTrigger>
            <TabsTrigger value="courses">
              <BookOpen className="h-4 w-4 mr-2" />
              Dersler
            </TabsTrigger>
            <TabsTrigger value="publications">
              <GraduationCap className="h-4 w-4 mr-2" />
              Yayınlar
            </TabsTrigger>
            <TabsTrigger value="gallery">
              <ImageIcon className="h-4 w-4 mr-2" />
              Galeri
            </TabsTrigger>
            <TabsTrigger value="cv">
              <User className="h-4 w-4 mr-2" />
              CV
            </TabsTrigger>
            <TabsTrigger value="homeworks">
              <GraduationCap className="h-4 w-4 mr-2" />
              Ödevler
            </TabsTrigger>
          </TabsList>

          {/* Announcements Tab */}
          <TabsContent value="announcements">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold" style={{ color: currentTheme.text }}>
                  Duyurular ({announcements.length})
                </h2>
                <div className="flex gap-2">
                  {announcements.length > 0 && (
                    <Button 
                      onClick={async () => {
                        if (!window.confirm(`${announcements.length} duyurunun tamamını silmek istediğinize emin misiniz? Bu işlem geri alınamaz!`)) return;
                        try {
                          // Tüm duyuruları sil
                          await Promise.all(announcements.map(a => announcementAPI.delete(a.id)));
                          toast({ title: 'Başarılı', description: `${announcements.length} duyuru silindi!` });
                          loadData();
                        } catch (error) {
                          toast({ title: 'Hata', description: 'Toplu silme işlemi başarısız', variant: 'destructive' });
                        }
                      }}
                      variant="destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Tümünü Sil ({announcements.length})
                    </Button>
                  )}
                  <Button onClick={openNewAnnouncementDialog} style={{ backgroundColor: currentTheme.accent }}>
                    <Plus className="h-4 w-4 mr-2" />
                  Yeni Duyuru
                </Button>
                </div>
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
                <div className="flex gap-2">
                  {courses.length > 0 && (
                    <Button 
                      onClick={async () => {
                        if (!window.confirm(`${courses.length} dersin tamamını silmek istediğinize emin misiniz? Bu işlem geri alınamaz!`)) return;
                        try {
                          await Promise.all(courses.map(c => courseAPI.delete(c.id)));
                          toast({ title: 'Başarılı', description: `${courses.length} ders silindi!` });
                          loadData();
                        } catch (error) {
                          toast({ title: 'Hata', description: 'Toplu silme işlemi başarısız', variant: 'destructive' });
                        }
                      }}
                      variant="destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Tümünü Sil ({courses.length})
                    </Button>
                  )}
                  <Button onClick={openNewCourseDialog} style={{ backgroundColor: currentTheme.accent }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Yeni Ders
                  </Button>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-8">Yükleniyor...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {courses.map((course) => {
                    const assignments = courseAssignments[course.id] || [];
                    const activeAssignments = assignments.filter(a => a.is_active);
                    
                    return (
                      <Card key={course.id} style={{ backgroundColor: currentTheme.card, borderColor: currentTheme.border }}>
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            {/* Ders Başlığı */}
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="text-xs px-2 py-1 rounded bg-blue-500 text-white">
                                    {course.code}
                                  </span>
                                  <span className="text-xs" style={{ color: currentTheme.text, opacity: 0.6 }}>
                                    {course.level}
                                  </span>
                                  {activeAssignments.length > 0 && (
                                    <span className="text-xs px-2 py-1 rounded bg-green-500 text-white">
                                      {activeAssignments.length} Aktif Ödev
                                    </span>
                                  )}
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

                            {/* Ödev Tanımları */}
                            {assignments.length > 0 && (
                              <div className="space-y-2 pt-2 border-t" style={{ borderColor: currentTheme.border }}>
                                <div className="flex items-center justify-between">
                                  <h4 className="text-sm font-semibold" style={{ color: currentTheme.text }}>
                                    Ödev Tanımları ({assignments.length})
                                  </h4>
                                </div>
                                {assignments.map((assignment) => (
                                  <div 
                                    key={assignment.id}
                                    className="text-xs p-2 rounded flex items-center justify-between"
                                    style={{ 
                                      backgroundColor: assignment.is_active ? 'rgba(34, 197, 94, 0.1)' : 'rgba(156, 163, 175, 0.1)'
                                    }}
                                  >
                                    <div className="flex-1">
                                      <div className="font-semibold" style={{ color: currentTheme.text }}>
                                        {assignment.title}
                                        {!assignment.is_active && (
                                          <span className="ml-2 text-red-500">(Pasif)</span>
                                        )}
                                      </div>
                                      <div style={{ color: currentTheme.text, opacity: 0.7 }}>
                                        Son: {new Date(assignment.due_date).toLocaleString('tr-TR')}
                                      </div>
                                    </div>
                                    <div className="flex space-x-1">
                                      <Button 
                                        size="sm" 
                                        variant="ghost"
                                        onClick={() => openEditHomeworkAssignmentDialog(assignment)}
                                        className="h-6 w-6 p-0"
                                      >
                                        <Edit className="h-3 w-3" />
                                      </Button>
                                      <Button 
                                        size="sm" 
                                        variant="ghost"
                                        onClick={() => handleHomeworkAssignmentDelete(assignment.id)}
                                        className="h-6 w-6 p-0"
                                      >
                                        <Trash2 className="h-3 w-3 text-red-500" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Ödev Tanımla Butonu */}
                            <Button 
                              onClick={() => openNewHomeworkAssignmentDialog(course.id)}
                              variant="outline"
                              size="sm"
                              className="w-full"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Ödev Tanımla
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Homeworks Tab */}
          <TabsContent value="homeworks">
            <HomeworksTab currentTheme={currentTheme} toast={toast} />
          </TabsContent>

          {/* Publications Tab */}
          <TabsContent value="publications">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold" style={{ color: currentTheme.text }}>
                  Yayınlar ({publications.length})
                </h2>
                <div className="flex gap-2">
                  {publications.length > 0 && (
                    <Button 
                      onClick={async () => {
                        if (!window.confirm(`${publications.length} yayının tamamını silmek istediğinize emin misiniz? Bu işlem geri alınamaz!`)) return;
                        try {
                          await Promise.all(publications.map(p => publicationAPI.delete(p.id)));
                          toast({ title: 'Başarılı', description: `${publications.length} yayın silindi!` });
                          loadData();
                        } catch (error) {
                          toast({ title: 'Hata', description: 'Toplu silme işlemi başarısız', variant: 'destructive' });
                        }
                      }}
                      variant="destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Tümünü Sil ({publications.length})
                    </Button>
                  )}
                <Button onClick={() => {
                  setEditingPublication(null);
                  setPublicationForm({
                    title: '',
                    authors: '',
                    year: new Date().getFullYear(),
                    type: 'article',
                    journal: '',
                    conference: '',
                    location: '',
                    doi: '',
                    external_url: '',
                    file_url: '',
                    abstract: ''
                  });
                  setPublicationDialog(true);
                }} style={{ backgroundColor: currentTheme.accent }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Yeni Yayın
                </Button>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-8">Yükleniyor...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {publications.map((pub) => (
                    <Card key={pub.id} style={{ backgroundColor: currentTheme.card, borderColor: currentTheme.border }}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="text-xs px-2 py-1 rounded bg-purple-500 text-white">
                                {pub.type === 'article' ? 'Makale' : 'Proje'}
                              </span>
                              <span className="text-xs" style={{ color: currentTheme.text, opacity: 0.6 }}>
                                {pub.year}
                              </span>
                            </div>
                            <h3 className="font-bold" style={{ color: currentTheme.text }}>{pub.title}</h3>
                            <p className="text-sm mt-1" style={{ color: currentTheme.text, opacity: 0.7 }}>
                              {pub.authors}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <Button size="icon" variant="ghost" onClick={() => {
                              setEditingPublication(pub);
                              setPublicationForm({
                                title: pub.title,
                                authors: pub.authors,
                                year: pub.year,
                                type: pub.type,
                                journal: pub.journal || '',
                                conference: pub.conference || '',
                                location: pub.location || '',
                                doi: pub.doi || '',
                                external_url: pub.external_url || '',
                                file_url: pub.file_url || '',
                                abstract: pub.abstract || ''
                              });
                              setPublicationDialog(true);
                            }}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={async () => {
                              if (!window.confirm('Bu yayını silmek istediğinize emin misiniz?')) return;
                              try {
                                await publicationAPI.delete(pub.id);
                                toast({ title: 'Başarılı', description: 'Yayın silindi!' });
                                loadData();
                              } catch (error) {
                                toast({ title: 'Hata', description: 'Silme işlemi başarısız', variant: 'destructive' });
                              }
                            }}>
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

          {/* Gallery Tab */}
          <TabsContent value="gallery">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold" style={{ color: currentTheme.text }}>
                  Galeri ({gallery.length})
                </h2>
                <div className="flex gap-2">
                  {gallery.length > 0 && (
                    <Button 
                      onClick={async () => {
                        if (!window.confirm(`${gallery.length} galeri öğesinin tamamını silmek istediğinize emin misiniz? Bu işlem geri alınamaz!`)) return;
                        try {
                          await Promise.all(gallery.map(g => galleryAPI.delete(g.id)));
                          toast({ title: 'Başarılı', description: `${gallery.length} galeri öğesi silindi!` });
                          loadData();
                        } catch (error) {
                          toast({ title: 'Hata', description: 'Toplu silme işlemi başarısız', variant: 'destructive' });
                        }
                      }}
                      variant="destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Tümünü Sil ({gallery.length})
                    </Button>
                  )}
                <Button onClick={() => {
                  setGalleryForm({
                    title: '',
                    description: '',
                    type: 'photo',
                    image_url: '',
                    video_url: ''
                  });
                  setGalleryDialog(true);
                }} style={{ backgroundColor: currentTheme.accent }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Yeni Öğe
                </Button>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-8">Yükleniyor...</div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {gallery.map((item) => (
                    <Card key={item.id} className="overflow-hidden" style={{ backgroundColor: currentTheme.card }}>
                      <div className="relative aspect-video">
                        {item.type === 'photo' && item.image_url ? (
                          <img 
                            src={`${BACKEND_URL}${item.image_url}`} 
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <ImageIcon className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white"
                          onClick={async () => {
                            if (!window.confirm('Bu öğeyi silmek istediğinize emin misiniz?')) return;
                            try {
                              await galleryAPI.delete(item.id);
                              toast({ title: 'Başarılı', description: 'Öğe silindi!' });
                              loadData();
                            } catch (error) {
                              toast({ title: 'Hata', description: 'Silme işlemi başarısız', variant: 'destructive' });
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <CardContent className="p-2">
                        <p className="text-xs font-semibold truncate" style={{ color: currentTheme.text }}>
                          {item.title}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* CV Tab */}
          <TabsContent value="cv">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold" style={{ color: currentTheme.text }}>
                  Özgeçmiş Bilgileri
                </h2>
                <Button onClick={() => {
                  if (cvData) {
                    let parsedEducation = [];
                    let parsedExperience = [];
                    
                    try {
                      if (cvData.education) parsedEducation = JSON.parse(cvData.education);
                      if (cvData.experience) parsedExperience = JSON.parse(cvData.experience);
                    } catch (e) {
                      console.error('Parse error:', e);
                    }
                    
                    setCvForm({
                      name: cvData.name || '',
                      title: cvData.title || '',
                      email: cvData.email || '',
                      phone: cvData.phone || '',
                      office: cvData.office || '',
                      education: parsedEducation,
                      experience: parsedExperience,
                      photo_url: cvData.photo_url || '',
                      file_url: cvData.file_url || ''
                    });
                  } else {
                    setCvForm({
                      name: '',
                      title: '',
                      email: '',
                      phone: '',
                      office: '',
                      education: [],
                      experience: [],
                      photo_url: '',
                      file_url: ''
                    });
                  }
                  setCvDialog(true);
                }} style={{ backgroundColor: currentTheme.accent }}>
                  <Edit className="h-4 w-4 mr-2" />
                  {cvData ? 'Düzenle' : 'Oluştur'}
                </Button>
              </div>

              {loading ? (
                <div className="text-center py-8">Yükleniyor...</div>
              ) : cvData ? (
                <Card style={{ backgroundColor: currentTheme.card }}>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-6">
                      {cvData.photo_url && (
                        <img 
                          src={`${BACKEND_URL}${cvData.photo_url}`}
                          alt={cvData.name}
                          className="w-32 h-32 rounded-full object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold" style={{ color: currentTheme.text }}>{cvData.name}</h3>
                        <p className="text-lg" style={{ color: currentTheme.text, opacity: 0.8 }}>{cvData.title}</p>
                        <div className="mt-4 space-y-1">
                          <p className="text-sm" style={{ color: currentTheme.text }}><strong>Email:</strong> {cvData.email}</p>
                          <p className="text-sm" style={{ color: currentTheme.text }}><strong>Telefon:</strong> {cvData.phone}</p>
                          <p className="text-sm" style={{ color: currentTheme.text }}><strong>Ofis:</strong> {cvData.office}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="text-center py-12">
                  <p style={{ color: currentTheme.text, opacity: 0.6 }}>Henüz CV bilgisi yok. Oluştur butonuna tıklayın.</p>
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
                <ReactQuill 
                  theme="snow"
                  value={announcementForm.content}
                  onChange={(value) => setAnnouncementForm(prev => ({...prev, content: value}))}
                  modules={{
                    toolbar: [
                      [{ 'header': [1, 2, 3, false] }],
                      ['bold', 'italic', 'underline', 'strike'],
                      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                      [{ 'align': [] }],
                      ['link', 'image'],
                      ['clean']
                    ],
                  }}
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
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingCourse ? 'Ders Düzenle' : 'Yeni Ders Ekle'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCourseSubmit} className="space-y-4">
              {/* Basic Info */}
              <div className="border-b pb-4">
                <h3 className="font-semibold mb-3">Temel Bilgiler</h3>
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
                <div className="mt-3">
                  <Label>Ders Adı *</Label>
                  <Input 
                    required
                    value={courseForm.name}
                    onChange={(e) => setCourseForm(prev => ({...prev, name: e.target.value}))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 mt-3">
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
                <div className="mt-3">
                  <Label>Açıklama</Label>
                  <ReactQuill 
                    theme="snow"
                    value={courseForm.description}
                    onChange={(value) => setCourseForm(prev => ({...prev, description: value}))}
                    modules={{
                      toolbar: [
                        [{ 'header': [1, 2, 3, false] }],
                        ['bold', 'italic', 'underline'],
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                        ['link'],
                        ['clean']
                      ],
                    }}
                  />
                </div>
              </div>

              {/* Videos Section */}
              <div className="border-b pb-4">
                <h3 className="font-semibold mb-3">Ders Videoları (YouTube)</h3>
                <div className="space-y-2 mb-3">
                  <Input 
                    placeholder="Video Başlığı"
                    value={newVideo.title}
                    onChange={(e) => setNewVideo({...newVideo, title: e.target.value})}
                  />
                  <Input 
                    placeholder="Açıklama (opsiyonel)"
                    value={newVideo.description}
                    onChange={(e) => setNewVideo({...newVideo, description: e.target.value})}
                  />
                  <Input 
                    placeholder="YouTube URL (https://www.youtube.com/watch?v=...)"
                    value={newVideo.url}
                    onChange={(e) => setNewVideo({...newVideo, url: e.target.value})}
                  />
                  <Button type="button" onClick={handleAddVideo} size="sm" variant="outline">
                    + Video Ekle
                  </Button>
                </div>
                {courseForm.content.videos && courseForm.content.videos.length > 0 && (
                  <div className="space-y-2">
                    {courseForm.content.videos.map((video, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{video.title}</p>
                          <p className="text-xs text-gray-500">{video.url}</p>
                        </div>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleRemoveVideo(index)}
                        >
                          ✕
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* PDFs Section */}
              <div className="border-b pb-4">
                <h3 className="font-semibold mb-3">Ders Materyalleri (PDF)</h3>
                <Input 
                  type="file" 
                  accept=".pdf"
                  onChange={handlePDFUpload}
                  disabled={uploadingPDF}
                />
                {uploadingPDF && <p className="text-sm mt-1">Yükleniyor...</p>}
                {courseForm.content.pdfs && courseForm.content.pdfs.length > 0 && (
                  <div className="space-y-2 mt-3">
                    {courseForm.content.pdfs.map((pdf, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{pdf.title}</p>
                        </div>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleRemovePDF(index)}
                        >
                          ✕
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Notes Section */}
              <div className="pb-4">
                <h3 className="font-semibold mb-3">Ders Notları</h3>
                <ReactQuill 
                  theme="snow"
                  placeholder="Ders notlarını buraya yazın..."
                  value={courseForm.content.notes || ''}
                  onChange={(value) => setCourseForm(prev => ({
                    ...prev,
                    content: { ...prev.content, notes: value }
                  }))}
                  modules={{
                    toolbar: [
                      [{ 'header': [1, 2, 3, false] }],
                      ['bold', 'italic', 'underline', 'strike'],
                      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                      [{ 'script': 'sub'}, { 'script': 'super' }],
                      [{ 'color': [] }, { 'background': [] }],
                      ['link', 'code-block'],
                      ['clean']
                    ],
                  }}
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

        {/* Publication Dialog */}
        <Dialog open={publicationDialog} onOpenChange={setPublicationDialog}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPublication ? 'Yayın Düzenle' : 'Yeni Yayın Ekle'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                // Map frontend field names to backend field names
                const dataToSend = {
                  ...publicationForm,
                  publication_type: publicationForm.type,
                  pdf_url: publicationForm.file_url
                };
                delete dataToSend.type;
                delete dataToSend.file_url;
                
                if (editingPublication) {
                  await publicationAPI.update(editingPublication.id, dataToSend);
                  toast({ title: 'Başarılı', description: 'Yayın güncellendi!' });
                } else {
                  await publicationAPI.create(dataToSend);
                  toast({ title: 'Başarılı', description: 'Yayın oluşturuldu!' });
                }
                setPublicationDialog(false);
                loadData();
              } catch (error) {
                toast({ title: 'Hata', description: getErrorMessage(error), variant: 'destructive' });
              }
            }} className="space-y-4">
              <div>
                <Label>Başlık *</Label>
                <Input 
                  required
                  value={publicationForm.title}
                  onChange={(e) => setPublicationForm(prev => ({...prev, title: e.target.value}))}
                />
              </div>
              <div>
                <Label>Yazarlar *</Label>
                <Input 
                  required
                  placeholder="Örn: Ahmet Yılmaz, Mehmet Demir"
                  value={publicationForm.authors}
                  onChange={(e) => setPublicationForm(prev => ({...prev, authors: e.target.value}))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Yıl</Label>
                  <Input 
                    type="number"
                    value={publicationForm.year}
                    onChange={(e) => setPublicationForm(prev => ({...prev, year: parseInt(e.target.value)}))}
                  />
                </div>
                <div>
                  <Label>Tip</Label>
                  <select 
                    className="w-full p-2 border rounded"
                    value={publicationForm.type}
                    onChange={(e) => setPublicationForm(prev => ({...prev, type: e.target.value}))}
                  >
                    <option value="article">Makale</option>
                    <option value="project">Proje</option>
                  </select>
                </div>
              </div>
              {publicationForm.type === 'article' ? (
                <div>
                  <Label>Dergi</Label>
                  <Input 
                    value={publicationForm.journal}
                    onChange={(e) => setPublicationForm(prev => ({...prev, journal: e.target.value}))}
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Konferans</Label>
                    <Input 
                      value={publicationForm.conference}
                      onChange={(e) => setPublicationForm(prev => ({...prev, conference: e.target.value}))}
                    />
                  </div>
                  <div>
                    <Label>Konum</Label>
                    <Input 
                      value={publicationForm.location}
                      onChange={(e) => setPublicationForm(prev => ({...prev, location: e.target.value}))}
                    />
                  </div>
                </div>
              )}
              <div>
                <Label>DOI</Label>
                <Input 
                  placeholder="10.1234/example"
                  value={publicationForm.doi}
                  onChange={(e) => setPublicationForm(prev => ({...prev, doi: e.target.value}))}
                />
              </div>
              <div>
                <Label>Harici URL</Label>
                <Input 
                  type="url"
                  placeholder="https://..."
                  value={publicationForm.external_url}
                  onChange={(e) => setPublicationForm(prev => ({...prev, external_url: e.target.value}))}
                />
              </div>
              <div>
                <Label>Özet</Label>
                <ReactQuill 
                  theme="snow"
                  value={publicationForm.abstract}
                  onChange={(value) => setPublicationForm(prev => ({...prev, abstract: value}))}
                  modules={{
                    toolbar: [
                      [{ 'header': [1, 2, 3, false] }],
                      ['bold', 'italic', 'underline'],
                      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                      ['clean']
                    ],
                  }}
                />
              </div>
              <div>
                <Label>PDF Dosyası</Label>
                <Input 
                  type="file" 
                  accept=".pdf"
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    try {
                      setUploadingPublicationPDF(true);
                      const result = await publicationAPI.uploadPDF(file);
                      setPublicationForm(prev => ({ ...prev, file_url: result.url }));
                      toast({ title: 'Başarılı', description: 'PDF yüklendi!' });
                    } catch (error) {
                      toast({ title: 'Hata', description: 'PDF yüklenirken hata oluştu', variant: 'destructive' });
                    } finally {
                      setUploadingPublicationPDF(false);
                    }
                  }}
                  disabled={uploadingPublicationPDF}
                />
                {uploadingPublicationPDF && <p className="text-sm mt-1">Yükleniyor...</p>}
                {publicationForm.file_url && (
                  <p className="text-sm mt-1 text-green-600">✓ PDF yüklendi</p>
                )}
              </div>
              <div className="flex space-x-2">
                <Button type="submit" className="flex-1" style={{ backgroundColor: currentTheme.accent }}>
                  {editingPublication ? 'Güncelle' : 'Kaydet'}
                </Button>
                <Button type="button" variant="outline" className="flex-1" onClick={() => setPublicationDialog(false)}>
                  İptal
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Gallery Dialog */}
        <Dialog open={galleryDialog} onOpenChange={setGalleryDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Yeni Galeri Öğesi Ekle</DialogTitle>
            </DialogHeader>
            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                // Map frontend field names to backend field names
                const dataToSend = {
                  title: galleryForm.title,
                  description: galleryForm.description,
                  item_type: galleryForm.type,
                  url: galleryForm.type === 'photo' ? galleryForm.image_url : galleryForm.video_url,
                  is_published: true
                };
                
                await galleryAPI.create(dataToSend);
                toast({ title: 'Başarılı', description: 'Galeri öğesi eklendi!' });
                setGalleryDialog(false);
                loadData();
              } catch (error) {
                console.error('Gallery creation error:', error);
                toast({ 
                  title: 'Hata', 
                  description: getErrorMessage(error),
                  variant: 'destructive' 
                });
              }
            }} className="space-y-4">
              <div>
                <Label>Başlık *</Label>
                <Input 
                  required
                  value={galleryForm.title}
                  onChange={(e) => setGalleryForm(prev => ({...prev, title: e.target.value}))}
                />
              </div>
              <div>
                <Label>Açıklama</Label>
                <Textarea 
                  rows={3}
                  value={galleryForm.description}
                  onChange={(e) => setGalleryForm(prev => ({...prev, description: e.target.value}))}
                />
              </div>
              <div>
                <Label>Tip</Label>
                <select 
                  className="w-full p-2 border rounded"
                  value={galleryForm.type}
                  onChange={(e) => setGalleryForm(prev => ({...prev, type: e.target.value}))}
                >
                  <option value="photo">Fotoğraf</option>
                  <option value="video">Video</option>
                </select>
              </div>
              {galleryForm.type === 'photo' ? (
                <div>
                  <Label>Fotoğraf *</Label>
                  <Input 
                    type="file" 
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      try {
                        setUploadingGalleryImage(true);
                        const result = await galleryAPI.uploadPhoto(file);
                        setGalleryForm(prev => ({ ...prev, image_url: result.url }));
                        toast({ title: 'Başarılı', description: 'Fotoğraf yüklendi!' });
                      } catch (error) {
                        toast({ title: 'Hata', description: 'Fotoğraf yüklenirken hata oluştu', variant: 'destructive' });
                      } finally {
                        setUploadingGalleryImage(false);
                      }
                    }}
                    disabled={uploadingGalleryImage}
                  />
                  {uploadingGalleryImage && <p className="text-sm mt-1">Yükleniyor...</p>}
                  {galleryForm.image_url && (
                    <img src={`${BACKEND_URL}${galleryForm.image_url}`} alt="Preview" className="w-32 h-32 object-cover rounded mt-2" />
                  )}
                </div>
              ) : (
                <div>
                  <Label>Video URL (YouTube)</Label>
                  <Input 
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={galleryForm.video_url}
                    onChange={(e) => setGalleryForm(prev => ({...prev, video_url: e.target.value}))}
                  />
                </div>
              )}
              <div className="flex space-x-2">
                <Button type="submit" className="flex-1" style={{ backgroundColor: currentTheme.accent }}>
                  Kaydet
                </Button>
                <Button type="button" variant="outline" className="flex-1" onClick={() => setGalleryDialog(false)}>
                  İptal
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* CV Dialog */}
        <Dialog open={cvDialog} onOpenChange={setCvDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Özgeçmiş Bilgileri {cvData ? 'Düzenle' : 'Oluştur'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                const dataToSend = {
                  ...cvForm,
                  education: JSON.stringify(cvForm.education),
                  experience: JSON.stringify(cvForm.experience)
                };
                
                if (cvData) {
                  await cvAPI.update(dataToSend);
                  toast({ title: 'Başarılı', description: 'CV güncellendi!' });
                } else {
                  await cvAPI.create(dataToSend);
                  toast({ title: 'Başarılı', description: 'CV oluşturuldu!' });
                }
                setCvDialog(false);
                loadData();
              } catch (error) {
                toast({ title: 'Hata', description: getErrorMessage(error), variant: 'destructive' });
              }
            }} className="space-y-4">
              {/* Basic Info */}
              <div className="border-b pb-4">
                <h3 className="font-semibold mb-3">Temel Bilgiler</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Ad Soyad *</Label>
                    <Input 
                      required
                      value={cvForm.name}
                      onChange={(e) => setCvForm(prev => ({...prev, name: e.target.value}))}
                    />
                  </div>
                  <div>
                    <Label>Unvan *</Label>
                    <Input 
                      required
                      value={cvForm.title}
                      onChange={(e) => setCvForm(prev => ({...prev, title: e.target.value}))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-3">
                  <div>
                    <Label>Email</Label>
                    <Input 
                      type="email"
                      value={cvForm.email}
                      onChange={(e) => setCvForm(prev => ({...prev, email: e.target.value}))}
                    />
                  </div>
                  <div>
                    <Label>Telefon</Label>
                    <Input 
                      value={cvForm.phone}
                      onChange={(e) => setCvForm(prev => ({...prev, phone: e.target.value}))}
                    />
                  </div>
                  <div>
                    <Label>Ofis</Label>
                    <Input 
                      value={cvForm.office}
                      onChange={(e) => setCvForm(prev => ({...prev, office: e.target.value}))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div>
                    <Label>Fotoğraf</Label>
                    <Input 
                      type="file" 
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        try {
                          setUploadingCVPhoto(true);
                          const result = await cvAPI.uploadPhoto(file);
                          setCvForm(prev => ({ ...prev, photo_url: result.url }));
                          toast({ title: 'Başarılı', description: 'Fotoğraf yüklendi!' });
                        } catch (error) {
                          toast({ title: 'Hata', description: 'Fotoğraf yüklenirken hata oluştu', variant: 'destructive' });
                        } finally {
                          setUploadingCVPhoto(false);
                        }
                      }}
                      disabled={uploadingCVPhoto}
                    />
                    {cvForm.photo_url && (
                      <img src={`${BACKEND_URL}${cvForm.photo_url}`} alt="Preview" className="w-24 h-24 object-cover rounded-full mt-2" />
                    )}
                  </div>
                  <div>
                    <Label>CV PDF</Label>
                    <Input 
                      type="file" 
                      accept=".pdf"
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        try {
                          setUploadingCVPDF(true);
                          const result = await cvAPI.uploadPDF(file);
                          setCvForm(prev => ({ ...prev, file_url: result.url }));
                          toast({ title: 'Başarılı', description: 'CV PDF yüklendi!' });
                        } catch (error) {
                          toast({ title: 'Hata', description: 'PDF yüklenirken hata oluştu', variant: 'destructive' });
                        } finally {
                          setUploadingCVPDF(false);
                        }
                      }}
                      disabled={uploadingCVPDF}
                    />
                    {cvForm.file_url && <p className="text-sm mt-1 text-green-600">✓ PDF yüklendi</p>}
                  </div>
                </div>
              </div>

              {/* Education */}
              <div className="border-b pb-4">
                <h3 className="font-semibold mb-3 flex items-center">
                  <GraduationCap className="h-5 w-5 mr-2" />
                  Eğitim
                </h3>
                <div className="space-y-2 mb-3">
                  <Input 
                    placeholder="Derece (Örn: Doktora)"
                    value={newEducation.degree}
                    onChange={(e) => setNewEducation({...newEducation, degree: e.target.value})}
                  />
                  <Input 
                    placeholder="Alan (Örn: Bilgisayar Mühendisliği)"
                    value={newEducation.field}
                    onChange={(e) => setNewEducation({...newEducation, field: e.target.value})}
                  />
                  <Input 
                    placeholder="Üniversite"
                    value={newEducation.university}
                    onChange={(e) => setNewEducation({...newEducation, university: e.target.value})}
                  />
                  <Input 
                    placeholder="Yıl (Örn: 2015-2020)"
                    value={newEducation.year}
                    onChange={(e) => setNewEducation({...newEducation, year: e.target.value})}
                  />
                  <Button type="button" onClick={() => {
                    if (!newEducation.degree || !newEducation.university) {
                      toast({ title: 'Uyarı', description: 'Derece ve üniversite gerekli', variant: 'destructive' });
                      return;
                    }
                    setCvForm(prev => ({
                      ...prev,
                      education: [...prev.education, { ...newEducation }]
                    }));
                    setNewEducation({ degree: '', field: '', university: '', year: '' });
                    toast({ title: 'Başarılı', description: 'Eğitim eklendi!' });
                  }} size="sm" variant="outline">
                    + Eğitim Ekle
                  </Button>
                </div>
                {cvForm.education.length > 0 && (
                  <div className="space-y-2">
                    {cvForm.education.map((edu, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{edu.degree} - {edu.field}</p>
                          <p className="text-xs text-gray-500">{edu.university} ({edu.year})</p>
                        </div>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setCvForm(prev => ({
                            ...prev,
                            education: prev.education.filter((_, i) => i !== index)
                          }))}
                        >
                          ✕
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Experience */}
              <div className="pb-4">
                <h3 className="font-semibold mb-3 flex items-center">
                  <Briefcase className="h-5 w-5 mr-2" />
                  Deneyim
                </h3>
                <div className="space-y-2 mb-3">
                  <Input 
                    placeholder="Pozisyon"
                    value={newExperience.position}
                    onChange={(e) => setNewExperience({...newExperience, position: e.target.value})}
                  />
                  <Input 
                    placeholder="Bölüm"
                    value={newExperience.department}
                    onChange={(e) => setNewExperience({...newExperience, department: e.target.value})}
                  />
                  <Input 
                    placeholder="Kurum"
                    value={newExperience.institution}
                    onChange={(e) => setNewExperience({...newExperience, institution: e.target.value})}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input 
                      placeholder="Başlangıç Yılı"
                      value={newExperience.startYear}
                      onChange={(e) => setNewExperience({...newExperience, startYear: e.target.value})}
                    />
                    <Input 
                      placeholder="Bitiş Yılı (veya 'Devam Ediyor')"
                      value={newExperience.endYear}
                      onChange={(e) => setNewExperience({...newExperience, endYear: e.target.value})}
                    />
                  </div>
                  <Button type="button" onClick={() => {
                    if (!newExperience.position || !newExperience.institution) {
                      toast({ title: 'Uyarı', description: 'Pozisyon ve kurum gerekli', variant: 'destructive' });
                      return;
                    }
                    setCvForm(prev => ({
                      ...prev,
                      experience: [...prev.experience, { ...newExperience }]
                    }));
                    setNewExperience({ position: '', department: '', institution: '', startYear: '', endYear: '' });
                    toast({ title: 'Başarılı', description: 'Deneyim eklendi!' });
                  }} size="sm" variant="outline">
                    + Deneyim Ekle
                  </Button>
                </div>
                {cvForm.experience.length > 0 && (
                  <div className="space-y-2">
                    {cvForm.experience.map((exp, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{exp.position}</p>
                          <p className="text-xs text-gray-500">{exp.institution} ({exp.startYear} - {exp.endYear})</p>
                        </div>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setCvForm(prev => ({
                            ...prev,
                            experience: prev.experience.filter((_, i) => i !== index)
                          }))}
                        >
                          ✕
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex space-x-2">
                <Button type="submit" className="flex-1" style={{ backgroundColor: currentTheme.accent }}>
                  {cvData ? 'Güncelle' : 'Oluştur'}
                </Button>
                <Button type="button" variant="outline" className="flex-1" onClick={() => setCvDialog(false)}>
                  İptal
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Homework Assignment Dialog */}
        <Dialog open={homeworkAssignmentDialog} onOpenChange={setHomeworkAssignmentDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingAssignment ? 'Ödev Tanımını Düzenle' : 'Yeni Ödev Tanımı'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleHomeworkAssignmentSubmit} className="space-y-4">
              <div>
                <Label htmlFor="hw-title">Ödev Başlığı *</Label>
                <Input
                  id="hw-title"
                  value={homeworkAssignmentForm.title}
                  onChange={(e) => setHomeworkAssignmentForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Örn: 1. Hafta Ödevi"
                  required
                />
              </div>

              <div>
                <Label htmlFor="hw-description">Açıklama</Label>
                <Textarea
                  id="hw-description"
                  value={homeworkAssignmentForm.description}
                  onChange={(e) => setHomeworkAssignmentForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Ödev detayları, talimatlar..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="hw-start">Başlangıç Tarihi *</Label>
                  <Input
                    id="hw-start"
                    type="datetime-local"
                    value={homeworkAssignmentForm.start_date}
                    onChange={(e) => setHomeworkAssignmentForm(prev => ({ ...prev, start_date: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="hw-due">Son Teslim Tarihi *</Label>
                  <Input
                    id="hw-due"
                    type="datetime-local"
                    value={homeworkAssignmentForm.due_date}
                    onChange={(e) => setHomeworkAssignmentForm(prev => ({ ...prev, due_date: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="hw-active"
                  checked={homeworkAssignmentForm.is_active}
                  onChange={(e) => setHomeworkAssignmentForm(prev => ({ ...prev, is_active: e.target.checked }))}
                  className="h-4 w-4"
                />
                <Label htmlFor="hw-active" className="cursor-pointer">
                  Aktif (Öğrenciler ödev yükleyebilir)
                </Label>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  <strong>ℹ️ Bilgi:</strong>
                </p>
                <ul className="text-xs text-blue-800 dark:text-blue-200 mt-2 space-y-1 ml-4 list-disc">
                  <li>Başlangıç tarihinden önce öğrenciler ödev yükleyemez</li>
                  <li>Son teslim tarihinden sonra yükleme otomatik kapanır</li>
                  <li>Süre uzatmak için son teslim tarihini güncelleyin</li>
                  <li>Pasif yaparsanız öğrenciler yükleyemez (acil durumlar için)</li>
                </ul>
              </div>

              <div className="flex space-x-2">
                <Button type="submit" className="flex-1" style={{ backgroundColor: currentTheme.accent }}>
                  {editingAssignment ? 'Güncelle' : 'Oluştur'}
                </Button>
                <Button type="button" variant="outline" className="flex-1" onClick={() => setHomeworkAssignmentDialog(false)}>
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
