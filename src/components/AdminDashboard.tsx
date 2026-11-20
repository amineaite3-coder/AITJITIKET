import React, { useEffect, useMemo, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import {
  ArrowLeft,
  Calendar,
  Check,
  Copy,
  Edit3,
  Eye,
  EyeOff,
  Inbox,
  LogOut,
  Plus,
  Search,
  Send,
  Settings,
  Star,
  Trash2,
  Upload,
} from 'lucide-react';
import {
  auth,
  db,
  googleProvider,
  handleFirestoreError,
  OperationType,
  PRIMARY_ADMIN_EMAIL,
} from '../firebase';
import { GALLERY_PRESETS, STARTER_EVENTS } from '../data/starterEvents';
import { TRANSLATIONS } from '../i18n/translations';
import {
  BLUEPRINT_LIMITS,
  CommunicationEntry,
  CurrencyCode,
  EVENT_CATEGORIES,
  EventCategory,
  EventItem,
  Language,
  REQUEST_STATUSES,
  RequestStatus,
  SiteSettings,
  TicketRequest,
} from '../types';
import { EventImage } from './EventImage';

interface AdminDashboardProps {
  lang: Language;
  onBackToSite: () => void;
}

const STATUS_BADGE_STYLES: Record<RequestStatus, string> = {
  'New Request': 'text-[#93C5FD]',
  'Under Research': 'text-indigo-300',
  'Searching for Options': 'text-violet-300',
  'Offer Available': 'text-amber-300',
  'Awaiting Customer Decision': 'text-amber-200',
  'Payment Pending': 'text-orange-300',
  Confirmed: 'text-emerald-400',
  Completed: 'text-emerald-300',
  Unavailable: 'text-rose-400',
  Cancelled: 'text-slate-400',
};

function compressImageToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('File read error'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Invalid image file'));
      img.onload = () => {
        const maxWidth = 960;
        const scale = img.width > maxWidth ? maxWidth / img.width : 1;
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas unavailable'));
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.78);
        resolve(dataUrl);
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  lang,
  onBackToSite,
}) => {
  const t = TRANSLATIONS[lang];
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'requests' | 'events' | 'settings'>('requests');

  // Requests state
  const [requests, setRequests] = useState<TicketRequest[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [requestSearch, setRequestSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<RequestStatus | 'ALL'>('ALL');
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

  // Request Detail editing state
  const [editStatus, setEditStatus] = useState<RequestStatus>('New Request');
  const [editNotes, setEditNotes] = useState('');
  const [offerPrice, setOfferPrice] = useState<string>('');
  const [offerFee, setOfferFee] = useState<string>('');
  const [offerCurrency, setOfferCurrency] = useState<CurrencyCode>('EUR');
  const [offerCategory, setOfferCategory] = useState('');
  const [offerMessage, setOfferMessage] = useState('');
  const [newCommChannel, setNewCommChannel] = useState<CommunicationEntry['channel']>('WhatsApp');
  const [newCommDirection, setNewCommDirection] = useState<CommunicationEntry['direction']>('outbound');
  const [newCommText, setNewCommText] = useState('');
  const [savingRequest, setSavingRequest] = useState(false);
  const [requestFeedback, setRequestFeedback] = useState<string | null>(null);
  const [copiedOffer, setCopiedOffer] = useState(false);

  // Events state
  const [events, setEvents] = useState<EventItem[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [editingEvent, setEditingEvent] = useState<Partial<EventItem> | null>(null);
  const [savingEvent, setSavingEvent] = useState(false);
  const [seedingEvents, setSeedingEvents] = useState(false);
  const [confirmDeleteEventId, setConfirmDeleteEventId] = useState<string | null>(null);
  const [confirmDeleteReqId, setConfirmDeleteReqId] = useState<string | null>(null);
  const [eventFeedback, setEventFeedback] = useState<string | null>(null);

  // Site Settings state (no-code content management)
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    conciergeWhatsapp: '',
    adminNotificationEmail: PRIMARY_ADMIN_EMAIL,
    heroHeadlineFr: TRANSLATIONS.fr.hero.headline,
    heroSubheadlineFr: TRANSLATIONS.fr.hero.subheadline,
    customHeadingFr: TRANSLATIONS.fr.customSection.heading,
    customDescriptionFr: TRANSLATIONS.fr.customSection.description,
    researchTimeFr: TRANSLATIONS.fr.howItWorks.researchTimeText,
    disclaimerFr: TRANSLATIONS.fr.disclaimer.body,
    disclaimerEn: TRANSLATIONS.en.disclaimer.body,
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsFeedback, setSettingsFeedback] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  const isAuthorizedAdmin = Boolean(
    user &&
      user.emailVerified &&
      user.email?.toLowerCase() === PRIMARY_ADMIN_EMAIL.toLowerCase()
  );

  // Listen to requests when authorized admin
  useEffect(() => {
    if (!authReady || !isAuthorizedAdmin) {
      setRequests([]);
      setRequestsLoading(false);
      return;
    }

    setRequestsLoading(true);
    const q = query(collection(db, 'requests'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const list: TicketRequest[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<TicketRequest, 'id'>),
        }));
        setRequests(list);
        setRequestsLoading(false);
      },
      (err) => {
        setRequestsLoading(false);
        handleFirestoreError(err, OperationType.LIST, 'requests');
      }
    );

    return () => unsub();
  }, [authReady, isAuthorizedAdmin]);

  // Listen to all events (published + unpublished) when authorized admin
  useEffect(() => {
    if (!authReady || !isAuthorizedAdmin) {
      setEvents([]);
      setEventsLoading(false);
      return;
    }

    setEventsLoading(true);
    const q = query(collection(db, 'events'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const list: EventItem[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<EventItem, 'id'>),
        }));
        setEvents(list);
        setEventsLoading(false);
      },
      (err) => {
        setEventsLoading(false);
        handleFirestoreError(err, OperationType.LIST, 'events');
      }
    );

    return () => unsub();
  }, [authReady, isAuthorizedAdmin]);

  // Listen to site settings document
  useEffect(() => {
    if (!authReady || !isAuthorizedAdmin) return;
    const unsub = onSnapshot(
      doc(db, 'settings', 'site'),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as SiteSettings;
          setSiteSettings((prev) => ({ ...prev, ...data }));
        }
      },
      (err) => {
        console.error('Error loading site settings:', err);
      }
    );
    return () => unsub();
  }, [authReady, isAuthorizedAdmin]);

  const selectedRequest = useMemo(
    () => requests.find((r) => r.id === selectedRequestId) || null,
    [requests, selectedRequestId]
  );

  // Sync detail editor when selected request changes
  useEffect(() => {
    if (!selectedRequest) return;
    setEditStatus(selectedRequest.status);
    setEditNotes(selectedRequest.privateNotes || '');
    setOfferPrice(
      selectedRequest.offerTicketPrice !== undefined
        ? String(selectedRequest.offerTicketPrice)
        : ''
    );
    setOfferFee(
      selectedRequest.offerServiceFee !== undefined
        ? String(selectedRequest.offerServiceFee)
        : ''
    );
    setOfferCurrency(selectedRequest.offerCurrency || selectedRequest.currency || 'EUR');
    setOfferCategory(selectedRequest.offerCategory || selectedRequest.preferredCategory || '');
    setOfferMessage(selectedRequest.offerMessage || '');
    setRequestFeedback(null);
    setConfirmDeleteReqId(null);
  }, [selectedRequest?.id]);

  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      if (statusFilter !== 'ALL' && req.status !== statusFilter) return false;
      if (!requestSearch.trim()) return true;
      const q = requestSearch.toLowerCase();
      return (
        req.reference.toLowerCase().includes(q) ||
        req.fullName.toLowerCase().includes(q) ||
        req.eventName.toLowerCase().includes(q) ||
        req.whatsapp.toLowerCase().includes(q)
      );
    });
  }, [requests, statusFilter, requestSearch]);

  const handleSignIn = async () => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      setAuthError(
        err instanceof Error ? err.message : 'Erreur de connexion Google.'
      );
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
  };

  const handleGenerateOfferTemplate = () => {
    if (!selectedRequest) return;
    const unit = Number(offerPrice) || 0;
    const fee = Number(offerFee) || 0;
    const total = unit * selectedRequest.ticketQuantity + fee;
    const msg = `Bonjour ${selectedRequest.fullName},\n\nSuite à votre demande AITJITIKET (${selectedRequest.reference}) pour "${selectedRequest.eventName}" (${selectedRequest.eventDate}), nous avons identifié une option possible :\n\n• Quantité : ${selectedRequest.ticketQuantity} billet(s)\n• Catégorie : ${offerCategory || selectedRequest.preferredCategory}\n• Prix estimatif par billet : ${unit} ${offerCurrency}\n• Frais de conciergerie AITJITIKET : ${fee} ${offerCurrency}\n• Total estimé : ${total} ${offerCurrency}\n\nNote importante : Cette proposition reste soumise à disponibilité réelle au moment de votre confirmation. Aucun paiement n'est demandé avant votre accord.\n\nSouhaitez-vous que nous poursuivions la vérification finale pour cette option ?\n\nL'équipe AITJITIKET`;
    setOfferMessage(msg);
  };

  const handleSaveRequest = async (overrideStatus?: RequestStatus, markOfferSent = false) => {
    if (!selectedRequest) return;
    setSavingRequest(true);
    setRequestFeedback(null);

    const nextStatus = overrideStatus || editStatus;
    const parsedPrice = offerPrice !== '' ? Math.max(0, Number(offerPrice) || 0) : undefined;
    const parsedFee = offerFee !== '' ? Math.max(0, Number(offerFee) || 0) : undefined;

    const updatedComms = [...(selectedRequest.communications || [])];
    if (markOfferSent) {
      updatedComms.unshift({
        id: `comm-${Date.now()}`,
        channel: 'WhatsApp',
        direction: 'outbound',
        message: `Proposition préparée et marquée envoyée (${parsedPrice ?? 0} ${offerCurrency}/billet + ${parsedFee ?? 0} ${offerCurrency} frais).`,
        timestamp: new Date().toISOString(),
      });
    }

    const updatePayload: Record<string, unknown> = {
      status: nextStatus,
      privateNotes: editNotes.slice(0, BLUEPRINT_LIMITS.privateNotesMax),
      offerCurrency,
      offerCategory: offerCategory.slice(0, BLUEPRINT_LIMITS.offerCategoryMax),
      offerMessage: offerMessage.slice(0, BLUEPRINT_LIMITS.offerMessageMax),
      communications: updatedComms.slice(0, BLUEPRINT_LIMITS.maxCommunications),
      updatedAt: serverTimestamp(),
    };

    if (parsedPrice !== undefined) updatePayload.offerTicketPrice = parsedPrice;
    if (parsedFee !== undefined) updatePayload.offerServiceFee = parsedFee;
    if (markOfferSent) updatePayload.offerSentAt = new Date().toISOString();

    try {
      await updateDoc(doc(db, 'requests', selectedRequest.id), updatePayload);
      setEditStatus(nextStatus);
      setRequestFeedback(
        markOfferSent
          ? 'Offre enregistrée et statut mis à jour.'
          : 'Modifications enregistrées.'
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `requests/${selectedRequest.id}`);
    } finally {
      setSavingRequest(false);
    }
  };

  const handleAddCommunication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest || !newCommText.trim()) return;
    setSavingRequest(true);
    const entry: CommunicationEntry = {
      id: `comm-${Date.now()}`,
      channel: newCommChannel,
      direction: newCommDirection,
      message: newCommText.trim().slice(0, 600),
      timestamp: new Date().toISOString(),
    };
    const nextList = [entry, ...(selectedRequest.communications || [])].slice(
      0,
      BLUEPRINT_LIMITS.maxCommunications
    );

    try {
      await updateDoc(doc(db, 'requests', selectedRequest.id), {
        communications: nextList,
        updatedAt: serverTimestamp(),
      });
      setNewCommText('');
      setRequestFeedback('Communication ajoutée au journal.');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `requests/${selectedRequest.id}`);
    } finally {
      setSavingRequest(false);
    }
  };

  const handleCopyOfferMessage = async () => {
    if (!offerMessage.trim()) return;
    try {
      await navigator.clipboard.writeText(offerMessage);
      setCopiedOffer(true);
      setTimeout(() => setCopiedOffer(false), 2000);
    } catch {
      // Clipboard may not be available
    }
  };

  const handleDeleteRequest = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'requests', id));
      if (selectedRequestId === id) setSelectedRequestId(null);
      setConfirmDeleteReqId(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `requests/${id}`);
    }
  };

  // --- Events CRUD ---
  const handleSeedStarterEvents = async () => {
    setSeedingEvents(true);
    setEventFeedback(null);
    try {
      for (const ev of STARTER_EVENTS) {
        const docId = ev.id.replace('starter-', 'ev-');
        await setDoc(doc(db, 'events', docId), {
          title: ev.title,
          titleAr: ev.titleAr || '',
          category: ev.category,
          date: ev.date,
          venue: ev.venue,
          city: ev.city,
          country: ev.country,
          descriptionFr: ev.descriptionFr || '',
          descriptionEn: ev.descriptionEn || '',
          descriptionAr: ev.descriptionAr || '',
          imageUrl: ev.imageUrl || '',
          published: ev.published,
          featured: ev.featured,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      setEventFeedback('6 événements ont été initialisés dans votre catalogue Firestore.');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'events');
    } finally {
      setSeedingEvents(false);
    }
  };

  const openNewEventForm = () => {
    setEventFeedback(null);
    setEditingEvent({
      title: '',
      titleAr: '',
      category: 'Football',
      date: '',
      venue: '',
      city: '',
      country: '',
      descriptionFr: '',
      descriptionEn: '',
      descriptionAr: '',
      imageUrl: GALLERY_PRESETS[0].url,
      published: true,
      featured: false,
    });
  };

  const handleEventImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingEvent) return;
    try {
      const dataUrl = await compressImageToDataUrl(file);
      if (dataUrl.length > 590000) {
        setEventFeedback("L'image est trop volumineuse après compression. Essayez une image plus légère.");
        return;
      }
      setEditingEvent({ ...editingEvent, imageUrl: dataUrl });
    } catch {
      setEventFeedback("Impossible de charger l'image sélectionnée.");
    }
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;

    const title = (editingEvent.title || '').trim().slice(0, BLUEPRINT_LIMITS.eventTitleMax);
    const date = (editingEvent.date || '').trim().slice(0, BLUEPRINT_LIMITS.eventDateMax);
    const venue = (editingEvent.venue || '').trim().slice(0, BLUEPRINT_LIMITS.eventVenueMax);
    const city = (editingEvent.city || '').trim().slice(0, BLUEPRINT_LIMITS.eventCityMax);
    const country = (editingEvent.country || '').trim().slice(0, BLUEPRINT_LIMITS.eventCountryMax);

    if (title.length < 2 || date.length < 4 || venue.length < 2 || city.length < 2 || country.length < 2) {
      setEventFeedback('Veuillez remplir tous les champs obligatoires (titre, date, lieu, ville, pays).');
      return;
    }

    setSavingEvent(true);
    setEventFeedback(null);

    const isUpdate = Boolean(editingEvent.id);
    const docId = editingEvent.id || `ev-${Date.now()}`;

    const basePayload = {
      title,
      titleAr: (editingEvent.titleAr || '').trim().slice(0, BLUEPRINT_LIMITS.eventTitleMax),
      category: (editingEvent.category || 'Football') as EventCategory,
      date,
      venue,
      city,
      country,
      descriptionFr: (editingEvent.descriptionFr || '').trim().slice(0, BLUEPRINT_LIMITS.eventDescMax),
      descriptionEn: (editingEvent.descriptionEn || '').trim().slice(0, BLUEPRINT_LIMITS.eventDescMax),
      descriptionAr: (editingEvent.descriptionAr || '').trim().slice(0, BLUEPRINT_LIMITS.eventDescMax),
      imageUrl: editingEvent.imageUrl || '',
      published: Boolean(editingEvent.published),
      featured: Boolean(editingEvent.featured),
      updatedAt: serverTimestamp(),
    };

    try {
      if (isUpdate) {
        await updateDoc(doc(db, 'events', docId), basePayload);
        setEventFeedback('Événement mis à jour.');
      } else {
        await setDoc(doc(db, 'events', docId), {
          ...basePayload,
          createdAt: serverTimestamp(),
        });
        setEventFeedback('Nouvel événement ajouté au catalogue.');
      }
      setEditingEvent(null);
    } catch (err) {
      handleFirestoreError(err, isUpdate ? OperationType.UPDATE : OperationType.CREATE, `events/${docId}`);
    } finally {
      setSavingEvent(false);
    }
  };

  const handleToggleEventField = async (
    ev: EventItem,
    field: 'published' | 'featured'
  ) => {
    try {
      await updateDoc(doc(db, 'events', ev.id), {
        [field]: !ev[field],
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `events/${ev.id}`);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'events', id));
      setConfirmDeleteEventId(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `events/${id}`);
    }
  };

  const handleSaveSiteSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsFeedback(null);
    try {
      await setDoc(doc(db, 'settings', 'site'), {
        conciergeWhatsapp: (siteSettings.conciergeWhatsapp || '').trim().slice(0, 40),
        adminNotificationEmail: (siteSettings.adminNotificationEmail || '').trim().slice(0, 160),
        heroHeadlineFr: (siteSettings.heroHeadlineFr || '').trim().slice(0, 240),
        heroSubheadlineFr: (siteSettings.heroSubheadlineFr || '').trim().slice(0, 600),
        customHeadingFr: (siteSettings.customHeadingFr || '').trim().slice(0, 200),
        customDescriptionFr: (siteSettings.customDescriptionFr || '').trim().slice(0, 800),
        researchTimeFr: (siteSettings.researchTimeFr || '').trim().slice(0, 600),
        disclaimerFr: (siteSettings.disclaimerFr || '').trim().slice(0, 1200),
        disclaimerEn: (siteSettings.disclaimerEn || '').trim().slice(0, 1200),
        updatedAt: serverTimestamp(),
      });
      setSettingsFeedback('Contenu du site enregistré et publié immédiatement.');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'settings/site');
    } finally {
      setSavingSettings(false);
    }
  };

  // --- Auth Gate Render ---
  if (!authReady) {
    return (
      <div className="min-h-screen bg-[#070B19] text-slate-100 flex items-center justify-center p-6">
        <div className="text-sm text-slate-400">Vérification de la session administrateur...</div>
      </div>
    );
  }

  if (!user || !isAuthorizedAdmin) {
    return (
      <div className="min-h-screen bg-[#070B19] text-slate-100 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md bg-[#0E152B] border border-white/10 rounded-xl p-8 space-y-6">
          <div>
            <div className="text-xs font-medium text-[#93C5FD] mb-2">AITJITIKET</div>
            <h1 className="text-2xl font-bold text-white">Espace Administrateur</h1>
            <p className="text-sm text-slate-400 mt-2 leading-relaxed">
              Accès réservé exclusivement à l’administrateur AITJITIKET pour gérer les événements, les demandes clients et les propositions tarifaires.
            </p>
          </div>

          {user && !isAuthorizedAdmin && (
            <div className="p-3.5 text-xs text-rose-200 bg-rose-950/50 border border-rose-500/30 rounded-lg space-y-2">
              <p>
                Le compte <span className="font-mono-tabular text-white">{user.email}</span> n’est pas autorisé à accéder à l’administration.
              </p>
              <button
                type="button"
                onClick={handleSignOut}
                className="underline text-rose-100 hover:text-white"
              >
                Se déconnecter et changer de compte
              </button>
            </div>
          )}

          {authError && (
            <div className="p-3.5 text-xs text-rose-200 bg-rose-950/50 border border-rose-500/30 rounded-lg">
              {authError}
            </div>
          )}

          <div className="space-y-3">
            <button
              type="button"
              onClick={handleSignIn}
              className="w-full px-4 py-3 text-sm font-semibold text-white bg-[#3B82F6] hover:bg-[#2563EB] rounded-lg transition-colors"
            >
              Connexion Administrateur (Google)
            </button>
            <button
              type="button"
              onClick={onBackToSite}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour au site public
            </button>
          </div>
        </div>
      </div>
    );
  }

  const newRequestsCount = requests.filter((r) => r.status === 'New Request').length;
  const activeResearchCount = requests.filter(
    (r) => r.status === 'Under Research' || r.status === 'Searching for Options'
  ).length;
  const offersSentCount = requests.filter(
    (r) => r.status === 'Offer Available' || r.status === 'Awaiting Customer Decision'
  ).length;
  const publishedEventsCount = events.filter((e) => e.published).length;

  const computedOfferTotal =
    selectedRequest
      ? (Number(offerPrice) || 0) * selectedRequest.ticketQuantity + (Number(offerFee) || 0)
      : 0;

  return (
    <div className="min-h-screen bg-[#070B19] text-slate-100 flex flex-col lg:flex-row">
      {/* Sidebar */}
      <aside className="w-full lg:w-64 shrink-0 bg-[#0B1124] border-b lg:border-b-0 lg:border-e border-white/[0.08] flex flex-col">
        <div className="px-6 py-5 border-b border-white/[0.08] flex items-center justify-between">
          <span className="font-display text-lg font-extrabold tracking-tight text-white">
            AITJITIKET
          </span>
          <span className="text-xs text-slate-400">Admin</span>
        </div>

        <nav className="p-3 space-y-1 flex-1">
          <button
            type="button"
            onClick={() => setActiveTab('requests')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'requests'
                ? 'bg-[#3B82F6]/15 text-white border border-[#3B82F6]/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span className="inline-flex items-center gap-2.5">
              <Inbox className="w-4 h-4" />
              Demandes clients
            </span>
            <span className="font-mono-tabular text-xs text-slate-300">
              {requests.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('events')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'events'
                ? 'bg-[#3B82F6]/15 text-white border border-[#3B82F6]/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span className="inline-flex items-center gap-2.5">
              <Calendar className="w-4 h-4" />
              Événements
            </span>
            <span className="font-mono-tabular text-xs text-slate-300">
              {events.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'settings'
                ? 'bg-[#3B82F6]/15 text-white border border-[#3B82F6]/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span className="inline-flex items-center gap-2.5">
              <Settings className="w-4 h-4" />
              Contenu du site
            </span>
          </button>
        </nav>

        <div className="p-4 border-t border-white/[0.08] space-y-2">
          <div className="text-xs text-slate-400 truncate px-2">{user.email}</div>
          <button
            type="button"
            onClick={onBackToSite}
            className="w-full inline-flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Voir le site public
          </button>
          <button
            type="button"
            onClick={handleSignOut}
            className="w-full inline-flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-400 hover:text-rose-300 hover:bg-white/5 rounded-lg transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 flex flex-col">
        {/* Top Admin Header */}
        <header className="px-6 py-4 bg-[#070B19] border-b border-white/[0.08] flex flex-wrap items-center justify-between gap-4">
          <div className="text-sm text-slate-400">
            <span>AITJITIKET Admin</span>
            <span className="mx-2 text-slate-600">/</span>
            <span className="text-white font-medium">
              {activeTab === 'requests'
                ? 'Gestion des demandes'
                : activeTab === 'events'
                  ? 'Catalogue des événements'
                  : 'Contenu & Paramètres du site'}
            </span>
          </div>
          {activeTab === 'events' && (
            <button
              type="button"
              onClick={openNewEventForm}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#3B82F6] hover:bg-[#2563EB] rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4" />
              Ajouter un événement
            </button>
          )}
        </header>

        {/* Summary Metrics Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 border-b border-white/[0.08] bg-[#0B1124]/60">
          <div className="px-6 py-4 border-e border-white/[0.06]">
            <div className="text-xs text-slate-400">Nouvelles demandes</div>
            <div className="text-2xl font-bold font-mono-tabular text-white mt-1">
              {newRequestsCount}
            </div>
          </div>
          <div className="px-6 py-4 lg:border-e border-white/[0.06]">
            <div className="text-xs text-slate-400">En cours de recherche</div>
            <div className="text-2xl font-bold font-mono-tabular text-white mt-1">
              {activeResearchCount}
            </div>
          </div>
          <div className="px-6 py-4 border-t lg:border-t-0 border-e border-white/[0.06]">
            <div className="text-xs text-slate-400">Offres proposées</div>
            <div className="text-2xl font-bold font-mono-tabular text-white mt-1">
              {offersSentCount}
            </div>
          </div>
          <div className="px-6 py-4 border-t lg:border-t-0">
            <div className="text-xs text-slate-400">Événements publiés</div>
            <div className="text-2xl font-bold font-mono-tabular text-white mt-1">
              {publishedEventsCount} / {events.length}
            </div>
          </div>
        </div>

        {/* Workspace Area */}
        <div className="flex-1 p-6 overflow-y-auto">
          {activeTab === 'requests' && newRequestsCount > 0 && statusFilter !== 'New Request' && (
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 bg-[#0E152B] border border-[#3B82F6]/35 rounded-xl px-5 py-3.5">
              <div className="text-sm text-slate-200">
                <span className="font-semibold text-white font-mono-tabular">
                  {newRequestsCount}
                </span>{' '}
                {newRequestsCount > 1
                  ? 'nouvelles demandes clients en attente de traitement.'
                  : 'nouvelle demande client en attente de traitement.'}
              </div>
              <button
                type="button"
                onClick={() => setStatusFilter('New Request')}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#3B82F6] hover:bg-[#2563EB] rounded-lg transition-colors whitespace-nowrap"
              >
                Filtrer les nouvelles demandes
              </button>
            </div>
          )}

          {activeTab === 'requests' ? (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
              {/* Left Column: Requests List */}
              <div className="xl:col-span-5 space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-500 absolute start-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={requestSearch}
                      onChange={(e) => setRequestSearch(e.target.value)}
                      placeholder="Référence, client, événement..."
                      className="w-full ps-10 pe-3.5 py-2 text-sm bg-[#0E152B] border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#3B82F6]"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as RequestStatus | 'ALL')}
                    className="px-3 py-2 text-xs bg-[#0E152B] border border-white/10 rounded-lg text-slate-200 focus:outline-none focus:border-[#3B82F6]"
                  >
                    <option value="ALL">Tous les statuts ({requests.length})</option>
                    {REQUEST_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {t.statuses[st]} ({requests.filter((r) => r.status === st).length})
                      </option>
                    ))}
                  </select>
                </div>

                {requestsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((n) => (
                      <div
                        key={n}
                        className="h-24 bg-[#0E152B] border border-white/[0.06] rounded-lg animate-pulse"
                      />
                    ))}
                  </div>
                ) : filteredRequests.length === 0 ? (
                  <div className="bg-[#0E152B] border border-white/[0.08] rounded-xl p-8 text-center text-sm text-slate-400">
                    Aucune demande client ne correspond à ce filtre.
                  </div>
                ) : (
                  <div className="border border-white/[0.08] rounded-xl overflow-hidden divide-y divide-white/[0.06] bg-[#0E152B]">
                    {filteredRequests.map((req) => {
                      const active = req.id === selectedRequestId;
                      return (
                        <button
                          key={req.id}
                          type="button"
                          onClick={() => setSelectedRequestId(req.id)}
                          className={`w-full text-start p-4 transition-colors ${
                            active ? 'bg-[#162040]' : 'hover:bg-white/[0.03]'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 text-xs mb-1">
                            <span className="font-mono-tabular font-semibold text-white">
                              {req.reference}
                            </span>
                            <span className={`font-medium ${STATUS_BADGE_STYLES[req.status]}`}>
                              {t.statuses[req.status]}
                            </span>
                          </div>
                          <div className="text-sm font-semibold text-white truncate">
                            {req.eventName}
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-1">
                            <span>{req.fullName}</span>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono-tabular">
                              {req.ticketQuantity}x
                            </span>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono-tabular">
                              Max {req.maxBudgetPerTicket} {req.currency}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span>
                              {req.requestType === 'custom' ? 'Personnalisée' : 'Catalogue'}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Right Column: Selected Request Workspace */}
              <div className="xl:col-span-7">
                {!selectedRequest ? (
                  <div className="bg-[#0E152B] border border-white/[0.08] rounded-xl p-12 text-center text-sm text-slate-400">
                    Sélectionnez une demande dans la liste pour consulter les coordonnées client, ajouter des notes privées, préparer une offre personnalisée et suivre les échanges.
                  </div>
                ) : (
                  <div className="bg-[#0E152B] border border-white/[0.08] rounded-xl divide-y divide-white/[0.08]">
                    {/* Request Header & Status Controls */}
                    <div className="p-6 space-y-4">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                            <span className="font-mono-tabular text-[#93C5FD] font-semibold">
                              {selectedRequest.reference}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span>
                              {selectedRequest.requestType === 'custom'
                                ? 'Demande personnalisée (hors catalogue)'
                                : 'Demande depuis catalogue'}
                            </span>
                          </div>
                          <h2 className="text-xl font-bold text-white">
                            {selectedRequest.eventName}
                          </h2>
                          <p className="text-sm text-slate-400 mt-0.5">
                            {selectedRequest.eventDate}
                            {selectedRequest.cityCountry ? ` — ${selectedRequest.cityCountry}` : ''}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <select
                            value={editStatus}
                            onChange={(e) => setEditStatus(e.target.value as RequestStatus)}
                            className="px-3 py-2 text-xs font-medium bg-[#070B19] border border-white/15 rounded-lg text-white focus:outline-none focus:border-[#3B82F6]"
                          >
                            {REQUEST_STATUSES.map((st) => (
                              <option key={st} value={st}>
                                {st} ({t.statuses[st]})
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            disabled={savingRequest}
                            onClick={() => handleSaveRequest()}
                            className="px-4 py-2 text-xs font-semibold text-white bg-[#3B82F6] hover:bg-[#2563EB] disabled:opacity-60 rounded-lg transition-colors whitespace-nowrap"
                          >
                            Enregistrer
                          </button>
                        </div>
                      </div>

                      {/* Quick Action Buttons */}
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          disabled={savingRequest}
                          onClick={() => handleSaveRequest('Under Research')}
                          className="px-3 py-1.5 text-xs font-medium text-slate-200 bg-white/5 hover:bg-white/10 rounded-md transition-colors"
                        >
                          Passer en recherche
                        </button>
                        <button
                          type="button"
                          disabled={savingRequest}
                          onClick={() => handleSaveRequest('Confirmed')}
                          className="px-3 py-1.5 text-xs font-medium text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-md transition-colors"
                        >
                          Accepter / Confirmer
                        </button>
                        <button
                          type="button"
                          disabled={savingRequest}
                          onClick={() => handleSaveRequest('Unavailable')}
                          className="px-3 py-1.5 text-xs font-medium text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 rounded-md transition-colors"
                        >
                          Rejeter (Indisponible)
                        </button>
                        {confirmDeleteReqId === selectedRequest.id ? (
                          <button
                            type="button"
                            onClick={() => handleDeleteRequest(selectedRequest.id)}
                            className="px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-md transition-colors ms-auto"
                          >
                            Confirmer suppression
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteReqId(selectedRequest.id)}
                            className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-rose-300 rounded-md transition-colors ms-auto"
                          >
                            Supprimer
                          </button>
                        )}
                      </div>

                      {requestFeedback && (
                        <div className="text-xs text-emerald-300 bg-emerald-950/40 border border-emerald-500/30 rounded-lg px-3.5 py-2">
                          {requestFeedback}
                        </div>
                      )}
                    </div>

                    {/* Customer Details */}
                    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-xs text-slate-400">Client</div>
                        <div className="text-white font-medium mt-0.5">
                          {selectedRequest.fullName}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-400">WhatsApp</div>
                        <div className="text-white font-mono-tabular mt-0.5">
                          {selectedRequest.whatsapp}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-400">E-mail</div>
                        <div className="text-slate-200 mt-0.5">
                          {selectedRequest.email || '—'}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-400">Quantité & Budget max / billet</div>
                        <div className="text-white font-mono-tabular mt-0.5">
                          {selectedRequest.ticketQuantity} billet(s) · Max{' '}
                          {selectedRequest.maxBudgetPerTicket} {selectedRequest.currency}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-400">Catégorie préférée</div>
                        <div className="text-slate-200 mt-0.5">
                          {selectedRequest.preferredCategory}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-400">Zone / emplacement</div>
                        <div className="text-slate-200 mt-0.5">
                          {selectedRequest.preferredSeating || '—'}
                        </div>
                      </div>
                      {selectedRequest.additionalInfo && (
                        <div className="sm:col-span-2 bg-[#070B19] border border-white/[0.06] rounded-lg p-3.5">
                          <div className="text-xs text-slate-400 mb-1">
                            Informations complémentaires du client
                          </div>
                          <div className="text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
                            {selectedRequest.additionalInfo}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Private Research & Supplier Notes */}
                    <div className="p-6 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-semibold text-white">
                          Notes privées de recherche & sources (confidentiel)
                        </label>
                        <span className="text-xs text-slate-500">Jamais visible par le client</span>
                      </div>
                      <textarea
                        rows={3}
                        maxLength={BLUEPRINT_LIMITS.privateNotesMax}
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                        placeholder="Sources vérifiées, contacts privés, coût fournisseur, conditions de transfert..."
                        className="w-full px-3.5 py-2.5 text-sm bg-[#070B19] border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#3B82F6]"
                      />
                    </div>

                    {/* Personalized Offer Builder */}
                    <div className="p-6 space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="text-sm font-semibold text-white">
                          Proposition tarifaire personnalisée
                        </h3>
                        <button
                          type="button"
                          onClick={handleGenerateOfferTemplate}
                          className="text-xs font-medium text-[#93C5FD] hover:text-white transition-colors"
                        >
                          Générer un modèle de message
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">
                            Prix par billet
                          </label>
                          <input
                            type="number"
                            min={0}
                            step="any"
                            value={offerPrice}
                            onChange={(e) => setOfferPrice(e.target.value)}
                            placeholder="0"
                            className="w-full px-3 py-2 text-sm font-mono-tabular bg-[#070B19] border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#3B82F6]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">
                            Frais de service
                          </label>
                          <input
                            type="number"
                            min={0}
                            step="any"
                            value={offerFee}
                            onChange={(e) => setOfferFee(e.target.value)}
                            placeholder="0"
                            className="w-full px-3 py-2 text-sm font-mono-tabular bg-[#070B19] border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#3B82F6]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">Devise</label>
                          <select
                            value={offerCurrency}
                            onChange={(e) => setOfferCurrency(e.target.value as CurrencyCode)}
                            className="w-full px-3 py-2 text-sm bg-[#070B19] border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#3B82F6]"
                          >
                            <option value="EUR">EUR (€)</option>
                            <option value="MAD">MAD (DH)</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">
                            Catégorie / bloc proposé
                          </label>
                          <input
                            type="text"
                            maxLength={BLUEPRINT_LIMITS.offerCategoryMax}
                            value={offerCategory}
                            onChange={(e) => setOfferCategory(e.target.value)}
                            placeholder="Ex. Catégorie 1 — Tribune Latérale"
                            className="w-full px-3 py-2 text-sm bg-[#070B19] border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#3B82F6]"
                          />
                        </div>
                        <div className="bg-[#070B19] border border-white/[0.08] rounded-lg px-3.5 py-2 flex items-center justify-between gap-3">
                          <div>
                            <div className="text-xs text-slate-400">
                              Total ({selectedRequest.ticketQuantity}x + frais)
                            </div>
                            {offerPrice !== '' && offerCurrency === selectedRequest.currency && (
                              <div
                                className={`text-[11px] font-medium ${
                                  Number(offerPrice) <= selectedRequest.maxBudgetPerTicket
                                    ? 'text-emerald-400'
                                    : 'text-amber-300'
                                }`}
                              >
                                {Number(offerPrice) <= selectedRequest.maxBudgetPerTicket
                                  ? 'Dans le budget max du client'
                                  : `Au-dessus du budget max (${selectedRequest.maxBudgetPerTicket} ${selectedRequest.currency})`}
                              </div>
                            )}
                          </div>
                          <span className="text-base font-bold font-mono-tabular text-white whitespace-nowrap">
                            {computedOfferTotal.toLocaleString('fr-FR')} {offerCurrency}
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs text-slate-400 mb-1">
                          Message de proposition à envoyer au client
                        </label>
                        <textarea
                          rows={5}
                          maxLength={BLUEPRINT_LIMITS.offerMessageMax}
                          value={offerMessage}
                          onChange={(e) => setOfferMessage(e.target.value)}
                          placeholder="Rédigez ou générez le message de proposition pour WhatsApp / E-mail..."
                          className="w-full px-3.5 py-2.5 text-sm bg-[#070B19] border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#3B82F6]"
                        />
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          disabled={savingRequest}
                          onClick={() => handleSaveRequest('Awaiting Customer Decision', true)}
                          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-60 rounded-lg transition-colors whitespace-nowrap"
                        >
                          <Send className="w-3.5 h-3.5" />
                          Enregistrer & Marquer Offre Envoyée
                        </button>
                        <button
                          type="button"
                          onClick={handleCopyOfferMessage}
                          disabled={!offerMessage.trim()}
                          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-200 bg-white/5 hover:bg-white/10 disabled:opacity-40 rounded-lg transition-colors whitespace-nowrap"
                        >
                          {copiedOffer ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                          {copiedOffer ? 'Message copié' : 'Copier pour WhatsApp / E-mail'}
                        </button>
                      </div>
                    </div>

                    {/* Customer Communications Log */}
                    <div className="p-6 space-y-4">
                      <h3 className="text-sm font-semibold text-white">
                        Journal des communications client
                      </h3>
                      <form onSubmit={handleAddCommunication} className="space-y-2.5">
                        <div className="flex flex-wrap gap-2">
                          <select
                            value={newCommChannel}
                            onChange={(e) =>
                              setNewCommChannel(e.target.value as CommunicationEntry['channel'])
                            }
                            className="px-3 py-1.5 text-xs bg-[#070B19] border border-white/10 rounded-lg text-white"
                          >
                            <option value="WhatsApp">WhatsApp</option>
                            <option value="Email">E-mail</option>
                            <option value="Phone">Téléphone</option>
                            <option value="Internal">Note interne</option>
                          </select>
                          <select
                            value={newCommDirection}
                            onChange={(e) =>
                              setNewCommDirection(e.target.value as CommunicationEntry['direction'])
                            }
                            className="px-3 py-1.5 text-xs bg-[#070B19] border border-white/10 rounded-lg text-white"
                          >
                            <option value="outbound">Envoyé au client</option>
                            <option value="inbound">Reçu du client</option>
                            <option value="note">Suivi interne</option>
                          </select>
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newCommText}
                            onChange={(e) => setNewCommText(e.target.value)}
                            placeholder="Ajouter un résumé d'échange..."
                            className="flex-1 px-3.5 py-2 text-sm bg-[#070B19] border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#3B82F6]"
                          />
                          <button
                            type="submit"
                            disabled={savingRequest || !newCommText.trim()}
                            className="px-4 py-2 text-xs font-semibold text-white bg-[#3B82F6] hover:bg-[#2563EB] disabled:opacity-50 rounded-lg transition-colors whitespace-nowrap"
                          >
                            Ajouter
                          </button>
                        </div>
                      </form>

                      {selectedRequest.communications && selectedRequest.communications.length > 0 ? (
                        <div className="space-y-2 pt-2">
                          {selectedRequest.communications.map((entry) => (
                            <div
                              key={entry.id}
                              className="bg-[#070B19] border border-white/[0.06] rounded-lg px-3.5 py-2.5 text-xs"
                            >
                              <div className="flex items-center justify-between gap-2 text-slate-400 mb-1">
                                <span>
                                  {entry.channel} ·{' '}
                                  {entry.direction === 'outbound'
                                    ? 'Envoyé'
                                    : entry.direction === 'inbound'
                                      ? 'Reçu'
                                      : 'Interne'}
                                </span>
                                <span className="font-mono-tabular">
                                  {new Date(entry.timestamp).toLocaleString('fr-FR')}
                                </span>
                              </div>
                              <p className="text-slate-200 leading-relaxed">{entry.message}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500">
                          Aucune communication enregistrée pour ce dossier.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : activeTab === 'events' ? (
            /* EVENTS MANAGER TAB */
            <div className="space-y-6">
              {eventFeedback && (
                <div className="text-xs text-emerald-300 bg-emerald-950/40 border border-emerald-500/30 rounded-lg px-4 py-2.5">
                  {eventFeedback}
                </div>
              )}

              {editingEvent ? (
                <form
                  onSubmit={handleSaveEvent}
                  className="bg-[#0E152B] border border-white/10 rounded-xl p-6 space-y-5 max-w-3xl"
                >
                  <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
                    <h2 className="text-lg font-bold text-white">
                      {editingEvent.id ? "Modifier l'événement" : 'Créer un nouvel événement'}
                    </h2>
                    <button
                      type="button"
                      onClick={() => setEditingEvent(null)}
                      className="text-xs text-slate-400 hover:text-white"
                    >
                      Annuler
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-300 mb-1">
                        Titre de l'événement *
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={BLUEPRINT_LIMITS.eventTitleMax}
                        value={editingEvent.title || ''}
                        onChange={(e) =>
                          setEditingEvent({ ...editingEvent, title: e.target.value })
                        }
                        placeholder="Ex. Finale Ligue des Champions"
                        className="w-full px-3.5 py-2 text-sm bg-[#070B19] border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#3B82F6]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-300 mb-1">
                        Titre en arabe (optionnel)
                      </label>
                      <input
                        type="text"
                        dir="rtl"
                        maxLength={BLUEPRINT_LIMITS.eventTitleMax}
                        value={editingEvent.titleAr || ''}
                        onChange={(e) =>
                          setEditingEvent({ ...editingEvent, titleAr: e.target.value })
                        }
                        placeholder="العنوان بالعربية"
                        className="w-full px-3.5 py-2 text-sm bg-[#070B19] border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#3B82F6]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-slate-300 mb-1">Catégorie *</label>
                      <select
                        value={editingEvent.category || 'Football'}
                        onChange={(e) =>
                          setEditingEvent({
                            ...editingEvent,
                            category: e.target.value as EventCategory,
                          })
                        }
                        className="w-full px-3.5 py-2 text-sm bg-[#070B19] border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#3B82F6]"
                      >
                        {EVENT_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {t.categories[cat]}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs text-slate-300 mb-1">Date *</label>
                      <input
                        type="text"
                        required
                        maxLength={BLUEPRINT_LIMITS.eventDateMax}
                        value={editingEvent.date || ''}
                        onChange={(e) =>
                          setEditingEvent({ ...editingEvent, date: e.target.value })
                        }
                        placeholder="Ex. 30 Mai 2027"
                        className="w-full px-3.5 py-2 text-sm bg-[#070B19] border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#3B82F6]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-slate-300 mb-1">
                        Stade / Salle / Lieu *
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={BLUEPRINT_LIMITS.eventVenueMax}
                        value={editingEvent.venue || ''}
                        onChange={(e) =>
                          setEditingEvent({ ...editingEvent, venue: e.target.value })
                        }
                        placeholder="Ex. Stade de France"
                        className="w-full px-3.5 py-2 text-sm bg-[#070B19] border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#3B82F6]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-slate-300 mb-1">Ville *</label>
                        <input
                          type="text"
                          required
                          maxLength={BLUEPRINT_LIMITS.eventCityMax}
                          value={editingEvent.city || ''}
                          onChange={(e) =>
                            setEditingEvent({ ...editingEvent, city: e.target.value })
                          }
                          placeholder="Paris"
                          className="w-full px-3 py-2 text-sm bg-[#070B19] border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#3B82F6]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-300 mb-1">Pays *</label>
                        <input
                          type="text"
                          required
                          maxLength={BLUEPRINT_LIMITS.eventCountryMax}
                          value={editingEvent.country || ''}
                          onChange={(e) =>
                            setEditingEvent({ ...editingEvent, country: e.target.value })
                          }
                          placeholder="France"
                          className="w-full px-3 py-2 text-sm bg-[#070B19] border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#3B82F6]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Image Upload or Preset Selector */}
                  <div className="space-y-3 pt-2 border-t border-white/[0.06]">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <label className="text-xs font-medium text-slate-300">
                        Visuel de l'événement (importer ou choisir)
                      </label>
                      <label className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-white bg-white/10 hover:bg-white/15 rounded-lg cursor-pointer transition-colors">
                        <Upload className="w-3.5 h-3.5" />
                        Importer une image
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleEventImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {GALLERY_PRESETS.map((preset) => (
                        <button
                          key={preset.url}
                          type="button"
                          onClick={() =>
                            setEditingEvent({ ...editingEvent, imageUrl: preset.url })
                          }
                          className={`relative aspect-[4/3] rounded-lg overflow-hidden border-2 transition-all ${
                            editingEvent.imageUrl === preset.url
                              ? 'border-[#3B82F6]'
                              : 'border-transparent opacity-70 hover:opacity-100'
                          }`}
                        >
                          <EventImage
                            src={preset.url}
                            alt={preset.label}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Descriptions */}
                  <div className="space-y-3 pt-2 border-t border-white/[0.06]">
                    <div>
                      <label className="block text-xs text-slate-300 mb-1">
                        Description (Français)
                      </label>
                      <textarea
                        rows={3}
                        maxLength={BLUEPRINT_LIMITS.eventDescMax}
                        value={editingEvent.descriptionFr || ''}
                        onChange={(e) =>
                          setEditingEvent({ ...editingEvent, descriptionFr: e.target.value })
                        }
                        className="w-full px-3.5 py-2 text-sm bg-[#070B19] border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#3B82F6]"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-slate-300 mb-1">
                          Description (Anglais - optionnel)
                        </label>
                        <textarea
                          rows={2}
                          maxLength={BLUEPRINT_LIMITS.eventDescMax}
                          value={editingEvent.descriptionEn || ''}
                          onChange={(e) =>
                            setEditingEvent({ ...editingEvent, descriptionEn: e.target.value })
                          }
                          className="w-full px-3.5 py-2 text-sm bg-[#070B19] border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#3B82F6]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-300 mb-1">
                          Description (Arabe - optionnel)
                        </label>
                        <textarea
                          rows={2}
                          dir="rtl"
                          maxLength={BLUEPRINT_LIMITS.eventDescMax}
                          value={editingEvent.descriptionAr || ''}
                          onChange={(e) =>
                            setEditingEvent({ ...editingEvent, descriptionAr: e.target.value })
                          }
                          className="w-full px-3.5 py-2 text-sm bg-[#070B19] border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#3B82F6]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Visibility Toggles */}
                  <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-white/[0.06]">
                    <label className="inline-flex items-center gap-2.5 text-sm text-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(editingEvent.published)}
                        onChange={(e) =>
                          setEditingEvent({ ...editingEvent, published: e.target.checked })
                        }
                        className="w-4 h-4 accent-[#3B82F6]"
                      />
                      Publié sur le site
                    </label>
                    <label className="inline-flex items-center gap-2.5 text-sm text-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(editingEvent.featured)}
                        onChange={(e) =>
                          setEditingEvent({ ...editingEvent, featured: e.target.checked })
                        }
                        className="w-4 h-4 accent-[#7C3AED]"
                      />
                      Mettre en avant sur la page d'accueil
                    </label>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setEditingEvent(null)}
                      className="px-4 py-2 text-sm text-slate-300 bg-white/5 hover:bg-white/10 rounded-lg"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={savingEvent}
                      className="px-5 py-2 text-sm font-semibold text-white bg-[#3B82F6] hover:bg-[#2563EB] disabled:opacity-60 rounded-lg"
                    >
                      {savingEvent ? 'Enregistrement...' : "Enregistrer l'événement"}
                    </button>
                  </div>
                </form>
              ) : eventsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3].map((n) => (
                    <div
                      key={n}
                      className="h-56 bg-[#0E152B] border border-white/[0.06] rounded-xl animate-pulse"
                    />
                  ))}
                </div>
              ) : events.length === 0 ? (
                <div className="bg-[#0E152B] border border-white/[0.08] rounded-xl p-10 text-center space-y-4">
                  <h3 className="text-lg font-semibold text-white">
                    Votre catalogue Firestore est vide
                  </h3>
                  <p className="text-sm text-slate-400 max-w-lg mx-auto">
                    Ajoutez votre premier événement manuellement ou importez les 6 événements internationaux de départ pour les personnaliser immédiatement.
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={openNewEventForm}
                      className="px-4 py-2.5 text-sm font-semibold text-white bg-[#3B82F6] hover:bg-[#2563EB] rounded-lg transition-colors"
                    >
                      Ajouter un événement
                    </button>
                    <button
                      type="button"
                      disabled={seedingEvents}
                      onClick={handleSeedStarterEvents}
                      className="px-4 py-2.5 text-sm font-medium text-slate-200 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
                    >
                      {seedingEvents
                        ? 'Importation...'
                        : 'Importer les 6 événements de départ'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {events.map((ev) => (
                    <div
                      key={ev.id}
                      className="bg-[#0E152B] border border-white/[0.08] rounded-xl overflow-hidden flex flex-col"
                    >
                      <div className="aspect-[4/3] bg-[#070B19] overflow-hidden">
                        <EventImage
                          src={ev.imageUrl}
                          alt={ev.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                        <div>
                          <div className="flex items-center justify-between gap-2 text-xs text-slate-400 mb-1">
                            <span className="text-[#93C5FD]">
                              {t.categories[ev.category]}
                            </span>
                            <span>
                              {ev.published ? 'Publié' : 'Brouillon'}
                              {ev.featured ? ' · À la une' : ''}
                            </span>
                          </div>
                          <h3 className="text-base font-bold text-white line-clamp-2">
                            {ev.title}
                          </h3>
                          <p className="text-xs text-slate-400 mt-1">
                            {ev.date} · {ev.venue} ({ev.city}, {ev.country})
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-white/[0.06]">
                          <button
                            type="button"
                            onClick={() => setEditingEvent(ev)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-200 bg-white/5 hover:bg-white/10 rounded-md transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            Modifier
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleEventField(ev, 'published')}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-200 bg-white/5 hover:bg-white/10 rounded-md transition-colors"
                          >
                            {ev.published ? (
                              <>
                                <EyeOff className="w-3.5 h-3.5" />
                                Masquer
                              </>
                            ) : (
                              <>
                                <Eye className="w-3.5 h-3.5" />
                                Publier
                              </>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleEventField(ev, 'featured')}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
                              ev.featured
                                ? 'text-amber-300 bg-amber-500/10 hover:bg-amber-500/20'
                                : 'text-slate-400 bg-white/5 hover:bg-white/10'
                            }`}
                          >
                            <Star className="w-3.5 h-3.5" />
                            Une
                          </button>
                          {confirmDeleteEventId === ev.id ? (
                            <button
                              type="button"
                              onClick={() => handleDeleteEvent(ev.id)}
                              className="px-2.5 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-md ms-auto"
                            >
                              Confirmer
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteEventId(ev.id)}
                              aria-label="Supprimer l'événement"
                              className="p-1.5 text-slate-400 hover:text-rose-400 rounded-md ms-auto"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* SITE CONTENT & SETTINGS TAB (NO-CODE MANAGEMENT) */
            <form
              onSubmit={handleSaveSiteSettings}
              className="bg-[#0E152B] border border-white/[0.08] rounded-xl p-6 sm:p-8 space-y-6 max-w-3xl"
            >
              <div className="border-b border-white/[0.08] pb-4">
                <h2 className="text-lg font-bold text-white">
                  Gestion du contenu du site (sans code)
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Modifiez les textes clés affichés sur la page d’accueil et les coordonnées administrateur. Les changements sont appliqués immédiatement sur le site public.
                </p>
              </div>

              {settingsFeedback && (
                <div className="text-xs text-emerald-300 bg-emerald-950/40 border border-emerald-500/30 rounded-lg px-4 py-2.5">
                  {settingsFeedback}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-300 mb-1.5">
                    Numéro WhatsApp Conciergerie
                  </label>
                  <input
                    type="text"
                    maxLength={40}
                    value={siteSettings.conciergeWhatsapp || ''}
                    onChange={(e) =>
                      setSiteSettings({ ...siteSettings, conciergeWhatsapp: e.target.value })
                    }
                    placeholder="+212 6 00 00 00 00"
                    className="w-full px-3.5 py-2 text-sm bg-[#070B19] border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#3B82F6]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1.5">
                    E-mail administrateur
                  </label>
                  <input
                    type="email"
                    maxLength={160}
                    value={siteSettings.adminNotificationEmail || ''}
                    onChange={(e) =>
                      setSiteSettings({
                        ...siteSettings,
                        adminNotificationEmail: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2 text-sm bg-[#070B19] border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#3B82F6]"
                  />
                </div>
              </div>

              <div className="space-y-4 pt-3 border-t border-white/[0.06]">
                <div>
                  <label className="block text-xs text-slate-300 mb-1.5">
                    Titre principal (Accueil — FR)
                  </label>
                  <input
                    type="text"
                    maxLength={240}
                    value={siteSettings.heroHeadlineFr || ''}
                    onChange={(e) =>
                      setSiteSettings({ ...siteSettings, heroHeadlineFr: e.target.value })
                    }
                    className="w-full px-3.5 py-2 text-sm bg-[#070B19] border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#3B82F6]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1.5">
                    Sous-titre (Accueil — FR)
                  </label>
                  <textarea
                    rows={2}
                    maxLength={600}
                    value={siteSettings.heroSubheadlineFr || ''}
                    onChange={(e) =>
                      setSiteSettings({ ...siteSettings, heroSubheadlineFr: e.target.value })
                    }
                    className="w-full px-3.5 py-2 text-sm bg-[#070B19] border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#3B82F6]"
                  />
                </div>
              </div>

              <div className="space-y-4 pt-3 border-t border-white/[0.06]">
                <div>
                  <label className="block text-xs text-slate-300 mb-1.5">
                    Titre section demande personnalisée (FR)
                  </label>
                  <input
                    type="text"
                    maxLength={200}
                    value={siteSettings.customHeadingFr || ''}
                    onChange={(e) =>
                      setSiteSettings({ ...siteSettings, customHeadingFr: e.target.value })
                    }
                    className="w-full px-3.5 py-2 text-sm bg-[#070B19] border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#3B82F6]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1.5">
                    Description section demande personnalisée (FR)
                  </label>
                  <textarea
                    rows={3}
                    maxLength={800}
                    value={siteSettings.customDescriptionFr || ''}
                    onChange={(e) =>
                      setSiteSettings({
                        ...siteSettings,
                        customDescriptionFr: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2 text-sm bg-[#070B19] border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#3B82F6]"
                  />
                </div>
              </div>

              <div className="space-y-4 pt-3 border-t border-white/[0.06]">
                <div>
                  <label className="block text-xs text-slate-300 mb-1.5">
                    Mention délai de recherche (FR)
                  </label>
                  <textarea
                    rows={2}
                    maxLength={600}
                    value={siteSettings.researchTimeFr || ''}
                    onChange={(e) =>
                      setSiteSettings({ ...siteSettings, researchTimeFr: e.target.value })
                    }
                    className="w-full px-3.5 py-2 text-sm bg-[#070B19] border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#3B82F6]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1.5">
                    Avertissement disponibilité (FR)
                  </label>
                  <textarea
                    rows={3}
                    maxLength={1200}
                    value={siteSettings.disclaimerFr || ''}
                    onChange={(e) =>
                      setSiteSettings({ ...siteSettings, disclaimerFr: e.target.value })
                    }
                    className="w-full px-3.5 py-2 text-sm bg-[#070B19] border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#3B82F6]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1.5">
                    Availability Disclaimer (EN)
                  </label>
                  <textarea
                    rows={3}
                    maxLength={1200}
                    value={siteSettings.disclaimerEn || ''}
                    onChange={(e) =>
                      setSiteSettings({ ...siteSettings, disclaimerEn: e.target.value })
                    }
                    className="w-full px-3.5 py-2 text-sm bg-[#070B19] border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#3B82F6]"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-[#3B82F6] hover:bg-[#2563EB] disabled:opacity-60 rounded-lg transition-colors"
                >
                  {savingSettings ? 'Enregistrement...' : 'Enregistrer et publier'}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
};
