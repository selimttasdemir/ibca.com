import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { useToast } from '../hooks/use-toast';
import { 
  FileText, 
  BookOpen, 
  Image as ImageIcon, 
  Plus,
  Edit,
  Trash2,
  Upload
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';

const AdminDashboard = () => {
  const { t } = useLanguage();
  const { currentTheme } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('announcements');

  if (!isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  const handleSave = (type) => {
    toast({
      title: 'Başarılı',
      description: `${type} kaydedildi!`,
    });
  };

  const AnnouncementManager = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold" style={{ color: currentTheme.text }}>
          {t('admin.announcements')}
        </h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button style={{ backgroundColor: currentTheme.accent }}>
              <Plus className="h-4 w-4 mr-2" />
              {t('admin.addNew')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Yeni Duyuru Ekle</DialogTitle>
            </DialogHeader>
            <form className="space-y-4">
              <div>
                <Label>Başlık</Label>
                <Input placeholder="Duyuru başlığı..." />
              </div>
              <div>
                <Label>İçerik</Label>
                <Textarea rows={6} placeholder="Duyuru içeriği..." />
              </div>
              <div>
                <Label>Tip</Label>
                <select className="w-full p-2 border rounded">
                  <option value="department">Bölüm</option>
                  <option value="course">Ders</option>
                  <option value="event">Etkinlik</option>
                </select>
              </div>
              <Button type="button" onClick={() => handleSave('Duyuru')} className="w-full">
                {t('admin.save')}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} style={{ backgroundColor: currentTheme.card, borderColor: currentTheme.border }}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-bold" style={{ color: currentTheme.text }}>Duyuru Başlığı {i}</h3>
                  <p className="text-sm mt-1" style={{ color: currentTheme.text, opacity: 0.7 }}>Duyuru içeriği...</p>
                </div>
                <div className="flex space-x-2">
                  <Button size="icon" variant="ghost">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost">
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const CourseManager = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold" style={{ color: currentTheme.text }}>
          {t('admin.manageCourses')}
        </h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button style={{ backgroundColor: currentTheme.accent }}>
              <Plus className="h-4 w-4 mr-2" />
              {t('admin.addNew')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Yeni Ders Ekle</DialogTitle>
            </DialogHeader>
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Ders Kodu</Label>
                  <Input placeholder="MEM215" />
                </div>
                <div>
                  <Label>Kredi</Label>
                  <Input type="number" placeholder="3" />
                </div>
              </div>
              <div>
                <Label>Ders Adı</Label>
                <Input placeholder="İnternet Tabanlı Programlama" />
                </div>
              <div>
                <Label>Açıklama</Label>
                <Textarea rows={4} placeholder="Ders açıklaması..." />
              </div>
              <Button type="button" onClick={() => handleSave('Ders')} className="w-full">
                {t('admin.save')}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );

  const GalleryManager = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold" style={{ color: currentTheme.text }}>
          {t('admin.manageGallery')}
        </h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button style={{ backgroundColor: currentTheme.accent }}>
              <Upload className="h-4 w-4 mr-2" />
              Yükle
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Fotoğraf/Video Yükle</DialogTitle>
            </DialogHeader>
            <form className="space-y-4">
              <div>
                <Label>Başlık</Label>
                <Input placeholder="Fotoğraf başlığı..." />
              </div>
              <div>
                <Label>Dosya</Label>
                <Input type="file" accept="image/*,video/*" />
              </div>
              <Button type="button" onClick={() => handleSave('Galeri öğesi')} className="w-full">
                Yükle
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="overflow-hidden">
            <div className="aspect-square bg-gray-200" />
            <CardContent className="p-2">
              <div className="flex justify-between items-center">
                <span className="text-xs truncate">Fotoğraf {i}</span>
                <Button size="icon" variant="ghost" className="h-6 w-6">
                  <Trash2 className="h-3 w-3 text-red-500" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen py-8" style={{ backgroundColor: currentTheme.background }}>
      <div className="container mx-auto px-4">
        {/* Header */}
        <div 
          className="mb-8 p-6 rounded-xl shadow-lg"
          style={{ 
            backgroundColor: currentTheme.card,
            borderColor: currentTheme.border,
            borderWidth: '2px'
          }}
        >
          <h1 className="text-3xl font-bold" style={{ color: currentTheme.primary }}>
            {t('admin.dashboard')}
          </h1>
          <p className="text-sm mt-2" style={{ color: currentTheme.text, opacity: 0.7 }}>
            Hoş geldiniz, {user?.username}
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full md:w-auto grid-cols-3 mb-6">
            <TabsTrigger value="announcements" className="flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Duyurular
            </TabsTrigger>
            <TabsTrigger value="courses" className="flex items-center">
              <BookOpen className="h-4 w-4 mr-2" />
              Dersler
            </TabsTrigger>
            <TabsTrigger value="gallery" className="flex items-center">
              <ImageIcon className="h-4 w-4 mr-2" />
              Galeri
            </TabsTrigger>
          </TabsList>

          <TabsContent value="announcements">
            <AnnouncementManager />
          </TabsContent>

          <TabsContent value="courses">
            <CourseManager />
          </TabsContent>

          <TabsContent value="gallery">
            <GalleryManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;