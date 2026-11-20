import { Timestamp } from 'firebase/firestore';

export type Language = 'fr' | 'en' | 'ar';

export type EventCategory =
  | 'Football'
  | 'Concerts'
  | 'Festivals'
  | 'Sports'
  | 'International Events'
  | 'VIP Experiences';

export const EVENT_CATEGORIES: EventCategory[] = [
  'Football',
  'Concerts',
  'Festivals',
  'Sports',
  'International Events',
  'VIP Experiences',
];

export type RequestStatus =
  | 'New Request'
  | 'Under Research'
  | 'Searching for Options'
  | 'Offer Available'
  | 'Awaiting Customer Decision'
  | 'Payment Pending'
  | 'Confirmed'
  | 'Completed'
  | 'Unavailable'
  | 'Cancelled';

export const REQUEST_STATUSES: RequestStatus[] = [
  'New Request',
  'Under Research',
  'Searching for Options',
  'Offer Available',
  'Awaiting Customer Decision',
  'Payment Pending',
  'Confirmed',
  'Completed',
  'Unavailable',
  'Cancelled',
];

export type CurrencyCode = 'EUR' | 'MAD';

export interface EventItem {
  id: string;
  title: string;
  titleAr?: string;
  category: EventCategory;
  date: string;
  venue: string;
  city: string;
  country: string;
  descriptionFr?: string;
  descriptionEn?: string;
  descriptionAr?: string;
  imageUrl?: string;
  published: boolean;
  featured: boolean;
  isStarter?: boolean;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
}

export interface CommunicationEntry {
  id: string;
  channel: 'WhatsApp' | 'Email' | 'Phone' | 'Internal';
  direction: 'outbound' | 'inbound' | 'note';
  message: string;
  timestamp: string;
}

export interface TicketRequest {
  id: string;
  reference: string;
  requestType: 'catalog' | 'custom';
  eventId?: string;
  fullName: string;
  email?: string;
  whatsapp: string;
  eventName: string;
  eventDate: string;
  cityCountry?: string;
  ticketQuantity: number;
  preferredCategory: string;
  preferredSeating?: string;
  maxBudgetPerTicket: number;
  currency: CurrencyCode;
  additionalInfo?: string;
  status: RequestStatus;
  privateNotes?: string;
  offerTicketPrice?: number;
  offerServiceFee?: number;
  offerCurrency?: CurrencyCode;
  offerCategory?: string;
  offerMessage?: string;
  offerSentAt?: string;
  communications?: CommunicationEntry[];
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
}

export interface SiteSettings {
  conciergeWhatsapp?: string;
  adminNotificationEmail?: string;
  heroHeadlineFr?: string;
  heroSubheadlineFr?: string;
  customHeadingFr?: string;
  customDescriptionFr?: string;
  researchTimeFr?: string;
  disclaimerFr?: string;
  disclaimerEn?: string;
  updatedAt?: Timestamp | null;
}

export const BLUEPRINT_LIMITS = {
  eventTitleMax: 160,
  eventDateMax: 60,
  eventVenueMax: 140,
  eventCityMax: 80,
  eventCountryMax: 80,
  eventDescMax: 2000,
  fullNameMax: 120,
  emailMax: 160,
  whatsappMax: 40,
  eventNameMax: 180,
  requestDateMax: 80,
  cityCountryMax: 140,
  categoryMax: 100,
  seatingMax: 140,
  additionalInfoMax: 2000,
  privateNotesMax: 4000,
  offerCategoryMax: 140,
  offerMessageMax: 2000,
  maxTickets: 50,
  maxBudget: 1000000,
  maxCommunications: 30,
} as const;
