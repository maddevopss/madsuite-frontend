const IGNORED_APPS = [
  "Electron",
  "MADSuite",
  "ApplicationFrameHost",
  "SystemSettings",
  "TextInputHost",
  "PowerToys.QuickAccess",
];

const IGNORED_TITLES = ["Paramètres", "Settings", "Developer Tools"];

export function shouldIgnoreActivity({ app_name, window_title }) {
  if (!app_name && !window_title) {
    return true;
  }

  // Ignore apps système
  if (
    IGNORED_APPS.some((app) =>
      String(app_name || "")
        .toLowerCase()
        .includes(app.toLowerCase()),
    )
  ) {
    return true;
  }

  // Ignore titres système
  if (
    IGNORED_TITLES.some((title) =>
      String(window_title || "")
        .toLowerCase()
        .includes(title.toLowerCase()),
    )
  ) {
    return true;
  }

  // Ignore fenêtres vides
  if (!String(window_title || "").trim()) {
    return true;
  }

  return false;
}

export function getActivitySignature({ app_name, window_title }) {
  return `${app_name || ""}::${window_title || ""}`;
}
