(() => {
  const counters = document.querySelectorAll("[data-visitor-counter]");
  if (!counters.length || navigator.webdriver) return;

  const apiBaseUrl = "https://the-educator-api.onrender.com";
  const storageKey = "public-site-visitor-id";

  function getVisitorId() {
    try {
      let visitorId = localStorage.getItem(storageKey);
      if (!visitorId) {
        visitorId = crypto.randomUUID();
        localStorage.setItem(storageKey, visitorId);
      }
      return visitorId;
    } catch (_) {
      return crypto.randomUUID();
    }
  }

  const visitorId = getVisitorId();

  counters.forEach(async (counter) => {
    const siteKey = counter.dataset.visitorCounter;
    const value = counter.querySelector("[data-visitor-count]");

    try {
      const response = await fetch(`${apiBaseUrl}/api/visitors/${encodeURIComponent(siteKey)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitorId })
      });

      if (!response.ok) throw new Error(`Visitor API returned ${response.status}`);

      const result = await response.json();
      value.textContent = new Intl.NumberFormat(document.documentElement.lang || "en")
        .format(result.total);
      counter.dataset.counterState = "ready";
    } catch (_) {
      value.textContent = "—";
      counter.dataset.counterState = "unavailable";
    }
  });
})();
