import { MEMBERSHIP_URL } from "@/lib/nav";

// Questions for the FAQ on the homepage. Edit freely: `a` is the answer;
// `link` (optional) adds a link after it.
export const faq = [
  {
    q: "Who can come to a debate?",
    a: "Anyone. King’s students, students from other universities and members of the public are all welcome. Each debate has tickets set aside for King’s students and for external guests.",
  },
  {
    q: "Do tickets cost anything?",
    a: "Our debates are free. Places are limited, so you still need a ticket: get one through the “Get tickets” button on the debate’s page.",
  },
  {
    q: "I’ve requested a ticket. What happens next?",
    a: "The committee approves ticket requests, and you’ll get an email from Luma once yours is confirmed. Bring it with you on the night.",
  },
  {
    q: "Do I need to be a member?",
    a: "No. Anyone can come, but members have tickets reserved for them, so they’re more likely to get in when a debate is busy. Membership is through KCLSU.",
    link: { href: MEMBERSHIP_URL, text: "Become a member", external: true },
  },
  {
    q: "Can I speak?",
    a: "Yes. After the main speeches, the debate is opened to the floor and anyone in the audience can make a point. If you’d like to be one of the main speakers, get in touch.",
    link: { href: "/speak", text: "Speak at the Union" },
  },
  {
    q: "How long does a debate last?",
    a: "About two hours, including the vote at the end.",
  },
  {
    q: "Is there a dress code?",
    a: "There’s no dress code, but we recommend dressing formally.",
  },
  {
    q: "What does “Chatham House Rule” mean?",
    a: "Some debates are held under the Chatham House Rule. You can use what is said, but not say who said it. For these debates we don’t publish the speakers.",
  },
  {
    q: "Can I suggest a motion?",
    a: "Please do. Every suggestion is read by the committee.",
    link: { href: "/debates#propose", text: "Propose a motion" },
  },
  {
    q: "Something else?",
    a: "For access requirements or any other question, email operations@kingsunion.org.uk and we’ll get back to you.",
    link: { href: "/contact#union", text: "Contact us" },
  },
];
