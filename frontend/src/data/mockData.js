export const mockAnnouncements = [
  {
    id: 1,
    date: '25.10.2025',
    title: 'RESMİ TATİL',
    content: "Rektörlük'ten gelen yazıya göre Resmi Tatillere denk gelen dersler işlenmeyecek ve telafisi de yapılmayacaktır. Bu hafta Cumhuriyet Bayramı tatili 28.Ekim Salı Öğleden Sonra ve 29 Ekim Çarşamba gününe denk gelmektedir. Dolayısı ile benim derslerden İnt.Tab. Programlama dersi bu aralığa denk geldiği için işlenmeyecektir, telafisi de yapılmayacaktır.",
    type: 'department'
  },
  {
    id: 2,
    date: '25.10.2025',
    title: 'ÖĞRENCİ PROJELERİ DUYURUSU',
    content: 'TÜBİTAK 2209-A Üniversite Öğrencileri Araştırma Projeleri Destek programı ile 2209-B Üniversite Öğrencileri Sanayiye Yönelik Araştırma Projeleri Destek Programı 2025 yılı çağrısı 13 Ekim 2025 tarihi itibarıyla başvuruya açılmıştır. Başvurular 12 Kasım 2025 tarihine kadar devam edecektir.',
    type: 'course'
  },
  {
    id: 3,
    date: '20.10.2025',
    title: 'ÖDEV 2: MEM215-İNTERNET TABANLI PROGRAMLAMA',
    content: 'Son Teslim Tarihi: 27.10.2025-Pazar:24:00. https://www.w3schools.com/ sitesindeki HTML, CSS ve BOOSTRAP konularının her birinden 30 adet, toplamda 90 adet kısa uygulamaları yapın.',
    type: 'course'
  },
  {
    id: 4,
    date: '13.10.2025',
    title: 'KARİYER SÖYLEŞİLERİ ETKİNLİĞİ',
    content: 'Karabük Üniversitesi Kariyer Merkezi olarak, öğrencilerimizin iş dünyasını yakından tanımalarını desteklemek amacıyla düzenlediğimiz Kariyer Söyleşileri etkinlikleri başlıyor! Farklı sektörlerden alanında uzman yöneticilerin konuk olacağı bu etkinliklerde kariyer hikayeleri sizleri bekliyor.',
    type: 'event'
  }
];

export const mockCourses = [
  {
    id: 1,
    code: 'MEM215',
    name: 'İnternet Tabanlı Programlama',
    level: 'Lisans',
    semester: 'Güz',
    credits: 3,
    description: 'HTML, CSS, JavaScript ve Bootstrap kullanarak web uygulamaları geliştirme'
  },
  {
    id: 2,
    code: 'MKT705',
    name: 'Bilgisayar Destekli Mekanik Sistem Tasarımı',
    level: 'Yüksek Lisans',
    semester: 'Güz',
    credits: 3,
    description: 'CAD/CAE yazılımları kullanarak mekanik sistem modelleme ve analiz'
  },
  {
    id: 3,
    code: 'MKT824',
    name: 'Görüntü İşleme ve Programlama',
    level: 'Doktora',
    semester: 'Güz',
    credits: 3,
    description: 'Dijital görüntü işleme teknikleri ve algoritmalar'
  }
];

export const mockPublications = [
  {
    id: 1,
    title: 'Web-Based Engineering Education Platform',
    authors: 'İbrahim Çayıroğlu, et al.',
    year: 2024,
    type: 'article',
    journal: 'International Journal of Engineering Education',
    doi: '10.xxxx/ijee.2024.xxxxx'
  },
  {
    id: 2,
    title: 'Interactive Learning Tools for Mechanical Design',
    authors: 'İbrahim Çayıroğlu',
    year: 2023,
    type: 'project',
    conference: 'International Conference on Engineering Education',
    location: 'Istanbul, Turkey'
  }
];

export const mockGallery = [
  {
    id: 1,
    type: 'photo',
    url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800',
    title: 'Üniversite Kampüsü',
    date: '2024'
  },
  {
    id: 2,
    type: 'photo',
    url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800',
    title: 'Laboratuvar Çalışmaları',
    date: '2024'
  },
  {
    id: 3,
    type: 'photo',
    url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800',
    title: 'Öğrenci Projeleri',
    date: '2024'
  },
  {
    id: 4,
    type: 'photo',
    url: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800',
    title: 'Konferans Sunumu',
    date: '2023'
  },
  {
    id: 5,
    type: 'video',
    url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    title: 'Ders Tanıtım Videosu',
    date: '2024'
  }
];

export const mockCV = {
  name: 'Prof. Dr. İbrahim ÇAYIROĞLU',
  title: 'Bölüm Başkanı - Mekatronik Mühendisliği',
  photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
  education: [
    {
      degree: 'Doktora',
      field: 'Mekatronik Mühendisliği',
      university: 'Karabük Üniversitesi',
      year: '2015'
    },
    {
      degree: 'Yüksek Lisans',
      field: 'Makine Mühendisliği',
      university: 'Karabük Üniversitesi',
      year: '2010'
    }
  ],
  experience: [
    {
      position: 'Bölüm Başkanı',
      department: 'Mekatronik Mühendisliği',
      institution: 'Karabük Üniversitesi',
      startYear: '2020',
      endYear: 'Halen'
    }
  ],
  contact: {
    email: 'icayiroglu@karabuk.edu.tr',
    phone: '+90 370 418 7440',
    office: 'Mühendislik Fakültesi'
  }
};