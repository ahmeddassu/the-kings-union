// Shows King's Union admin notifications on phones and computers, and opens
// the right admin page when one is tapped. Registered from the bell in admin.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: "King’s Union admin", body: event.data ? event.data.text() : "" };
  }
  event.waitUntil(
    self.registration.showNotification(data.title || "King’s Union admin", {
      body: data.body || "",
      icon: "/admin-icon-192.png",
      badge: "/admin-badge.png",
      tag: data.href || undefined,
      renotify: Boolean(data.href),
      timestamp: data.at || Date.now(),
      data: { href: data.href || "/dashboard" },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  // Links are relative to admin: this worker's scope is admin's address.
  const target = new URL(String(event.notification.data?.href || "/dashboard").replace(/^\//, ""), self.registration.scope).toString();
  event.waitUntil(
    (async () => {
      const open = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      const here = open.find((c) => c.url.startsWith(self.registration.scope));
      if (here) {
        await here.focus();
        return here.navigate(target);
      }
      return self.clients.openWindow(target);
    })()
  );
});
