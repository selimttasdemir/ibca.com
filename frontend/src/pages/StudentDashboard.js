/**
 * Öğrenci Ödev Yükleme Sayfası
 * 
 * Öğrenciler sadece derslerine ödev yükleyebilir.
 * Basit ve kullanımı kolay arayüz.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Alert, AlertDescription } from '../components/ui/alert';
import { 
  Upload, 
  LogOut,
  FileText,
  CheckCircle,
  AlertCircle,
  BookOpen
} from 'lucide-react';
import api from '../services/api';
import { useToast } from '../hooks/use-toast';

export default function StudentDashboard() {
  const { student, studentLogout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [homeworkAssignments, setHomeworkAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState('');
  const [coursesWithAssignments, setCoursesWithAssignments] = useState({});
  const [file, setFile] = useState(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [myHomeworks, setMyHomeworks] = useState([]);

  useEffect(() => {
    // Öğrenci yoksa login sayfasına yönlendir
    if (!student) {
      navigate('/student-login');
      return;
    }

    loadCourses();
    loadMyHomeworks();
    loadAllAssignments();
  }, [student, navigate]);

  useEffect(() => {
    // Ders seçildiğinde o dersin ödevlerini yükle
    if (selectedCourse) {
      loadHomeworkAssignments(selectedCourse);
    } else {
      setHomeworkAssignments([]);
      setSelectedAssignment('');
    }
  }, [selectedCourse]);

  const loadCourses = async () => {
    try {
      const response = await api.get('/courses');
      const allCourses = response.data.filter(c => c.is_active);
      
      // Eğer student'ta enrolled_courses varsa sadece onları göster
      if (student.enrolled_courses && student.enrolled_courses.length > 0) {
        const enrolledCourses = allCourses.filter(course => 
          student.enrolled_courses.includes(course.id)
        );
        setCourses(enrolledCourses);
      } else {
        // Eski öğrenciler için tüm dersleri göster
        setCourses(allCourses);
      }
    } catch (error) {
      console.error('Ders yükleme hatası:', error);
    }
  };

  const loadMyHomeworks = async () => {
    try {
      const response = await api.get(`/homeworks/my-homeworks/${student.student_number}`);
      setMyHomeworks(response.data);
    } catch (error) {
      console.error('Ödev geçmişi yükleme hatası:', error);
    }
  };

  const loadAllAssignments = async () => {
    try {
      const response = await api.get('/homework-assignments?is_active=true');
      const now = new Date();
      
      // Her ders için aktif ödev sayısını hesapla
      const assignmentsByCourse = {};
      response.data.forEach(assignment => {
        const startDate = new Date(assignment.start_date);
        const dueDate = new Date(assignment.due_date);
        
        // Sadece aktif ve süresi geçmemiş ödevleri say
        if (now >= startDate && now <= dueDate && assignment.is_active) {
          if (!assignmentsByCourse[assignment.course_id]) {
            assignmentsByCourse[assignment.course_id] = [];
          }
          assignmentsByCourse[assignment.course_id].push(assignment);
        }
      });
      
      setCoursesWithAssignments(assignmentsByCourse);
    } catch (error) {
      console.error('Tüm ödev atamaları yükleme hatası:', error);
    }
  };

  const loadHomeworkAssignments = async (courseId) => {
    try {
      const response = await api.get(`/homework-assignments?course_id=${courseId}&is_active=true`);
      const now = new Date();
      
      // Sadece aktif ve süresi geçmemiş ödevleri filtrele
      const activeAssignments = response.data.filter(assignment => {
        const startDate = new Date(assignment.start_date);
        const dueDate = new Date(assignment.due_date);
        return now >= startDate && now <= dueDate && assignment.is_active;
      });
      
      setHomeworkAssignments(activeAssignments);
      
      // Eğer sadece bir ödev varsa otomatik seç
      if (activeAssignments.length === 1) {
        setSelectedAssignment(activeAssignments[0].id.toString());
      }
    } catch (error) {
      console.error('Ödev atamaları yükleme hatası:', error);
      setHomeworkAssignments([]);
    }
  };

  const formatDateTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // PDF kontrolü
      if (selectedFile.type !== 'application/pdf') {
        toast({
          title: "Hata",
          description: "Sadece PDF dosyası yükleyebilirsiniz!",
          variant: "destructive"
        });
        e.target.value = '';
        return;
      }
      
      // Dosya boyutu kontrolü (3MB)
      if (selectedFile.size > 3 * 1024 * 1024) {
        toast({
          title: "Hata",
          description: "Dosya boyutu 3MB'dan küçük olmalıdır! PDF kalitesini düşürerek tekrar deneyin.",
          variant: "destructive"
        });
        e.target.value = '';
        return;
      }
      
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedCourse) {
      toast({
        title: "Hata",
        description: "Lütfen bir ders seçin!",
        variant: "destructive"
      });
      return;
    }

    if (!selectedAssignment) {
      toast({
        title: "Hata",
        description: "Lütfen bir ödev seçin!",
        variant: "destructive"
      });
      return;
    }
    
    if (!file) {
      toast({
        title: "Hata",
        description: "Lütfen bir dosya seçin!",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('student_number', student.student_number);
      formData.append('student_name', student.full_name);
      formData.append('course_id', selectedCourse);
      formData.append('assignment_id', selectedAssignment);
      formData.append('notes', notes);
      formData.append('file', file);

      await api.post('/homeworks', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast({
        title: "Başarılı!",
        description: "Ödeviniz başarıyla yüklendi.",
      });

      // Formu temizle
      setSelectedCourse('');
      setSelectedAssignment('');
      setFile(null);
      setNotes('');
      document.getElementById('file-input').value = '';
      
      // Ödev geçmişini yenile
      loadMyHomeworks();
      
    } catch (error) {
      console.error('Ödev yükleme hatası:', error);
      toast({
        title: "Hata",
        description: error.response?.data?.detail || "Ödev yüklenirken bir hata oluştu!",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    studentLogout();
    navigate('/student-login');
  };

  if (!student) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Ödev Yükleme Sistemi
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {student.full_name} - {student.student_number}
              </p>
              {student.enrolled_courses && student.enrolled_courses.length > 0 && (
                <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                  <BookOpen className="inline-block mr-1" size={14} />
                  {student.enrolled_courses.length} derse kayıtlısınız
                </p>
              )}
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2" size={16} />
              Çıkış
            </Button>
          </div>
        </div>

        {/* Ödev Yükleme Usulleri */}
        <Alert className="mb-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-900 dark:text-blue-100">
            <strong className="font-semibold text-lg">ÖDEV YÜKLEME USULLERİ:</strong>
            <ul className="list-disc ml-5 mt-2 space-y-2 text-sm">
              <li><strong>Dosya Formatı:</strong> Sadece PDF formatında dosya yükleyebilirsiniz</li>
              <li><strong>Dosya Boyutu:</strong> Maksimum 3 MB (10 MB değil!). Boyut aşıyorsa PDF'nin ayarlarından kalitesini düşürerek yükleyin.</li>
              <li><strong>Dosya Adı:</strong> OgrenciNo_DersKodu_Tarih.pdf formatında olmalıdır (Örnek: 2025000001_MKT101_04112024.pdf)</li>
              <li><strong>Her ders için sadece bir ödev yükleyebilirsiniz.</strong> Yüklediğiniz ödevler "Yüklenen Ödevlerim" bölümünde görünecektir.</li>
              
              <li className="mt-3"><strong className="text-red-700 dark:text-red-400">ŞİFRE UNUTMA:</strong> Şifrenizi UNUTURSANIZ numaranızın 5. rakamını değiştirip tekrar kaydolun. Listede aramak durumunda kalacağımız için <span className="font-bold">(-1p)</span> olur.</li>
              
              <li><strong className="text-red-700 dark:text-red-400">YANLIŞ ÖDEV YÜKLEME:</strong> Yanlış ödev yüklerseniz, yenisini eskisinin üzerine yükleyin. Yanlış numaraya yüklenen ödevden puan alamazsınız. Eğer o numaradaki ödevi tamamen kaldırmak istiyorsanız boş bir sayfaya "İPTAL" yazıp onu yükleyin.</li>
              
              <li><strong className="text-red-700 dark:text-red-400">İSİM YAZIMI:</strong> İsimlerinizi Otomasyon sisteminde yazıldığı şekilde tam olarak yazın. Not verirken listede aramak durumunda kalınmasın. <span className="font-bold">(-1p)</span></li>
              
              <li><strong>EKRAN GÖRÜNTÜLERİ:</strong> Modeli yakından ve dataları anlaşılır şekilde yükleyin. Ne olduğu belirsiz, ekran ortasında küçücük bir çizim not alamaz. Mümkün olduğunca kenarlardaki gereksiz alanları kırpın.</li>
              
              <li><strong>RESİM YERLEŞTİRME:</strong> Resimleri yerleştirirken yanlardan ve üstten çekmeyin. Köşelerden çekerek küçültün. Orantısı bozulmasın.</li>
              
              <li className="mt-3">
                <strong>DETAYLI BİLGİ:</strong> Ödevlerin sayfalarını hazırlarken detaylı usullere dikkat ediniz:<br/>
                <a 
                  href="https://ibrahimcayiroglu.com/Dokumanlar/OdevYuklemeUsulleri.pdf" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 font-semibold"
                >
                  📄 Ödev Yükleme Usulleri PDF (Tıklayın)
                </a>
              </li>
            </ul>
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Ödev Yükleme Formu */}
          <Card className="shadow-xl">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-xl">
              <CardTitle className="flex items-center">
                <Upload className="mr-2" size={20} />
                Yeni Ödev Yükle
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Ders Seçimi */}
                <div className="space-y-2">
                  <Label htmlFor="course">Ders Seçin *</Label>
                  <select
                    id="course"
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
                    required
                  >
                    <option value="">-- Ders Seçin --</option>
                    {courses.map((course) => {
                      const hasActiveHomework = coursesWithAssignments[course.id] && coursesWithAssignments[course.id].length > 0;
                      return (
                        <option 
                          key={course.id} 
                          value={course.id}
                          disabled={!hasActiveHomework}
                        >
                          {course.code} - {course.name} {!hasActiveHomework ? '(Aktif ödev yok)' : `(${coursesWithAssignments[course.id].length} ödev)`}
                        </option>
                      );
                    })}
                  </select>
                  {courses.length > 0 && Object.keys(coursesWithAssignments).length === 0 && (
                    <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-2">
                      ⚠️ Şu anda hiçbir dersinizde aktif ödev bulunmuyor.
                    </p>
                  )}
                </div>

                {/* Ödev Seçimi */}
                {selectedCourse && (
                  <div className="space-y-2">
                    <Label htmlFor="assignment">Ödev Seçin *</Label>
                    {homeworkAssignments.length > 0 ? (
                      <>
                        <select
                          id="assignment"
                          value={selectedAssignment}
                          onChange={(e) => setSelectedAssignment(e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
                          required
                        >
                          <option value="">-- Ödev Seçin --</option>
                          {homeworkAssignments.map((assignment) => (
                            <option key={assignment.id} value={assignment.id}>
                              {assignment.title}
                            </option>
                          ))}
                        </select>
                        
                        {/* Seçilen Ödev Detayı */}
                        {selectedAssignment && (
                          <>
                            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                              {(() => {
                                const assignment = homeworkAssignments.find(a => a.id.toString() === selectedAssignment);
                                return assignment ? (
                                  <div className="text-sm">
                                    <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                                      {assignment.title}
                                    </p>
                                    {assignment.description && (
                                      <p className="text-blue-800 dark:text-blue-200 mb-2">
                                        {assignment.description}
                                      </p>
                                    )}
                                    <div className="space-y-1 text-xs text-blue-700 dark:text-blue-300">
                                      <p>📅 <strong>Başlangıç:</strong> {formatDateTime(assignment.start_date)}</p>
                                      <p>⏰ <strong>Son Teslim:</strong> {formatDateTime(assignment.due_date)}</p>
                                    </div>
                                  </div>
                                ) : null;
                              })()}
                            </div>
                            
                            {/* Tekrar Yükleme Uyarısı */}
                            <Alert className="mt-2 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800">
                              <AlertCircle className="h-4 w-4 text-orange-600" />
                              <AlertDescription className="text-orange-900 dark:text-orange-100 text-xs">
                                <strong>⚠️ Dikkat:</strong> Bu ödeve daha önce dosya yüklediyseniz, yeni yükleme eskisinin üzerine yazacaktır. Eski dosyanız silinecektir.
                              </AlertDescription>
                            </Alert>
                          </>
                        )}
                      </>
                    ) : (
                      <Alert className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                        <AlertDescription className="text-yellow-900 dark:text-yellow-100">
                          Bu ders için şu anda aktif ödev bulunmuyor.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}

                {/* Dosya Seçimi */}
                <div className="space-y-2">
                  <Label htmlFor="file-input">Ödev Dosyası (PDF) *</Label>
                  <Input
                    id="file-input"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    required
                    disabled={!selectedAssignment}
                  />
                  {file && (
                    <div className="flex items-center text-sm text-green-600 dark:text-green-400">
                      <CheckCircle size={16} className="mr-1" />
                      {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </div>
                  )}
                  {!selectedAssignment && selectedCourse && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Dosya seçmek için önce bir ödev seçin
                    </p>
                  )}
                </div>

                {/* Notlar */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Notlar (Opsiyonel)</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Ödeve dair notlarınız..."
                    rows={3}
                  />
                </div>

                {/* Yükle Butonu */}
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  disabled={loading || !selectedAssignment}
                >
                  {loading ? (
                    <>Yükleniyor...</>
                  ) : (
                    <>
                      <Upload className="mr-2" size={16} />
                      Ödev Yükle
                    </>
                  )}
                </Button>
                
                {!selectedAssignment && selectedCourse && homeworkAssignments.length === 0 && (
                  <p className="text-sm text-center text-yellow-600 dark:text-yellow-400">
                    Bu ders için aktif ödev olmadığı için yükleme yapamazsınız
                  </p>
                )}
              </form>
            </CardContent>
          </Card>

          {/* Yüklenen Ödevler */}
          <Card className="shadow-xl">
            <CardHeader className="bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-t-xl">
              <CardTitle className="flex items-center">
                <FileText className="mr-2" size={20} />
                Yüklenen Ödevlerim ({myHomeworks.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {myHomeworks.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {myHomeworks.map((homework) => (
                    <div
                      key={homework.id}
                      className="border rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <BookOpen className="mr-2 text-blue-600" size={16} />
                            <span className="font-semibold text-sm">
                              {homework.course_code} - {homework.course_name}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {new Date(homework.upload_date).toLocaleString('tr-TR')}
                          </p>
                          {homework.notes && (
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 italic">
                              Not: {homework.notes}
                            </p>
                          )}
                        </div>
                        <a
                          href={`http://localhost:8000${homework.file_url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-xs underline ml-2"
                        >
                          Görüntüle
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <FileText size={48} className="mx-auto mb-3 opacity-30" />
                  <p>Henüz ödev yüklemediniz</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Kayıtlı Dersler */}
        <Card className="shadow-xl mt-6">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-xl">
            <CardTitle className="flex items-center">
              <BookOpen className="mr-2" size={20} />
              Kayıtlı Derslerim ({courses.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <h3 className="font-semibold text-blue-600 dark:text-blue-400">
                    {course.code}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {course.name}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                      {course.credits} Kredi
                    </span>
                    <span className="text-xs text-gray-500">
                      {course.semester}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
