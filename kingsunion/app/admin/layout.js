export const metadata = {
  title: "Admin · The King’s Union",
  robots: { index: false, follow: false },
  // Admin can be added to a phone's home screen (needed for notifications on iPhone).
  manifest: "/admin-manifest.webmanifest",
  appleWebApp: { capable: true, title: "KU Admin", statusBarStyle: "black-translucent" },
  icons: { apple: "/admin-icon-192.png" },
};

export const viewport = { themeColor: "#3d0202" };

export default function AdminLayout({ children }) {
  return <div className="flex-1 flex flex-col bg-[#3d0202] text-white font-serif">{children}</div>;
}
