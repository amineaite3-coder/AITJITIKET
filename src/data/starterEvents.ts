import { EventItem } from '../types';

export const HERO_IMAGE_PATH = '/src/assets/images/hero_stadium_night_1795176387951.jpg';

export const GALLERY_PRESETS = [
  {
    label: 'Football Stadium',
    url: '/src/assets/images/event_football_match_1795176387489.jpg',
  },
  {
    label: 'Arena Concert',
    url: '/src/assets/images/event_concert_arena_1795176387502.jpg',
  },
  {
    label: 'Open-Air Festival',
    url: '/src/assets/images/event_festival_stage_1795176387464.jpg',
  },
  {
    label: 'VIP Hospitality Suite',
    url: '/src/assets/images/event_vip_suite_1795176387829.jpg',
  },
  {
    label: 'Grand Prix Motorsport',
    url: '/src/assets/images/event_motorsport_gp_1795176387139.jpg',
  },
  {
    label: 'Night Stadium Aerial',
    url: '/src/assets/images/hero_stadium_night_1795176387951.jpg',
  },
];

export const STARTER_EVENTS: Omit<EventItem, 'createdAt' | 'updatedAt'>[] = [
  {
    id: 'starter-ucl-final',
    title: 'Finale Ligue des Champions UEFA',
    titleAr: 'نهائي دوري أبطال أوروبا',
    category: 'Football',
    date: '30 Mai 2027',
    venue: 'Estadio Metropolitano',
    city: 'Madrid',
    country: 'Espagne',
    descriptionFr:
      "Le rendez-vous annuel majeur du football européen. Soumettez votre demande de recherche pour connaître les catégories et options envisageables selon le marché.",
    descriptionEn:
      'The flagship fixture of European club football. Submit a research request to explore possible seating categories and market options.',
    descriptionAr:
      'الحدث الأبرز في كرة القدم الأوروبية. أرسل طلب البحث الخاص بك لدراسة الفئات والخيارات الممكنة حسب السوق.',
    imageUrl: '/src/assets/images/event_football_match_1795176387489.jpg',
    published: true,
    featured: true,
    isStarter: true,
  },
  {
    id: 'starter-paris-arena-concert',
    title: 'Tournée Internationale — Concert Arena Paris',
    titleAr: 'جولة دولية — حفل أرينا باريس',
    category: 'Concerts',
    date: '18 Juin 2027',
    venue: 'Paris La Défense Arena',
    city: 'Paris',
    country: 'France',
    descriptionFr:
      "Une soirée exceptionnelle dans la plus grande salle couverte d'Europe. Indiquez vos préférences de placement (Fosse Or, Carré Or, Catégorie 1) pour une recherche sur mesure.",
    descriptionEn:
      "An exceptional evening at Europe's largest indoor arena. Share your seating preferences (Golden Circle, Category 1, VIP) for tailored research.",
    descriptionAr:
      'أمسية موسيقية استثنائية في أكبر قاعة مغطاة في أوروبا. حدد تفضيلاتك للجلوس لإجراء بحث مخصص.',
    imageUrl: '/src/assets/images/event_concert_arena_1795176387502.jpg',
    published: true,
    featured: true,
    isStarter: true,
  },
  {
    id: 'starter-europe-summer-festival',
    title: 'Festival International de Musique — Pass Weekend',
    titleAr: 'المهرجان الدولي للموسيقى — تذكرة نهاية الأسبوع',
    category: 'Festivals',
    date: '16–18 Juillet 2027',
    venue: 'Parc des Expositions International',
    city: 'Boom / Anvers',
    country: 'Belgique',
    descriptionFr:
      "Trois jours de performances internationales en plein air. Notre équipe étudie les options de pass journaliers, pass weekend et accès confort.",
    descriptionEn:
      'Three days of international open-air performances. Our team researches single-day passes, full weekend passes, and comfort access options.',
    descriptionAr:
      'ثلاثة أيام من العروض الدولية في الهواء الطلق. يدرس فريقنا خيارات التذاكر اليومية وتذاكر نهاية الأسبوع.',
    imageUrl: '/src/assets/images/event_festival_stage_1795176387464.jpg',
    published: true,
    featured: true,
    isStarter: true,
  },
  {
    id: 'starter-night-grand-prix',
    title: 'Grand Prix Nocturne — Formule Internationale',
    titleAr: 'سباق الجائزة الكبرى الليلي',
    category: 'Sports',
    date: '05 Décembre 2027',
    venue: 'Circuit International Yas Marina',
    city: 'Abou Dabi',
    country: 'Émirats Arabes Unis',
    descriptionFr:
      "Vivez la finale de la saison sous les projecteurs. Recherche personnalisée pour tribunes principales, virages stratégiques et accès paddock.",
    descriptionEn:
      'Experience the season finale under the floodlights. Bespoke research for main grandstands, strategic corners, and hospitality lounges.',
    descriptionAr:
      'عش ختام الموسم تحت الأضواء الكاشفة. بحث مخصص للمدرجات الرئيسية وصالات الضيافة.',
    imageUrl: '/src/assets/images/event_motorsport_gp_1795176387139.jpg',
    published: true,
    featured: true,
    isStarter: true,
  },
  {
    id: 'starter-vip-hospitality-box',
    title: 'Loge Privée & Hospitalité VIP — Matchs Européens',
    titleAr: 'مقصورة خاصة وضيافة كبار الشخصيات — مباريات أوروبية',
    category: 'VIP Experiences',
    date: 'Saison 2026–2027',
    venue: 'Grands Stades Européens (Londres, Madrid, Paris)',
    city: 'Europe',
    country: 'International',
    descriptionFr:
      "Accès salon privé, vue panoramique sur le terrain et accueil dédié pour vos déplacements professionnels ou privés.",
    descriptionEn:
      'Private lounge access, panoramic pitch views, and dedicated hosting options researched for corporate or private trips.',
    descriptionAr:
      'دخول إلى الصالات الخاصة وإطلالة بانورامية على الملعب لرحلاتكم الخاصة أو المهنية.',
    imageUrl: '/src/assets/images/event_vip_suite_1795176387829.jpg',
    published: true,
    featured: false,
    isStarter: true,
  },
  {
    id: 'starter-international-gala-match',
    title: 'Affiche Internationale — Derby Classique',
    titleAr: 'مباراة دولية كبرى — ديربي كلاسيكي',
    category: 'International Events',
    date: '14 Avril 2027',
    venue: 'Santiago Bernabéu',
    city: 'Madrid',
    country: 'Espagne',
    descriptionFr:
      "L'une des affiches les plus demandées du calendrier mondial. Soumettez votre budget et votre nombre de places pour une étude personnalisée.",
    descriptionEn:
      'One of the most sought-after fixtures on the global calendar. Share your budget and group size for an individual market search.',
    descriptionAr:
      'واحدة من أكثر المباريات طلباً على الساحة العالمية. شاركنا ميزانيتك وعدد التذاكر لإجراء دراسة مخصصة.',
    imageUrl: '/src/assets/images/hero_stadium_night_1795176387951.jpg',
    published: true,
    featured: false,
    isStarter: true,
  },
];
