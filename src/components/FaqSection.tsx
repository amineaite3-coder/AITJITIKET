import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Language } from '../types';

interface FaqItem {
  number: string;
  question: string;
  paragraphs: string[];
  bullets?: string[];
  closing?: string;
}

interface FaqContent {
  heading: string;
  subheading: string;
  items: FaqItem[];
  commitmentHeading: string;
  commitmentIntro: string;
  commitmentPoints: string[];
  tagline: string;
  contactPrompt: string;
  contactCta: string;
}

const FAQ_DATA: Record<Language, FaqContent> = {
  fr: {
    heading: 'FAQ – AITJITIKET',
    subheading:
      'Toutes les réponses claires sur notre service indépendant de recherche et d’accompagnement billetterie.',
    items: [
      {
        number: '01',
        question: 'Qui sommes-nous ?',
        paragraphs: [
          'AITJITIKET est un service indépendant d’accompagnement et de recherche de billets pour les concerts, festivals, matchs de football et événements sportifs.',
          'Notre mission est de vous aider à rechercher des solutions adaptées à votre événement, à vos préférences et à votre budget.',
          'Nous ne sommes pas une billetterie officielle et nous ne prétendons pas être partenaires des organisateurs sans autorisation.',
        ],
      },
      {
        number: '02',
        question: 'Comment fonctionne AITJITIKET ?',
        paragraphs: ["C'est simple :"],
        bullets: [
          '1. Choisissez un événement sur notre site ou faites une demande personnalisée.',
          '2. Cliquez sur « DEMANDER UN PRIX ».',
          '3. Indiquez le nombre de billets, la catégorie souhaitée et votre budget.',
          '4. Notre équipe étudie les possibilités disponibles auprès de différentes sources.',
          '5. Nous vous contactons pour vous présenter les options que nous avons pu identifier.',
        ],
        closing: "Vous êtes libre d'accepter ou de refuser notre proposition.",
      },
      {
        number: '03',
        question: 'Est-ce que ma demande est gratuite ?',
        paragraphs: [
          'Oui. Envoyer une demande à AITJITIKET est gratuit et sans engagement.',
          "Vous n'avez aucune obligation d'acheter un billet après avoir reçu notre proposition.",
        ],
      },
      {
        number: '04',
        question: 'Est-ce que les billets sont immédiatement disponibles ?',
        paragraphs: [
          'Pas nécessairement. Les événements présentés sur notre site sont des événements que nous pouvons étudier à la demande.',
          'La disponibilité des billets dépend des sources consultées et peut évoluer rapidement. Une demande envoyée ne constitue donc pas une réservation ni une confirmation de disponibilité.',
        ],
      },
      {
        number: '05',
        question: 'Pourquoi les prix ne sont-ils pas affichés directement ?',
        paragraphs: [
          "Les prix peuvent varier selon l'événement, la catégorie, le nombre de billets et les disponibilités auprès des différentes sources.",
          "Nous préférons étudier votre demande et vous communiquer une proposition personnalisée plutôt que d'afficher un prix qui pourrait ne plus être valable.",
        ],
      },
      {
        number: '06',
        question: 'Combien de temps faut-il pour recevoir une réponse ?',
        paragraphs: [
          "Notre délai habituel de recherche et de préparation d'une proposition est de 24 à 48 heures.",
          'Ce délai peut varier selon la complexité de votre demande et les possibilités de disponibilité. Il ne constitue pas une garantie de disponibilité ou de livraison des billets.',
        ],
      },
      {
        number: '07',
        question: 'Comment puis-je être sûr de la fiabilité des billets ?',
        paragraphs: [
          'La confiance et la transparence sont importantes pour AITJITIKET.',
          'Avant de vous présenter une option, nous cherchons à examiner les informations disponibles sur la source, le type de billet, les conditions de transfert et les éventuelles restrictions.',
          'Nous vous communiquons les informations et conditions que nous avons pu vérifier avant toute décision de votre part. Si nous ne pouvons pas établir un niveau de fiabilité suffisant, nous préférons ne pas vous proposer cette option.',
          "Aucun contrôle ne peut toutefois garantir à lui seul l'admission à un événement. Les conditions de l'organisateur et du lieu restent applicables.",
        ],
      },
      {
        number: '08',
        question: 'Dois-je payer immédiatement après ma demande ?',
        paragraphs: [
          "Non. L'envoi d'une demande ne nécessite aucun paiement.",
          "Un éventuel paiement intervient uniquement après présentation d'une proposition, confirmation des conditions et accord explicite du client.",
          'Les modalités de paiement vous seront communiquées avant toute transaction.',
        ],
      },
      {
        number: '09',
        question: 'Comment vais-je recevoir mes billets ?',
        paragraphs: [
          'Le mode de livraison dépend du type de billet et des conditions de la source : transfert électronique, application officielle ou autre méthode autorisée.',
          'Les modalités exactes vous seront expliquées avant votre accord et votre paiement.',
        ],
      },
      {
        number: '10',
        question: "Puis-je demander un événement qui n'apparaît pas sur le site ?",
        paragraphs: [
          "Bien sûr ! Vous pouvez nous contacter pour n'importe quel événement, même s'il n'est pas affiché sur AITJITIKET.",
          "Indiquez-nous le nom de l'événement, la date, la ville et le nombre de billets souhaités. Notre équipe étudiera les possibilités.",
        ],
      },
      {
        number: '11',
        question: 'Puis-je choisir ma catégorie et mon budget ?',
        paragraphs: [
          'Oui. Vous pouvez préciser votre catégorie préférée, votre emplacement souhaité et votre budget maximum par billet.',
          "Nous ferons notre possible pour rechercher des options correspondant à vos critères, sans garantir qu'elles seront disponibles.",
        ],
      },
      {
        number: '12',
        question: 'Comment puis-je contacter votre équipe ?',
        paragraphs: ['Vous pouvez choisir le moyen de communication qui vous convient :'],
        bullets: ['WhatsApp', 'E-mail', 'Appel téléphonique'],
        closing: 'Notre équipe vous contactera selon votre préférence indiquée lors de la demande.',
      },
      {
        number: '13',
        question: "Que se passe-t-il si aucune option n'est disponible ?",
        paragraphs: [
          'Si nous ne trouvons aucune option correspondant à votre demande, nous vous en informerons clairement.',
          'Nous ne vous demanderons jamais de payer pour une disponibilité que nous ne pouvons pas confirmer.',
        ],
      },
      {
        number: '14',
        question: 'Puis-je annuler ma demande ?',
        paragraphs: [
          "Oui. Tant que vous n'avez pas accepté une proposition, vous pouvez retirer votre demande sans engagement.",
          "Si vous avez déjà accepté une offre ou effectué un paiement, les conditions d'annulation et de remboursement qui vous ont été communiquées avant la transaction s'appliquent.",
        ],
      },
      {
        number: '15',
        question: 'Comment mes informations personnelles sont-elles utilisées ?',
        paragraphs: [
          'Les informations communiquées lors de votre demande servent à traiter celle-ci et à vous contacter.',
          'Nous ne devons collecter que les informations nécessaires à ce service et les protéger conformément à notre politique de confidentialité et aux règles applicables.',
        ],
      },
    ],
    commitmentHeading: 'Notre engagement envers vous',
    commitmentIntro: 'Chez AITJITIKET, nous croyons que la confiance se construit grâce à la transparence.',
    commitmentPoints: [
      'Aucune disponibilité inventée.',
      'Aucun prix présenté comme garanti sans confirmation.',
      "Aucune obligation d'achat après une demande.",
      'Des informations communiquées avant toute décision.',
      'Un accompagnement humain pendant votre recherche.',
    ],
    tagline: 'AITJITIKET – YOUR TICKET. OUR MISSION.',
    contactPrompt: 'Vous avez encore une question ? Contactez notre équipe avant de prendre votre décision.',
    contactCta: 'Contacter notre équipe',
  },
  en: {
    heading: 'FAQ – AITJITIKET',
    subheading:
      'Clear answers about our independent ticket research and concierge assistance service.',
    items: [
      {
        number: '01',
        question: 'Who are we?',
        paragraphs: [
          'AITJITIKET is an independent ticket research and assistance service for concerts, festivals, football matches, and international sporting events.',
          'Our mission is to help you research options tailored to your event, preferences, and budget.',
          'We are not an official box office and never claim unauthorized partnerships with event organizers.',
        ],
      },
      {
        number: '02',
        question: 'How does AITJITIKET work?',
        paragraphs: ['It is simple:'],
        bullets: [
          '1. Choose an event on our website or submit a custom request.',
          '2. Click "REQUEST A PRICE".',
          '3. Enter the number of tickets, preferred category, and maximum budget.',
          '4. Our team researches possible options across market sources.',
          '5. We contact you to present any options we have identified.',
        ],
        closing: 'You are completely free to accept or decline our proposal.',
      },
      {
        number: '03',
        question: 'Is my request free?',
        paragraphs: [
          'Yes. Submitting a request to AITJITIKET is completely free and without obligation.',
          'You have no obligation to purchase tickets after receiving a proposal.',
        ],
      },
      {
        number: '04',
        question: 'Are tickets immediately available?',
        paragraphs: [
          'Not necessarily. Events listed on our site are events we can research upon request.',
          'Ticket availability depends on market sources and can change rapidly. Submitting a request is never a confirmed booking or guarantee of availability.',
        ],
      },
      {
        number: '05',
        question: 'Why are prices not displayed directly?',
        paragraphs: [
          'Prices vary depending on the event, seating category, ticket quantity, and real-time market availability.',
          'We prefer to research your request individually and share a tailored proposal rather than showing outdated or inaccurate prices.',
        ],
      },
      {
        number: '06',
        question: 'How long does it take to receive a response?',
        paragraphs: [
          'Our usual research and proposal preparation time is 24 to 48 hours.',
          'This timeframe may vary depending on request complexity and availability, and is not a guaranteed ticket delivery time.',
        ],
      },
      {
        number: '07',
        question: 'How can I be confident about ticket reliability?',
        paragraphs: [
          'Trust and transparency are central to AITJITIKET.',
          'Before presenting an option, we review available information on the source, ticket format, transfer terms, and any restrictions.',
          'We share verified details and conditions before you decide. If we cannot establish sufficient confidence, we prefer not to propose that option.',
          'No check alone can guarantee venue admission; organizer and venue terms always apply.',
        ],
      },
      {
        number: '08',
        question: 'Do I have to pay immediately after submitting a request?',
        paragraphs: [
          'No. Submitting a request requires no payment.',
          'Payment only takes place after we present a proposal, confirm terms, and receive your explicit agreement.',
        ],
      },
      {
        number: '09',
        question: 'How will I receive my tickets?',
        paragraphs: [
          'Delivery depends on the ticket type and source conditions: electronic transfer, official mobile app, or another authorized method.',
          'Exact delivery terms are explained clearly before your agreement and payment.',
        ],
      },
      {
        number: '10',
        question: 'Can I request an event not listed on the website?',
        paragraphs: [
          'Yes! You can contact us for any event, even if it does not appear in our catalogue.',
          'Share the event name, date, city, and ticket count, and our team will research available options.',
        ],
      },
      {
        number: '11',
        question: 'Can I choose my seating category and budget?',
        paragraphs: [
          'Yes. You can specify your preferred category, seating area, and maximum budget per ticket.',
          'We will do our best to search for matching options without guaranteeing availability.',
        ],
      },
      {
        number: '12',
        question: 'How can I contact your team?',
        paragraphs: ['You can choose your preferred communication channel:'],
        bullets: ['WhatsApp', 'Email', 'Phone call'],
        closing: 'Our team will contact you using the preference you provide in your request.',
      },
      {
        number: '13',
        question: 'What happens if no option is available?',
        paragraphs: [
          'If we cannot find an option matching your criteria, we will inform you clearly.',
          'We will never ask you to pay for availability we cannot confirm.',
        ],
      },
      {
        number: '14',
        question: 'Can I cancel my request?',
        paragraphs: [
          'Yes. As long as you have not accepted a proposal, you may withdraw your request with no obligation.',
          'If you have already accepted an offer or completed payment, the cancellation and refund terms communicated prior to the transaction apply.',
        ],
      },
      {
        number: '15',
        question: 'How is my personal information used?',
        paragraphs: [
          'The details you submit are used solely to process your research request and contact you.',
          'We collect only the information needed for this service and protect it in accordance with applicable privacy rules.',
        ],
      },
    ],
    commitmentHeading: 'Our Commitment to You',
    commitmentIntro: 'At AITJITIKET, we believe trust is built through transparency.',
    commitmentPoints: [
      'No invented availability.',
      'No prices presented as guaranteed without confirmation.',
      'No obligation to buy after submitting a request.',
      'Clear information shared before any decision.',
      'Human concierge support throughout your search.',
    ],
    tagline: 'AITJITIKET – YOUR TICKET. OUR MISSION.',
    contactPrompt: 'Still have a question? Contact our team before making your decision.',
    contactCta: 'Contact Our Team',
  },
  ar: {
    heading: 'الأسئلة الشائعة – AITJITIKET',
    subheading: 'إجابات واضحة حول خدمة البحث والمساعدة المستقلة في حجز التذاكر.',
    items: [
      {
        number: '01',
        question: 'من نحن؟',
        paragraphs: [
          'AITJITIKET هي خدمة مستقلة للمرافقة والبحث عن تذاكر الحفلات الموسيقية والمهرجانات ومباريات كرة القدم والفعاليات الرياضية.',
          'مهمتنا هي مساعدتك في البحث عن خيارات تناسب فعاليتك وتفضيلاتك وميزانيتك.',
          'نحن لسنا شباك تذاكر رسمياً ولا ندّعي أي شراكة مع المنظمين دون تصريح.',
        ],
      },
      {
        number: '02',
        question: 'كيف تعمل AITJITIKET؟',
        paragraphs: ['الأمر بسيط:'],
        bullets: [
          '1. اختر فعالية من موقعنا أو قدّم طلباً مخصصاً.',
          '2. اضغط على «طلب سعر».',
          '3. حدد عدد التذاكر والفئة المفضلة وميزانيتك القصوى.',
          '4. يدرس فريقنا الخيارات المتاحة لدى مختلف المصادر.',
          '5. نتواصل معك لعرض الخيارات التي تمكّنا من تحديدها.',
        ],
        closing: 'لك كامل الحرية في قبول العرض أو رفضه.',
      },
      {
        number: '03',
        question: 'هل طلبي مجاني؟',
        paragraphs: [
          'نعم. إرسال طلب إلى AITJITIKET مجاني تماماً وبدون أي التزام.',
          'ليس عليك أي التزام بالشراء بعد استلام عرضنا.',
        ],
      },
      {
        number: '04',
        question: 'هل التذاكر متوفرة فوراً؟',
        paragraphs: [
          'ليس بالضرورة. الفعاليات المعروضة هي فعاليات يمكننا دراستها عند الطلب.',
          'يعتمد التوفر على المصادر المتاحة وقد يتغير بسرعة؛ لذا فإن إرسال الطلب لا يشكل حجزاً مؤكداً.',
        ],
      },
      {
        number: '05',
        question: 'لماذا لا تُعرض الأسعار مباشرة؟',
        paragraphs: [
          'تتغير الأسعار حسب الفعالية والفئة وعدد التذاكر وتوفر السوق.',
          'نفضل دراسة طلبك وتقديم عرض مخصص بدلاً من عرض سعر قد لا يكون سارياً.',
        ],
      },
      {
        number: '06',
        question: 'كم من الوقت يستغرق استلام الرد؟',
        paragraphs: [
          'المدة المعتادة للبحث وإعداد العرض هي من 24 إلى 48 ساعة.',
          'قد تختلف هذه المدة حسب تعقيد الطلب وإمكانية التوفر، ولا تشكل ضماناً للتوفر أو التسليم.',
        ],
      },
      {
        number: '07',
        question: 'كيف أطمئن لموثوقية التذاكر؟',
        paragraphs: [
          'الثقة والشفافية أساس عمل AITJITIKET.',
          'قبل عرض أي خيار، نراجع المعلومات المتاحة حول المصدر ونوع التذكرة وشروط التحويل والقيود المحتملة، ونشاركها معك قبل أي قرار.',
          'تبقى شروط المنظم ومكان الفعالية سارية دائماً.',
        ],
      },
      {
        number: '08',
        question: 'هل يجب الدفع فور إرسال الطلب؟',
        paragraphs: [
          'لا. إرسال الطلب لا يتطلب أي دفع.',
          'لا يتم أي دفع إلا بعد تقديم عرض واضح وتأكيد الشروط وموافقتك الصريحة.',
        ],
      },
      {
        number: '09',
        question: 'كيف سأستلم تذاكري؟',
        paragraphs: [
          'تعتمد طريقة التسليم على نوع التذكرة وشروط المصدر: تحويل إلكتروني، تطبيق رسمي، أو وسيلة معتمدة أخرى، وتُشرح لك قبل الموافقة والدفع.',
        ],
      },
      {
        number: '10',
        question: 'هل يمكنني طلب فعالية غير مدرجة على الموقع؟',
        paragraphs: [
          'بالطبع! يمكنك التواصل معنا لأي فعالية حتى لو لم تكن معروضة على AITJITIKET. فقط اذكر اسم الفعالية والتاريخ والمدينة وعدد التذاكر.',
        ],
      },
      {
        number: '11',
        question: 'هل يمكنني اختيار الفئة والميزانية؟',
        paragraphs: [
          'نعم. يمكنك تحديد الفئة المفضلة وموقع الجلوس والميزانية القصوى لكل تذكرة، وسنبحث عن الخيارات المطابقة دون ضمان التوفر.',
        ],
      },
      {
        number: '12',
        question: 'كيف يمكنني التواصل مع فريقكم؟',
        paragraphs: ['يمكنك اختيار وسيلة التواصل الأنسب لك:'],
        bullets: ['واتساب', 'البريد الإلكتروني', 'مكالمة هاتفية'],
        closing: 'سيتواصل معك فريقنا وفق التفضيل المحدد في طلبك.',
      },
      {
        number: '13',
        question: 'ماذا يحدث إذا لم يتوفر أي خيار؟',
        paragraphs: [
          'إذا لم نجد خياراً مطابقاً لطلبك، سنبلغك بوضوح، ولن نطلب منك أبداً الدفع مقابل توفر غير مؤكد.',
        ],
      },
      {
        number: '14',
        question: 'هل يمكنني إلغاء طلبي؟',
        paragraphs: [
          'نعم. طالما لم تقبل أي عرض، يمكنك سحب طلبك بدون أي التزام. أما بعد قبول عرض أو إتمام الدفع، فتُطبّق شروط الإلغاء المبلّغة لك قبل المعاملة.',
        ],
      },
      {
        number: '15',
        question: 'كيف تُستخدم معلوماتي الشخصية؟',
        paragraphs: [
          'تُستخدم المعلومات المقدمة فقط لمعالجة طلبك والتواصل معك، ونلتزم بحمايتها وفق القواعد المعمول بها.',
        ],
      },
    ],
    commitmentHeading: 'التزامنا تجاهك',
    commitmentIntro: 'في AITJITIKET، نؤمن بأن الثقة تُبنى بالشفافية.',
    commitmentPoints: [
      'لا توفر وهمياً أبداً.',
      'لا أسعار مضمونة دون تأكيد فعلي.',
      'لا التزام بالشراء بعد تقديم الطلب.',
      'معلومات واضحة قبل أي قرار.',
      'مرافقة بشرية طوال عملية البحث.',
    ],
    tagline: 'AITJITIKET – YOUR TICKET. OUR MISSION.',
    contactPrompt: 'هل لديك سؤال آخر؟ تواصل مع فريقنا قبل اتخاذ قرارك.',
    contactCta: 'تواصل مع فريقنا',
  },
};

interface FaqSectionProps {
  lang: Language;
  onContactClick: () => void;
}

export const FaqSection: React.FC<FaqSectionProps> = ({ lang, onContactClick }) => {
  const content = FAQ_DATA[lang];
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      <div className="max-w-2xl space-y-2">
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          {content.heading}
        </h2>
        <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
          {content.subheading}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* 15 FAQ Accordion Items */}
        <div className="lg:col-span-8 border border-white/[0.08] rounded-xl overflow-hidden divide-y divide-white/[0.08] bg-[#0E152B]">
          {content.items.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div key={item.number}>
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between gap-4 px-5 sm:px-6 py-4 text-start hover:bg-white/[0.02] transition-colors"
                >
                  <span className="flex items-baseline gap-3 text-sm sm:text-base font-semibold text-white">
                    <span className="font-mono-tabular text-xs text-[#93C5FD] shrink-0">
                      {item.number}.
                    </span>
                    <span>{item.question}</span>
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-white' : ''
                    }`}
                    aria-hidden="true"
                  />
                </button>
                {isOpen && (
                  <div className="px-5 sm:px-6 pb-5 pt-1 text-sm text-slate-300 leading-relaxed space-y-3 border-t border-white/[0.04]">
                    {item.paragraphs.map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                    {item.bullets && (
                      <ul className="space-y-1.5 ps-4 list-disc text-slate-300">
                        {item.bullets.map((b, i) => (
                          <li key={i}>{b}</li>
                        ))}
                      </ul>
                    )}
                    {item.closing && <p className="text-slate-200 font-medium">{item.closing}</p>}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Commitment & Contact Card */}
        <aside className="lg:col-span-4 bg-[#0E152B] border border-white/[0.08] rounded-xl p-6 sm:p-7 space-y-6 lg:sticky lg:top-24">
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-white">{content.commitmentHeading}</h3>
            <p className="text-sm text-slate-300 leading-relaxed">{content.commitmentIntro}</p>
          </div>

          <ul className="space-y-2.5 text-sm text-slate-300 border-y border-white/[0.08] py-5">
            {content.commitmentPoints.map((point) => (
              <li key={point} className="flex items-start gap-2.5">
                <span className="text-[#93C5FD] mt-0.5" aria-hidden="true">
                  —
                </span>
                <span>{point}</span>
              </li>
            ))}
          </ul>

          <div className="space-y-4">
            <div className="font-display text-xs font-bold tracking-wider text-white">
              {content.tagline}
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">{content.contactPrompt}</p>
            <button
              type="button"
              onClick={onContactClick}
              className="w-full px-4 py-2.5 text-sm font-semibold text-white bg-[#3B82F6] hover:bg-[#2563EB] rounded-lg transition-colors whitespace-nowrap"
            >
              {content.contactCta}
            </button>
          </div>
        </aside>
      </div>
    </section>
  );
};
