const educatorConfig = {
  supabaseUrl: "https://obgmbgsgwxbenglltcwv.supabase.co",
  supabaseKey: "sb_publishable_Qa-0cZ5V15zHHYIWD_SXcA_yCZ0N2GM",
  apiBaseUrl: "https://the-educator-api.onrender.com"
};

const sessionKey = "theEducatorSession";
const retryDelays = [800, 2000, 4000];

function readSession() {
  try {
    return JSON.parse(localStorage.getItem(sessionKey));
  } catch {
    return null;
  }
}

function writeSession(session) {
  localStorage.setItem(sessionKey, JSON.stringify({
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
    expiresAt: session.expires_at,
    user: session.user
  }));
}

function clearSession() {
  localStorage.removeItem(sessionKey);
}

async function signInWithPassword(email, password) {
  const response = await fetch(
    `${educatorConfig.supabaseUrl}/auth/v1/token?grant_type=password`,
    {
      method: "POST",
      headers: {
        apikey: educatorConfig.supabaseKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    }
  );

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.error_description || payload.msg || "Login failed.");
  }

  writeSession(payload);
  return payload;
}

async function apiGet(path) {
  const session = readSession();

  if (!session?.accessToken) {
    throw new Error("Please login first.");
  }

  const response = await fetchWithRetry(`${educatorConfig.apiBaseUrl}${path}`, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${session.accessToken}`
    }
  });

  if (response.status === 401) {
    clearSession();
    throw new Error("Your session expired. Please login again.");
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.detail || payload?.title || "Request failed.");
  }

  return payload;
}

async function warmUpApi() {
  await fetchWithRetry(`${educatorConfig.apiBaseUrl}/health`, {
    cache: "no-store"
  });
}

async function fetchWithRetry(url, options) {
  let lastError;

  for (let attempt = 0; attempt <= retryDelays.length; attempt += 1) {
    try {
      return await fetch(url, options);
    } catch (error) {
      lastError = error;
      const delay = retryDelays[attempt];

      if (!delay) {
        break;
      }

      await wait(delay);
    }
  }

  throw lastError ?? new Error("Network request failed.");
}

function wait(milliseconds) {
  return new Promise(resolve => {
    window.setTimeout(resolve, milliseconds);
  });
}

function setMessage(element, message, tone = "neutral") {
  if (!element) {
    return;
  }

  element.textContent = message;
  element.dataset.tone = tone;
  element.hidden = false;
}

function setupLoginPage() {
  const form = document.querySelector("[data-login-form]");
  const message = document.querySelector("[data-login-message]");

  if (!form) {
    return;
  }

  const existingSession = readSession();

  if (existingSession?.accessToken) {
    setMessage(message, "You are already signed in. Redirecting to dashboard...", "success");
    window.setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 600);
  }

  form.addEventListener("submit", async event => {
    event.preventDefault();

    const email = form.elements.email.value.trim();
    const password = form.elements.password.value;
    const submit = form.querySelector("button[type='submit']");

    if (!email || !password) {
      setMessage(message, "Enter your email and password.", "error");
      return;
    }

    submit.disabled = true;
    submit.textContent = "Signing in...";
    setMessage(message, "Checking your Supabase account...", "neutral");

    try {
      await signInWithPassword(email, password);
      setMessage(message, "Login successful. Opening your dashboard...", "success");
      window.location.href = "dashboard.html";
    } catch (error) {
      setMessage(message, error.message, "error");
      submit.disabled = false;
      submit.textContent = "Continue";
    }
  });
}

function renderCourses(courses) {
  const container = document.querySelector("[data-courses]");

  if (!container) {
    return;
  }

  if (!courses.length) {
    container.innerHTML = `
      <article class="course-card state-card">
        <div>
          <span class="code">No courses</span>
          <h3>No active course spaces yet</h3>
          <p>Your courses will appear here after enrollment or assignment by an instructor.</p>
        </div>
      </article>
    `;
    return;
  }

  container.innerHTML = courses.map(course => `
    <article class="course-card">
      <div>
        <div class="course-top">
          <span class="code">${escapeHtml(course.courseCode)}</span>
          <span class="status">${course.visibility === 1 ? "Published" : "Draft"}</span>
        </div>
        <h3>${escapeHtml(course.title)}</h3>
        <p>${escapeHtml(course.semester)}${course.section ? ` · ${escapeHtml(course.section)}` : ""}</p>
        <div class="course-meta">
          <span class="meta">Syllabus</span>
          <span class="meta">Resources</span>
          <span class="meta">Assignments</span>
        </div>
      </div>
      <a class="open-link" href="course.html">Open Course</a>
    </article>
  `).join("");
}

function updateDashboardStats(courses) {
  const activeCourses = document.querySelector("[data-stat='courses']");
  const resources = document.querySelector("[data-stat='resources']");
  const updates = document.querySelector("[data-stat='updates']");

  if (activeCourses) {
    activeCourses.textContent = String(courses.length);
  }

  if (resources) {
    resources.textContent = courses.length ? "1" : "0";
  }

  if (updates) {
    updates.textContent = courses.length ? "1" : "0";
  }
}

async function setupDashboardPage() {
  const container = document.querySelector("[data-courses]");
  const message = document.querySelector("[data-dashboard-message]");
  const userName = document.querySelector("[data-user-name]");

  if (!container) {
    return;
  }

  const session = readSession();

  if (!session?.accessToken) {
    setMessage(message, "Please login to view your courses.", "error");
    window.setTimeout(() => {
      window.location.href = "login.html";
    }, 900);
    return;
  }

  setMessage(message, "Waking the hosted Educator API...", "neutral");

  try {
    await warmUpApi();
    setMessage(message, "Loading your live course data...", "neutral");

    const [profile, courses] = await Promise.all([
      apiGet("/api/me"),
      apiGet("/api/courses")
    ]);

    if (userName) {
      userName.textContent = profile.name;
    }

    renderCourses(courses);
    updateDashboardStats(courses);
    setMessage(message, "Connected to Supabase and The Educator API.", "success");
  } catch (error) {
    renderApiUnavailable(error);
    setMessage(message, "Could not reach The Educator API. Please refresh in a few seconds.", "error");
  }
}

function renderApiUnavailable(error) {
  const container = document.querySelector("[data-courses]");

  if (!container) {
    return;
  }

  container.innerHTML = `
    <article class="course-card state-card">
      <div>
        <span class="code">API unavailable</span>
        <h3>The hosted API is not responding yet</h3>
        <p>${escapeHtml(error?.message || "Render may still be waking up. Refresh the page in a few seconds.")}</p>
      </div>
    </article>
  `;
}

function setupLogoutLinks() {
  document.querySelectorAll("[data-logout]").forEach(link => {
    link.addEventListener("click", event => {
      event.preventDefault();
      clearSession();
      window.location.href = "login.html";
    });
  });
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

setupLoginPage();
setupDashboardPage();
setupLogoutLinks();
