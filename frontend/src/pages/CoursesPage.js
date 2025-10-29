import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { mockCourses } from '../data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { BookOpen, FileText } from 'lucide-react';

const CoursesPage = () => {
  const { t } = useLanguage();
  const { currentTheme } = useTheme();

  const undergraduateCourses = mockCourses.filter(c => c.level === 'Lisans');
  const graduateCourses = mockCourses.filter(c => c.level !== 'Lisans');

  const CourseCard = ({ course }) => (
    <Card
      className="shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
      style={{ 
        backgroundColor: currentTheme.card,
        borderColor: currentTheme.border,
        borderWidth: '2px'
      }}
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
            </div>
            <CardTitle style={{ color: currentTheme.text }}>
              {course.name}
            </CardTitle>
          </div>
          <BookOpen className="h-8 w-8" style={{ color: currentTheme.accent, opacity: 0.5 }} />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm" style={{ color: currentTheme.text, opacity: 0.8 }}>
          {course.description}
        </p>
      </CardContent>
    </Card>
  );

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

        {/* Undergraduate Courses */}
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

        {/* Graduate Courses */}
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
      </div>
    </div>
  );
};

export default CoursesPage;