import React, { useEffect, useMemo, useState } from 'react';
import { collection, doc, onSnapshot, query, where } from 'firebase/firestore';
import { ArrowRight, Clock, Menu, Search, ShieldCheck, X } from 'lucide-react';
import { AdminDashboard } from './components/AdminDashboard';
import { ErrorBoundary } from './components/ErrorBoundary';
import { EventDetailModal } from './components/EventDetailModal';
import { EventImage } from './components/EventImage';
import { FaqSection } from './components/FaqSection';
import { RequestModal } from './components/RequestModal';
import { HERO_IMAGE_PATH, STARTER_EVENTS } from './data/starterEvents';
import { db } from './firebase';
import { TRANSLATIONS } from './i18n/translations';
import { EVENT_CATEGORIES, EventCategory, EventItem, Language, SiteSettings } from './types';

function MainApp() {
  const [lang, setLang] = useState<Language>('fr');
  const [view, setView] = useState<'storefront' | 'admin'>('storefront');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [firestoreEvents, setFirestoreEvents] = useState<EventItem[]>([]);
  const [eventsLoaded, setEventsLoaded] = useState(false);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<EventCategory | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const [detailEvent, setDetailEvent] = useState<EventItem | null>(null);
  const [requestModalState, setRequestModalState] = useState<{
    open: boolean;
    mode: 'catalog' | 'custom';
    event?: EventItem | null;
  }>({ open: false, mode: 'custom', event: null });

  const t = TRANSLATIONS[lang];

  // Sync HTML lang and dir attributes for French / English / Arabic RTL support
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  // Subscribe to published events from Firestore
  useEffect(() => {
    const q = query(collection(db, 'events'), where('published', '==', true));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const list: EventItem[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<EventItem, 'id'>),
        }));
        setFirestoreEvents(list);
        setEventsLoaded(true);
      },
      (err) => {
        console.error('Error loading published events:', err);
        setEventsLoaded(true);
      }
    );
    return () => unsub();
  }, []);

  // Subscribe to admin-managed site content settings
  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, 'settings', 'site'),
      (snap) => {
        if (snap.exists()) {
          setSiteSettings(snap.data() as SiteSettings);
        }
      },
      () => {
        // Fallback silently to default copy if not yet initialized
      }
    );
    return () => unsub();
  }, []);

  const heroHeadline =
    lang === 'fr' && siteSettings?.heroHeadlineFr ? siteSettings.heroHeadlineFr : t.hero.headline;
  const heroSubheadline =
    lang === 'fr' && siteSettings?.heroSubheadlineFr
      ? siteSettings.heroSubheadlineFr
      : t.hero.subheadline;
  const customHeading =
    lang === 'fr' && siteSettings?.customHeadingFr
      ? siteSettings.customHeadingFr
      : t.customSection.heading;
  const customDescription =
    lang === 'fr' && siteSettings?.customDescriptionFr
      ? siteSettings.customDescriptionFr
      : t.customSection.description;
  const researchTimeText =
    lang === 'fr' && siteSettings?.researchTimeFr
      ? siteSettings.researchTimeFr
      : t.howItWorks.researchTimeText;
  const disclaimerPrimary =
    lang === 'fr' && siteSettings?.disclaimerFr
      ? siteSettings.disclaimerFr
      : lang === 'en' && siteSettings?.disclaimerEn
        ? siteSettings.disclaimerEn
        : t.disclaimer.body;
  const disclaimerCounterpart =
    lang === 'en'
      ? siteSettings?.disclaimerFr || TRANSLATIONS.fr.disclaimer.body
      : siteSettings?.disclaimerEn || TRANSLATIONS.en.disclaimer.body;

  // Use live Firestore events once the admin has added any; otherwise show the curated starter selection
  const activeEvents = useMemo(() => {
    const source = firestoreEvents.length > 0 ? firestoreEvents : STARTER_EVENTS;
    return [...source].sort((a, b) => Number(b.featured) - Number(a.featured));
  }, [firestoreEvents]);

  // Open event detail modal automatically when visiting a shared ?event=<id> link
  useEffect(() => {
    if (!eventsLoaded) return;
    const sharedEventId = new URLSearchParams(window.location.search).get('event');
    if (!sharedEventId) return;
    const matched = activeEvents.find((ev) => ev.id === sharedEventId);
    if (matched) {
      setDetailEvent(matched);
    }
  }, [eventsLoaded, activeEvents]);

  const filteredEvents = useMemo(() => {
    return activeEvents.filter((ev) => {
      if (selectedCategory !== 'ALL' && ev.category !== selectedCategory) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        ev.title.toLowerCase().includes(q) ||
        (ev.titleAr && ev.titleAr.toLowerCase().includes(q)) ||
        ev.city.toLowerCase().includes(q) ||
        ev.country.toLowerCase().includes(q) ||
        ev.venue.toLowerCase().includes(q)
      );
    });
  }, [activeEvents, selectedCategory, searchQuery]);

  const openCatalogRequest = (ev: EventItem) => {
    setDetailEvent(null);
    setRequestModalState({ open: true, mode: 'catalog', event: ev });
  };

  const openCustomRequest = () => {
    setDetailEvent(null);
    setRequestModalState({ open: true, mode: 'custom', event: null });
  };

  if (view === 'admin') {
    return (
      <AdminDashboard
        lang={lang}
        onBackToSite={() => setView('storefront')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#070B19] text-slate-100 flex flex-col">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-40 bg-[#070B19]/90 backdrop-blur-md border-b border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single-element Brand Wordmark */}
          <a
            href="#top"
            className="font-display text-xl font-extrabold tracking-tight text-white whitespace-nowrap shrink-0"
          >
            AITJITIKET
          </a>

          {/* Zone 2: 4 single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
            <a
              href="#events"
              className="hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              {t.nav.events}
            </a>
            <a
              href="#custom-request"
              className="hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              {t.nav.customRequest}
            </a>
            <a
              href="#how-it-works"
              className="hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              {t.nav.howItWorks}
            </a>
            <a
              href="#faq"
              className="hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              FAQ
            </a>
            <button
              type="button"
              onClick={() => setView('admin')}
              className="hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              {t.nav.admin}
            </button>
          </nav>

          {/* Zone 3: 1 primary action + mobile menu button */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={openCustomRequest}
              className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-white bg-[#3B82F6] hover:bg-[#2563EB] rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              {t.nav.primaryCta}
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((o) => !o)}
              aria-label="Menu"
              className="md:hidden p-2 text-slate-300 hover:text-white rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/[0.08] bg-[#0B1124] px-6 py-4 space-y-3">
            <a
              href="#events"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm text-slate-200 hover:text-white"
            >
              {t.nav.events}
            </a>
            <a
              href="#custom-request"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm text-slate-200 hover:text-white"
            >
              {t.nav.customRequest}
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm text-slate-200 hover:text-white"
            >
              {t.nav.howItWorks}
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm text-slate-200 hover:text-white"
            >
              FAQ
            </a>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setView('admin');
              }}
              className="block w-full text-start py-2 text-sm text-slate-200 hover:text-white"
            >
              {t.nav.admin}
            </button>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                openCustomRequest();
              }}
              className="w-full mt-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#3B82F6] hover:bg-[#2563EB] rounded-lg"
            >
              {t.nav.primaryCta}
            </button>
          </div>
        )}
      </header>

      <main id="top" className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden border-b border-white/[0.08]">
          {/* Background stadium image with measured contrast scrim */}
          <div className="absolute inset-0">
            <EventImage
              src={HERO_IMAGE_PATH}
              alt="International stadium illuminated at night"
              className="w-full h-full object-cover opacity-35"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#070B19]/80 via-[#070B19]/75 to-[#070B19]" />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 sm:pb-24">
            {/* Language Switcher Row (FR / EN / AR) */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-10 border-b border-white/[0.08]">
              <p className="text-xs text-slate-300 tracking-wide">
                {t.hero.kicker}
              </p>
              <div
                className="inline-flex items-center gap-1 p-1 bg-[#0E152B]/90 border border-white/10 rounded-lg"
                role="group"
                aria-label="Language"
              >
                {(['fr', 'en', 'ar'] as Language[]).map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setLang(code)}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                      lang === code
                        ? 'bg-[#3B82F6] text-white'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    {code === 'fr' ? 'Français' : code === 'en' ? 'English' : 'العربية'}
                  </button>
                ))}
              </div>
            </div>

            {/* Hero Statement */}
            <div className="max-w-3xl pt-12 pb-12 space-y-5">
              <h1
                className="font-display font-extrabold text-white tracking-tight leading-[1.12]"
                style={{ fontSize: 'clamp(2.25rem, 4.2vw, 3.65rem)' }}
              >
                {heroHeadline}
              </h1>
              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
                {heroSubheadline}
              </p>
            </div>

            {/* Two Clear Ways to Request Tickets (Option A & Option B) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl">
              <div className="bg-[#0E152B]/90 border border-white/10 rounded-xl p-6 flex flex-col justify-between gap-5">
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-[#93C5FD]">
                    {t.hero.optionALabel}
                  </div>
                  <h2 className="text-lg font-bold text-white">{t.hero.optionATitle}</h2>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {t.hero.optionADesc}
                  </p>
                </div>
                <div>
                  <a
                    href="#events"
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#3B82F6] hover:bg-[#2563EB] rounded-lg transition-colors whitespace-nowrap"
                  >
                    {t.hero.optionACta}
                    <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                  </a>
                </div>
              </div>

              <div className="bg-[#0E152B]/90 border border-[#7C3AED]/35 rounded-xl p-6 flex flex-col justify-between gap-5">
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-[#C4B5FD]">
                    {t.hero.optionBLabel}
                  </div>
                  <h2 className="text-lg font-bold text-white">{t.hero.optionBTitle}</h2>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {t.hero.optionBDesc}
                  </p>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={openCustomRequest}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#7C3AED] hover:bg-[#6D28D9] rounded-lg transition-colors whitespace-nowrap"
                  >
                    {t.hero.optionBCta}
                    <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* EVENTS CATALOGUE SECTION (OPTION A) */}
        <section id="events" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
            <div className="max-w-2xl space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {t.catalogue.heading}
              </h2>
              <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
                {t.catalogue.subheading}
              </p>
            </div>

            <div className="relative w-full lg:w-80">
              <Search className="w-4 h-4 text-slate-500 absolute start-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.catalogue.searchPlaceholder}
                className="w-full ps-10 pe-4 py-2.5 text-sm bg-[#0E152B] border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#3B82F6]"
              />
            </div>
          </div>

          {/* Category Filter Bar (Interactive Segmented Controls) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-8 border-b border-white/[0.08]">
            <button
              type="button"
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                selectedCategory === 'ALL'
                  ? 'bg-[#3B82F6] text-white'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              {t.catalogue.allCategories}
            </button>
            {EVENT_CATEGORIES.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  selectedCategory === category
                    ? 'bg-[#3B82F6] text-white'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {t.categories[category]}
              </button>
            ))}
          </div>

          {/* Event Cards Grid */}
          {!eventsLoaded && firestoreEvents.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="h-96 bg-[#0E152B] border border-white/[0.06] rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="bg-[#0E152B] border border-white/[0.08] rounded-xl p-10 text-center space-y-4">
              <p className="text-sm text-slate-300">{t.catalogue.noResults}</p>
              <button
                type="button"
                onClick={openCustomRequest}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-[#7C3AED] hover:bg-[#6D28D9] rounded-lg transition-colors"
              >
                {t.catalogue.noResultsCta}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((ev) => {
                const displayTitle = lang === 'ar' && ev.titleAr ? ev.titleAr : ev.title;
                return (
                  <article
                    key={ev.id}
                    className="group bg-[#0E152B] border border-white/[0.08] hover:border-white/20 rounded-xl overflow-hidden flex flex-col transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => setDetailEvent(ev)}
                      className="relative aspect-[4/3] w-full overflow-hidden bg-[#070B19] text-start"
                    >
                      <EventImage
                        src={ev.imageUrl}
                        alt={displayTitle}
                        className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0E152B]/80 via-transparent to-transparent" />
                    </button>

                    <div className="p-6 flex-1 flex flex-col justify-between gap-5">
                      <div className="space-y-2.5">
                        {/* Unboxed Metadata Line (Zero-Pill Rule) */}
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                          <span className="text-[#93C5FD] font-medium">
                            {t.categories[ev.category]}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{ev.date}</span>
                          {ev.featured && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="text-[#C4B5FD]">{t.catalogue.featuredLabel}</span>
                            </>
                          )}
                        </div>

                        <h3 className="text-lg font-bold text-white leading-snug">
                          <button
                            type="button"
                            onClick={() => setDetailEvent(ev)}
                            className="text-start hover:text-[#93C5FD] transition-colors"
                          >
                            {displayTitle}
                          </button>
                        </h3>

                        <p className="text-sm text-slate-400">
                          {ev.venue} — {ev.city}, {ev.country}
                        </p>
                      </div>

                      <div className="space-y-3 pt-4 border-t border-white/[0.06]">
                        <div className="text-xs text-slate-400">
                          {t.catalogue.disclaimerShort}
                        </div>
                        <div className="flex items-center gap-2.5">
                          <button
                            type="button"
                            onClick={() => openCatalogRequest(ev)}
                            className="flex-1 px-4 py-2.5 text-xs font-bold tracking-wide text-white bg-[#3B82F6] hover:bg-[#2563EB] rounded-lg transition-colors whitespace-nowrap"
                          >
                            {t.catalogue.requestPriceBtn}
                          </button>
                          <button
                            type="button"
                            onClick={() => setDetailEvent(ev)}
                            className="px-3.5 py-2.5 text-xs font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors whitespace-nowrap"
                          >
                            {t.catalogue.viewDetailsBtn}
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* DEDICATED HOMEPAGE SECTION: EVENTS NOT LISTED ON THE WEBSITE (OPTION B) */}
        <section
          id="custom-request"
          className="border-y border-white/[0.08] bg-[#0B1124] py-16 sm:py-24"
        >
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-[#0E152B] border border-[#7C3AED]/30 rounded-2xl p-8 sm:p-12 text-center space-y-6">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {customHeading}
              </h2>
              <p className="text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
                {customDescription}
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={openCustomRequest}
                  className="inline-flex items-center gap-2.5 px-7 py-3.5 text-sm font-bold tracking-wide text-white bg-[#7C3AED] hover:bg-[#6D28D9] rounded-lg transition-colors whitespace-nowrap"
                >
                  {t.customSection.ctaButton}
                  <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                </button>
              </div>
              <p className="text-xs text-slate-400">{t.customSection.noteFree}</p>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS & RESEARCH TIME */}
        <section
          id="how-it-works"
          className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14"
        >
          <div className="max-w-2xl space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {t.howItWorks.heading}
            </h2>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
              {t.howItWorks.subheading}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3 border-t border-white/15 pt-6">
              <h3 className="text-lg font-bold text-white">{t.howItWorks.step1Title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                {t.howItWorks.step1Desc}
              </p>
            </div>
            <div className="space-y-3 border-t border-white/15 pt-6">
              <h3 className="text-lg font-bold text-white">{t.howItWorks.step2Title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                {t.howItWorks.step2Desc}
              </p>
            </div>
            <div className="space-y-3 border-t border-white/15 pt-6">
              <h3 className="text-lg font-bold text-white">{t.howItWorks.step3Title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                {t.howItWorks.step3Desc}
              </p>
            </div>
          </div>

          {/* Research Time Notice */}
          <div className="bg-[#0E152B] border border-white/[0.08] rounded-xl p-6 sm:p-8 flex flex-col sm:flex-row items-start gap-5">
            <div className="p-3 bg-[#7C3AED]/15 text-[#C4B5FD] rounded-lg shrink-0">
              <Clock className="w-6 h-6" aria-hidden="true" />
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-bold text-white">
                {t.howItWorks.researchTimeHeading}
              </h3>
              <p className="text-sm text-slate-200 leading-relaxed">
                {researchTimeText}
              </p>
              <p className="text-xs text-slate-400 leading-relaxed">
                {t.howItWorks.researchTimeClarification}
              </p>
            </div>
          </div>
        </section>

        {/* OFFICIAL FAQ & TRANSPARENCY COMMITMENT */}
        <div className="border-t border-white/[0.08]">
          <FaqSection lang={lang} onContactClick={openCustomRequest} />
        </div>

        {/* IMPORTANT AVAILABILITY DISCLAIMER */}
        <section className="border-t border-white/[0.08] bg-[#0B1124]/80 py-14 sm:py-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-[#93C5FD] shrink-0" aria-hidden="true" />
              <h2 className="text-lg font-bold text-white">{t.disclaimer.heading}</h2>
            </div>

            <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
              {disclaimerPrimary}
            </p>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed border-t border-white/[0.06] pt-4">
              {disclaimerCounterpart}
            </p>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              {t.disclaimer.secondaryNote}
            </p>

            <ul className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {t.disclaimer.rules.map((rule) => (
                <li
                  key={rule}
                  className="bg-[#070B19] border border-white/[0.08] rounded-lg p-4 text-xs text-slate-300 leading-relaxed"
                >
                  {rule}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      {/* QUIET FOOTER */}
      <footer className="border-t border-white/[0.08] bg-[#070B19] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-md">
            <div className="font-display text-lg font-extrabold tracking-tight text-white">
              AITJITIKET
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">{t.footer.tagline}</p>
            <p className="text-xs text-slate-500">{t.footer.conciergeNotice}</p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-slate-400">
            <a href="#events" className="hover:text-white transition-colors">
              {t.nav.events}
            </a>
            <a href="#custom-request" className="hover:text-white transition-colors">
              {t.nav.customRequest}
            </a>
            <a href="#how-it-works" className="hover:text-white transition-colors">
              {t.nav.howItWorks}
            </a>
            <a href="#faq" className="hover:text-white transition-colors">
              FAQ
            </a>
            <button
              type="button"
              onClick={() => setView('admin')}
              className="hover:text-white transition-colors"
            >
              {t.footer.adminAccess}
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pt-6 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
          <span>
            © {new Date().getFullYear()} {t.footer.rights}
          </span>
          <div className="flex items-center gap-3">
            {(['fr', 'en', 'ar'] as Language[]).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setLang(code)}
                className={`transition-colors ${
                  lang === code ? 'text-white font-medium' : 'hover:text-slate-300'
                }`}
              >
                {code === 'fr' ? 'FR' : code === 'en' ? 'EN' : 'AR'}
              </button>
            ))}
          </div>
        </div>
      </footer>

      {/* Modals */}
      {detailEvent && (
        <EventDetailModal
          event={detailEvent}
          lang={lang}
          onClose={() => setDetailEvent(null)}
          onRequestPrice={openCatalogRequest}
        />
      )}

      {requestModalState.open && (
        <RequestModal
          mode={requestModalState.mode}
          event={requestModalState.event}
          lang={lang}
          onClose={() => setRequestModalState({ open: false, mode: 'custom', event: null })}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <MainApp />
    </ErrorBoundary>
  );
}
