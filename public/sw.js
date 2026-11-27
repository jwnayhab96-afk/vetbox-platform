/* VetBox Web Push service worker */
self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = { body: event.data ? event.data.text() : "لديك إشعار جديد في VetBox." };
  }

  const title = payload.title || "إشعار جديد من VetBox";
  const options = {
    body: payload.body || "افتح VetBox للاطلاع على التفاصيل.",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    tag: payload.id || undefined,
    data: { url: typeof payload.url === "string" && payload.url.startsWith("/") ? payload.url : "/" },
    dir: "rtl",
    lang: "ar",
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = new URL(event.notification.data?.url || "/", self.location.origin).href;
  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const client of windows) {
      if (client.url.startsWith(self.location.origin) && "focus" in client) {
        if ("navigate" in client && client.url !== target) await client.navigate(target);
        return client.focus();
      }
    }
    return self.clients.openWindow(target);
  })());
});
