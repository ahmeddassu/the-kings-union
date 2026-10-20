// Where contact-form messages go.
// Union messages go to the Union.
// Kingsway applications go to the Kingsway Editors, and also to the Kingsway
// Leadership team if CONTACT_KINGSWAY_LEADERSHIP_EMAIL is set.
// Set the addresses in Vercel: CONTACT_UNION_EMAIL, CONTACT_KINGSWAY_EMAIL,
// and (optional) CONTACT_KINGSWAY_LEADERSHIP_EMAIL.

export const UNION_EMAIL = process.env.CONTACT_UNION_EMAIL || "operations@kingsunion.org.uk";
export const KINGSWAY_EMAIL = process.env.CONTACT_KINGSWAY_EMAIL || "kcuskingsway@gmail.com";
export const KINGSWAY_LEADERSHIP_EMAIL = process.env.CONTACT_KINGSWAY_LEADERSHIP_EMAIL || "";

export const teams = {
  union: {
    label: "The King’s Union",
    recipients: () => [UNION_EMAIL],
  },
  alerts: {
    label: "Ticket alerts",
    recipients: () => [UNION_EMAIL],
  },
  motion: {
    label: "Motion suggestion",
    recipients: () => [UNION_EMAIL],
  },
  kingsway: {
    label: "Kingsway",
    recipients: () => [KINGSWAY_EMAIL, KINGSWAY_LEADERSHIP_EMAIL].filter(Boolean),
  },
};

// Shown on the Contact page under "Other enquiries".
// Media contact: fill in when there is one. While blank, the page says it's
// directs press to the Union email.
export const MEDIA_CONTACT = { name: "", email: "" };
export const SPONSORSHIP_EMAIL = "sponsorships@kingsunion.org.uk";
