export interface ContactChannel {
  id: "whatsapp" | "viber" | "facebook" | "instagram";
  name: string;
  badge: string;
  actionText: string;
  description: string;
  href: string;
  directAppUrl?: string;
  displayValue: string;
  color: string;
}

export const CONTACT_INFO = {
  phoneRaw: "+639615929770",
  phoneFormatted: "+63 961 592 9770",
  email: "orders@riverafragrance.com",
  facebookUrl: "https://www.facebook.com/riverafraghouse",
  facebookMessengerUrl: "https://m.me/riverafraghouse",
  instagramUrl: "https://www.instagram.com/riverafragrancehouse._07/",
  instagramDmUrl: "https://ig.me/m/riverafragrancehouse._07",
  whatsappUrl: "https://wa.me/639615929770?text=Hello%20Rivera%20Fragrance%20House%2C%20I%20would%20like%20to%20inquire%20about%20wholesale%20and%20orders.",
  viberUrl: "viber://chat?number=%2B639615929770",
  viberWebFallback: "https://msng.link/o/?639615929770=vi",
  location: "Malabon, Metro Manila, Philippines",
};

export const WHOLESALE_CHANNELS: ContactChannel[] = [
  {
    id: "whatsapp",
    name: "WhatsApp",
    badge: "Direct Line",
    actionText: "Chat on WhatsApp",
    description: "Instant chat for volume discounts, carton availability, and batch code photos.",
    href: CONTACT_INFO.whatsappUrl,
    displayValue: CONTACT_INFO.phoneFormatted,
    color: "#25D366",
  },
  {
    id: "viber",
    name: "Viber",
    badge: "PH Messaging",
    actionText: "Message on Viber",
    description: "Direct community and reseller inquiries, stock reservations, and payment proofs.",
    href: CONTACT_INFO.viberUrl,
    directAppUrl: CONTACT_INFO.viberWebFallback,
    displayValue: CONTACT_INFO.phoneFormatted,
    color: "#7360F2",
  },
  {
    id: "facebook",
    name: "Facebook",
    badge: "Official Page",
    actionText: "Visit Facebook Page",
    description: "Our official Facebook community — customer reviews, announcements, and Messenger support.",
    href: CONTACT_INFO.facebookUrl,
    directAppUrl: CONTACT_INFO.facebookMessengerUrl,
    displayValue: "riverafraghouse",
    color: "#1877F2",
  },
  {
    id: "instagram",
    name: "Instagram",
    badge: "@riverafragrancehouse._07",
    actionText: "View Instagram",
    description: "Curated bottle lookbook, aesthetic reels, new drop announcements, and DM inquiries.",
    href: CONTACT_INFO.instagramUrl,
    directAppUrl: CONTACT_INFO.instagramDmUrl,
    displayValue: "@riverafragrancehouse._07",
    color: "#E1306C",
  },
];
