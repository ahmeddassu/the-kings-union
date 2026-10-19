export const metadata = {
  title: "Admin · The King’s Union",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }) {
  return <div className="flex-1 flex flex-col bg-[#3d0202] text-white font-serif">{children}</div>;
}
