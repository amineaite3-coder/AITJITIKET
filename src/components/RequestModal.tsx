import React, { useState } from 'react';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { Check, Copy, X } from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { TRANSLATIONS } from '../i18n/translations';
import { BLUEPRINT_LIMITS, CurrencyCode, EventItem, Language } from '../types';

interface RequestModalProps {
  mode: 'catalog' | 'custom';
  event?: EventItem | null;
  lang: Language;
  onClose: () => void;
}

function generateReference(): string {
  const year = new Date().getFullYear();
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let suffix = '';
  for (let i = 0; i < 6; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `ATJ-${year}-${suffix}`;
}

export const RequestModal: React.FC<RequestModalProps> = ({
  mode,
  event,
  lang,
  onClose,
}) => {
  const t = TRANSLATIONS[lang];
  const isCatalog = mode === 'catalog' && !!event;

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [eventName, setEventName] = useState(
    isCatalog && event ? (lang === 'ar' && event.titleAr ? event.titleAr : event.title) : ''
  );
  const [eventDate, setEventDate] = useState(isCatalog && event ? event.date : '');
  const [cityCountry, setCityCountry] = useState(
    isCatalog && event ? `${event.city}, ${event.country}` : ''
  );
  const [ticketQuantity, setTicketQuantity] = useState<number>(2);
  const [preferredCategory, setPreferredCategory] = useState<string>(t.form.categories[2]);
  const [preferredSeating, setPreferredSeating] = useState('');
  const [maxBudgetPerTicket, setMaxBudgetPerTicket] = useState<string>('');
  const [currency, setCurrency] = useState<CurrencyCode>('EUR');
  const [additionalInfo, setAdditionalInfo] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopyRef = async () => {
    if (!submittedRef) return;
    try {
      await navigator.clipboard.writeText(submittedRef);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard may be unavailable in restricted contexts
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedName = fullName.trim().slice(0, BLUEPRINT_LIMITS.fullNameMax);
    const trimmedEmail = email.trim().slice(0, BLUEPRINT_LIMITS.emailMax);
    const trimmedWhatsapp = whatsapp.trim().slice(0, BLUEPRINT_LIMITS.whatsappMax);
    const trimmedEventName = eventName.trim().slice(0, BLUEPRINT_LIMITS.eventNameMax);
    const trimmedDate = eventDate.trim().slice(0, BLUEPRINT_LIMITS.requestDateMax);
    const trimmedCity = cityCountry.trim().slice(0, BLUEPRINT_LIMITS.cityCountryMax);
    const trimmedCategory = preferredCategory.trim().slice(0, BLUEPRINT_LIMITS.categoryMax);
    const trimmedSeating = preferredSeating.trim().slice(0, BLUEPRINT_LIMITS.seatingMax);
    const trimmedAdditional = additionalInfo.trim().slice(0, BLUEPRINT_LIMITS.additionalInfoMax);

    const parsedBudget = Number(maxBudgetPerTicket);
    const parsedQty = Math.min(
      BLUEPRINT_LIMITS.maxTickets,
      Math.max(1, Math.floor(Number(ticketQuantity) || 1))
    );

    if (
      trimmedName.length < 2 ||
      trimmedWhatsapp.length < 6 ||
      trimmedEventName.length < 2 ||
      trimmedDate.length < 2 ||
      (isCatalog && trimmedEmail.length < 5) ||
      (!isCatalog && trimmedCity.length < 2) ||
      Number.isNaN(parsedBudget) ||
      parsedBudget < 0 ||
      parsedBudget > BLUEPRINT_LIMITS.maxBudget
    ) {
      setErrorMsg(t.form.errorRequired);
      return;
    }

    setSubmitting(true);
    const reference = generateReference();
    const requestDocId = reference.toLowerCase();

    // If the event is a live Firestore event, link its eventId; if starter showcase, pass empty string
    const linkedEventId = isCatalog && event && !event.isStarter ? event.id : '';

    const payload = {
      reference,
      requestType: isCatalog ? 'catalog' : 'custom',
      eventId: linkedEventId,
      fullName: trimmedName,
      email: trimmedEmail,
      whatsapp: trimmedWhatsapp,
      eventName: trimmedEventName,
      eventDate: trimmedDate,
      cityCountry: trimmedCity,
      ticketQuantity: parsedQty,
      preferredCategory: trimmedCategory,
      preferredSeating: trimmedSeating,
      maxBudgetPerTicket: parsedBudget,
      currency,
      additionalInfo: trimmedAdditional,
      status: 'New Request',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    try {
      await setDoc(doc(db, 'requests', requestDocId), payload);
      setSubmittedRef(reference);
    } catch (err) {
      setErrorMsg(t.form.errorSubmit);
      try {
        handleFirestoreError(err, OperationType.CREATE, `requests/${requestDocId}`);
      } catch {
        // Logged via handleFirestoreError; keep user-friendly inline feedback visible
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="request-modal-title"
    >
      <div className="relative w-full max-w-2xl bg-[#0E152B] border border-white/10 rounded-xl shadow-2xl my-8 overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-white/[0.08]">
          <div>
            <h2 id="request-modal-title" className="text-xl font-bold text-white">
              {submittedRef
                ? t.form.confirmationTitle
                : isCatalog
                  ? t.form.catalogTitle
                  : t.form.customTitle}
            </h2>
            {!submittedRef && (
              <p className="text-sm text-slate-400 mt-1">
                {isCatalog ? t.form.catalogSubtitle : t.form.customSubtitle}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.form.closeBtn}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        {submittedRef ? (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="bg-[#070B19] border border-[#3B82F6]/30 rounded-lg p-5">
              <div className="text-xs text-slate-400 mb-1">{t.form.referenceLabel}</div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-2xl font-bold font-mono-tabular text-white tracking-wider">
                  {submittedRef}
                </span>
                <button
                  type="button"
                  onClick={handleCopyRef}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-200 bg-white/5 hover:bg-white/10 border border-white/10 rounded-md transition-colors whitespace-nowrap shrink-0"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? t.form.copied : t.form.copyReference}
                </button>
              </div>
            </div>

            <div className="space-y-3 text-sm text-slate-300 leading-relaxed">
              <p>{t.form.confirmationSubtitle}</p>
              <div className="bg-[#131C38] border border-white/[0.08] rounded-lg p-4 space-y-2">
                <div className="flex justify-between gap-4 text-xs">
                  <span className="text-slate-400">{t.form.eventName.replace(' *', '')}</span>
                  <span className="text-white font-medium text-end">{eventName}</span>
                </div>
                <div className="flex justify-between gap-4 text-xs">
                  <span className="text-slate-400">{t.form.eventDate.replace(' *', '')}</span>
                  <span className="text-slate-200">{eventDate}</span>
                </div>
                <div className="flex justify-between gap-4 text-xs">
                  <span className="text-slate-400">{t.form.ticketQuantity.replace(' *', '')}</span>
                  <span className="text-slate-200 font-mono-tabular">{ticketQuantity}</span>
                </div>
                <div className="flex justify-between gap-4 text-xs">
                  <span className="text-slate-400">{t.form.maxBudget.replace(' *', '')}</span>
                  <span className="text-slate-200 font-mono-tabular">
                    {maxBudgetPerTicket} {currency}
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-300">{t.form.confirmationTimeNote}</p>
              <p className="text-xs text-slate-400">{t.form.confirmationFreeNote}</p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-[#3B82F6] hover:bg-[#2563EB] rounded-lg transition-colors whitespace-nowrap"
              >
                {t.form.closeBtn}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
            {errorMsg && (
              <div className="p-3.5 text-sm text-rose-200 bg-rose-950/50 border border-rose-500/30 rounded-lg">
                {errorMsg}
              </div>
            )}

            {/* Event Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  {t.form.eventName}
                </label>
                <input
                  type="text"
                  required
                  maxLength={BLUEPRINT_LIMITS.eventNameMax}
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  readOnly={isCatalog}
                  placeholder={t.form.eventNamePlaceholder}
                  className={`w-full px-3.5 py-2.5 text-sm rounded-lg border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-[#3B82F6] ${
                    isCatalog ? 'bg-[#070B19]/70 text-slate-200 cursor-not-allowed' : 'bg-[#070B19]'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  {t.form.eventDate}
                </label>
                <input
                  type="text"
                  required
                  maxLength={BLUEPRINT_LIMITS.requestDateMax}
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  placeholder={t.form.eventDatePlaceholder}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#070B19] border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#3B82F6]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  {t.form.cityCountry}
                </label>
                <input
                  type="text"
                  required={!isCatalog}
                  maxLength={BLUEPRINT_LIMITS.cityCountryMax}
                  value={cityCountry}
                  onChange={(e) => setCityCountry(e.target.value)}
                  placeholder={t.form.cityCountryPlaceholder}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#070B19] border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#3B82F6]"
                />
              </div>
            </div>

            {/* Customer Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/[0.06]">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  {t.form.fullName}
                </label>
                <input
                  type="text"
                  required
                  maxLength={BLUEPRINT_LIMITS.fullNameMax}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={t.form.fullNamePlaceholder}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#070B19] border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#3B82F6]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  {t.form.whatsapp}
                </label>
                <input
                  type="tel"
                  required
                  maxLength={BLUEPRINT_LIMITS.whatsappMax}
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder={t.form.whatsappPlaceholder}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#070B19] border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#3B82F6]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  {isCatalog ? t.form.email : t.form.email.replace(' *', '')}
                </label>
                <input
                  type="email"
                  required={isCatalog}
                  maxLength={BLUEPRINT_LIMITS.emailMax}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.form.emailPlaceholder}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#070B19] border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#3B82F6]"
                />
              </div>
            </div>

            {/* Ticket Preferences & Budget */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-white/[0.06]">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  {t.form.ticketQuantity}
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  max={BLUEPRINT_LIMITS.maxTickets}
                  value={ticketQuantity}
                  onChange={(e) => setTicketQuantity(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-sm font-mono-tabular bg-[#070B19] border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#3B82F6]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  {t.form.maxBudget}
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  max={BLUEPRINT_LIMITS.maxBudget}
                  step="any"
                  value={maxBudgetPerTicket}
                  onChange={(e) => setMaxBudgetPerTicket(e.target.value)}
                  placeholder="250"
                  className="w-full px-3.5 py-2.5 text-sm font-mono-tabular bg-[#070B19] border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#3B82F6]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  {t.form.currency}
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#070B19] border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#3B82F6]"
                >
                  <option value="EUR">EUR (€)</option>
                  <option value="MAD">MAD (DH)</option>
                </select>
              </div>

              <div className="sm:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    {t.form.preferredCategory}
                  </label>
                  <select
                    value={preferredCategory}
                    onChange={(e) => setPreferredCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-[#070B19] border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#3B82F6]"
                  >
                    {t.form.categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    {t.form.preferredSeating}
                  </label>
                  <input
                    type="text"
                    maxLength={BLUEPRINT_LIMITS.seatingMax}
                    value={preferredSeating}
                    onChange={(e) => setPreferredSeating(e.target.value)}
                    placeholder={t.form.preferredSeatingPlaceholder}
                    className="w-full px-3.5 py-2.5 text-sm bg-[#070B19] border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#3B82F6]"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  {t.form.additionalInfo}
                </label>
                <textarea
                  rows={3}
                  maxLength={BLUEPRINT_LIMITS.additionalInfoMax}
                  value={additionalInfo}
                  onChange={(e) => setAdditionalInfo(e.target.value)}
                  placeholder={t.form.additionalInfoPlaceholder}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#070B19] border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#3B82F6] resize-y"
                />
              </div>
            </div>

            {/* Availability & Research Time Reminder */}
            <div className="bg-[#070B19] border border-white/[0.08] rounded-lg p-4 space-y-2 text-xs text-slate-400 leading-relaxed">
              <p className="text-slate-300">{t.form.freeObligationNotice}</p>
              <p>{t.howItWorks.researchTimeText}</p>
              <p>{t.disclaimer.body}</p>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-sm font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors whitespace-nowrap"
              >
                {t.form.cancelBtn}
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-[#3B82F6] hover:bg-[#2563EB] disabled:opacity-60 rounded-lg transition-colors whitespace-nowrap"
              >
                {submitting ? t.form.submittingBtn : t.form.submitBtn}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
