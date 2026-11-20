import React, { useState } from 'react';
import { Calendar, Check, Clock, ExternalLink, Link2, Loader2, Mail, MapPin, MessageCircle, Navigation, Share2, X } from 'lucide-react';
import { TRANSLATIONS } from '../i18n/translations';
import { EventItem, Language } from '../types';
import { EventImage } from './EventImage';

interface VenueMapsInfo {
  text: string;
  mapLinks: Array<{ title: string; uri: string }>;
  reviewSnippets: Array<{ text: string; uri?: string }>;
}

interface EventDetailModalProps {
  event: EventItem;
  lang: Language;
  onClose: () => void;
  onRequestPrice: (event: EventItem) => void;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  event,
  lang,
  onClose,
  onRequestPrice,
}) => {
  const t = TRANSLATIONS[lang];
  const [copied, setCopied] = useState(false);
  const [venueInfo, setVenueInfo] = useState<VenueMapsInfo | null>(null);
  const [venueLoading, setVenueLoading] = useState(false);
  const [venueError, setVenueError] = useState<string | null>(null);

  const handleLoadVenueMaps = async () => {
    setVenueLoading(true);
    setVenueError(null);
    try {
      const res = await fetch('/api/venue-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          venue: event.venue,
          city: event.city,
          country: event.country,
          lang,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Unable to load venue information.');
      }
      setVenueInfo({
        text: data.text || '',
        mapLinks: Array.isArray(data.mapLinks) ? data.mapLinks : [],
        reviewSnippets: Array.isArray(data.reviewSnippets) ? data.reviewSnippets : [],
      });
    } catch (err) {
      setVenueError(
        err instanceof Error ? err.message : 'Impossible de charger les infos Google Maps.'
      );
    } finally {
      setVenueLoading(false);
    }
  };

  const displayTitle = lang === 'ar' && event.titleAr ? event.titleAr : event.title;
  const displayDescription =
    lang === 'en'
      ? event.descriptionEn || event.descriptionFr
      : lang === 'ar'
        ? event.descriptionAr || event.descriptionFr
        : event.descriptionFr || event.descriptionEn;

  const shareUrl = (() => {
    const url = new URL(window.location.href);
    url.searchParams.set('event', event.id);
    url.hash = '';
    return url.toString();
  })();

  const shareText = `${t.catalogue.shareMessagePrefix} ${displayTitle} — ${event.date} (${event.city}, ${event.country})`;
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(shareText);
  const encodedFull = encodeURIComponent(`${shareText}\n${shareUrl}`);

  const whatsappHref = `https://wa.me/?text=${encodedFull}`;
  const xHref = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
  const facebookHref = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
  const emailHref = `mailto:?subject=${encodeURIComponent(displayTitle)}&body=${encodedFull}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API may be restricted in some environments
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="event-detail-title"
    >
      <div className="relative w-full max-w-2xl bg-[#0E152B] border border-white/10 rounded-xl shadow-2xl overflow-hidden my-8">
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#070B19]">
          <EventImage
            src={event.imageUrl}
            alt={displayTitle}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0E152B] via-[#0E152B]/35 to-transparent" />
          <button
            type="button"
            onClick={onClose}
            aria-label={t.form.closeBtn}
            className="absolute top-4 end-4 p-2 bg-[#070B19]/80 hover:bg-[#070B19] text-white rounded-lg border border-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mb-2">
              <span className="text-[#93C5FD] font-medium">
                {t.categories[event.category]}
              </span>
              <span aria-hidden="true">·</span>
              <span>{event.date}</span>
              <span aria-hidden="true">·</span>
              <span>
                {event.city}, {event.country}
              </span>
            </div>

            <h2 id="event-detail-title" className="text-2xl font-bold text-white">
              {displayTitle}
            </h2>

            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-slate-300">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-400" aria-hidden="true" />
                {event.date}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-slate-400" aria-hidden="true" />
                {event.venue} — {event.city}, {event.country}
              </span>
            </div>
          </div>

          {displayDescription && (
            <p className="text-sm text-slate-300 leading-relaxed">{displayDescription}</p>
          )}

          {/* Google Maps Grounding: Up-to-date Venue & Transit Info */}
          <div className="bg-[#070B19] border border-white/[0.08] rounded-lg p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-white">
                <Navigation className="w-3.5 h-3.5 text-[#93C5FD]" aria-hidden="true" />
                <span>
                  {lang === 'en'
                    ? 'Venue Location & Access (Google Maps)'
                    : lang === 'ar'
                      ? 'موقع الفعالية والوصول (خرائط Google)'
                      : 'Accès & Infos Lieu (Google Maps)'}
                </span>
              </div>
              {!venueInfo && (
                <button
                  type="button"
                  onClick={handleLoadVenueMaps}
                  disabled={venueLoading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-white/10 hover:bg-white/15 disabled:opacity-60 rounded-md transition-colors whitespace-nowrap"
                >
                  {venueLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {venueLoading
                    ? lang === 'en'
                      ? 'Loading...'
                      : lang === 'ar'
                        ? 'جاري التحميل...'
                        : 'Chargement...'
                    : lang === 'en'
                      ? 'View Maps Info'
                      : lang === 'ar'
                        ? 'عرض معلومات الخريطة'
                        : 'Voir infos & accès'}
                </button>
              )}
            </div>

            {venueError && (
              <p className="text-xs text-rose-300">{venueError}</p>
            )}

            {venueInfo && (
              <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
                {venueInfo.text && (
                  <p className="whitespace-pre-line">{venueInfo.text}</p>
                )}
                {venueInfo.mapLinks.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {venueInfo.mapLinks.map((link) => (
                      <a
                        key={link.uri}
                        href={link.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-[#93C5FD] hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-md transition-colors"
                      >
                        <MapPin className="w-3 h-3" aria-hidden="true" />
                        <span>{link.title}</span>
                        <ExternalLink className="w-3 h-3 opacity-75" aria-hidden="true" />
                      </a>
                    ))}
                  </div>
                )}
                {venueInfo.reviewSnippets.length > 0 && (
                  <div className="space-y-1.5 border-t border-white/[0.06] pt-2.5">
                    {venueInfo.reviewSnippets.map((snippet, idx) => (
                      <div key={idx} className="text-[11px] text-slate-400">
                        “{snippet.text}”
                        {snippet.uri && (
                          <a
                            href={snippet.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ms-1.5 text-[#93C5FD] hover:underline"
                          >
                            Google Maps
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Social Media Sharing Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 py-3.5 border-y border-white/[0.08]">
            <div className="inline-flex items-center gap-2 text-xs font-medium text-slate-300">
              <Share2 className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
              <span>{t.catalogue.shareLabel}</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-white/5 hover:bg-white/10 border border-white/[0.08] rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                WhatsApp
              </a>
              <a
                href={xHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-white/5 hover:bg-white/10 border border-white/[0.08] rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                X
              </a>
              <a
                href={facebookHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-white/5 hover:bg-white/10 border border-white/[0.08] rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                Facebook
              </a>
              <a
                href={emailHref}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-white/5 hover:bg-white/10 border border-white/[0.08] rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                <Mail className="w-3.5 h-3.5 text-slate-300" aria-hidden="true" />
                Email
              </a>
              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-white/5 hover:bg-white/10 border border-white/[0.08] rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                ) : (
                  <Link2 className="w-3.5 h-3.5 text-[#93C5FD]" aria-hidden="true" />
                )}
                {copied ? t.catalogue.linkCopied : t.catalogue.copyLink}
              </button>
            </div>
          </div>

          <div className="bg-[#070B19] border border-white/[0.08] rounded-lg p-4 space-y-2.5 text-xs text-slate-400 leading-relaxed">
            <div className="flex items-start gap-2 text-slate-300">
              <Clock className="w-4 h-4 text-[#7C3AED] shrink-0 mt-0.5" aria-hidden="true" />
              <span>{t.howItWorks.researchTimeText}</span>
            </div>
            <p>{t.disclaimer.body}</p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-white/[0.08]">
            <span className="text-xs text-slate-400">{t.catalogue.disclaimerShort}</span>
            <button
              type="button"
              onClick={() => onRequestPrice(event)}
              className="px-6 py-3 text-sm font-semibold text-white bg-[#3B82F6] hover:bg-[#2563EB] rounded-lg transition-colors whitespace-nowrap"
            >
              {t.catalogue.requestPriceBtn}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
