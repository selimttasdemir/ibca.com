import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { mockGallery } from '../data/mockData';
import { Card } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent } from '../components/ui/dialog';
import { Image as ImageIcon, Video, X } from 'lucide-react';
import { Button } from '../components/ui/button';

const GalleryPage = () => {
  const { t } = useLanguage();
  const { currentTheme } = useTheme();
  const [selectedItem, setSelectedItem] = useState(null);

  const photos = mockGallery.filter(item => item.type === 'photo');
  const videos = mockGallery.filter(item => item.type === 'video');

  const GalleryItem = ({ item }) => (
    <Card
      onClick={() => setSelectedItem(item)}
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
            src={item.url}
            alt={item.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div 
            className="w-full h-full flex items-center justify-center"
            style={{ backgroundColor: currentTheme.background }}
          >
            <Video className="h-16 w-16" style={{ color: currentTheme.accent }} />
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
          <p className="text-white text-sm font-semibold">{item.title}</p>
          <p className="text-white/70 text-xs">{item.date}</p>
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

        {/* Lightbox Dialog */}
        <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
          <DialogContent className="max-w-4xl p-0">
            {selectedItem && (
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedItem(null)}
                  className="absolute top-2 right-2 z-10 bg-black/50 text-white hover:bg-black/70"
                >
                  <X className="h-5 w-5" />
                </Button>
                {selectedItem.type === 'photo' ? (
                  <img
                    src={selectedItem.url}
                    alt={selectedItem.title}
                    className="w-full h-auto"
                  />
                ) : (
                  <div className="aspect-video">
                    <iframe
                      src={selectedItem.url}
                      title={selectedItem.title}
                      className="w-full h-full"
                      allowFullScreen
                    />
                  </div>
                )}
                <div className="p-4" style={{ backgroundColor: currentTheme.card }}>
                  <h3 className="text-xl font-bold" style={{ color: currentTheme.text }}>
                    {selectedItem.title}
                  </h3>
                  <p className="text-sm" style={{ color: currentTheme.text, opacity: 0.7 }}>
                    {selectedItem.date}
                  </p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default GalleryPage;