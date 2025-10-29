import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { mockAnnouncements } from '../data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from './ui/button';

const AnnouncementCard = ({ announcement }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { t } = useLanguage();
  const { currentTheme } = useTheme();

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
              <Badge style={{ backgroundColor: typeColors[announcement.type] }}>
                {typeLabels[announcement.type]}
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
        <div 
          className="prose max-w-none"
          style={{ color: currentTheme.text }}
        >
          <p className={`${!isExpanded && 'line-clamp-3'}`}>
            {announcement.content}
          </p>
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
                {t('home.readMore')}
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

  return (
    <div className="space-y-4">
      <h2 
        className="text-2xl font-bold mb-6"
        style={{ color: currentTheme.text }}
      >
        {t('home.latestAnnouncements')}
      </h2>
      {mockAnnouncements.map((announcement) => (
        <AnnouncementCard key={announcement.id} announcement={announcement} />
      ))}
    </div>
  );
};

export default AnnouncementList;