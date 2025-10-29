import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { courseAPI } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  ArrowLeft, 
  BookOpen, 
  FileText, 
  Video, 
  Download,
  Clock,
  GraduationCap
} from 'lucide-react';

const CourseDetailPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { currentTheme } = useTheme();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState({ videos: [], pdfs: [], notes: [] });

  useEffect(() => {
    loadCourse();
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
              <p className="text-lg" style={{ color: currentTheme.text, opacity: 0.8 }}>
                {course.description}
              </p>
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
          <TabsList className="grid w-full md:w-auto grid-cols-4 mb-6">
            <TabsTrigger value="overview">
              <GraduationCap className="h-4 w-4 mr-2" />
              Genel Bakış
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
                    <div>
                      <h3 className="font-semibold">Ders İçeriği</h3>
                      <p className="text-sm opacity-80 whitespace-pre-line">{course.description}</p>
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