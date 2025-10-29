import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { mockPublications } from '../data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { FileText, Users, Calendar } from 'lucide-react';

const PublicationsPage = () => {
  const { t } = useLanguage();
  const { currentTheme } = useTheme();

  const articles = mockPublications.filter(p => p.type === 'article');
  const projects = mockPublications.filter(p => p.type === 'project');

  const PublicationCard = ({ publication }) => (
    <Card
      className="shadow-lg transition-all duration-300 hover:shadow-xl"
      style={{ 
        backgroundColor: currentTheme.card,
        borderColor: currentTheme.border,
        borderWidth: '2px'
      }}
    >
      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          <Badge style={{ backgroundColor: currentTheme.accent }}>
            {publication.type === 'article' ? t('publications.articles') : t('publications.projects')}
          </Badge>
          <div className="flex items-center" style={{ color: currentTheme.accent }}>
            <Calendar className="h-4 w-4 mr-1" />
            <span className="text-sm font-semibold">{publication.year}</span>
          </div>
        </div>
        <CardTitle className="text-lg" style={{ color: currentTheme.text }}>
          {publication.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-start">
            <Users className="h-4 w-4 mr-2 mt-0.5" style={{ color: currentTheme.accent }} />
            <p className="text-sm" style={{ color: currentTheme.text, opacity: 0.8 }}>
              {publication.authors}
            </p>
          </div>
          {publication.journal && (
            <p className="text-sm italic" style={{ color: currentTheme.text, opacity: 0.7 }}>
              {publication.journal}
            </p>
          )}
          {publication.conference && (
            <p className="text-sm italic" style={{ color: currentTheme.text, opacity: 0.7 }}>
              {publication.conference}, {publication.location}
            </p>
          )}
          {publication.doi && (
            <p className="text-xs" style={{ color: currentTheme.accent }}>
              DOI: {publication.doi}
            </p>
          )}
        </div>
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
            {t('publications.title')}
          </h1>
          <div className="w-24 h-1 mx-auto rounded-full" style={{ backgroundColor: currentTheme.accent }}></div>
        </div>

        {/* Articles */}
        <section className="mb-12">
          <h2 
            className="text-2xl font-bold mb-6 flex items-center"
            style={{ color: currentTheme.text }}
          >
            <FileText className="mr-2 h-6 w-6" style={{ color: currentTheme.accent }} />
            {t('publications.articles')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {articles.map((publication) => (
              <PublicationCard key={publication.id} publication={publication} />
            ))}
          </div>
        </section>

        {/* Projects */}
        <section>
          <h2 
            className="text-2xl font-bold mb-6 flex items-center"
            style={{ color: currentTheme.text }}
          >
            <FileText className="mr-2 h-6 w-6" style={{ color: currentTheme.accent }} />
            {t('publications.projects')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((publication) => (
              <PublicationCard key={publication.id} publication={publication} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default PublicationsPage;