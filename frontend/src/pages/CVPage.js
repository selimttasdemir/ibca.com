import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { mockCV } from '../data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Mail, Phone, MapPin, GraduationCap, Briefcase } from 'lucide-react';

const CVPage = () => {
  const { t } = useLanguage();
  const { currentTheme } = useTheme();

  return (
    <div className="min-h-screen py-8" style={{ backgroundColor: currentTheme.background }}>
      <div className="container mx-auto px-4">
        {/* Header */}
        <div 
          className="text-center mb-8 p-8 rounded-xl shadow-lg"
          style={{ 
            backgroundColor: currentTheme.card,
            borderColor: currentTheme.border,
            borderWidth: '2px'
          }}
        >
          <img
            src={mockCV.photo}
            alt={mockCV.name}
            className="w-40 h-40 rounded-full mx-auto mb-4 object-cover border-4 shadow-xl"
            style={{ borderColor: currentTheme.accent }}
          />
          <h1 className="text-4xl font-bold mb-2" style={{ color: currentTheme.primary }}>
            {mockCV.name}
          </h1>
          <p className="text-xl" style={{ color: currentTheme.text, opacity: 0.8 }}>
            {mockCV.title}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Education */}
          <Card
            className="shadow-lg transition-all duration-300 hover:shadow-xl"
            style={{ 
              backgroundColor: currentTheme.card,
              borderColor: currentTheme.border,
              borderWidth: '2px'
            }}
          >
            <CardHeader>
              <CardTitle className="flex items-center" style={{ color: currentTheme.primary }}>
                <GraduationCap className="mr-2 h-6 w-6" style={{ color: currentTheme.accent }} />
                {t('cv.education')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockCV.education.map((edu, index) => (
                  <div key={index} className="border-l-4 pl-4 py-2" style={{ borderColor: currentTheme.accent }}>
                    <h3 className="font-bold text-lg" style={{ color: currentTheme.text }}>
                      {edu.degree}
                    </h3>
                    <p className="text-sm" style={{ color: currentTheme.text, opacity: 0.8 }}>
                      {edu.field}
                    </p>
                    <p className="text-sm" style={{ color: currentTheme.text, opacity: 0.7 }}>
                      {edu.university}
                    </p>
                    <p className="text-xs font-semibold mt-1" style={{ color: currentTheme.accent }}>
                      {edu.year}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Experience */}
          <Card
            className="shadow-lg transition-all duration-300 hover:shadow-xl"
            style={{ 
              backgroundColor: currentTheme.card,
              borderColor: currentTheme.border,
              borderWidth: '2px'
            }}
          >
            <CardHeader>
              <CardTitle className="flex items-center" style={{ color: currentTheme.primary }}>
                <Briefcase className="mr-2 h-6 w-6" style={{ color: currentTheme.accent }} />
                {t('cv.experience')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockCV.experience.map((exp, index) => (
                  <div key={index} className="border-l-4 pl-4 py-2" style={{ borderColor: currentTheme.accent }}>
                    <h3 className="font-bold text-lg" style={{ color: currentTheme.text }}>
                      {exp.position}
                    </h3>
                    <p className="text-sm" style={{ color: currentTheme.text, opacity: 0.8 }}>
                      {exp.department}
                    </p>
                    <p className="text-sm" style={{ color: currentTheme.text, opacity: 0.7 }}>
                      {exp.institution}
                    </p>
                    <p className="text-xs font-semibold mt-1" style={{ color: currentTheme.accent }}>
                      {exp.startYear} - {exp.endYear}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact Information */}
        <Card
          className="mt-8 shadow-lg transition-all duration-300 hover:shadow-xl"
          style={{ 
            backgroundColor: currentTheme.card,
            borderColor: currentTheme.border,
            borderWidth: '2px'
          }}
        >
          <CardHeader>
            <CardTitle style={{ color: currentTheme.primary }}>
              {t('cv.contact')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5" style={{ color: currentTheme.accent }} />
                <div>
                  <p className="text-sm font-semibold" style={{ color: currentTheme.text }}>Email</p>
                  <p className="text-sm" style={{ color: currentTheme.text, opacity: 0.8 }}>
                    {mockCV.contact.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5" style={{ color: currentTheme.accent }} />
                <div>
                  <p className="text-sm font-semibold" style={{ color: currentTheme.text }}>Telefon</p>
                  <p className="text-sm" style={{ color: currentTheme.text, opacity: 0.8 }}>
                    {mockCV.contact.phone}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5" style={{ color: currentTheme.accent }} />
                <div>
                  <p className="text-sm font-semibold" style={{ color: currentTheme.text }}>Ofis</p>
                  <p className="text-sm" style={{ color: currentTheme.text, opacity: 0.8 }}>
                    {mockCV.contact.office}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CVPage;