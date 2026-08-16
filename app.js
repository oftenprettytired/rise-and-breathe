const { useState, useEffect, useRef, useMemo, useCallback } = React;

/* ---------------------------------------------------------------------- */
/* Config                                                                  */
/* ---------------------------------------------------------------------- */

const STORAGE_KEY = "riseAndBreathe:v1";

const TECHNIQUES = {
  box: {
    id: "box",
    name: "Box Breathing",
    description: "Building a foundation of calm",
    icon: "◻",
    phases: [
      { key: "inhale", label: "Breathe in", seconds: 4, voice: "Breathe in" },
      { key: "hold1", label: "Hold", seconds: 4, voice: "Hold" },
      { key: "exhale", label: "Breathe out", seconds: 4, voice: "Breathe out" },
      { key: "hold2", label: "Hold", seconds: 4, voice: "Hold" },
    ],
  },
  "478": {
    id: "478",
    name: "4-7-8 Breathing",
    description: "Release and let go",
    icon: "◯",
    phases: [
      { key: "inhale", label: "Breathe in", seconds: 4, voice: "Breathe in through your nose" },
      { key: "hold1", label: "Hold", seconds: 7, voice: "Hold" },
      { key: "exhale", label: "Breathe out", seconds: 8, voice: "Breathe out slowly through your mouth" },
    ],
  },
  nadi: {
    id: "nadi",
    name: "Alternate Nostril",
    description: "Find your center",
    icon: "☯",
    phases: [
      { key: "inhaleLeft", label: "Inhale left", seconds: 4, voice: "Inhale through your left", side: "left" },
      { key: "hold1", label: "Hold", seconds: 4, voice: "Hold", side: "both" },
      { key: "exhaleRight", label: "Exhale right", seconds: 4, voice: "Exhale through your right", side: "right" },
      { key: "inhaleRight", label: "Inhale right", seconds: 4, voice: "Inhale through your right", side: "right" },
      { key: "hold2", label: "Hold", seconds: 4, voice: "Hold", side: "both" },
      { key: "exhaleLeft", label: "Exhale left", seconds: 4, voice: "Exhale through your left", side: "left" },
    ],
  },
  belly: {
    id: "belly",
    name: "Diaphragmatic Breathing",
    description: "Root into safety",
    icon: "✋",
    phases: [
      { key: "inhale", label: "Breathe in", seconds: 5, voice: "Breathe in, let your belly rise" },
      { key: "exhale", label: "Breathe out", seconds: 6, voice: "Breathe out, let it fall" },
    ],
  },
};

const TECHNIQUE_ORDER = ["box", "478", "nadi", "belly"];

const DURATIONS = {
  5: { open: 30, breath: 210, close: 30, label: "5 min" },
  10: { open: 45, breath: 480, close: 75, label: "10 min" },
  15: { open: 60, breath: 720, close: 120, label: "15 min" },
};

// Labeled by their well-known reference pitch (432/528 Hz), but actually
// played an octave down (same note, lower octave) for a deeper, softer hum.
const FREQUENCIES = {
  432: { label: "432 Hz", desc: "Earthy, grounding", hz: 216 },
  528: { label: "528 Hz", desc: "Uplifting, healing", hz: 264 },
};

// Pre-rendered voiceover clips (warm, human-recorded-style narration) —
// keyed by the same phase.voice strings used throughout TECHNIQUES.
const VOICE_AUDIO = {
  "Breathe in": "audio/voice/breathe-in.m4a",
  Hold: "audio/voice/hold.m4a",
  "Breathe out": "audio/voice/breathe-out.m4a",
  "Breathe in through your nose": "audio/voice/breathe-in-nose.m4a",
  "Breathe out slowly through your mouth": "audio/voice/breathe-out-mouth.m4a",
  "Inhale through your left": "audio/voice/inhale-left.m4a",
  "Exhale through your right": "audio/voice/exhale-right.m4a",
  "Inhale through your right": "audio/voice/inhale-right.m4a",
  "Exhale through your left": "audio/voice/exhale-left.m4a",
  "Breathe in, let your belly rise": "audio/voice/breathe-in-belly.m4a",
  "Breathe out, let it fall": "audio/voice/breathe-out-belly.m4a",
  "Let's begin": "audio/voice/lets-begin.m4a",
  "Well done": "audio/voice/well-done.m4a",
};

/* ---------------------------------------------------------------------- */
/* State persistence                                                      */
/* ---------------------------------------------------------------------- */

function defaultState() {
  return {
    name: "",
    prefs: {
      cueStyle: "voice", // "voice" | "chime" | "off"
      frequencyOn: true,
      frequencyPref: "rotate",
      techniquePref: "rotate",
      theme: "auto",
    },
    history: [],
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    const prefs = { ...defaultState().prefs, ...(parsed.prefs || {}) };
    if (!parsed.prefs || parsed.prefs.cueStyle === undefined) {
      prefs.cueStyle = !parsed.prefs || parsed.prefs.voiceoverOn !== false ? "voice" : "off";
    }
    return {
      ...defaultState(),
      ...parsed,
      prefs,
      history: Array.isArray(parsed.history) ? parsed.history : [],
    };
  } catch (e) {
    return defaultState();
  }
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    /* storage unavailable — session still works in memory */
  }
}

/* ---------------------------------------------------------------------- */
/* Date / quote / streak helpers                                          */
/* ---------------------------------------------------------------------- */

function todayStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function dayIndex(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return Math.floor(d.getTime() / 86400000);
}

function quoteOfTheDay(dateStr) {
  const idx = ((dayIndex(dateStr) % QUOTES.length) + QUOTES.length) % QUOTES.length;
  return QUOTES[idx];
}

function dateKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function computeStreak(history) {
  if (!history.length) return 0;
  const days = new Set(history.map((h) => h.date));
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  // allow the streak to still "count" if today hasn't happened yet but yesterday did
  if (!days.has(dateKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (days.has(dateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function completedThisMonth(history) {
  const now = new Date();
  return history.filter((h) => {
    const d = new Date(h.date + "T00:00:00");
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  }).length;
}

function pickTechniqueForSession(techniquePref, history) {
  if (techniquePref && techniquePref !== "rotate") return techniquePref;
  const idx = history.length % TECHNIQUE_ORDER.length;
  return TECHNIQUE_ORDER[idx];
}

function pickFrequencyForSession(frequencyPref, history) {
  if (frequencyPref && frequencyPref !== "rotate") return Number(frequencyPref);
  return history.length % 2 === 0 ? 432 : 528;
}

// Singing-bowl-style ding, one low fundamental per breath phase kind
// (G3 on the inhale settling down to C3 on the exhale).
const CHIME_TONES = {
  inhale: 196.0, // G3
  hold: 164.81, // E3
  exhale: 130.81, // C3
  start: 196.0, // G3
  end: 130.81, // C3
};

function phaseKind(key) {
  if (key.toLowerCase().includes("inhale")) return "inhale";
  if (key.toLowerCase().includes("exhale")) return "exhale";
  return "hold";
}

/* ---------------------------------------------------------------------- */
/* Audio engine (Web Audio tone + chime + pre-rendered voiceover)         */
/* ---------------------------------------------------------------------- */

const AudioEngine = {
  ctx: null,
  osc: null,
  gain: null,
  voice: null,

  ensureContext() {
    if (!this.ctx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (Ctx) this.ctx = new Ctx();
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  },

  startTone(freq) {
    const ctx = this.ensureContext();
    if (!ctx) return;
    this.stopTone();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.value = 0;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    gain.gain.linearRampToValueAtTime(0.045, ctx.currentTime + 1.5);
    this.osc = osc;
    this.gain = gain;
  },

  stopTone() {
    if (this.osc && this.gain && this.ctx) {
      const now = this.ctx.currentTime;
      try {
        this.gain.gain.cancelScheduledValues(now);
        this.gain.gain.setValueAtTime(this.gain.gain.value, now);
        this.gain.gain.linearRampToValueAtTime(0, now + 0.8);
        this.osc.stop(now + 0.9);
      } catch (e) {
        /* already stopped */
      }
    }
    this.osc = null;
    this.gain = null;
  },

  // A single low singing-bowl-style ding: a fundamental plus a softly
  // detuned partner (the natural "beating" shimmer of a struck bowl) and
  // a quiet high overtone, all sine tones with a slow bloom and long decay.
  playChime(kind) {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const base = CHIME_TONES[kind] || CHIME_TONES.hold;
    const now = ctx.currentTime;
    const partials = [
      { mult: 1, gain: 0.15, detune: 0 },
      { mult: 1, gain: 0.07, detune: 5 },
      { mult: 2.76, gain: 0.035, detune: 0 },
    ];
    partials.forEach(({ mult, gain, detune }) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = base * mult;
      if (detune) osc.detune.value = detune;
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(gain, now + 0.05);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 3.2);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 3.3);
    });
  },

  speak(key) {
    const src = VOICE_AUDIO[key];
    if (!src) return;
    if (!this.voiceAudio) {
      this.voiceAudio = new Audio();
      this.voiceAudio.preload = "auto";
    }
    this.voiceAudio.pause();
    this.voiceAudio.currentTime = 0;
    this.voiceAudio.src = src;
    this.voiceAudio.volume = 0.95;
    this.voiceAudio.play().catch(() => {});
  },

  stopSpeak() {
    if (this.voiceAudio) {
      this.voiceAudio.pause();
      this.voiceAudio.currentTime = 0;
    }
  },

  stopAll() {
    this.stopTone();
    this.stopSpeak();
  },
};

/* ---------------------------------------------------------------------- */
/* Shared UI bits                                                         */
/* ---------------------------------------------------------------------- */

function TopBar({ onBack, label }) {
  if (!onBack) return null;
  return (
    <div className="top-bar">
      <button className="back-btn" onClick={onBack}>
        &larr; {label || "Back"}
      </button>
      <span />
    </div>
  );
}

function ReadMoreOverlay({ quote, onClose }) {
  if (!quote) return null;
  return (
    <div className="overlay-backdrop" onClick={onClose}>
      <div className="overlay-sheet" onClick={(e) => e.stopPropagation()}>
        <p className="quote-of-day quote-label" style={{ margin: 0 }}>
          {quote.source}
        </p>
        <p className="quote-text">&ldquo;{quote.text}&rdquo;</p>
        <p className="quote-author">
          &mdash; <span>{quote.author}</span>
        </p>
        <p className="overlay-context">{quote.context}</p>
        <button className="btn btn-primary btn-block" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Breath visual                                                          */
/* ---------------------------------------------------------------------- */

function BreathVisual({ technique, phaseKey }) {
  if (technique === "box") {
    const cls =
      phaseKey === "inhale" ? "phase-inhale" : phaseKey === "exhale" ? "phase-exhale" : "phase-hold";
    return (
      <div className={`breath-stage ${cls}`}>
        <div className="box-shape" />
        <div className="box-core" />
      </div>
    );
  }
  if (technique === "478") {
    const cls =
      phaseKey === "inhale" ? "phase-inhale" : phaseKey === "exhale" ? "phase-exhale" : "phase-hold";
    return (
      <div className={`breath-stage ${cls}`}>
        <div className="pulse-circle" />
      </div>
    );
  }
  if (technique === "nadi") {
    const phase = TECHNIQUES.nadi.phases.find((p) => p.key === phaseKey);
    const side = phase ? phase.side : "both";
    return (
      <div className="breath-stage">
        <div className="nostril-pair">
          <div className={`nostril-circle ${side === "left" || side === "both" ? "glow" : ""}`} />
          <div className={`nostril-circle ${side === "right" || side === "both" ? "glow" : ""}`} />
        </div>
      </div>
    );
  }
  // belly
  const expand = phaseKey === "inhale";
  return (
    <div className="breath-stage">
      <div className="belly-guide">
        <div className={`belly-hand ${expand ? "expand" : ""}`}>{"✋"}</div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Screens                                                                 */
/* ---------------------------------------------------------------------- */

function WelcomeScreen({ state, onNameSave, onNavigate }) {
  const [nameDraft, setNameDraft] = useState("");
  const today = todayStr();
  const quote = useMemo(() => quoteOfTheDay(today), [today]);
  const [showQuote, setShowQuote] = useState(false);
  const streak = computeStreak(state.history);

  if (!state.name) {
    return (
      <div className="screen">
        <p className="eyebrow">Welcome</p>
        <h1 className="headline">Let's begin with your name</h1>
        <p className="subtext">We'll use it to greet you each morning.</p>
        <input
          className="text-input"
          placeholder="Your name"
          value={nameDraft}
          onChange={(e) => setNameDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && nameDraft.trim()) onNameSave(nameDraft.trim());
          }}
          autoFocus
        />
        <div className="nav-row">
          <button
            className="btn btn-primary btn-block"
            disabled={!nameDraft.trim()}
            onClick={() => onNameSave(nameDraft.trim())}
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="screen">
      <p className="eyebrow">Good morning</p>
      <h1 className="headline">Good morning, {state.name}.</h1>
      <p className="subtext">Let's begin.</p>

      {streak > 0 && (
        <div className="streak-badge">
          {"✨"} {streak}-day streak
        </div>
      )}

      <div className="quote-of-day">
        <p className="quote-label">Quote of the Day</p>
        <p className="quote-text">&ldquo;{quote.text}&rdquo;</p>
        <p className="quote-author">
          &mdash; <span>{quote.author}</span>
        </p>
        <button className="btn btn-ghost" onClick={() => setShowQuote(true)} style={{ marginTop: "0.5rem" }}>
          Read more
        </button>
      </div>

      <div className="nav-row">
        <button className="btn btn-primary btn-block" onClick={() => onNavigate("setup")}>
          Start Ritual
        </button>
        <button className="btn btn-secondary btn-block" onClick={() => onNavigate("progress")}>
          Progress
        </button>
        <button className="btn btn-secondary btn-block" onClick={() => onNavigate("settings")}>
          Settings
        </button>
      </div>

      {showQuote && <ReadMoreOverlay quote={quote} onClose={() => setShowQuote(false)} />}
    </div>
  );
}

function SetupScreen({ state, onBack, onStart }) {
  const [duration, setDuration] = useState(10);
  const [technique, setTechnique] = useState(state.prefs.techniquePref || "rotate");

  return (
    <div className="screen">
      <TopBar onBack={onBack} label="Home" />
      <p className="eyebrow">Ritual Setup</p>
      <h1 className="headline">Set your pace</h1>
      <p className="subtext">Choose how long you'd like to spend this morning.</p>

      <div className="option-grid">
        {Object.keys(DURATIONS).map((d) => (
          <button
            key={d}
            className={`option-pill ${Number(d) === duration ? "selected" : ""}`}
            onClick={() => setDuration(Number(d))}
          >
            {DURATIONS[d].label}
          </button>
        ))}
      </div>

      <p className="subtext" style={{ marginBottom: "1rem" }}>
        Choose a breathwork technique.
      </p>

      <div className="technique-list">
        {TECHNIQUE_ORDER.map((id) => {
          const t = TECHNIQUES[id];
          return (
            <button
              key={id}
              className={`technique-card ${technique === id ? "selected" : ""}`}
              onClick={() => setTechnique(id)}
            >
              <span className="technique-icon">{t.icon}</span>
              <span className="technique-copy">
                <p className="technique-name">{t.name}</p>
                <p className="technique-desc">{t.description}</p>
              </span>
            </button>
          );
        })}
      </div>

      <button
        className={`rotate-toggle ${technique === "rotate" ? "selected" : ""}`}
        onClick={() => setTechnique("rotate")}
      >
        Rotate for me
      </button>

      <div className="nav-row">
        <button
          className="btn btn-primary btn-block"
          onClick={() => onStart({ duration, technique: pickTechniqueForSession(technique, state.history) })}
        >
          Begin
        </button>
      </div>
    </div>
  );
}

function RitualScreen({ state, session, onComplete, onExit }) {
  const { duration, technique } = session;
  const dur = DURATIONS[duration];
  const quote = useMemo(() => quoteOfTheDay(todayStr()), []);
  const techniqueConfig = TECHNIQUES[technique];
  const frequency = useMemo(
    () => pickFrequencyForSession(state.prefs.frequencyPref, state.history),
    [] // eslint-disable-line
  );

  const [stage, setStage] = useState("opening"); // opening | breathing | closing
  const [elapsed, setElapsed] = useState(0);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [phaseElapsed, setPhaseElapsed] = useState(0);
  const [cueStyle, setCueStyle] = useState(state.prefs.cueStyle); // "voice" | "chime" | "off"
  const [soundOn, setSoundOn] = useState(state.prefs.frequencyOn);

  const stageRef = useRef(stage);
  stageRef.current = stage;
  const cueStyleRef = useRef(cueStyle);
  cueStyleRef.current = cueStyle;
  const soundOnRef = useRef(soundOn);
  soundOnRef.current = soundOn;
  const phaseIdxRef = useRef(0);

  const playPhaseCue = (phase) => {
    if (cueStyleRef.current === "voice") AudioEngine.speak(phase.voice);
    else if (cueStyleRef.current === "chime") AudioEngine.playChime(phaseKind(phase.key));
  };

  const playEdgeCue = (kind) => {
    if (cueStyleRef.current === "voice") AudioEngine.speak(kind === "start" ? "Let's begin" : "Well done");
    else if (cueStyleRef.current === "chime") AudioEngine.playChime(kind);
  };

  // opening / closing countdown
  useEffect(() => {
    if (stage !== "opening" && stage !== "closing") return;
    const budget = stage === "opening" ? dur.open : dur.close;
    setElapsed(0);
    const id = setInterval(() => {
      setElapsed((prev) => {
        if (prev + 1 >= budget) {
          clearInterval(id);
          if (stage === "opening") {
            setStage("breathing");
          } else {
            onComplete({ duration, technique, quote });
          }
        }
        return prev + 1;
      });
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line
  }, [stage]);

  // breathing loop
  useEffect(() => {
    if (stage !== "breathing") return;
    setPhaseIdx(0);
    phaseIdxRef.current = 0;
    setPhaseElapsed(0);
    setElapsed(0);

    if (soundOnRef.current) AudioEngine.startTone(FREQUENCIES[frequency].hz);
    playEdgeCue("start");

    let totalElapsed = 0;
    let phaseElapsedLocal = 0;
    const id = setInterval(() => {
      totalElapsed += 1;
      phaseElapsedLocal += 1;
      setElapsed(totalElapsed);

      const currentPhase = techniqueConfig.phases[phaseIdxRef.current];
      if (phaseElapsedLocal >= currentPhase.seconds) {
        phaseElapsedLocal = 0;
        phaseIdxRef.current = (phaseIdxRef.current + 1) % techniqueConfig.phases.length;
        setPhaseIdx(phaseIdxRef.current);
        playPhaseCue(techniqueConfig.phases[phaseIdxRef.current]);
      }
      setPhaseElapsed(phaseElapsedLocal);

      if (totalElapsed >= dur.breath) {
        clearInterval(id);
        AudioEngine.stopTone();
        playEdgeCue("end");
        setStage("closing");
      }
    }, 1000);

    return () => {
      clearInterval(id);
    };
    // eslint-disable-next-line
  }, [stage]);

  useEffect(() => {
    return () => AudioEngine.stopAll();
  }, []);

  const selectCueStyle = (mode) => {
    setCueStyle((current) => {
      const next = current === mode ? "off" : mode;
      AudioEngine.stopSpeak();
      return next;
    });
  };

  const toggleSound = () => {
    setSoundOn((v) => {
      const next = !v;
      if (next) {
        if (stageRef.current === "breathing") AudioEngine.startTone(FREQUENCIES[frequency].hz);
      } else {
        AudioEngine.stopTone();
      }
      return next;
    });
  };

  if (stage === "opening" || stage === "closing") {
    const budget = stage === "opening" ? dur.open : dur.close;
    const pct = Math.min(100, (elapsed / budget) * 100);
    return (
      <div className="screen">
        <TopBar onBack={onExit} label="Exit" />
        <p className="ritual-phase-label">{stage === "opening" ? "Settle in" : "Well done"}</p>
        <div className="ritual-quote-wrap">
          <p className="quote-text">&ldquo;{quote.text}&rdquo;</p>
          <p className="quote-author">
            &mdash; <span>{quote.author}</span>
          </p>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="nav-row">
          <button
            className="btn btn-primary btn-block"
            onClick={() => {
              if (stage === "opening") setStage("breathing");
              else onComplete({ duration, technique, quote });
            }}
          >
            {stage === "opening" ? "Ready? Begin breathing" : "Continue"}
          </button>
        </div>
      </div>
    );
  }

  // breathing
  const phase = techniqueConfig.phases[phaseIdx];
  const remaining = Math.max(0, dur.breath - elapsed);
  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");
  const pct = Math.min(100, (elapsed / dur.breath) * 100);

  return (
    <div className="screen">
      <TopBar onBack={onExit} label="Exit" />
      <p className="ritual-phase-label">{techniqueConfig.name}</p>
      <BreathVisual technique={technique} phaseKey={phase.key} />
      <p className="breath-instruction">{phase.label}</p>
      <p className="timer-readout">
        {mm}:{ss} remaining
      </p>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="ritual-controls">
        <div className="control-group">
          <button
            className={`icon-btn ${cueStyle === "voice" ? "active" : ""}`}
            onClick={() => selectCueStyle("voice")}
            title="Voice cues"
          >
            {"\u{1F5E3}\u{FE0F}"}
          </button>
          <span className="control-label">Voice</span>
        </div>
        <div className="control-group">
          <button
            className={`icon-btn ${cueStyle === "chime" ? "active" : ""}`}
            onClick={() => selectCueStyle("chime")}
            title="Chime cues"
          >
            {"\u{1F514}"}
          </button>
          <span className="control-label">Chime</span>
        </div>
        <div className="control-group">
          <button
            className={`icon-btn ${soundOn ? "active" : ""}`}
            onClick={toggleSound}
            title={soundOn ? "Sound on" : "Sound off"}
          >
            {soundOn ? "\u{1F3B5}" : "\u{1F507}"}
          </button>
          <span className="control-label">Sound</span>
        </div>
      </div>
    </div>
  );
}

function CompletionScreen({ state, result, onHome }) {
  const [showQuote, setShowQuote] = useState(false);
  const monthCount = completedThisMonth(state.history);
  const streak = computeStreak(state.history);

  return (
    <div className="screen">
      <div className="completion-icon">{"\u{1F33F}"}</div>
      <p className="eyebrow">Ritual Complete</p>
      <h1 className="headline">
        {state.name}, you've completed your {result.duration}-minute ritual.
      </h1>
      <p className="subtext">Carry this stillness into your day.</p>

      <div className="stat-row">
        <div className="stat-card">
          <span className="stat-number">{streak}</span>
          <span className="stat-label">Day streak</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{monthCount}</span>
          <span className="stat-label">This month</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{state.history.length}</span>
          <span className="stat-label">All time</span>
        </div>
      </div>

      <div className="nav-row">
        <button className="btn btn-secondary btn-block" onClick={() => setShowQuote(true)}>
          Read the full passage
        </button>
        <button className="btn btn-primary btn-block" onClick={onHome}>
          Home
        </button>
      </div>

      {showQuote && <ReadMoreOverlay quote={result.quote} onClose={() => setShowQuote(false)} />}
    </div>
  );
}

function ProgressScreen({ state, onBack }) {
  const streak = computeStreak(state.history);
  const monthCount = completedThisMonth(state.history);
  const recent = [...state.history].reverse().slice(0, 12);

  return (
    <div className="screen">
      <TopBar onBack={onBack} label="Home" />
      <p className="eyebrow">Your Progress</p>
      <h1 className="headline">Steady, gentle progress</h1>
      <p className="subtext">You've completed {monthCount} ritual{monthCount === 1 ? "" : "s"} this month.</p>

      <div className="stat-row">
        <div className="stat-card">
          <span className="stat-number">{streak}</span>
          <span className="stat-label">Day streak</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{monthCount}</span>
          <span className="stat-label">This month</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{state.history.length}</span>
          <span className="stat-label">All time</span>
        </div>
      </div>

      <div className="settings-section">
        <h3>Recent rituals</h3>
        {recent.length === 0 && <p className="subtext">Your first ritual will appear here.</p>}
        {recent.map((h, i) => (
          <div className="settings-row" key={i}>
            <span className="settings-label">{h.date}</span>
            <span className="settings-sub">
              {TECHNIQUES[h.technique] ? TECHNIQUES[h.technique].name : h.technique} &middot; {h.duration} min
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsScreen({ state, onBack, onUpdate, onResetProgress }) {
  const [name, setName] = useState(state.name);

  const updatePrefs = (patch) => {
    onUpdate({ prefs: { ...state.prefs, ...patch } });
  };

  return (
    <div className="screen">
      <TopBar onBack={onBack} label="Home" />
      <p className="eyebrow">Settings</p>
      <h1 className="headline">Make it yours</h1>

      <div className="settings-section">
        <h3>Your name</h3>
        <input
          className="text-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => name.trim() && onUpdate({ name: name.trim() })}
        />
      </div>

      <div className="settings-section">
        <h3>Audio</h3>
        <div className="settings-row" style={{ display: "block" }}>
          <p className="settings-label" style={{ marginBottom: "0.6rem" }}>
            Breathing cues
          </p>
          <div className="segmented">
            {["voice", "chime", "off"].map((c) => (
              <button
                key={c}
                className={state.prefs.cueStyle === c ? "selected" : ""}
                onClick={() => updatePrefs({ cueStyle: c })}
              >
                {c === "voice" ? "Voice" : c === "chime" ? "Chime" : "Off"}
              </button>
            ))}
          </div>
          <p className="settings-sub" style={{ marginTop: "0.5rem" }}>
            {state.prefs.cueStyle === "chime"
              ? "A soft singing-bowl ding marks each breath change."
              : state.prefs.cueStyle === "voice"
              ? "A gentle voice guides each breath change."
              : "No spoken or chime cues — visual guide only."}
          </p>
        </div>
        <div className="settings-row">
          <span className="settings-label">Background frequency</span>
          <button
            className={`switch ${state.prefs.frequencyOn ? "on" : ""}`}
            onClick={() => updatePrefs({ frequencyOn: !state.prefs.frequencyOn })}
          >
            <span className="knob" />
          </button>
        </div>
        <div className="settings-row" style={{ display: "block" }}>
          <p className="settings-label" style={{ marginBottom: "0.6rem" }}>
            Frequency
          </p>
          <div className="segmented">
            {["432", "528", "rotate"].map((f) => (
              <button
                key={f}
                className={state.prefs.frequencyPref === f ? "selected" : ""}
                onClick={() => updatePrefs({ frequencyPref: f })}
              >
                {f === "rotate" ? "Rotate" : FREQUENCIES[f].label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="settings-section">
        <h3>Appearance</h3>
        <div className="segmented">
          {["light", "auto", "dark"].map((t) => (
            <button
              key={t}
              className={state.prefs.theme === t ? "selected" : ""}
              onClick={() => updatePrefs({ theme: t })}
            >
              {t === "light" ? "Light" : t === "dark" ? "Dark" : "Auto"}
            </button>
          ))}
        </div>
      </div>

      <div className="settings-section">
        <h3>Breathwork preference</h3>
        <div className="segmented">
          {[...TECHNIQUE_ORDER, "rotate"].map((t) => (
            <button
              key={t}
              className={state.prefs.techniquePref === t ? "selected" : ""}
              onClick={() => updatePrefs({ techniquePref: t })}
            >
              {t === "rotate" ? "Rotate" : TECHNIQUES[t].icon}
            </button>
          ))}
        </div>
      </div>

      <div className="settings-section">
        <h3>Data</h3>
        <button
          className="danger-link"
          onClick={() => {
            if (window.confirm("Reset all progress data? This can't be undone.")) {
              onResetProgress();
            }
          }}
        >
          Reset progress data
        </button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Root app                                                                */
/* ---------------------------------------------------------------------- */

function App() {
  const [state, setState] = useState(loadState);
  const [screen, setScreen] = useState("welcome");
  const [session, setSession] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    saveState(state);
  }, [state]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const applyTheme = () => {
      const mode = state.prefs.theme === "auto" ? (mq.matches ? "dark" : "light") : state.prefs.theme;
      document.documentElement.setAttribute("data-theme", mode);
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute("content", mode === "dark" ? "#201e19" : "#7a8e74");
    };
    applyTheme();
    mq.addEventListener("change", applyTheme);
    return () => mq.removeEventListener("change", applyTheme);
  }, [state.prefs.theme]);

  const updateState = useCallback((patch) => {
    setState((prev) => ({ ...prev, ...patch }));
  }, []);

  const handleNameSave = (name) => updateState({ name });

  const handleStart = (sessionConfig) => {
    setSession(sessionConfig);
    setScreen("ritual");
  };

  const handleComplete = ({ duration, technique, quote }) => {
    setState((prev) => {
      const entry = { date: todayStr(), duration, technique };
      const history = [...prev.history, entry];
      return { ...prev, history };
    });
    setResult({ duration, technique, quote });
    setScreen("completion");
  };

  const handleExitRitual = () => {
    AudioEngine.stopAll();
    setScreen("welcome");
  };

  const handleResetProgress = () => {
    updateState({ history: [] });
  };

  let body;
  if (screen === "welcome") {
    body = <WelcomeScreen state={state} onNameSave={handleNameSave} onNavigate={setScreen} />;
  } else if (screen === "setup") {
    body = <SetupScreen state={state} onBack={() => setScreen("welcome")} onStart={handleStart} />;
  } else if (screen === "ritual") {
    body = (
      <RitualScreen state={state} session={session} onComplete={handleComplete} onExit={handleExitRitual} />
    );
  } else if (screen === "completion") {
    body = <CompletionScreen state={state} result={result} onHome={() => setScreen("welcome")} />;
  } else if (screen === "progress") {
    body = <ProgressScreen state={state} onBack={() => setScreen("welcome")} />;
  } else if (screen === "settings") {
    body = (
      <SettingsScreen
        state={state}
        onBack={() => setScreen("welcome")}
        onUpdate={updateState}
        onResetProgress={handleResetProgress}
      />
    );
  }

  return <div className="app-shell">{body}</div>;
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
