import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { FileText, Users, Calendar, ExternalLink, X } from 'lucide-react';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import api from '../services/api';

const PublicationsPage = () => {
  const { t } = useLanguage();
  const { currentTheme } = useTheme();
  const [publications, setPublications] = useState([]);
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [loading, setLoading] = useState(true);

  // Yayınları API'den çek
  useEffect(() => {
    const fetchPublications = async () => {
      try {
        const response = await api.get('/publications');
        setPublications(response.data);
      } catch (error) {
        console.error('Yayınlar yüklenirken hata:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPublications();
  }, []);

  const articles = publications.filter(p => p.type === 'article');
  const projects = publications.filter(p => p.type === 'project');

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
        <div className="space-y-3">
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
          
          {/* Abstract */}
          {publication.abstract && (
            <div 
              className="prose prose-sm max-w-none text-sm mt-2 p-3 rounded"
              style={{ 
                color: currentTheme.text, 
                backgroundColor: currentTheme.background,
                opacity: 0.9
              }}
              dangerouslySetInnerHTML={{ __html: publication.abstract }}
            />
          )}
          
          {/* PDF Görüntüleme Butonu */}
          {publication.file_url && (
            <Button
              onClick={() => setSelectedPdf(publication.file_url)}
              className="w-full mt-2"
              style={{ backgroundColor: currentTheme.accent }}
            >
              <FileText className="h-4 w-4 mr-2" />
              PDF'i Görüntüle
            </Button>
          )}
          
          {/* Harici Link */}
          {publication.external_url && (
            <Button
              onClick={() => window.open(publication.external_url, '_blank')}
              variant="outline"
              className="w-full mt-2"
              style={{ borderColor: currentTheme.accent, color: currentTheme.accent }}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Kaynağa Git
            </Button>
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

      {/* PDF Modal */}
      <Dialog open={!!selectedPdf} onOpenChange={() => setSelectedPdf(null)}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95">
          <VisuallyHidden>
            <DialogTitle>Yayın PDF Görüntüleyici</DialogTitle>
            <DialogDescription>Yayın dosyasının tam ekran görünümü</DialogDescription>
          </VisuallyHidden>
          <div className="relative w-full h-[95vh]">
            {/* Kapat Butonu */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedPdf(null)}
              className="absolute top-4 right-4 z-10 bg-white/10 text-white hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </Button>
            
            {/* PDF Viewer */}
            {selectedPdf && (
              <iframe
                src={`http://localhost:8000${selectedPdf}`}
                className="w-full h-full"
                title="PDF Görüntüleyici"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PublicationsPage;