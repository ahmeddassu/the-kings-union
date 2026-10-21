// "How to debate" (/guide): for first-timers in the audience and new speakers.
// Edit freely. Each section has an id (used for links like /guide#poi), a title
// and paragraphs; `tips` (optional) shows as a list.
//
// To add short videos, put YouTube video IDs in `videos` (the part after
// "watch?v=" in the address), with a title for each. They show under the guide.
//   { id: "dQw4w9WgXcQ", title: "How to make a point of information" }
export const videos = [];

export const sections = [
  {
    id: "first-night",
    title: "Your first night",
    paras: [
      "Get a ticket first: use the “Get tickets” button on the debate’s page. Debates are free, but places are limited, and the committee approves requests. Luma will email you once yours is confirmed.",
      "A debate lasts about two hours, including the vote at the end. There’s no dress code, but we recommend dressing formally.",
      "You don’t have to say anything. Most people come to listen, and to vote at the end. If you’d like to join in, there are two ways: a point of information during a speech, or a speech from the floor once the main speeches are done.",
    ],
  },
  {
    id: "how-it-runs",
    title: "How a debate runs",
    paras: [
      "Every debate is on a motion, a statement that begins “This House…”. Three speakers propose it and three oppose it, usually a mix of guests and King’s students.",
      "While a main speaker is speaking, members of the floor can rise to offer a point of information. Once the main speeches are done, the debate is opened to the floor and anyone in the audience can make a point, and the audience puts questions to both sides.",
      "Finally, the House divides: everyone votes for or against the motion, and the result is announced from the chair as Ayes and Noes. To vote, scan the QR code on the screen, or type the 5-digit code shown in the chamber.",
    ],
  },
  {
    id: "poi",
    title: "Points of information",
    paras: [
      "A point of information is a short interruption of a speaker, to challenge them or ask them a question. It’s the quickest way to join in.",
      "To offer one, stand up while they’re speaking. The speaker can accept it or wave you down. Being turned down is normal and not a snub: sit down and try again later.",
    ],
    tips: [
      "Keep it to one sentence. A good point is over in about fifteen seconds.",
      "Make it a question or a sharp challenge, not a speech.",
      "Aim it at the weakest part of what they’ve just said.",
      "Once you’ve made it, sit down and let them answer.",
    ],
  },
  {
    id: "floor",
    title: "Speaking from the floor",
    paras: [
      "When the debate is opened to the floor, the chair invites people from the audience to speak. Catch the chair’s eye, and wait to be called.",
      "Speak to the chair and the House, not to one person. Say which side you’re on, make one point well, and sit down. Short and clear beats long and thorough.",
    ],
  },
  {
    id: "building-a-case",
    title: "Building a case",
    paras: [
      "For main speakers, or anyone preparing a point. A speech that wins votes usually does three things: it says what the debate is really about, it gives a few strong reasons, and it answers the other side.",
    ],
    tips: [
      "Start with your line: one sentence that says why the House should vote your way.",
      "Pick two or three arguments, not seven. Say how many you have, then take them in turn.",
      "For each one, give the claim, why it’s true, and why it matters. An example or a figure the audience will remember does more than a list of statistics.",
      "Answer the other side. Take their best argument, not their weakest, and say why it fails.",
      "If you’re on a team, agree beforehand who covers what, so you don’t repeat each other.",
      "Finish by telling the House what it’s voting on, in your terms.",
    ],
  },
  {
    id: "delivery",
    title: "Delivery",
    paras: ["How you say it matters almost as much as what you say."],
    tips: [
      "Speak more slowly than feels natural, and pause after your key lines.",
      "Bring notes, not a script: a few words per point is enough.",
      "Look up and around the room, not at your page.",
      "Practise out loud at least once, and time yourself.",
      "Humour works best when it makes your point for you.",
    ],
  },
  {
    id: "words",
    title: "Words you’ll hear",
    terms: [
      ["Motion", "The statement being debated. It begins “This House…”."],
      ["The House", "Everyone in the room, who vote at the end."],
      ["Proposition", "The side arguing for the motion."],
      ["Opposition", "The side arguing against it."],
      ["The chair", "The person running the debate, who calls speakers and keeps order."],
      ["The floor", "The audience. Speaking from the floor means making a point from the audience."],
      ["Point of information", "A short interruption of a speaker, offered by standing up."],
      ["Division", "The vote at the end of the debate."],
      ["Ayes and Noes", "Votes for and against the motion. If the Ayes have more, the motion is carried; a tie means it falls."],
      ["Chatham House Rule", "What is said can be used, but not who said it. For these debates we don’t publish the speakers."],
    ],
  },
];
