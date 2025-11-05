import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import api from '../services/api';

const ImageSlider = () => {
  const { currentTheme } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Gallery'den fotoğrafları çek
  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const response = await api.get('/gallery');
        const galleryPhotos = response.data.filter(item => item.type === 'photo');
        setPhotos(galleryPhotos);
      } catch (error) {
        console.error('Fotoğraflar yüklenirken hata:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % photos.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [photos.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % photos.length);
  };

  if (loading) {
    return (
      <div 
        className="relative w-full h-[400px] rounded-xl overflow-hidden shadow-2xl flex items-center justify-center"
        style={{ 
          borderColor: currentTheme.border, 
          borderWidth: '3px',
          backgroundColor: currentTheme.card 
        }}
      >
        <p style={{ color: currentTheme.text }}>Fotoğraflar yükleniyor...</p>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div 
        className="relative w-full h-[400px] rounded-xl overflow-hidden shadow-2xl flex items-center justify-center"
        style={{ 
          borderColor: currentTheme.border, 
          borderWidth: '3px',
          backgroundColor: currentTheme.card 
        }}
      >
        <p style={{ color: currentTheme.text }}>Henüz fotoğraf eklenmemiş</p>
      </div>
    );
  }

  return (
    <div 
      className="relative w-full h-[400px] rounded-xl overflow-hidden shadow-2xl group"
      style={{ borderColor: currentTheme.border, borderWidth: '3px' }}
    >
      {/* Image */}
      <div className="relative w-full h-full">
        <img
          src={`http://localhost:8000${photos[currentIndex].image_url}`}
          alt={photos[currentIndex].title}
          className="w-full h-full object-cover transition-opacity duration-500"
        />
        <div 
          className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent"
        >
          <p className="text-white text-lg font-semibold">
            {photos[currentIndex].title}
          </p>
        </div>
      </div>

      {/* Navigation Buttons */}
      <Button
        variant="ghost"
        size="icon"
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <ChevronRight className="h-6 w-6" />
      </Button>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
        {photos.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentIndex ? 'bg-white w-8' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default ImageSlider;