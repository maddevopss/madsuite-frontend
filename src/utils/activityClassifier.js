// Détecte automatiquement le type de travail selon l'application et le titre de fenêtre

export function classifyActivity(appName = "", windowTitle = "") {
  const app = appName.toLowerCase();
  const title = windowTitle.toLowerCase();

  // Développement
  if (app.includes("code") || app.includes("cursor") || app.includes("webstorm")) {
    return {
      category: "development",
      confidence: 0.95,
      icon: "💻",
      label: "Développement",
    };
  }

  // Design
  if (app.includes("figma") || app.includes("photoshop") || app.includes("illustrator")) {
    return {
      category: "design",
      confidence: 0.95,
      icon: "🎨",
      label: "Design",
    };
  }

  // Communication
  if (app.includes("discord") || app.includes("slack") || app.includes("teams")) {
    return {
      category: "communication",
      confidence: 0.85,
      icon: "💬",
      label: "Communication",
    };
  }

  // Navigateur
  if (app.includes("chrome") || app.includes("firefox") || app.includes("edge")) {
    // Frontend localhost
    if (title.includes("localhost") || title.includes("127.0.0.1")) {
      return {
        category: "development",
        confidence: 0.8,
        icon: "💻",
        label: "Développement Web",
      };
    }

    // Github
    if (title.includes("github")) {
      return {
        category: "development",
        confidence: 0.75,
        icon: "💻",
        label: "Code Review",
      };
    }

    return {
      category: "web",
      confidence: 0.6,
      icon: "🌐",
      label: "Navigation Web",
    };
  }

  // Fallback
  return {
    category: "other",
    confidence: 0.3,
    icon: "📄",
    label: "Autre",
  };
}

// Détecte un projet probable à partir du titre de fenêtre
export function detectProjectFromTitle(windowTitle = "", projects = []) {
  const title = windowTitle.toLowerCase();

  const match = projects.find((project) => {
    const name = String(project.nom || project.projet || "").toLowerCase();

    return name && title.includes(name);
  });

  if (!match) {
    return null;
  }

  return {
    id: match.id,
    nom: match.nom || match.projet,
    client_id: match.client_id,
    couleur: match.couleur,
  };
}
