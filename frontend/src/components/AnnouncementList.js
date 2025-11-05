import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext'
import { useTheme } from '../context/ThemeContext';
import { announcementAPI } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Calendar, ChevronDown, ChevronUp, X } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from './ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

const AnnouncementCard = ({ announcement }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const { t } = useLanguage();
  const { currentTheme } = useTheme();
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  const typeColors = {
    department: '#DC2626',
    course: '#2563EB',
    event: '#16A34A'
  };

  const typeLabels = {
    department: 'Bölüm',
    course: 'Ders',
    event: 'Etkinlik'
  };

  return (
    <Card 
      className="mb-4 transition-all duration-300 hover:shadow-xl"
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
              <Calendar className="h-4 w-4" style={{ color: currentTheme.accent }} />
              <span className="text-sm font-medium" style={{ color: currentTheme.text }}>
                {announcement.date}
              </span>
              <Badge style={{ backgroundColor: typeColors[announcement.announcement_type] }}>
                {typeLabels[announcement.announcement_type]}
              </Badge>
            </div>
            <CardTitle 
              className="text-lg font-bold"
              style={{ color: currentTheme.text }}
            >
              {announcement.title}
            </CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {announcement.image_url && (
          <>
            <img 
              src={`${BACKEND_URL}${announcement.image_url}`}
              alt={announcement.title}
              className="w-full h-48 object-cover rounded-lg mb-4 cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => setImageModalOpen(true)}
              title="Resmi büyütmek için tıklayın"
            />
            
            {/* Image Modal */}
            <Dialog open={imageModalOpen} onOpenChange={setImageModalOpen}>
              <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 overflow-hidden bg-black/95">
                <VisuallyHidden>
                  <DialogTitle>{announcement.title}</DialogTitle>
                  <DialogDescription>Duyuru görseli tam ekran görünümü</DialogDescription>
                </VisuallyHidden>
                <div className="relative w-full h-full flex items-center justify-center p-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-4 right-4 z-50 bg-white/10 hover:bg-white/20 text-white rounded-full"
                    onClick={() => setImageModalOpen(false)}
                  >
                    <X className="h-6 w-6" />
                  </Button>
                  <img 
                    src={`${BACKEND_URL}${announcement.image_url}`}
                    alt={announcement.title}
                    className="max-w-full max-h-[90vh] object-contain rounded-lg"
                  />
                </div>
              </DialogContent>
            </Dialog>
          </>
        )}
        <div 
          className="prose prose-sm max-w-none"
          style={{ color: currentTheme.text }}
        >
          <div 
            className={`${!isExpanded && 'line-clamp-3'}`}
            dangerouslySetInnerHTML={{ __html: announcement.content }}
          />
        </div>
        {announcement.content.length > 150 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-2"
            style={{ color: currentTheme.accent }}
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1" />
                Daha Az
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-1" />
                {t('home.readMore')}
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

const AnnouncementList = () => {
  const { t } = useLanguage();
  const { currentTheme } = useTheme();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        const data = await announcementAPI.getAll();
        setAnnouncements(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching announcements:', err);
        setError('Duyurular yüklenemedi');
        // Fallback to mock data if API fails
        const { mockAnnouncements } = await import('../data/mockData');
        setAnnouncements(mockAnnouncements);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-8" style={{ color: currentTheme.text }}>
        Yükleniyor...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 
        className="text-2xl font-bold mb-6"
        style={{ color: currentTheme.text }}
      >
        {t('home.latestAnnouncements')}
      </h2>
      {error && (
        <div className="text-sm text-yellow-600 mb-4">
          {error} (Mock veri gösteriliyor)
        </div>
      )}
      {announcements.map((announcement) => (
        <AnnouncementCard key={announcement.id} announcement={announcement} />
      ))}
    </div>
  );
};

export default AnnouncementList;