import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { Card } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { Image as ImageIcon, Video, X } from 'lucide-react';
import { Button } from '../components/ui/button';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import api from '../services/api';

const GalleryPage = () => {
  const { t } = useLanguage();
  const { currentTheme } = useTheme();
  const [selectedItem, setSelectedItem] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);

  // Galeri öğelerini API'den çek
  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const response = await api.get('/gallery');
        setGallery(response.data);
      } catch (error) {
        console.error('Galeri yüklenirken hata:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGallery();
  }, []);

  const photos = gallery.filter(item => item.type === 'photo');
  const videos = gallery.filter(item => item.type === 'video');

  // YouTube video ID'sini al (thumbnail için)
  const getYouTubeVideoId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&\s]+)/);
    return match ? match[1] : null;
  };

  // YouTube watch URL'ini al
  const getYouTubeWatchUrl = (url) => {
    if (!url) return null;
    const videoId = getYouTubeVideoId(url);
    return videoId ? `https://www.youtube.com/watch?v=${videoId}` : url;
  };

  // Video tıklandığında YouTube'da aç
  const handleVideoClick = (item) => {
    const youtubeUrl = getYouTubeWatchUrl(item.video_url);
    window.open(youtubeUrl, '_blank', 'noopener,noreferrer');
  };

  const GalleryItem = ({ item }) => (
    <Card
      onClick={() => item.type === 'video' ? handleVideoClick(item) : setSelectedItem(item)}
      className="cursor-pointer overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-105"
      style={{ 
        backgroundColor: currentTheme.card,
        borderColor: currentTheme.border,
        borderWidth: '2px'
      }}
    >
      <div className="relative aspect-video">
        {item.type === 'photo' ? (
          <img
            src={`http://localhost:8000${item.image_url}`}
            alt={item.title}
            className="w-full h-full object-cover"
          />
        ) : (
          // Video için YouTube thumbnail göster
          (() => {
            const videoId = getYouTubeVideoId(item.video_url);
            return videoId ? (
              <div className="relative w-full h-full">
                <img
                  src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                {/* Play button overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20">
                  <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center shadow-xl mb-2">
                    <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-white border-b-8 border-b-transparent ml-1"></div>
                  </div>
                  <span className="text-white text-sm font-semibold bg-black/50 px-3 py-1 rounded">
                    YouTube'da İzle
                  </span>
                </div>
              </div>
            ) : (
              <div 
                className="w-full h-full flex items-center justify-center"
                style={{ backgroundColor: currentTheme.background }}
              >
                <Video className="h-16 w-16" style={{ color: currentTheme.accent }} />
              </div>
            );
          })()
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
          <p className="text-white text-sm font-semibold">{item.title}</p>
          <p className="text-white/70 text-xs">{new Date(item.created_at).toLocaleDateString('tr-TR')}</p>
        </div>
      </div>
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
            {t('gallery.title')}
          </h1>
          <div className="w-24 h-1 mx-auto rounded-full" style={{ backgroundColor: currentTheme.accent }}></div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="photos" className="w-full">
          <TabsList className="grid w-full md:w-96 mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="photos" className="flex items-center">
              <ImageIcon className="h-4 w-4 mr-2" />
              {t('gallery.photos')} ({photos.length})
            </TabsTrigger>
            <TabsTrigger value="videos" className="flex items-center">
              <Video className="h-4 w-4 mr-2" />
              {t('gallery.videos')} ({videos.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="photos">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {photos.map((item) => (
                <GalleryItem key={item.id} item={item} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="videos">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {videos.map((item) => (
                <GalleryItem key={item.id} item={item} />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Lightbox Dialog - Sadece fotoğraflar için */}
        <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
          <DialogContent className="max-w-4xl p-0">
            {selectedItem && selectedItem.type === 'photo' && (
              <>
                <VisuallyHidden>
                  <DialogTitle>{selectedItem.title}</DialogTitle>
                  <DialogDescription>Galeri fotoğrafı</DialogDescription>
                </VisuallyHidden>
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedItem(null)}
                    className="absolute top-2 right-2 z-10 bg-black/50 text-white hover:bg-black/70"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                  <img
                    src={`http://localhost:8000${selectedItem.image_url}`}
                    alt={selectedItem.title}
                    className="w-full h-auto max-h-[85vh] object-contain"
                  />
                  <div className="p-4" style={{ backgroundColor: currentTheme.card }}>
                    <h3 className="text-xl font-bold" style={{ color: currentTheme.text }}>
                      {selectedItem.title}
                    </h3>
                    <p className="text-sm mt-2" style={{ color: currentTheme.text, opacity: 0.7 }}>
                      {new Date(selectedItem.created_at).toLocaleDateString('tr-TR')}
                    </p>
                    {selectedItem.description && (
                      <p className="text-sm mt-2" style={{ color: currentTheme.text, opacity: 0.9 }}>
                        {selectedItem.description}
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default GalleryPage;