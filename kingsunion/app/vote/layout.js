export const metadata = {
  title: "Vote · The King’s Union",
  description: "Vote in a King’s Union debate.",
  robots: { index: false, follow: false },
};

export default function VoteLayout({ children }) {
  return <div className="flex-1 flex flex-col bg-[#3d0202] text-white font-serif">{children}</div>;
}
