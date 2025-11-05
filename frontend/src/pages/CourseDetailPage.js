import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { courseAPI } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Alert, AlertDescription } from '../components/ui/alert';
import { 
  ArrowLeft, 
  BookOpen, 
  FileText, 
  Video, 
  Download,
  Clock,
  GraduationCap,
  ClipboardList,
  CalendarClock,
  AlertCircle,
  Upload
} from 'lucide-react';

const CourseDetailPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { currentTheme } = useTheme();
  const { studentToken } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState({ videos: [], pdfs: [], notes: [] });
  const [homeworkAssignments, setHomeworkAssignments] = useState([]);

  useEffect(() => {
    loadCourse();
    loadHomeworkAssignments();
  }, [courseId]);

  const loadCourse = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/courses/${courseId}`);
      const data = await response.json();
      setCourse(data);
      
      // Parse content if exists
      if (data.content) {
        try {
          const parsedContent = JSON.parse(data.content);
          setContent(parsedContent);
        } catch (e) {
          console.error('Error parsing course content:', e);
        }
      }
    } catch (error) {
      console.error('Error loading course:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadHomeworkAssignments = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/homework-assignments?course_id=${courseId}&is_active=true`
      );
      const data = await response.json();
      setHomeworkAssignments(data);
    } catch (error) {
      console.error('Error loading homework assignments:', error);
    }
  };

  const formatDateTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isAssignmentActive = (assignment) => {
    const now = new Date();
    const startDate = new Date(assignment.start_date);
    const dueDate = new Date(assignment.due_date);
    return now >= startDate && now <= dueDate && assignment.is_active;
  };

  const getAssignmentStatus = (assignment) => {
    const now = new Date();
    const startDate = new Date(assignment.start_date);
    const dueDate = new Date(assignment.due_date);

    if (now < startDate) {
      return { 
        text: 'Yakında Başlayacak', 
        color: 'bg-blue-500', 
        icon: CalendarClock 
      };
    } else if (now > dueDate) {
      return { 
        text: 'Süresi Doldu', 
        color: 'bg-red-500', 
        icon: AlertCircle 
      };
    } else if (assignment.is_active) {
      return { 
        text: 'Aktif', 
        color: 'bg-green-500', 
        icon: Upload 
      };
    } else {
      return { 
        text: 'Pasif', 
        color: 'bg-gray-500', 
        icon: AlertCircle 
      };
    }
  };

  const handleUploadHomework = (assignmentId) => {
    if (!studentToken) {
      // Redirect to student dashboard with login required message
      navigate('/student-dashboard', { 
        state: { 
          tab: 'homeworks',
          assignmentId,
          requiresLogin: true,
          message: 'Ödev yüklemek için giriş yapmalısınız' 
        } 
      });
    } else {
      // Go to student dashboard homework tab
      navigate('/student-dashboard', { state: { tab: 'homeworks', assignmentId } });
    }
  };

  if (loading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center" 
        style={{ backgroundColor: currentTheme.background }}
      >
        <div style={{ color: currentTheme.text }}>Yükleniyor...</div>
      </div>
    );
  }

  if (!course) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center" 
        style={{ backgroundColor: currentTheme.background }}
      >
        <div style={{ color: currentTheme.text }}>Ders bulunamadı</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8" style={{ backgroundColor: currentTheme.background }}>
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/courses')}
          className="mb-6"
          style={{ color: currentTheme.text }}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Derslere Dön
        </Button>

        {/* Course Header */}
        <div 
          className="p-8 rounded-xl shadow-lg mb-8"
          style={{ 
            backgroundColor: currentTheme.card,
            borderColor: currentTheme.border,
            borderWidth: '2px'
          }}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                <Badge style={{ backgroundColor: currentTheme.accent, fontSize: '14px', padding: '6px 12px' }}>
                  {course.code}
                </Badge>
                <Badge variant="outline" style={{ borderColor: currentTheme.border }}>
                  {course.level}
                </Badge>
                <Badge variant="outline" style={{ borderColor: currentTheme.border }}>
                  {course.semester}
                </Badge>
                <Badge variant="outline" style={{ borderColor: currentTheme.border }}>
                  {course.credits} Kredi
                </Badge>
              </div>
              <h1 className="text-4xl font-bold mb-4" style={{ color: currentTheme.primary }}>
                {course.name}
              </h1>
              <div 
                className="prose prose-lg max-w-none"
                style={{ color: currentTheme.text, opacity: 0.8 }}
                dangerouslySetInnerHTML={{ __html: course.description }}
              />
            </div>
            <div 
              className="w-24 h-24 rounded-full flex items-center justify-center"
              style={{ backgroundColor: currentTheme.accent, opacity: 0.1 }}
            >
              <BookOpen className="h-12 w-12" style={{ color: currentTheme.accent }} />
            </div>
          </div>
        </div>

        {/* Course Content Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full md:w-auto grid-cols-5 mb-6">
            <TabsTrigger value="overview">
              <GraduationCap className="h-4 w-4 mr-2" />
              Genel Bakış
            </TabsTrigger>
            <TabsTrigger value="homeworks">
              <ClipboardList className="h-4 w-4 mr-2" />
              Ödevler ({homeworkAssignments.length})
            </TabsTrigger>
            <TabsTrigger value="videos">
              <Video className="h-4 w-4 mr-2" />
              Videolar ({content.videos?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="materials">
              <FileText className="h-4 w-4 mr-2" />
              Materyaller ({content.pdfs?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="notes">
              <BookOpen className="h-4 w-4 mr-2" />
              Notlar
            </TabsTrigger>
          </TabsList>

          {/* Homeworks Tab */}
          <TabsContent value="homeworks">
            <div className="space-y-4">
              {!studentToken && homeworkAssignments.length > 0 && (
                <Alert style={{ 
                  backgroundColor: currentTheme.accent + '20', 
                  borderColor: currentTheme.accent 
                }}>
                  <AlertCircle className="h-4 w-4" style={{ color: currentTheme.accent }} />
                  <AlertDescription style={{ color: currentTheme.text }}>
                    Ödev yüklemek için öğrenci girişi yapmalısınız.
                  </AlertDescription>
                </Alert>
              )}

              {homeworkAssignments.length > 0 ? (
                homeworkAssignments.map((assignment) => {
                  const status = getAssignmentStatus(assignment);
                  const StatusIcon = status.icon;
                  const canUpload = isAssignmentActive(assignment);

                  return (
                    <Card 
                      key={assignment.id} 
                      style={{ 
                        backgroundColor: currentTheme.card, 
                        borderColor: currentTheme.border,
                        borderWidth: '2px'
                      }}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start space-x-4 flex-1">
                            <div 
                              className="w-12 h-12 rounded-lg flex items-center justify-center"
                              style={{ backgroundColor: currentTheme.accent + '20' }}
                            >
                              <ClipboardList className="h-6 w-6" style={{ color: currentTheme.accent }} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h3 className="text-xl font-bold" style={{ color: currentTheme.text }}>
                                  {assignment.title}
                                </h3>
                                <Badge className={`${status.color} text-white`}>
                                  <StatusIcon className="h-3 w-3 mr-1" />
                                  {status.text}
                                </Badge>
                              </div>
                              
                              {assignment.description && (
                                <p 
                                  className="text-sm mb-4" 
                                  style={{ color: currentTheme.text, opacity: 0.7 }}
                                >
                                  {assignment.description}
                                </p>
                              )}

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                                <div className="flex items-center space-x-2">
                                  <CalendarClock className="h-4 w-4" style={{ color: currentTheme.accent }} />
                                  <span className="text-sm" style={{ color: currentTheme.text }}>
                                    <strong>Başlangıç:</strong> {formatDateTime(assignment.start_date)}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Clock className="h-4 w-4" style={{ color: currentTheme.accent }} />
                                  <span className="text-sm" style={{ color: currentTheme.text }}>
                                    <strong>Son Teslim:</strong> {formatDateTime(assignment.due_date)}
                                  </span>
                                </div>
                              </div>

                              {canUpload ? (
                                <Button
                                  onClick={() => handleUploadHomework(assignment.id)}
                                  style={{ backgroundColor: currentTheme.accent }}
                                  className="w-full md:w-auto"
                                >
                                  <Upload className="h-4 w-4 mr-2" />
                                  Yükle
                                </Button>
                              ) : (
                                <Alert style={{ 
                                  backgroundColor: status.color + '20',
                                  borderColor: status.color
                                }}>
                                  <AlertCircle className="h-4 w-4" style={{ color: status.color }} />
                                  <AlertDescription style={{ color: currentTheme.text }}>
                                    {new Date() < new Date(assignment.start_date) 
                                      ? `Bu ödev henüz başlamadı. ${formatDateTime(assignment.start_date)} tarihinde açılacak.`
                                      : 'Bu ödevin süresi dolmuştur. Artık yükleme yapılamaz.'}
                                  </AlertDescription>
                                </Alert>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <Card style={{ backgroundColor: currentTheme.card }}>
                  <CardContent className="p-8 text-center">
                    <ClipboardList className="h-12 w-12 mx-auto mb-4" style={{ color: currentTheme.text, opacity: 0.3 }} />
                    <p style={{ color: currentTheme.text, opacity: 0.7 }}>
                      Bu ders için aktif ödev bulunmuyor
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <Card style={{ backgroundColor: currentTheme.card, borderColor: currentTheme.border }}>
              <CardHeader>
                <CardTitle style={{ color: currentTheme.text }}>Ders Hakkında</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4" style={{ color: currentTheme.text }}>
                  <div className="flex items-start space-x-3">
                    <Clock className="h-5 w-5 mt-1" style={{ color: currentTheme.accent }} />
                    <div>
                      <h3 className="font-semibold">Dönem</h3>
                      <p className="text-sm opacity-80">{course.semester} Dönemi</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <GraduationCap className="h-5 w-5 mt-1" style={{ color: currentTheme.accent }} />
                    <div>
                      <h3 className="font-semibold">Seviye</h3>
                      <p className="text-sm opacity-80">{course.level}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <FileText className="h-5 w-5 mt-1" style={{ color: currentTheme.accent }} />
                    <div className="flex-1">
                      <h3 className="font-semibold">Ders İçeriği</h3>
                      <div 
                        className="prose prose-sm max-w-none text-sm opacity-80"
                        style={{ color: currentTheme.text }}
                        dangerouslySetInnerHTML={{ __html: course.description }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Videos Tab */}
          <TabsContent value="videos">
            <div className="space-y-4">
              {content.videos && content.videos.length > 0 ? (
                content.videos.map((video, index) => (
                  <Card key={index} style={{ backgroundColor: currentTheme.card, borderColor: currentTheme.border }}>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-4">
                        <div 
                          className="w-12 h-12 rounded flex items-center justify-center"
                          style={{ backgroundColor: currentTheme.accent, opacity: 0.1 }}
                        >
                          <Video className="h-6 w-6" style={{ color: currentTheme.accent }} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold" style={{ color: currentTheme.text }}>
                            {video.title}
                          </h3>
                          <p className="text-sm" style={{ color: currentTheme.text, opacity: 0.7 }}>
                            {video.description}
                          </p>
                        </div>
                        <Button 
                          onClick={() => window.open(video.url, '_blank')}
                          style={{ backgroundColor: currentTheme.accent }}
                        >
                          İzle
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card style={{ backgroundColor: currentTheme.card }}>
                  <CardContent className="p-8 text-center">
                    <Video className="h-12 w-12 mx-auto mb-4" style={{ color: currentTheme.text, opacity: 0.3 }} />
                    <p style={{ color: currentTheme.text, opacity: 0.7 }}>
                      Henüz video eklenmemiş
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Materials Tab */}
          <TabsContent value="materials">
            <div className="space-y-4">
              {content.pdfs && content.pdfs.length > 0 ? (
                content.pdfs.map((pdf, index) => (
                  <Card key={index} style={{ backgroundColor: currentTheme.card, borderColor: currentTheme.border }}>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-4">
                        <div 
                          className="w-12 h-12 rounded flex items-center justify-center"
                          style={{ backgroundColor: currentTheme.accent, opacity: 0.1 }}
                        >
                          <FileText className="h-6 w-6" style={{ color: currentTheme.accent }} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold" style={{ color: currentTheme.text }}>
                            {pdf.title}
                          </h3>
                          <p className="text-sm" style={{ color: currentTheme.text, opacity: 0.7 }}>
                            {pdf.description}
                          </p>
                        </div>
                        <Button 
                          onClick={() => window.open(`${process.env.REACT_APP_BACKEND_URL}${pdf.url}`, '_blank')}
                          style={{ backgroundColor: currentTheme.accent }}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          İndir
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card style={{ backgroundColor: currentTheme.card }}>
                  <CardContent className="p-8 text-center">
                    <FileText className="h-12 w-12 mx-auto mb-4" style={{ color: currentTheme.text, opacity: 0.3 }} />
                    <p style={{ color: currentTheme.text, opacity: 0.7 }}>
                      Henüz materyal eklenmemiş
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notes">
            <Card style={{ backgroundColor: currentTheme.card, borderColor: currentTheme.border }}>
              <CardHeader>
                <CardTitle style={{ color: currentTheme.text }}>Ders Notları</CardTitle>
              </CardHeader>
              <CardContent>
                {content.notes && content.notes.length > 0 ? (
                  <div className="prose max-w-none" style={{ color: currentTheme.text }}>
                    <div dangerouslySetInnerHTML={{ __html: content.notes }} />
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 mx-auto mb-4" style={{ color: currentTheme.text, opacity: 0.3 }} />
                    <p style={{ color: currentTheme.text, opacity: 0.7 }}>
                      Henüz not eklenmemiş
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CourseDetailPage;