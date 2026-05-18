const scoreData = {
  transport: {
    "Zu Fuß": 2,
    Rollstuhl: 4,
    "E-Roller": 10,
    Skateboard: 9,
    Fahrrad: 7,
    Einrad: 16,
    Auto: 5,
    Motorrad: 15,
    Bus: 3,
    Straßenbahn: 4,
    Zug: 2,
    Flugzeug: 1,
    Panzer: 12
  },
  weather: {
    Sonnig: 1,
    Bewölkt: 2,
    Nebel: 8,
    Regen: 7,
    Sturm: 13,
    Gewitter: 15,
    Gewittersturm: 22,
    Schneefall: 10,
    Schneesturm: 24,
    "Gewitter und Schneesturm": 35,
    Glatteis: 26,
    Eisregen: 30,
    Sandsturm: 20
  },
  mood: {
    Normal: 1,
    Fröhlich: 1,
    Traurig: 4,
    Wütend: 9,
    Aggressiv: 16,
    Tollwütig: 28
  },
  sobriety: {
    Nüchtern: 0,
    "Leicht Angetrunken": 8,
    Besoffen: 20,
    "Sturz Besoffen": 36
  },
  condition: {
    Normal: 2,
    Müde: 8,
    Aufmerksam: 1,
    Krank: 10,
    Gehirnerschütterung: 26,
    "Gebrochenes Bein": 20,
    Suizidgefährdet: 42
  }
};

const form = document.querySelector("#calculator-form");
const button = document.querySelector("#calculate-button");
const derekButton = document.querySelector("#derek-button");
const helperText = document.querySelector("#helper-text");
const resultNumber = document.querySelector("#result-number");
const resultTitle = document.querySelector("#result-title");
const resultDescription = document.querySelector("#result-description");
const riskPill = document.querySelector("#risk-pill");
const resultPanel = document.querySelector("#result-panel");
const resultRing = document.querySelector(".result-ring");

let displayedScore = 0;
let derekModeEnabled = false;

populateSelect("transport", scoreData.transport);
populateSelect("weather", scoreData.weather);
populateSelect("mood", scoreData.mood);
populateSelect("sobriety", scoreData.sobriety);
populateSelect("condition", scoreData.condition);

button.addEventListener("click", calculateRisk);
derekButton.addEventListener("click", toggleDerekMode);

function populateSelect(selectId, options) {
  const select = document.getElementById(selectId);

  Object.entries(options).forEach(([label]) => {
    const option = document.createElement("option");
    option.value = label;
    option.textContent = label;
    select.append(option);
  });
}

function calculateRisk() {
  const selections = {
    transport: form.transport.value,
    weather: form.weather.value,
    mood: form.mood.value,
    sobriety: form.sobriety.value,
    condition: form.condition.value
  };

  const missingSelection = Object.values(selections).some((value) => !value);

  if (missingSelection) {
    helperText.textContent = "Bitte wähle in allen fünf Kategorien jeweils eine Option aus.";
    helperText.style.color = "var(--danger)";
    setResultState(0, "Unvollständige Auswahl", "Für eine sinnvolle Berechnung müssen alle fünf Dropdowns ausgefüllt sein.", "Fehlt");
    return;
  }

  helperText.textContent = "Die Auswahl wurde berechnet. Du kannst jederzeit Werte ändern und erneut klicken.";
  helperText.style.color = "var(--text-soft)";

  const detailEntries = [
    ["Fortbewegungsmittel", selections.transport, scoreData.transport[selections.transport]],
    ["Wetter", selections.weather, scoreData.weather[selections.weather]],
    ["Laune", selections.mood, scoreData.mood[selections.mood]],
    ["Nüchternheit", selections.sobriety, scoreData.sobriety[selections.sobriety]],
    ["Zustand", selections.condition, scoreData.condition[selections.condition]]
  ];

  const totalScore = detailEntries.reduce((sum, entry) => sum + entry[2], 0);
  const cappedScore = Math.min(totalScore, 100);
  const riskMeta = getRiskMeta(cappedScore);

  setResultState(cappedScore, riskMeta.title, riskMeta.description, riskMeta.pill, riskMeta.tone);
}

function toggleDerekMode() {
  derekModeEnabled = !derekModeEnabled;
  derekButton.classList.toggle("active", derekModeEnabled);
  document.body.classList.toggle("derek-mode", derekModeEnabled);

  const currentScore = Number.parseInt(resultNumber.textContent, 10) || 0;
  const riskMeta = getRiskMeta(currentScore);
  setResultState(currentScore, riskMeta.title, riskMeta.description, riskMeta.pill, riskMeta.tone);
}

function setResultState(score, title, description, pillText, tone = "") {
  animateNumber(displayedScore, score);
  displayedScore = score;

  const angle = `${score * 3.6}deg`;
  resultRing.style.setProperty("--ring-angle", angle);
  document.body.classList.toggle("full-risk", score === 100);
  resultTitle.textContent = title;
  resultDescription.textContent = description;
  riskPill.textContent = pillText;

  resultPanel.classList.remove("low", "medium", "high", "extreme");

  if (tone) {
    resultPanel.classList.add(tone);
  }
}

function animateNumber(from, to) {
  const start = performance.now();
  const duration = 800;

  function update(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.round(from + (to - from) * eased);
    resultNumber.textContent = `${value}%`;

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

function getRiskMeta(score) {
  if (derekModeEnabled) {
    if (score <= 20) {
      return {
        title: "Ruhige Risikolage",
        description: "Die aktuelle Kombination wirkt vergleichsweise sicher und liegt im niedrigen Bereich.",
        pill: "Leichtes ein Schießt",
        tone: "low"
      };
    }

    if (score <= 45) {
      return {
        title: "Spürbares Risiko",
        description: "Mehrere Faktoren erhöhen die Wahrscheinlichkeit bereits sichtbar, aber noch nicht kritisch.",
        pill: "Ein Motorschaden Doppelt",
        tone: "medium"
      };
    }

    if (score <= 74) {
      return {
        title: "Erhöhte Gefahr",
        description: "Die Kombination enthält deutliche Risikotreiber. Zusätzliche Vorsicht wäre angebracht.",
        pill: "Bruder lass Los",
        tone: "high"
      };
    }

    return {
      title: "Sehr kritische Lage",
      description: score === 100
        ? "50€ Tedi gib ihm."
        : "Die Auswahl bündelt starke Risikofaktoren. Der Wert liegt im oberen Warnbereich.",
      pill: "Bruder las Los",
      tone: "extreme"
    };
  }

  if (score <= 20) {
    return {
      title: "Ruhige Risikolage",
      description: "Die aktuelle Kombination wirkt vergleichsweise sicher und liegt im niedrigen Bereich.",
      pill: "Niedrig",
      tone: "low"
    };
  }

  if (score <= 45) {
    return {
      title: "Spürbares Risiko",
      description: "Mehrere Faktoren erhöhen die Wahrscheinlichkeit bereits sichtbar, aber noch nicht kritisch.",
      pill: "Mittel",
      tone: "medium"
    };
  }

  if (score <= 74) {
    return {
      title: "Erhöhte Gefahr",
      description: "Die Kombination enthält deutliche Risikotreiber. Zusätzliche Vorsicht wäre angebracht.",
      pill: "Hoch",
      tone: "high"
    };
  }

  return {
    title: "Sehr kritische Lage",
    description: "Die Auswahl bündelt starke Risikofaktoren. Der Wert liegt im oberen Warnbereich.",
    pill: "Extrem",
    tone: "extreme"
  };
}
