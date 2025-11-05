import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { courseAPI } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { BookOpen, FileText, ArrowRight, ClipboardList } from 'lucide-react';
import { Button } from '../components/ui/button';

const CoursesPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { currentTheme } = useTheme();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [homeworkCounts, setHomeworkCounts] = useState({});

  useEffect(() => {
    loadCourses();
    loadHomeworkCounts();
  }, []);

  const loadCourses = async () => {
    try {
      const data = await courseAPI.getAll();
      setCourses(data);
    } catch (error) {
      console.error('Error loading courses:', error);
      // Fallback to mock if API fails
      const { mockCourses } = await import('../data/mockData');
      setCourses(mockCourses);
    } finally {
      setLoading(false);
    }
  };

  const loadHomeworkCounts = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/homework-assignments?is_active=true`);
      const assignments = await response.json();
      
      // Her ders için aktif ödev sayısını hesapla
      const counts = {};
      assignments.forEach(assignment => {
        counts[assignment.course_id] = (counts[assignment.course_id] || 0) + 1;
      });
      setHomeworkCounts(counts);
    } catch (error) {
      console.error('Error loading homework counts:', error);
    }
  };

  const undergraduateCourses = courses.filter(c => c.level === 'Lisans');
  const graduateCourses = courses.filter(c => c.level !== 'Lisans');

  const CourseCard = ({ course }) => {
    const homeworkCount = homeworkCounts[course.id] || 0;
    
    return (
      <Card
        className="shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 cursor-pointer"
        style={{ 
          backgroundColor: currentTheme.card,
          borderColor: currentTheme.border,
          borderWidth: '2px'
        }}
        onClick={() => navigate(`/courses/${course.id}`)}
      >
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <Badge style={{ backgroundColor: currentTheme.accent }}>
                  {course.code}
                </Badge>
                <Badge variant="outline" style={{ borderColor: currentTheme.border }}>
                  {course.semester}
                </Badge>
                <Badge variant="outline" style={{ borderColor: currentTheme.border }}>
                  {course.credits} Kredi
                </Badge>
                {homeworkCount > 0 && (
                  <Badge className="bg-green-500 text-white">
                    <ClipboardList className="h-3 w-3 mr-1" />
                    {homeworkCount} Ödev
                  </Badge>
                )}
              </div>
              <CardTitle style={{ color: currentTheme.text }}>
                {course.name}
              </CardTitle>
            </div>
            <BookOpen className="h-8 w-8" style={{ color: currentTheme.accent, opacity: 0.5 }} />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm mb-4" style={{ color: currentTheme.text, opacity: 0.8 }}>
            {course.description?.substring(0, 150)}...
          </p>
          <Button 
            variant="ghost" 
            className="w-full"
            style={{ color: currentTheme.accent }}
          >
            Detayları Gör
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen py-8" style={{ backgroundColor: currentTheme.background }}>
      <div className="container mx-auto px-4">
        {/* Page Header */}
        <div 
          className="text-center mb-12 p-8 rounded-xl shadow-lg"
          style={{ 
            backgroundColor: currentTheme.card,
            borderColor: currentTheme.border,
            borderWidth: '2px'
          }}
        >
          <h1 className="text-4xl font-bold mb-4" style={{ color: currentTheme.primary }}>
            {t('courses.title')}
          </h1>
          <div className="w-24 h-1 mx-auto rounded-full" style={{ backgroundColor: currentTheme.accent }}></div>
        </div>

        {loading ? (
          <div className="text-center py-8" style={{ color: currentTheme.text }}>
            Yükleniyor...
          </div>
        ) : (
          <>
            {/* Undergraduate Courses */}
            {undergraduateCourses.length > 0 && (
              <section className="mb-12">
                <h2 
                  className="text-2xl font-bold mb-6 flex items-center"
                  style={{ color: currentTheme.text }}
                >
                  <FileText className="mr-2 h-6 w-6" style={{ color: currentTheme.accent }} />
                  {t('courses.undergraduate')}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {undergraduateCourses.map((course) => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>
              </section>
            )}

            {/* Graduate Courses */}
            {graduateCourses.length > 0 && (
              <section>
                <h2 
                  className="text-2xl font-bold mb-6 flex items-center"
                  style={{ color: currentTheme.text }}
                >
                  <FileText className="mr-2 h-6 w-6" style={{ color: currentTheme.accent }} />
                  {t('courses.graduate')}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {graduateCourses.map((course) => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CoursesPage;