import { EventCategory, Language, RequestStatus } from '../types';

export interface TranslationDictionary {
  nav: {
    events: string;
    customRequest: string;
    howItWorks: string;
    admin: string;
    primaryCta: string;
  };
  hero: {
    kicker: string;
    headline: string;
    subheadline: string;
    optionALabel: string;
    optionATitle: string;
    optionADesc: string;
    optionACta: string;
    optionBLabel: string;
    optionBTitle: string;
    optionBDesc: string;
    optionBCta: string;
  };
  catalogue: {
    heading: string;
    subheading: string;
    allCategories: string;
    searchPlaceholder: string;
    featuredLabel: string;
    requestPriceBtn: string;
    viewDetailsBtn: string;
    noResults: string;
    noResultsCta: string;
    disclaimerShort: string;
    shareLabel: string;
    copyLink: string;
    linkCopied: string;
    shareMessagePrefix: string;
  };
  customSection: {
    heading: string;
    description: string;
    ctaButton: string;
    noteFree: string;
  };
  howItWorks: {
    heading: string;
    subheading: string;
    step1Title: string;
    step1Desc: string;
    step2Title: string;
    step2Desc: string;
    step3Title: string;
    step3Desc: string;
    researchTimeHeading: string;
    researchTimeText: string;
    researchTimeClarification: string;
  };
  disclaimer: {
    heading: string;
    body: string;
    secondaryNote: string;
    rules: string[];
  };
  form: {
    catalogTitle: string;
    customTitle: string;
    catalogSubtitle: string;
    customSubtitle: string;
    fullName: string;
    fullNamePlaceholder: string;
    email: string;
    emailPlaceholder: string;
    whatsapp: string;
    whatsappPlaceholder: string;
    eventName: string;
    eventNamePlaceholder: string;
    eventDate: string;
    eventDatePlaceholder: string;
    cityCountry: string;
    cityCountryPlaceholder: string;
    ticketQuantity: string;
    preferredCategory: string;
    preferredSeating: string;
    preferredSeatingPlaceholder: string;
    maxBudget: string;
    currency: string;
    additionalInfo: string;
    additionalInfoPlaceholder: string;
    submitBtn: string;
    submittingBtn: string;
    cancelBtn: string;
    freeObligationNotice: string;
    categories: string[];
    confirmationTitle: string;
    confirmationSubtitle: string;
    referenceLabel: string;
    copyReference: string;
    copied: string;
    confirmationFreeNote: string;
    confirmationTimeNote: string;
    closeBtn: string;
    errorRequired: string;
    errorSubmit: string;
  };
  footer: {
    tagline: string;
    conciergeNotice: string;
    rights: string;
    adminAccess: string;
  };
  categories: Record<EventCategory, string>;
  statuses: Record<RequestStatus, string>;
}

export const TRANSLATIONS: Record<Language, TranslationDictionary> = {
  fr: {
    nav: {
      events: 'Événements',
      customRequest: 'Demande sur mesure',
      howItWorks: 'Comment ça marche',
      admin: 'Admin',
      primaryCta: 'Demander un prix',
    },
    hero: {
      kicker: 'Service international de recherche et d’assistance billetterie',
      headline: 'Votre conciergerie billetterie pour les grands événements internationaux',
      subheadline:
        'AITJITIKET n’est pas un revendeur traditionnel. Soumettez votre demande gratuitement, notre équipe recherche les options envisageables selon le marché et vous présente une proposition personnalisée.',
      optionALabel: 'Option A',
      optionATitle: 'Parcourir notre sélection',
      optionADesc: 'Choisissez un événement ci-dessous et cliquez sur « Demander un prix ».',
      optionACta: 'Voir les événements',
      optionBLabel: 'Option B',
      optionBTitle: 'Événement non listé ?',
      optionBDesc: 'Demandez une recherche personnalisée pour n’importe quel concert, match ou festival.',
      optionBCta: 'Faire une demande personnalisée',
    },
    catalogue: {
      heading: 'Sélection d’événements internationaux',
      subheading:
        'Une sélection d’événements régulièrement recherchés par nos clients. La disponibilité n’est jamais garantie à l’avance.',
      allCategories: 'Tous',
      searchPlaceholder: 'Rechercher un événement, une ville, un stade...',
      featuredLabel: 'À la une',
      requestPriceBtn: 'DEMANDER UN PRIX',
      viewDetailsBtn: 'Détails',
      noResults: 'Aucun événement ne correspond à votre recherche dans cette sélection.',
      noResultsCta: 'Faire une demande personnalisée',
      disclaimerShort: 'Recherche personnalisée — disponibilité non garantie',
      shareLabel: 'Partager cet événement',
      copyLink: 'Copier le lien',
      linkCopied: 'Lien copié',
      shareMessagePrefix: 'Découvre cet événement sur AITJITIKET :',
    },
    customSection: {
      heading: 'VOUS CHERCHEZ UN AUTRE ÉVÉNEMENT ?',
      description:
        "Vous ne trouvez pas l'événement que vous recherchez sur notre site ? Pas de problème ! Envoyez-nous votre demande et notre équipe étudiera les possibilités pour vous aider à trouver des billets adaptés à vos préférences et à votre budget.",
      ctaButton: 'FAIRE UNE DEMANDE PERSONNALISÉE',
      noteFree: 'Demande gratuite et sans engagement. Aucun paiement requis avant votre accord sur une proposition.',
    },
    howItWorks: {
      heading: 'Comment fonctionne AITJITIKET',
      subheading: 'Un processus transparent en trois étapes, sans paiement anticipé et sans obligation d’achat.',
      step1Title: '01. Soumettez votre demande',
      step1Desc:
        'Indiquez l’événement souhaité (depuis notre sélection ou un événement libre), le nombre de places, vos préférences et votre budget maximum.',
      step2Title: '02. Recherche personnalisée',
      step2Desc:
        'Notre équipe étudie individuellement les options disponibles sur le marché selon vos critères. Aucune disponibilité n’est promise à l’avance.',
      step3Title: '03. Proposition & Décision',
      step3Desc:
        'Si une option correspond à vos attentes, nous vous transmettons une proposition claire via WhatsApp ou e-mail. Vous restez libre d’accepter ou de refuser.',
      researchTimeHeading: 'Délai estimé de recherche',
      researchTimeText:
        "Notre délai habituel de recherche et de préparation d'une proposition est de 24 à 48 heures, selon l'événement et les possibilités de disponibilité.",
      researchTimeClarification:
        'Ce délai correspond à une estimation pour la recherche et la préparation de proposition, et ne constitue pas un délai garanti de livraison de billets.',
    },
    disclaimer: {
      heading: 'Information importante sur la disponibilité',
      body: "Les événements présentés sur AITJITIKET constituent une sélection d'événements recherchés par nos clients. Vous pouvez également nous contacter pour tout autre événement. La disponibilité des billets n'est jamais garantie. Chaque demande fait l'objet d'une recherche personnalisée selon les possibilités du marché.",
      secondaryNote:
        "AITJITIKET est un service indépendant de recherche et d'assistance billetterie. Nous ne sommes ni organisateur officiel d'événements ni place de marché publique.",
      rules: [
        'La soumission d’une demande ne constitue jamais une réservation confirmée.',
        'Aucun paiement n’est demandé avant la confirmation d’une option et votre accord explicite.',
        'Les tarifs dépendent des possibilités réelles du marché au moment de la recherche.',
      ],
    },
    form: {
      catalogTitle: 'Demander un prix',
      customTitle: 'Faire une demande personnalisée',
      catalogSubtitle: 'Remplissez vos préférences pour cet événement. Demande gratuite et sans engagement.',
      customSubtitle: 'Indiquez l’événement, l’artiste ou l’équipe que vous recherchez. Notre équipe étudiera les possibilités.',
      fullName: 'Nom complet *',
      fullNamePlaceholder: 'Ex. Youssef Benali',
      email: 'Adresse e-mail *',
      emailPlaceholder: 'vous@exemple.com',
      whatsapp: 'Numéro WhatsApp *',
      whatsappPlaceholder: '+212 6 00 00 00 00 ou +33 6 00 00 00 00',
      eventName: "Nom de l'événement, artiste ou équipe *",
      eventNamePlaceholder: 'Ex. Real Madrid vs FC Barcelone, Coldplay Londres...',
      eventDate: 'Date ou période souhaitée *',
      eventDatePlaceholder: 'Ex. 15 Juin 2027 ou Été 2027',
      cityCountry: 'Ville et pays *',
      cityCountryPlaceholder: 'Ex. Paris, France ou Madrid, Espagne',
      ticketQuantity: 'Nombre de billets *',
      preferredCategory: 'Catégorie souhaitée *',
      preferredSeating: 'Zone / emplacement souhaité',
      preferredSeatingPlaceholder: 'Ex. Tribune latérale, Fosse Or, Places côte à côte...',
      maxBudget: 'Budget maximum par billet *',
      currency: 'Devise *',
      additionalInfo: 'Informations complémentaires',
      additionalInfoPlaceholder: 'Précisez toute exigence particulière (places ensemble, accessibilité, dates flexibles...).',
      submitBtn: 'Envoyer ma demande gratuite',
      submittingBtn: 'Envoi en cours...',
      cancelBtn: 'Annuler',
      freeObligationNotice:
        'Cette demande est 100 % gratuite et sans engagement. Soumettre ce formulaire ne constitue pas une réservation confirmée.',
      categories: [
        'Standard / Catégorie 3',
        'Catégorie 2',
        'Catégorie 1',
        'Carré Or / Fosse Or',
        'VIP / Hospitalité / Loge',
        'Flexible selon le meilleur rapport qualité-prix',
      ],
      confirmationTitle: 'Votre demande a bien été enregistrée',
      confirmationSubtitle:
        'Notre équipe de conciergerie a reçu votre dossier et va lancer une recherche personnalisée selon vos critères.',
      referenceLabel: 'Référence unique de votre demande',
      copyReference: 'Copier la référence',
      copied: 'Copié',
      confirmationFreeNote:
        'Rappel : cette demande est entièrement gratuite et sans obligation d’achat. Aucun paiement ne vous sera demandé avant votre accord sur une proposition précise.',
      confirmationTimeNote:
        "Notre délai habituel de recherche et de préparation d'une proposition est de 24 à 48 heures, selon l'événement et les possibilités de disponibilité.",
      closeBtn: 'Retour au site',
      errorRequired: 'Veuillez renseigner tous les champs obligatoires.',
      errorSubmit: "Impossible d'enregistrer votre demande pour le moment. Veuillez réessayer.",
    },
    footer: {
      tagline: 'Service international de conciergerie et de recherche billetterie sur mesure.',
      conciergeNotice:
        'Service indépendant de recherche et d’assistance. Non affilié aux organisateurs officiels d’événements.',
      rights: 'AITJITIKET. Tous droits réservés.',
      adminAccess: 'Espace Administrateur',
    },
    categories: {
      Football: 'Football',
      Concerts: 'Concerts',
      Festivals: 'Festivals',
      Sports: 'Sports',
      'International Events': 'Événements Internationaux',
      'VIP Experiences': 'Expériences VIP',
    },
    statuses: {
      'New Request': 'Nouvelle demande',
      'Under Research': 'En cours d’étude',
      'Searching for Options': 'Recherche d’options',
      'Offer Available': 'Offre disponible',
      'Awaiting Customer Decision': 'En attente de décision',
      'Payment Pending': 'Paiement en attente',
      Confirmed: 'Confirmée',
      Completed: 'Terminée',
      Unavailable: 'Indisponible',
      Cancelled: 'Annulée',
    },
  },
  en: {
    nav: {
      events: 'Events',
      customRequest: 'Custom Request',
      howItWorks: 'How It Works',
      admin: 'Admin',
      primaryCta: 'Request a Price',
    },
    hero: {
      kicker: 'International Ticket Research & Concierge Assistance',
      headline: 'Bespoke ticket research for major international events',
      subheadline:
        'AITJITIKET is not a traditional ticket reseller or marketplace. Submit your request free of charge, our team researches market options tailored to your preferences, and contacts you with a personalized proposal.',
      optionALabel: 'Option A',
      optionATitle: 'Browse Curated Events',
      optionADesc: 'Select an event below and click "Request a Price" to submit your criteria.',
      optionACta: 'Explore Events',
      optionBLabel: 'Option B',
      optionBTitle: 'Event Not Listed?',
      optionBDesc: 'Request a custom search for any concert, football match, festival, or VIP experience.',
      optionBCta: 'Submit a Custom Request',
    },
    catalogue: {
      heading: 'Selected International Events',
      subheading:
        'A curated selection of events frequently requested by our clients. Ticket availability is never guaranteed in advance.',
      allCategories: 'All',
      searchPlaceholder: 'Search an event, city, or venue...',
      featuredLabel: 'Featured',
      requestPriceBtn: 'REQUEST A PRICE',
      viewDetailsBtn: 'Details',
      noResults: 'No events match your current filter in our selection.',
      noResultsCta: 'Submit a Custom Request',
      disclaimerShort: 'Individual research — availability not guaranteed',
      shareLabel: 'Share this event',
      copyLink: 'Copy link',
      linkCopied: 'Link copied',
      shareMessagePrefix: 'Check out this event on AITJITIKET:',
    },
    customSection: {
      heading: 'LOOKING FOR ANOTHER EVENT?',
      description:
        "Can't find the event you are looking for on our website? No problem! Send us your request and our team will study available options to help you find tickets suited to your preferences and budget.",
      ctaButton: 'REQUEST A CUSTOM REQUEST',
      noteFree: 'Free request with zero obligation. No payment is ever requested before you approve a confirmed option.',
    },
    howItWorks: {
      heading: 'How AITJITIKET Works',
      subheading: 'A transparent three-step concierge process with no upfront payment and no obligation.',
      step1Title: '01. Submit Your Request',
      step1Desc:
        'Choose an event from our selection or enter any unlisted event manually, along with ticket quantity, seating preferences, and maximum budget.',
      step2Title: '02. Individual Market Research',
      step2Desc:
        'Our team manually researches potential market options matching your request. Availability is never guaranteed beforehand.',
      step3Title: '03. Personalized Proposal',
      step3Desc:
        'If a suitable option is found, we send you a clear proposal via WhatsApp or email. You decide whether to proceed.',
      researchTimeHeading: 'Estimated Research Window',
      researchTimeText:
        'Our usual research and proposal preparation time is 24 to 48 hours, depending on the event and market availability.',
      researchTimeClarification:
        'This is an estimated research and offer preparation timeframe, NOT a guaranteed ticket delivery time.',
    },
    disclaimer: {
      heading: 'Important Availability Disclaimer',
      body: 'Events displayed on AITJITIKET represent a selection of events. You can also request tickets for events not listed on our website. Ticket availability is never guaranteed. Every request is individually researched according to available market options.',
      secondaryNote:
        'AITJITIKET is an independent ticket research and assistance concierge. We are neither an official event organizer nor a public ticket marketplace.',
      rules: [
        'Submitting a request does not constitute a confirmed booking.',
        'Payment is never requested before confirming an option and receiving your explicit agreement.',
        'Proposed pricing reflects actual market options identified during individual research.',
      ],
    },
    form: {
      catalogTitle: 'Request a Price',
      customTitle: 'Custom Ticket Request',
      catalogSubtitle: 'Share your seating and budget preferences for this event. Free and without obligation.',
      customSubtitle: 'Enter any artist, team, or international event. Our team will research possible options for you.',
      fullName: 'Full Name *',
      fullNamePlaceholder: 'e.g. Alex Martin',
      email: 'Email Address *',
      emailPlaceholder: 'you@example.com',
      whatsapp: 'WhatsApp Number *',
      whatsappPlaceholder: '+44 7000 000000 or +212 6 00 00 00 00',
      eventName: 'Artist, Team, or Event Name *',
      eventNamePlaceholder: 'e.g. Champions League Quarter-Final, Coldplay Paris...',
      eventDate: 'Event Date or Preferred Period *',
      eventDatePlaceholder: 'e.g. 15 June 2027 or Summer 2027',
      cityCountry: 'City and Country *',
      cityCountryPlaceholder: 'e.g. London, UK or Madrid, Spain',
      ticketQuantity: 'Number of Tickets *',
      preferredCategory: 'Preferred Ticket Category *',
      preferredSeating: 'Preferred Seating Area',
      preferredSeatingPlaceholder: 'e.g. Longside lower tier, Golden Circle, seats together...',
      maxBudget: 'Maximum Budget per Ticket *',
      currency: 'Currency *',
      additionalInfo: 'Additional Information / Requirements',
      additionalInfoPlaceholder: 'Any specific requirements (adjacent seats, accessibility, flexible dates...).',
      submitBtn: 'Submit Free Request',
      submittingBtn: 'Submitting...',
      cancelBtn: 'Cancel',
      freeObligationNotice:
        'This request is completely free and without obligation. Submitting this form does not constitute a confirmed booking.',
      categories: [
        'Standard / Category 3',
        'Category 2',
        'Category 1',
        'Golden Circle / Floor',
        'VIP / Hospitality Lounge',
        'Flexible for best available value',
      ],
      confirmationTitle: 'Your Request Has Been Received',
      confirmationSubtitle:
        'Our concierge team has logged your request and will begin individual market research based on your criteria.',
      referenceLabel: 'Unique Request Reference',
      copyReference: 'Copy Reference',
      copied: 'Copied',
      confirmationFreeNote:
        'Reminder: your request is free and carries no obligation. Payment is never requested before an option is confirmed and approved by you.',
      confirmationTimeNote:
        'Our usual research and proposal preparation time is 24 to 48 hours, depending on the event and market availability.',
      closeBtn: 'Return to Website',
      errorRequired: 'Please complete all required fields.',
      errorSubmit: 'Unable to submit your request right now. Please try again.',
    },
    footer: {
      tagline: 'International bespoke ticket research and concierge assistance.',
      conciergeNotice:
        'Independent ticket research and assistance service. Not affiliated with official event organizers.',
      rights: 'AITJITIKET. All rights reserved.',
      adminAccess: 'Admin Workspace',
    },
    categories: {
      Football: 'Football',
      Concerts: 'Concerts',
      Festivals: 'Festivals',
      Sports: 'Sports',
      'International Events': 'International Events',
      'VIP Experiences': 'VIP Experiences',
    },
    statuses: {
      'New Request': 'New Request',
      'Under Research': 'Under Research',
      'Searching for Options': 'Searching for Options',
      'Offer Available': 'Offer Available',
      'Awaiting Customer Decision': 'Awaiting Customer Decision',
      'Payment Pending': 'Payment Pending',
      Confirmed: 'Confirmed',
      Completed: 'Completed',
      Unavailable: 'Unavailable',
      Cancelled: 'Cancelled',
    },
  },
  ar: {
    nav: {
      events: 'الفعاليات',
      customRequest: 'طلب مخصص',
      howItWorks: 'كيف نعمل',
      admin: 'الإدارة',
      primaryCta: 'طلب سعر',
    },
    hero: {
      kicker: 'خدمة دولية للبحث والمساعدة في حجز التذاكر',
      headline: 'خدمة الكونسيرج المتخصصة للبحث عن تذاكر الفعاليات الدولية',
      subheadline:
        'AITJITIKET ليست منصة بيع تذاكر تقليدية. أرسل طلبك مجاناً، يقوم فريقنا بالبحث عن الخيارات المتاحة في السوق حسب تفضيلاتك وميزانيتك ويقدم لك عرضاً مخصصاً.',
      optionALabel: 'الخيار أ',
      optionATitle: 'تصفح الفعاليات المختارة',
      optionADesc: 'اختر الفعالية أدناه واضغط على «طلب سعر» لإرسال تفاصيلك.',
      optionACta: 'استعراض الفعاليات',
      optionBLabel: 'الخيار ب',
      optionBTitle: 'فعالية غير مدرجة؟',
      optionBDesc: 'اطلب بحثاً مخصصاً لأي حفل موسيقي أو مباراة كرة قدم أو مهرجان دولي.',
      optionBCta: 'تقديم طلب مخصص',
    },
    catalogue: {
      heading: 'مختارات من الفعاليات الدولية',
      subheading:
        'مجموعة مختارة من الفعاليات التي يبحث عنها عملاؤنا. توفر التذاكر غير مضمون مسبقاً أبداً.',
      allCategories: 'الكل',
      searchPlaceholder: 'ابحث عن فعالية، مدينة، أو ملعب...',
      featuredLabel: 'مميز',
      requestPriceBtn: 'طلب سعر',
      viewDetailsBtn: 'التفاصيل',
      noResults: 'لا توجد فعاليات مطابقة لبحثك في هذه القائمة.',
      noResultsCta: 'تقديم طلب مخصص',
      disclaimerShort: 'بحث مخصص — التوفر غير مضمون',
      shareLabel: 'مشاركة هذه الفعالية',
      copyLink: 'نسخ الرابط',
      linkCopied: 'تم نسخ الرابط',
      shareMessagePrefix: 'اكتشف هذه الفعالية على AITJITIKET:',
    },
    customSection: {
      heading: 'هل تبحث عن فعالية أخرى؟',
      description:
        'لم تجد الفعالية التي تبحث عنها على موقعنا؟ لا مشكلة! أرسل لنا طلبك وسيقوم فريقنا بدراسة الإمكانيات لمساعدتك في العثور على تذاكر تناسب تفضيلاتك وميزانيتك.',
      ctaButton: 'تقديم طلب مخصص',
      noteFree: 'الطلب مجاني تماماً وبدون أي التزام. لا يُطلب أي دفع قبل تأكيد الخيار وموافقتك.',
    },
    howItWorks: {
      heading: 'كيف تعمل منصة AITJITIKET',
      subheading: 'عملية شفافة من ثلاث خطوات، بدون دفع مسبق وبدون أي التزام بالشراء.',
      step1Title: '01. أرسل طلبك',
      step1Desc:
        'اختر فعالية من القائمة أو أدخل أي فعالية أخرى يدوياً مع عدد التذاكر، الفئة المفضلة، والميزانية القصوى.',
      step2Title: '02. بحث مخصص في السوق',
      step2Desc:
        'يقوم فريقنا بدراسة الخيارات الممكنة لكل طلب على حدة حسب ظروف السوق. لا نضمن التوفر مسبقاً.',
      step3Title: '03. عرض مخصص وقرارك الحر',
      step3Desc:
        'عند توفر خيار مناسب، نرسل لك عرضاً واضحاً عبر واتساب أو البريد الإلكتروني ولك كامل الحرية في القبول أو الرفض.',
      researchTimeHeading: 'المدة التقديرية للبحث',
      researchTimeText:
        'المدة المعتادة للبحث وإعداد عرض مخصص هي من 24 إلى 48 ساعة، وذلك حسب الفعالية وإمكانيات التوفر.',
      researchTimeClarification:
        'هذه مدة تقديرية للبحث وإعداد العرض فقط، وليست مدة مضمونة لتسليم التذاكر.',
    },
    disclaimer: {
      heading: 'تنبيه هام حول توفر التذاكر',
      body: 'تمثل الفعاليات المعروضة على AITJITIKET مجموعة مختارة من الفعاليات التي يبحث عنها عملاؤنا. يمكنك أيضاً التواصل معنا لأي فعالية أخرى غير مدرجة. توفر التذاكر غير مضمون أبداً، ويخضع كل طلب لبحث مخصص وفق إمكانيات السوق المتاحة.',
      secondaryNote:
        'AITJITIKET هي خدمة مستقلة للبحث والمساعدة في التذاكر، وليست منظماً رسمياً للفعاليات ولا سوقاً عاماً لإعادة البيع.',
      rules: [
        'تقديم الطلب لا يشكل حجزاً مؤكداً بأي حال من الأحوال.',
        'لا يُطلب أي دفع قبل تأكيد خيار التذاكر وموافقتك الصريحة.',
        'الأسعار تعتمد على الخيارات الفعلية المتاحة في السوق وقت البحث.',
      ],
    },
    form: {
      catalogTitle: 'طلب سعر',
      customTitle: 'تقديم طلب مخصص',
      catalogSubtitle: 'أدخل تفضيلاتك لهذه الفعالية. الطلب مجاني تماماً وبدون التزام.',
      customSubtitle: 'أدخل اسم الفنان أو الفريق أو الفعالية التي تبحث عنها وسيدرس فريقنا الإمكانيات المتاحة.',
      fullName: 'الاسم الكامل *',
      fullNamePlaceholder: 'مثال: يوسف بنعلي',
      email: 'البريد الإلكتروني *',
      emailPlaceholder: 'you@example.com',
      whatsapp: 'رقم الواتساب *',
      whatsappPlaceholder: '+212 6 00 00 00 00',
      eventName: 'اسم الفعالية أو الفنان أو الفريق *',
      eventNamePlaceholder: 'مثال: نهائي دوري أبطال أوروبا، حفل باريس...',
      eventDate: 'التاريخ أو الفترة المفضلة *',
      eventDatePlaceholder: 'مثال: 15 يونيو 2027 أو صيف 2027',
      cityCountry: 'المدينة والدولة *',
      cityCountryPlaceholder: 'مثال: مدريد، إسبانيا أو باريس، فرنسا',
      ticketQuantity: 'عدد التذاكر *',
      preferredCategory: 'الفئة المفضلة *',
      preferredSeating: 'منطقة الجلوس المفضلة',
      preferredSeatingPlaceholder: 'مثال: المدرج الجانبي، مقاعد متجاورة...',
      maxBudget: 'الميزانية القصوى لكل تذكرة *',
      currency: 'العملة *',
      additionalInfo: 'معلومات أو متطلبات إضافية',
      additionalInfoPlaceholder: 'اذكر أي متطلبات خاصة (مقاعد متجاورة، تواريخ مرنة...).',
      submitBtn: 'إرسال الطلب مجاناً',
      submittingBtn: 'جاري الإرسال...',
      cancelBtn: 'إلغاء',
      freeObligationNotice:
        'هذا الطلب مجاني 100% وبدون أي التزام. إرسال النموذج لا يعني تأكيد الحجز.',
      categories: [
        'عادي / الفئة 3',
        'الفئة 2',
        'الفئة 1',
        'الفئة الذهبية',
        'كبار الشخصيات / ضيافة VIP',
        'مرن حسب أفضل قيمة متاحة',
      ],
      confirmationTitle: 'تم تسجيل طلبك بنجاح',
      confirmationSubtitle:
        'استلم فريق الكونسيرج طلبك وسيبدأ البحث المخصص وفقاً للمعايير التي حددتها.',
      referenceLabel: 'الرقم المرجعي الفريد لطلبك',
      copyReference: 'نسخ المرجع',
      copied: 'تم النسخ',
      confirmationFreeNote:
        'تذكير: طلبك مجاني بالكامل وبدون أي التزام بالشراء. لا يُطلب أي دفع قبل موافقتك على عرض واضح.',
      confirmationTimeNote:
        'المدة المعتادة للبحث وإعداد عرض مخصص هي من 24 إلى 48 ساعة، حسب الفعالية وإمكانيات التوفر.',
      closeBtn: 'العودة إلى الموقع',
      errorRequired: 'يرجى تعبئة جميع الحقول المطلوبة.',
      errorSubmit: 'تعذر إرسال طلبك حالياً. يرجى المحاولة مرة أخرى.',
    },
    footer: {
      tagline: 'خدمة دولية مخصصة للبحث والمساعدة في تذاكر الفعاليات.',
      conciergeNotice: 'خدمة بحث ومساعدة مستقلة. غير تابعة للمنظمين الرسميين للفعاليات.',
      rights: 'AITJITIKET. جميع الحقوق محفوظة.',
      adminAccess: 'لوحة الإدارة',
    },
    categories: {
      Football: 'كرة القدم',
      Concerts: 'حفلات موسيقية',
      Festivals: 'مهرجانات',
      Sports: 'رياضة',
      'International Events': 'فعاليات دولية',
      'VIP Experiences': 'تجارب VIP',
    },
    statuses: {
      'New Request': 'طلب جديد',
      'Under Research': 'قيد الدراسة',
      'Searching for Options': 'البحث عن خيارات',
      'Offer Available': 'العرض متاح',
      'Awaiting Customer Decision': 'بانتظار قرار العميل',
      'Payment Pending': 'بانتظار الدفع',
      Confirmed: 'مؤكد',
      Completed: 'مكتمل',
      Unavailable: 'غير متاح',
      Cancelled: 'ملغي',
    },
  },
};
