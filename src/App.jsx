import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";
import {
  Home, User, ScrollText, BarChart3, BookOpen, Trophy, Timer, Settings,
  Flame, Plus, X, Check, ChevronRight, Star, Menu, Sparkles,
  Brain, Dumbbell, Moon, Hammer, Users, Coins, Play, Pause, Square,
  Trash2, Edit3, Skull, Volume2, VolumeX, Gem,
} from "lucide-react";

/* ============================== DESIGN TOKENS ============================== */
const C = {
  bg: "#07070C",
  bgGrad: "radial-gradient(ellipse 80% 60% at 50% -10%, #1a1440 0%, #07070C 55%)",
  panel: "#0F1018",
  panelBorder: "#242640",
  panelBorder2: "#33355a",
  violet: "#8B7FFF",
  violetDim: "#5B4FCC",
  cyan: "#5FE3E0",
  amber: "#F2B65C",
  rose: "#E8607A",
  text: "#F1F1F8",
  textDim: "#9A9CB8",
  textFaint: "#5C5E7E",
};

const FONT_LINK = "https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=Sora:wght@400;500;600;700&display=swap";

const ATTR_META = {
  STR: { label: "Strength", color: "#E8607A", icon: Dumbbell },
  INT: { label: "Intelligence", color: "#5FE3E0", icon: Brain },
  VIT: { label: "Vitality", color: "#7FDD8E", icon: Moon },
  DEX: { label: "Dexterity", color: "#F2B65C", icon: Hammer },
  DISC: { label: "Discipline", color: "#8B7FFF", icon: Flame },
  SOC: { label: "Social", color: "#E88BF2", icon: Users },
};

const CATEGORY_ATTR = {
  Study: "INT", Reading: "INT", Coding: "INT", Learning: "INT",
  Fitness: "VIT", Exercise: "VIT", Sleep: "VIT", Recovery: "VIT",
  Project: "DEX", Design: "DEX", Craft: "DEX",
  Discipline: "DISC", Focus: "DISC", Habit: "DISC",
  Social: "SOC", Networking: "SOC",
  Wealth: "STR", Finance: "STR", Training: "STR",
};
const CATEGORIES = Object.keys(CATEGORY_ATTR);

const DIFFICULTY = {
  easy: { label: "Easy", xp: 20 },
  medium: { label: "Medium", xp: 50 },
  hard: { label: "Hard", xp: 100 },
  epic: { label: "Epic", xp: 200 },
};

const RANKS = ["E", "D", "C", "B", "A", "S", "SS", "SSS"];

const ACHIEVEMENTS = [
  { id: "first_blood", name: "The Grind Begins", desc: "Complete your first quest.", rarity: "Common",
    check: (s) => s.stats.questsCompleted >= 1 },
  { id: "no_excuses", name: "No Excuses", desc: "Reach a 7-day streak.", rarity: "Uncommon",
    check: (s) => s.player.longestStreak >= 7 },
  { id: "iron_will", name: "Iron Will", desc: "Reach a 30-day streak.", rarity: "Rare",
    check: (s) => s.player.longestStreak >= 30 },
  { id: "centurion", name: "Centurion", desc: "Reach a 100-day streak.", rarity: "Legendary",
    check: (s) => s.player.longestStreak >= 100 },
  { id: "ten_quests", name: "Momentum", desc: "Complete 10 quests.", rarity: "Common",
    check: (s) => s.stats.questsCompleted >= 10 },
  { id: "fifty_quests", name: "The Machine", desc: "Complete 50 quests.", rarity: "Epic",
    check: (s) => s.stats.questsCompleted >= 50 },
  { id: "level_10", name: "Rising Power", desc: "Reach Level 10.", rarity: "Uncommon",
    check: (s) => s.player.level >= 10 },
  { id: "level_50", name: "System Breaker", desc: "Reach Level 50.", rarity: "Mythic",
    check: (s) => s.player.level >= 50 },
  { id: "focus_master", name: "Deep Work", desc: "Complete 10 focus sessions.", rarity: "Rare",
    check: (s) => s.stats.focusSessions >= 10 },
  { id: "journaler", name: "Self-Aware", desc: "Write 5 journal entries.", rarity: "Common",
    check: (s) => s.journal.length >= 5 },
  { id: "well_rounded", name: "Well Rounded", desc: "Reach level 5 in every attribute.", rarity: "Epic",
    check: (s) => Object.values(s.player.attributes).every((v) => v >= 5) },
];

const TITLES = ["The Awakened", "The Relentless", "The Scholar", "The Builder", "The Strategist", "The Ascended"];

// Preset quest packs. Modeled on patterns common to gamified habit systems
// (Habitica's Habit/Daily/To-Do split, domain-based leveling like Health/
// Wealth/Mind/Social trackers): each pack pairs one low-friction recurring
// daily with a light side quest and a bigger main quest, so a new player gets
// an immediate, sustainable loop in a domain rather than a wall of empty
// choices. Difficulties lean easy/medium on purpose — early wins matter more
// than early challenge for habits that need to survive past week one.
const PRESETS = [
  {
    id: "balanced", name: "Balanced Start", domain: "All Realms", icon: Sparkles, color: C.violet,
    blurb: "One easy daily from every realm — the recommended pack for a new character.",
    quests: [
      { title: "30 min focused study or reading", category: "Study", type: "daily", difficulty: "easy" },
      { title: "20 min movement or workout", category: "Fitness", type: "daily", difficulty: "easy" },
      { title: "Wind down 30 min before bed", category: "Sleep", type: "daily", difficulty: "easy" },
      { title: "Work 25 min on a personal project", category: "Project", type: "daily", difficulty: "easy" },
      { title: "Message one person you care about", category: "Social", type: "daily", difficulty: "easy" },
      { title: "Log today's spending", category: "Finance", type: "daily", difficulty: "easy" },
    ],
  },
  {
    id: "scholar", name: "Scholar's Path", domain: "Mind", icon: Brain, color: ATTR_META.INT.color,
    blurb: "Study, reading, and deep learning habits for steady INT growth.",
    quests: [
      { title: "30 min focused study", category: "Study", type: "daily", difficulty: "medium" },
      { title: "Read 10 pages", category: "Reading", type: "side", difficulty: "easy" },
      { title: "Finish one course module", category: "Learning", type: "main", difficulty: "hard" },
    ],
  },
  {
    id: "warrior", name: "Warrior's Rise", domain: "Body", icon: Dumbbell, color: ATTR_META.STR.color,
    blurb: "Movement and training habits for steady VIT and physical resilience.",
    quests: [
      { title: "20 min workout", category: "Fitness", type: "daily", difficulty: "medium" },
      { title: "10 minute walk outside", category: "Exercise", type: "side", difficulty: "easy" },
      { title: "Run a 5K", category: "Fitness", type: "main", difficulty: "hard" },
    ],
  },
  {
    id: "recovery", name: "Recovery Protocol", domain: "Recovery", icon: Moon, color: ATTR_META.VIT.color,
    blurb: "Sleep consistency and rest habits — the foundation everything else compounds on.",
    quests: [
      { title: "Consistent bedtime", category: "Sleep", type: "daily", difficulty: "easy" },
      { title: "10 min meditation or breathing", category: "Recovery", type: "side", difficulty: "easy" },
      { title: "Hit 7-day sleep consistency streak", category: "Recovery", type: "main", difficulty: "medium" },
    ],
  },
  {
    id: "builder", name: "Builder's Forge", domain: "Creation", icon: Hammer, color: ATTR_META.DEX.color,
    blurb: "Deep work and shipping habits for creative and technical projects.",
    quests: [
      { title: "1 hour deep work on a project", category: "Project", type: "daily", difficulty: "medium" },
      { title: "Sketch or prototype one idea", category: "Design", type: "side", difficulty: "easy" },
      { title: "Ship a project milestone", category: "Craft", type: "main", difficulty: "hard" },
    ],
  },
  {
    id: "networker", name: "Networker", domain: "Social", icon: Users, color: ATTR_META.SOC.color,
    blurb: "Small, repeatable habits for staying connected and building relationships.",
    quests: [
      { title: "Reach out to one person", category: "Social", type: "daily", difficulty: "easy" },
      { title: "Plan or attend a social activity", category: "Networking", type: "side", difficulty: "medium" },
      { title: "Reconnect with a dormant relationship", category: "Social", type: "main", difficulty: "medium" },
    ],
  },
  {
    id: "wealth", name: "Wealth Track", domain: "Wealth", icon: Coins, color: ATTR_META.STR.color,
    blurb: "Money-awareness habits that compound quietly in the background.",
    quests: [
      { title: "Log today's spending", category: "Finance", type: "daily", difficulty: "easy" },
      { title: "Review the week's budget", category: "Wealth", type: "side", difficulty: "easy" },
      { title: "Build a 1-month emergency buffer habit", category: "Training", type: "main", difficulty: "hard" },
    ],
  },
];

/* ============================== HELPERS ============================== */
const uid = () => Math.random().toString(36).slice(2, 10);
const todayStr = () => new Date().toISOString().slice(0, 10);

// XP curve: soft-capped polynomial (base * level^1.4), softening into a slow
// compounding rate after level 30. Polynomial curves give the "getting
// stronger" feeling of RPG progression without the wall a hard exponential
// curve creates late-game, and without the flatness a pure linear curve
// creates early-game — so growth stays meaningful indefinitely instead of
// plateauing or spiking out of reach.
const XP_CURVE_BASE = 45;
const XP_CURVE_SOFTCAP_LEVEL = 30;
const xpForLevel = (level) => {
  if (level <= XP_CURVE_SOFTCAP_LEVEL) {
    return Math.round(XP_CURVE_BASE * Math.pow(level, 1.4) + 40);
  }
  const atCap = XP_CURVE_BASE * Math.pow(XP_CURVE_SOFTCAP_LEVEL, 1.4) + 40;
  return Math.round(atCap * Math.pow(1.035, level - XP_CURVE_SOFTCAP_LEVEL));
};

function computeRank(player, stats) {
  const score =
    player.level * 3 +
    player.longestStreak * 1.5 +
    stats.questsCompleted * 0.8 +
    Object.values(player.attributes).reduce((a, b) => a + b, 0);
  const idx = Math.min(RANKS.length - 1, Math.floor(score / 40));
  return RANKS[idx];
}

/* ============================== SOUND ENGINE ============================== */
// Small synthesized SFX via Web Audio — no external audio files, so nothing
// to license or fail to load. Lazily creates its AudioContext on first use
// (inside a click handler) to satisfy browser autoplay policies.
const audioEngine = (() => {
  let ctx;
  const getCtx = () => {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) ctx = new AC();
    }
    return ctx;
  };
  const tone = (freq, dur, type = "sine", vol = 0.16, delay = 0) => {
    const ac = getCtx();
    if (!ac) return;
    if (ac.state === "suspended") ac.resume();
    const t0 = ac.currentTime + delay;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(vol, t0 + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  };
  return {
    click: () => tone(660, 0.05, "square", 0.05),
    xp: () => { tone(880, 0.12, "sine", 0.12); tone(1320, 0.12, "sine", 0.08, 0.04); },
    quest: () => { tone(523.25, 0.09, "triangle", 0.15); tone(659.25, 0.09, "triangle", 0.13, 0.07); tone(784, 0.16, "triangle", 0.13, 0.14); },
    levelUp: () => [523.25, 659.25, 784, 1046.5].forEach((f, i) => tone(f, 0.22, "sawtooth", 0.12, i * 0.09)),
    achievement: () => { tone(784, 0.1, "sine", 0.15); tone(988, 0.1, "sine", 0.13, 0.08); tone(1318.5, 0.22, "sine", 0.14, 0.16); },
    bossDefeat: () => [220, 330, 440, 660, 880].forEach((f, i) => tone(f, 0.3, "sawtooth", 0.1, i * 0.08)),
  };
})();

/* ============================== WEEKLY BOSS ============================== */
// A conceptual boss for the week, damaged by real completed activity. Losing
// a week to the boss isn't punished — it just tries again, per the "no
// shame-based failure" design principle.
const BOSS_POOL = [
  { name: "Procrastination", flavor: "It grows stronger every time you say \"later\".", color: C.rose },
  { name: "Chaos", flavor: "Unstructured days feed it.", color: C.amber },
  { name: "Distraction", flavor: "It thrives in half-finished tabs.", color: C.cyan },
  { name: "Fatigue", flavor: "Every skipped rest gives it strength.", color: C.violetDim },
  { name: "Inconsistency", flavor: "It waits for the days you almost show up.", color: C.violet },
];
function isoWeekKey(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${weekNo}`;
}
function generateBoss(weekKey) {
  const pick = BOSS_POOL[Math.floor(Math.random() * BOSS_POOL.length)];
  const maxHp = 650;
  return { ...pick, weekKey, maxHp, hp: maxHp, defeated: false };
}

/* ============================== ARCHETYPES ============================== */
const ARCHETYPES = [
  { id: "scholar", name: "Scholar", desc: "Masters of study and deep focus.", bonus: { INT: 4, DISC: 2 }, color: ATTR_META.INT.color, icon: Brain },
  { id: "warrior", name: "Warrior", desc: "Forged through physical discipline.", bonus: { STR: 3, VIT: 3 }, color: ATTR_META.STR.color, icon: Dumbbell },
  { id: "builder", name: "Builder", desc: "Turns ideas into shipped reality.", bonus: { DEX: 4, DISC: 2 }, color: ATTR_META.DEX.color, icon: Hammer },
  { id: "strategist", name: "Strategist", desc: "Balanced growth across every domain.", bonus: { INT: 2, DISC: 2, SOC: 2 }, color: C.cyan, icon: ScrollText },
  { id: "explorer", name: "Explorer", desc: "Driven by connection and momentum.", bonus: { SOC: 4, VIT: 2 }, color: C.amber, icon: Users },
];

/* ============================== PURE XP / ACHIEVEMENT LOGIC ============================== */
// Pure functions (no side effects) so callers can decide what to do with the
// result (toast, sound, floating number) after the state update is computed.
function applyXPToState(s, baseXp, attrKey, sourceLabel) {
  const ns = JSON.parse(JSON.stringify(s));
  const p = ns.player;
  const today = todayStr();
  if (ns.settings.streaksEnabled && ns.lastCompletionDate !== today) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    if (ns.lastCompletionDate === yesterday) p.streak += 1; else p.streak = 1;
    p.longestStreak = Math.max(p.longestStreak, p.streak);
    ns.lastCompletionDate = today;
  }

  // Daily combo: each completion today stacks a small extra XP bonus, on top
  // of the streak bonus — capped so it rewards a productive day without
  // letting XP run away. Resets automatically when the date changes.
  if (!ns.dailyCombo || ns.dailyCombo.date !== today) ns.dailyCombo = { date: today, count: 0 };
  ns.dailyCombo = { date: today, count: ns.dailyCombo.count + 1 };
  const comboBonus = Math.min(0.4, (ns.dailyCombo.count - 1) * 0.04);

  const streakBonus = ns.settings.streaksEnabled ? Math.min(0.5, p.streak * 0.02) : 0;
  const totalXp = Math.round(baseXp * (1 + streakBonus + comboBonus));
  p.xp += totalXp;
  p.totalXp += totalXp;
  if (attrKey) p.attributes[attrKey] = (p.attributes[attrKey] || 1) + Math.max(1, Math.round(totalXp / 40));

  // Gems — the currency spent on streak freezes (and future shop items).
  const gemsEarned = Math.max(1, Math.round(totalXp / 12));
  p.gems = (p.gems || 0) + gemsEarned;

  let leveledUp = false;
  let need = xpForLevel(p.level);
  while (p.xp >= need) {
    p.xp -= need;
    p.level += 1;
    leveledUp = true;
    need = xpForLevel(p.level);
  }
  p.rank = computeRank(p, ns.stats);
  ns.xpLog = [...ns.xpLog, { date: today, xp: p.totalXp }].slice(-200);

  let bossDefeatedNow = false;
  let bossName = null;
  if (ns.boss && !ns.boss.defeated) {
    const dmg = Math.round(totalXp * 1.4);
    ns.boss = { ...ns.boss, hp: Math.max(0, ns.boss.hp - dmg) };
    if (ns.boss.hp <= 0) { ns.boss.defeated = true; bossDefeatedNow = true; bossName = ns.boss.name; }
  }

  return { state: ns, totalXp, gemsEarned, comboCount: ns.dailyCombo.count, leveledUp, newLevel: p.level, bossDefeatedNow, bossName };
}
function checkAchievementsPure(s) {
  const unlocked = { ...s.achievementsUnlocked };
  const newly = [];
  for (const a of ACHIEVEMENTS) {
    if (!unlocked[a.id] && a.check(s)) { unlocked[a.id] = true; newly.push(a); }
  }
  return { state: { ...s, achievementsUnlocked: unlocked }, newly };
}

// Streak freezes: if the player has fully skipped one or more days since
// their last completion, spend a freeze per missed day to keep the streak
// alive (Duolingo's core retention mechanic). Runs once per app load, not
// per completion, since it's resolving days the app was never opened.
function resolveStreakGaps(s) {
  if (!s.player.streak || !s.lastCompletionDate) return { state: s, notice: null };
  const today = todayStr();
  if (s.lastCompletionDate === today) return { state: s, notice: null };
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (s.lastCompletionDate === yesterday) return { state: s, notice: null };

  const lastMs = new Date(s.lastCompletionDate + "T00:00:00Z").getTime();
  const todayMs = new Date(today + "T00:00:00Z").getTime();
  const missedDays = Math.round((todayMs - lastMs) / 86400000) - 1;
  if (missedDays <= 0) return { state: s, notice: null };

  const freezes = s.player.streakFreezes || 0;
  if (freezes >= missedDays) {
    const ns = { ...s, player: { ...s.player, streakFreezes: freezes - missedDays }, lastCompletionDate: yesterday };
    const used = missedDays === 1 ? "a Streak Freeze" : `${missedDays} Streak Freezes`;
    return { state: ns, notice: { text: `STREAK FREEZE — ${used} protected your ${s.player.streak}-day streak.`, kind: "boss" } };
  }
  const ns = { ...s, player: { ...s.player, streak: 0 } };
  return { state: ns, notice: { text: "Your streak reset — a fresh run starts today.", kind: "system" } };
}

function defaultState() {
  return {
    onboarded: false,
    player: {
      name: "Player",
      level: 1,
      xp: 0,
      totalXp: 0,
      title: "The Awakened",
      class: "Unclassed",
      streak: 0,
      longestStreak: 0,
      lastActiveDate: null,
      gems: 20,
      streakFreezes: 0,
      attributes: { STR: 1, INT: 1, VIT: 1, DEX: 1, DISC: 1, SOC: 1 },
    },
    quests: [
      { id: uid(), title: "Complete 3 hours of deep work", category: "Focus", type: "daily", difficulty: "medium", status: "active", createdAt: todayStr() },
      { id: uid(), title: "Read 10 pages", category: "Reading", type: "side", difficulty: "easy", status: "active", createdAt: todayStr() },
    ],
    achievementsUnlocked: {},
    journal: [],
    xpLog: [],
    stats: { questsCompleted: 0, focusSessions: 0, focusMinutes: 0 },
    settings: { streaksEnabled: true, soundEnabled: true },
    lastCompletionDate: null,
    dailyCombo: { date: null, count: 0 },
    boss: null,
  };
}

/* ============================== STORAGE ============================== */
// Standalone app (outside the Claude artifact sandbox) — persist to the
// browser's own localStorage instead of the artifact's window.storage API.
const STORAGE_KEY = "ascend-state";
async function loadState() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const merged = { ...defaultState(), ...parsed };
      // Any previously saved blob means this player already exists — even if
      // it predates the onboarding flow, don't send a returning player
      // through character creation again.
      merged.onboarded = parsed.onboarded !== undefined ? parsed.onboarded : true;
      return merged;
    }
  } catch (e) {
    /* no saved state yet, or storage unavailable */
  }
  return defaultState();
}
async function saveState(state) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("save failed", e);
  }
}

/* ============================== ROOT ============================== */
export default function AscendApp() {
  const [state, setState] = useState(null);
  const [view, setView] = useState("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [levelUpFlash, setLevelUpFlash] = useState(null);
  const [bursts, setBursts] = useState([]);
  const saveTimer = useRef(null);
  const soundEnabledRef = useRef(true);
  const lastCheckedWeek = useRef(null);

  const [pendingNotice, setPendingNotice] = useState(null);

  useEffect(() => {
    loadState().then((loaded) => {
      const resolved = resolveStreakGaps(loaded);
      setState(resolved.state);
      if (resolved.notice) setPendingNotice(resolved.notice);
    });
  }, []);

  useEffect(() => {
    if (pendingNotice) {
      pushToast(pendingNotice.text, pendingNotice.kind);
      setPendingNotice(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingNotice]);

  useEffect(() => {
    if (!state) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveState(state), 400);
    return () => clearTimeout(saveTimer.current);
  }, [state]);

  useEffect(() => {
    soundEnabledRef.current = state?.settings?.soundEnabled ?? true;
  }, [state?.settings?.soundEnabled]);

  // Weekly boss lifecycle — spawn one on first launch, replace it when the
  // ISO week rolls over. Guarded by a ref so it only evaluates once per week
  // per session rather than on every state change.
  useEffect(() => {
    if (!state) return;
    const wk = isoWeekKey();
    if (lastCheckedWeek.current === wk) return;
    lastCheckedWeek.current = wk;
    if (!state.boss || state.boss.weekKey !== wk) {
      const isFirst = !state.boss;
      const newBoss = generateBoss(wk);
      setState((prev) => (prev ? { ...prev, boss: newBoss } : prev));
      pushToast(isFirst ? `WEEKLY BOSS — ${newBoss.name} awaits.` : `NEW WEEKLY BOSS — ${newBoss.name} has appeared.`, "boss");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const pushToast = useCallback((text, kind = "system") => {
    const id = uid();
    setToasts((t) => [...t, { id, text, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3600);
  }, []);

  const playSound = useCallback((name) => {
    if (soundEnabledRef.current && audioEngine[name]) audioEngine[name]();
  }, []);

  const spawnBurst = useCallback((x, y, label, color) => {
    const id = uid();
    setBursts((b) => [...b, { id, x, y, label, color }]);
    setTimeout(() => setBursts((b) => b.filter((it) => it.id !== id)), 900);
  }, []);

  // Shared "resolve an XP-granting action" flow: run the pure calculation,
  // then fan out the side effects (toast, sound, level-up cinematic, boss
  // defeat, achievement unlocks) exactly once per action.
  const resolveXPResult = useCallback((result, sourceLabel) => {
    pushToast(`+${result.totalXp} XP · +${result.gemsEarned} 💎 — ${sourceLabel}`, "xp");
    playSound(result.leveledUp ? "levelUp" : "quest");
    if (result.leveledUp) {
      setLevelUpFlash(result.newLevel);
      setTimeout(() => setLevelUpFlash(null), 2600);
    }
    if (result.bossDefeatedNow) {
      pushToast(`BOSS DEFEATED — ${result.bossName} has fallen.`, "boss");
      playSound("bossDefeat");
    }
  }, [pushToast, playSound]);

  const completeQuest = useCallback((questId, event) => {
    const q = state?.quests.find((x) => x.id === questId);
    if (!q || q.status === "completed") return;
    const attr = CATEGORY_ATTR[q.category] || "DISC";
    setState((prev) => {
      const pq = prev.quests.find((x) => x.id === questId);
      if (!pq || pq.status === "completed") return prev;
      const withQuest = {
        ...prev,
        quests: prev.quests.map((x) => (x.id === questId ? { ...x, status: "completed", completedAt: todayStr() } : x)),
        stats: { ...prev.stats, questsCompleted: prev.stats.questsCompleted + 1 },
      };
      const result = applyXPToState(withQuest, DIFFICULTY[q.difficulty].xp, attr, q.title);
      const ach = checkAchievementsPure(result.state);
      resolveXPResult(result, q.title);
      ach.newly.forEach((a) => pushToast(`ACHIEVEMENT UNLOCKED — ${a.name}`, "achievement"));
      return ach.state;
    });
    if (event) spawnBurst(event.clientX, event.clientY, `+${DIFFICULTY[q.difficulty].xp} XP`, ATTR_META[attr].color);
  }, [state, resolveXPResult, pushToast, spawnBurst]);

  const addQuest = useCallback((quest) => {
    setState((prev) => ({ ...prev, quests: [...prev.quests, { ...quest, id: uid(), status: "active", createdAt: todayStr() }] }));
  }, []);

  const deleteQuest = useCallback((questId) => {
    setState((prev) => ({ ...prev, quests: prev.quests.filter((q) => q.id !== questId) }));
  }, []);

  const addJournalEntry = useCallback((entry) => {
    setState((prev) => ({ ...prev, journal: [{ ...entry, id: uid(), date: new Date().toISOString() }, ...prev.journal] }));
  }, []);

  const completeFocusSession = useCallback((minutes, event) => {
    setState((prev) => {
      const withStats = {
        ...prev,
        stats: { ...prev.stats, focusSessions: prev.stats.focusSessions + 1, focusMinutes: prev.stats.focusMinutes + minutes },
      };
      const xp = Math.min(150, Math.round(minutes * 1.2));
      const result = applyXPToState(withStats, xp, "DISC", `${minutes}min Focus Session`);
      const ach = checkAchievementsPure(result.state);
      resolveXPResult(result, "Focus Session");
      ach.newly.forEach((a) => pushToast(`ACHIEVEMENT UNLOCKED — ${a.name}`, "achievement"));
      return ach.state;
    });
    if (event) spawnBurst(event.clientX, event.clientY, "FOCUS COMPLETE", C.cyan);
  }, [resolveXPResult, pushToast, spawnBurst]);

  const updatePlayer = useCallback((patch) => {
    setState((prev) => ({ ...prev, player: { ...prev.player, ...patch } }));
  }, []);

  const toggleStreaks = useCallback(() => {
    setState((prev) => ({ ...prev, settings: { ...prev.settings, streaksEnabled: !prev.settings.streaksEnabled } }));
  }, []);

  const toggleSound = useCallback(() => {
    setState((prev) => ({ ...prev, settings: { ...prev.settings, soundEnabled: !prev.settings.soundEnabled } }));
  }, []);

  const STREAK_FREEZE_COST = 150;
  const STREAK_FREEZE_CAP = 2;
  const buyStreakFreeze = useCallback(() => {
    setState((prev) => {
      const owned = prev.player.streakFreezes || 0;
      if (owned >= STREAK_FREEZE_CAP || (prev.player.gems || 0) < STREAK_FREEZE_COST) return prev;
      return { ...prev, player: { ...prev.player, gems: prev.player.gems - STREAK_FREEZE_COST, streakFreezes: owned + 1 } };
    });
    playSound("achievement");
    pushToast("Streak Freeze purchased.", "system");
  }, [playSound, pushToast]);

  const resetAll = useCallback(() => {
    setState(defaultState());
    lastCheckedWeek.current = null;
  }, []);

  const createCharacter = useCallback((name, archetypeId) => {
    const arch = ARCHETYPES.find((a) => a.id === archetypeId) || ARCHETYPES[0];
    setState((prev) => {
      const attrs = { ...prev.player.attributes };
      Object.entries(arch.bonus).forEach(([k, v]) => { attrs[k] = (attrs[k] || 1) + v; });
      return { ...prev, onboarded: true, player: { ...prev.player, name: name || "Player", class: arch.name, attributes: attrs } };
    });
    playSound("quest");
  }, [playSound]);

  if (!state) {
    return (
      <div style={{ background: C.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: C.violet, fontFamily: "Rajdhani", letterSpacing: 4, fontSize: 14 }}>INITIALIZING SYSTEM…</div>
      </div>
    );
  }

  const ctx = { state, setState, view, setView, pushToast, playSound, spawnBurst, completeQuest, addQuest, deleteQuest, addJournalEntry, completeFocusSession, updatePlayer, toggleStreaks, toggleSound, resetAll, buyStreakFreeze, STREAK_FREEZE_COST, STREAK_FREEZE_CAP };

  return (
    <div style={{ background: C.bgGrad, backgroundColor: C.bg, minHeight: "100vh", color: C.text, fontFamily: "Sora, sans-serif", position: "relative", overflowX: "hidden" }}>
      <style>{`
        @import url('${FONT_LINK}');
        * { box-sizing: border-box; }
        .display { font-family: 'Rajdhani', sans-serif; letter-spacing: 0.06em; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-thumb { background: ${C.panelBorder2}; border-radius: 4px; }
        @keyframes floatUp { 0% { opacity: 0; transform: translateY(8px); } 10% { opacity: 1; transform: translateY(0);} 85% { opacity: 1; } 100% { opacity: 0; transform: translateY(-6px);} }
        @keyframes pulseGlow { 0%,100% { opacity: .55; } 50% { opacity: 1; } }
        @keyframes scanline { 0% { transform: translateY(-100%); } 100% { transform: translateY(100%); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px);} to { opacity:1; transform: translateY(0);} }
        @keyframes levelBurst { 0% { opacity: 0; transform: scale(0.7);} 15% { opacity: 1; transform: scale(1.02);} 85% { opacity: 1; } 100% { opacity: 0; transform: scale(1.05);} }
        @keyframes burstRise { 0% { opacity: 0; transform: translate(-50%,-30%) scale(.8);} 15% { opacity: 1; transform: translate(-50%,-55%) scale(1.15);} 100% { opacity: 0; transform: translate(-50%,-140%) scale(1);} }
        @keyframes flicker { 0%,100% { opacity: 1; } 50% { opacity: .55; } }
        @keyframes cardGlow { 0%,100% { box-shadow: 0 0 0px transparent; } 50% { box-shadow: 0 0 22px -6px currentColor; } }
        .fadein { animation: fadeIn .35s ease both; }
        .particle { position: absolute; border-radius: 50%; background: ${C.violet}; opacity: 0.35; filter: blur(1px); }
        .panel { transition: box-shadow .25s ease, transform .2s ease, border-color .25s ease; }
        .panel:hover { box-shadow: 0 0 26px -12px ${C.violet}55; border-color: ${C.panelBorder2}; }
        button { transition: transform .12s ease, filter .12s ease, box-shadow .12s ease, background .15s ease, border-color .15s ease; }
        button:active:not(:disabled) { transform: scale(0.94); }
        button:disabled { cursor: not-allowed; }
      `}</style>

      <BackgroundAtmosphere />

      {!state.onboarded ? (
        <CharacterCreation onCreate={createCharacter} />
      ) : (
        <>
          {levelUpFlash && <LevelUpOverlay level={levelUpFlash} />}
          <ToastStack toasts={toasts} />
          <BurstLayer bursts={bursts} />

          <div style={{ display: "flex", minHeight: "100vh" }}>
            <SideNav view={view} setView={setView} player={state.player} />
            <main style={{ flex: 1, padding: "28px 28px 100px", maxWidth: 1180, margin: "0 auto", width: "100%" }}>
              <TopBar player={state.player} setMobileMenuOpen={setMobileMenuOpen} />
              {view === "home" && <HomeView ctx={ctx} />}
              {view === "character" && <CharacterView ctx={ctx} />}
              {view === "quests" && <QuestsView ctx={ctx} />}
              {view === "journal" && <JournalView ctx={ctx} />}
              {view === "analytics" && <AnalyticsView ctx={ctx} />}
              {view === "achievements" && <AchievementsView ctx={ctx} />}
              {view === "focus" && <FocusView ctx={ctx} />}
              {view === "settings" && <SettingsView ctx={ctx} />}
            </main>
          </div>

          <MobileNav view={view} setView={setView} />
        </>
      )}
    </div>
  );
}

/* ============================== CHARACTER CREATION ============================== */
function CharacterCreation({ onCreate }) {
  const [name, setName] = useState("");
  const [selected, setSelected] = useState(null);
  const canConfirm = name.trim().length > 0 && !!selected;

  return (
    <div className="fadein" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, position: "relative", zIndex: 5 }}>
      <div style={{ maxWidth: 660, width: "100%" }}>
        <div className="display" style={{ textAlign: "center", fontSize: 13, letterSpacing: 4, color: C.cyan, marginBottom: 8 }}>SYSTEM INITIALIZATION</div>
        <div className="display" style={{ textAlign: "center", fontSize: 30, fontWeight: 700, marginBottom: 26 }}>CREATE YOUR CHARACTER</div>

        <Panel style={{ marginBottom: 18 }}>
          <SectionLabel icon={User}>PLAYER NAME</SectionLabel>
          <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your name…" style={selectStyle} />
        </Panel>

        <SectionLabel icon={Sparkles}>CHOOSE YOUR ARCHETYPE</SectionLabel>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 24 }}>
          {ARCHETYPES.map((a) => {
            const Icon = a.icon;
            const active = selected === a.id;
            return (
              <button key={a.id} onClick={() => setSelected(a.id)} style={{
                textAlign: "left", padding: 16, borderRadius: 12,
                background: active ? `${a.color}18` : C.panel,
                border: `1px solid ${active ? a.color : C.panelBorder}`,
                boxShadow: active ? `0 0 26px -8px ${a.color}` : "none",
              }}>
                <Icon size={20} color={a.color} style={{ marginBottom: 8 }} />
                <div className="display" style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{a.name}</div>
                <div style={{ fontSize: 11.5, color: C.textDim, marginBottom: 8 }}>{a.desc}</div>
                <div style={{ fontSize: 10, color: a.color, letterSpacing: 1 }}>
                  {Object.entries(a.bonus).map(([k, v]) => `+${v} ${k}`).join("   ")}
                </div>
              </button>
            );
          })}
        </div>

        <button disabled={!canConfirm} onClick={() => canConfirm && onCreate(name.trim(), selected)} style={{
          width: "100%", padding: 14, borderRadius: 10, border: "none",
          background: canConfirm ? C.violet : C.panelBorder, color: canConfirm ? "#0A0A12" : C.textFaint,
          fontFamily: "Rajdhani", fontWeight: 700, fontSize: 16, letterSpacing: 2,
        }}>BEGIN ASCENSION</button>
      </div>
    </div>
  );
}

/* ============================== FLOATING BURST EFFECTS ============================== */
function BurstLayer({ bursts }) {
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 70 }}>
      {bursts.map((b) => (
        <div key={b.id} style={{
          position: "absolute", left: b.x, top: b.y, transform: "translate(-50%,-50%)",
          color: b.color, fontFamily: "Rajdhani", fontWeight: 700, fontSize: 14,
          textShadow: `0 0 12px ${b.color}`, animation: "burstRise .9s ease-out forwards", whiteSpace: "nowrap",
        }}>{b.label}</div>
      ))}
    </div>
  );
}

/* ============================== ATMOSPHERE ============================== */
function BackgroundAtmosphere() {
  const particles = useMemo(() => Array.from({ length: 22 }).map((_, i) => ({
    id: i, left: Math.random() * 100, top: Math.random() * 100,
    size: 2 + Math.random() * 3, delay: Math.random() * 6, dur: 6 + Math.random() * 8,
  })), []);
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
      {particles.map((p) => (
        <div key={p.id} className="particle" style={{
          left: `${p.left}%`, top: `${p.top}%`, width: p.size, height: p.size,
          animation: `pulseGlow ${p.dur}s ease-in-out ${p.delay}s infinite`,
        }} />
      ))}
    </div>
  );
}

/* ============================== NAV ============================== */
const NAV_ITEMS = [
  { id: "home", label: "System", icon: Home },
  { id: "character", label: "Character", icon: User },
  { id: "quests", label: "Quests", icon: ScrollText },
  { id: "focus", label: "Focus", icon: Timer },
  { id: "journal", label: "Journal", icon: BookOpen },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "achievements", label: "Achievements", icon: Trophy },
  { id: "settings", label: "Settings", icon: Settings },
];

function SideNav({ view, setView }) {
  return (
    <aside style={{
      width: 220, borderRight: `1px solid ${C.panelBorder}`, padding: "26px 14px",
      display: "none",
    }} className="desktop-nav">
      <style>{`@media (min-width: 900px) { .desktop-nav { display: flex !important; flex-direction: column; } }`}</style>
      <div style={{ padding: "0 12px 26px" }}>
        <div className="display" style={{ fontSize: 20, fontWeight: 700, color: C.text }}>ASCEND</div>
        <div style={{ fontSize: 11, color: C.textFaint, marginTop: 2, letterSpacing: 1 }}>YOUR LIFE IS THE GAME</div>
      </div>
      <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = view === item.id;
          return (
            <button key={item.id} onClick={() => setView(item.id)} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
              borderRadius: 8, border: "none", cursor: "pointer", textAlign: "left",
              background: active ? "rgba(139,127,255,0.12)" : "transparent",
              color: active ? C.violet : C.textDim,
              borderLeft: active ? `2px solid ${C.violet}` : "2px solid transparent",
              fontFamily: "Sora", fontSize: 14, fontWeight: active ? 600 : 500,
              transition: "all .15s",
            }}>
              <Icon size={17} strokeWidth={1.8} />
              {item.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

function MobileNav({ view, setView }) {
  const items = NAV_ITEMS.slice(0, 5);
  return (
    <nav style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 30,
      background: "rgba(10,10,18,0.92)", backdropFilter: "blur(10px)",
      borderTop: `1px solid ${C.panelBorder}`, display: "flex", justifyContent: "space-around",
      padding: "8px 4px calc(8px + env(safe-area-inset-bottom))",
    }} className="mobile-nav">
      <style>{`@media (min-width: 900px) { .mobile-nav { display: none !important; } }`}</style>
      {items.map((item) => {
        const Icon = item.icon;
        const active = view === item.id;
        return (
          <button key={item.id} onClick={() => setView(item.id)} style={{
            background: "none", border: "none", display: "flex", flexDirection: "column",
            alignItems: "center", gap: 3, color: active ? C.violet : C.textFaint, padding: 4,
          }}>
            <Icon size={20} strokeWidth={1.8} />
            <span style={{ fontSize: 9.5, fontFamily: "Sora" }}>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

function TopBar({ player }) {
  const need = xpForLevel(player.level);
  const pct = Math.min(100, (player.xp / need) * 100);
  return (
    <div className="fadein" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 26, gap: 16, flexWrap: "wrap" }}>
      <div>
        <div className="display" style={{ fontSize: 13, color: C.textFaint, letterSpacing: 2 }}>WELCOME BACK</div>
        <div className="display" style={{ fontSize: 26, fontWeight: 700 }}>{player.name} <span style={{ color: C.violet }}>· LV {player.level}</span></div>
      </div>
      <div style={{ minWidth: 220, flex: 1, maxWidth: 340 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.textFaint, marginBottom: 4 }}>
          <span>RANK {player.rank}</span>
          <span>{player.xp} / {need} XP</span>
        </div>
        <XPBar pct={pct} />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, color: C.cyan }}>
          <Gem size={17} />
          <span className="display" style={{ fontWeight: 700, fontSize: 16 }}>{player.gems ?? 0}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, color: C.amber }}>
          <span style={{ display: "flex", animation: player.streak > 0 ? "flicker 1.8s ease-in-out infinite" : "none" }}>
            <Flame size={18} fill={player.streak > 0 ? C.amber : "none"} />
          </span>
          <span className="display" style={{ fontWeight: 700, fontSize: 16 }}>{player.streak}</span>
          {player.streakFreezes > 0 && (
            <span title={`${player.streakFreezes} Streak Freeze(s) banked`} style={{ fontSize: 11, color: C.textFaint }}>❄×{player.streakFreezes}</span>
          )}
        </div>
      </div>
    </div>
  );
}

function XPBar({ pct, color = C.violet }) {
  return (
    <div style={{ height: 8, borderRadius: 5, background: "rgba(255,255,255,0.06)", border: `1px solid ${C.panelBorder}`, overflow: "hidden", position: "relative" }}>
      <div style={{
        height: "100%", width: `${pct}%`, borderRadius: 5,
        background: `linear-gradient(90deg, ${color}88, ${color})`,
        boxShadow: `0 0 12px ${color}77`, transition: "width .6s cubic-bezier(.2,.9,.3,1)",
      }} />
    </div>
  );
}

/* ============================== PANEL PRIMITIVE ============================== */
function Panel({ children, style, glow }) {
  return (
    <div className="panel" style={{
      background: C.panel, border: `1px solid ${C.panelBorder}`, borderRadius: 12,
      padding: 20, position: "relative", overflow: "hidden",
      boxShadow: glow ? `0 0 30px -10px ${glow}` : "none",
      ...style,
    }}>
      {children}
    </div>
  );
}
function SectionLabel({ children, icon: Icon }) {
  return (
    <div className="display" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, letterSpacing: 2, color: C.textFaint, marginBottom: 14 }}>
      {Icon && <Icon size={14} />} {children}
    </div>
  );
}

/* ============================== TOASTS / LEVEL UP ============================== */
function ToastStack({ toasts }) {
  return (
    <div style={{ position: "fixed", top: 18, right: 18, zIndex: 60, display: "flex", flexDirection: "column", gap: 8, maxWidth: 300 }}>
      {toasts.map((t) => (
        <div key={t.id} style={{
          animation: "floatUp 3.6s ease both", background: "rgba(15,16,24,0.95)",
          border: `1px solid ${t.kind === "achievement" ? C.amber : C.violet}55`,
          borderLeft: `3px solid ${t.kind === "achievement" ? C.amber : C.violet}`,
          padding: "10px 14px", borderRadius: 8, fontSize: 12.5,
          boxShadow: `0 0 20px -6px ${t.kind === "achievement" ? C.amber : C.violet}66`,
        }}>
          <div className="display" style={{ fontSize: 10, letterSpacing: 1.5, color: C.textFaint, marginBottom: 2 }}>
            [ {t.kind === "achievement" ? "SYSTEM" : "SYSTEM"} ]
          </div>
          {t.text}
        </div>
      ))}
    </div>
  );
}

function LevelUpOverlay({ level }) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 80, display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(4,4,10,0.55)", backdropFilter: "blur(3px)", animation: "levelBurst 2.6s ease both",
      pointerEvents: "none",
    }}>
      <div style={{ textAlign: "center" }}>
        <div className="display" style={{ fontSize: 14, letterSpacing: 6, color: C.cyan }}>LEVEL UP</div>
        <div className="display" style={{ fontSize: 64, fontWeight: 700, color: C.text, textShadow: `0 0 40px ${C.violet}` }}>{level}</div>
      </div>
    </div>
  );
}

/* ============================== HOME VIEW ============================== */
function HomeView({ ctx }) {
  const { state, completeQuest, setView } = ctx;
  const daily = state.quests.filter((q) => q.type === "daily");
  const active = state.quests.filter((q) => q.status === "active" && q.type !== "daily");
  const completedToday = state.quests.filter((q) => q.status === "completed" && q.completedAt === todayStr()).length;
  const combo = state.dailyCombo && state.dailyCombo.date === todayStr() ? state.dailyCombo.count : 0;
  const comboPct = Math.min(40, Math.max(0, (combo - 1) * 4));

  return (
    <div className="fadein">
      <BossPanel boss={state.boss} />
      <Panel glow={C.violet + "33"} style={{ marginBottom: 20, padding: 26 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
          <div>
            <div className="display" style={{ fontSize: 12, color: C.cyan, letterSpacing: 3, marginBottom: 6 }}>SYSTEM INITIALIZED</div>
            <div className="display" style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>
              "{state.player.title}" — {state.player.name}
            </div>
            <div style={{ color: C.textDim, fontSize: 13 }}>
              {completedToday} quests completed today · Rank {state.player.rank} · Class {state.player.class}
            </div>
          </div>
          {combo >= 2 && (
            <div style={{
              display: "flex", alignItems: "center", gap: 6, background: `${C.amber}18`,
              border: `1px solid ${C.amber}55`, borderRadius: 20, padding: "6px 12px",
              animation: "flicker 1.6s ease-in-out infinite",
            }}>
              <Flame size={14} color={C.amber} />
              <span className="display" style={{ fontSize: 12, fontWeight: 700, color: C.amber }}>
                COMBO ×{combo} · +{comboPct}% XP
              </span>
            </div>
          )}
        </div>
      </Panel>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 14, marginBottom: 20 }}>
        <StatTile label="Focus Sessions" value={state.stats.focusSessions} icon={Timer} color={C.violet} />
        <StatTile label="Quests Completed" value={state.stats.questsCompleted} icon={ScrollText} color={C.cyan} />
        <StatTile label="Longest Streak" value={`${state.player.longestStreak}d`} icon={Flame} color={C.amber} />
        <StatTile label="Total XP" value={state.player.totalXp} icon={Sparkles} color={C.rose} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 16 }}>
        <Panel>
          <SectionLabel icon={Star}>DAILY MISSION</SectionLabel>
          {daily.length === 0 && <EmptyHint text="No daily missions set. Add one in Quests." />}
          {daily.map((q) => <QuestRow key={q.id} q={q} onComplete={completeQuest} />)}
          <div style={{ height: 18 }} />
          <SectionLabel icon={ScrollText}>ACTIVE QUESTS</SectionLabel>
          {active.length === 0 && <EmptyHint text="No active quests. The board is clear." />}
          {active.slice(0, 5).map((q) => <QuestRow key={q.id} q={q} onComplete={completeQuest} />)}
          <button onClick={() => setView("quests")} style={ghostBtn}>
            View all quests <ChevronRight size={14} />
          </button>
        </Panel>

        <Panel>
          <SectionLabel icon={Brain}>ATTRIBUTES</SectionLabel>
          <AttributeRadar attributes={state.player.attributes} />
        </Panel>
      </div>
    </div>
  );
}

function StatTile({ label, value, icon: Icon, color }) {
  return (
    <Panel style={{ padding: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, color, marginBottom: 8 }}>
        <Icon size={16} />
        <span className="display" style={{ fontSize: 10, letterSpacing: 1.5, color: C.textFaint }}>{label.toUpperCase()}</span>
      </div>
      <div className="display" style={{ fontSize: 24, fontWeight: 700 }}>{value}</div>
    </Panel>
  );
}

function EmptyHint({ text }) {
  return <div style={{ color: C.textFaint, fontSize: 12.5, fontStyle: "italic", padding: "8px 0" }}>{text}</div>;
}

function BossPanel({ boss }) {
  if (!boss) return null;
  const pct = Math.max(0, Math.min(100, (boss.hp / boss.maxHp) * 100));
  return (
    <Panel glow={boss.color + "33"} style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <SectionLabel icon={Skull}>WEEKLY BOSS</SectionLabel>
        <span style={{ fontSize: 10, color: C.textFaint }}>{boss.weekKey}</span>
      </div>
      <div className="display" style={{ fontSize: 20, fontWeight: 700, color: boss.color, marginBottom: 4 }}>
        {boss.defeated ? `${boss.name} — DEFEATED` : boss.name}
      </div>
      <div style={{ fontSize: 12, color: C.textDim, marginBottom: 12, fontStyle: "italic" }}>{boss.flavor}</div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.textFaint, marginBottom: 4 }}>
        <span>HP</span><span>{boss.hp} / {boss.maxHp}</span>
      </div>
      <XPBar pct={pct} color={boss.defeated ? C.cyan : boss.color} />
      {boss.defeated ? (
        <div style={{ marginTop: 10, fontSize: 11, color: C.cyan }}>A new challenger appears next week.</div>
      ) : (
        <div style={{ marginTop: 10, fontSize: 11, color: C.textFaint }}>Every completed quest and focus session damages this boss.</div>
      )}
    </Panel>
  );
}

function QuestRow({ q, onComplete, onDelete }) {
  const attr = CATEGORY_ATTR[q.category] || "DISC";
  const meta = ATTR_META[attr];
  const done = q.status === "completed";
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10, padding: "10px 10px", borderRadius: 8,
      background: done ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.03)",
      border: `1px solid ${C.panelBorder}`, marginBottom: 8, opacity: done ? 0.5 : 1,
    }}>
      <button onClick={(e) => !done && onComplete(q.id, e)} disabled={done} style={{
        width: 22, height: 22, borderRadius: 6, border: `1px solid ${done ? C.cyan : C.panelBorder2}`,
        background: done ? C.cyan + "22" : "transparent", display: "flex", alignItems: "center", justifyContent: "center",
        cursor: done ? "default" : "pointer", flexShrink: 0,
      }}>
        {done && <Check size={13} color={C.cyan} />}
      </button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, textDecoration: done ? "line-through" : "none" }}>{q.title}</div>
        <div style={{ fontSize: 10.5, color: C.textFaint, display: "flex", gap: 6, marginTop: 2 }}>
          <span style={{ color: meta.color }}>{meta.label}</span>·<span>{DIFFICULTY[q.difficulty].label}</span>·<span>+{DIFFICULTY[q.difficulty].xp} XP</span>
        </div>
      </div>
      {onDelete && (
        <button onClick={() => onDelete(q.id)} style={{ background: "none", border: "none", color: C.textFaint, cursor: "pointer" }}>
          <Trash2 size={14} />
        </button>
      )}
    </div>
  );
}

const ghostBtn = {
  display: "flex", alignItems: "center", gap: 4, background: "none", border: "none",
  color: C.violet, fontSize: 12.5, cursor: "pointer", marginTop: 6, padding: "4px 2px", fontFamily: "Sora",
};

/* ============================== ATTRIBUTE RADAR ============================== */
function AttributeRadar({ attributes }) {
  const data = Object.entries(attributes).map(([k, v]) => ({ attr: k, value: v, full: Math.max(20, v + 5) }));
  return (
    <div style={{ width: "100%", height: 240 }}>
      <ResponsiveContainer>
        <RadarChart data={data} outerRadius="75%">
          <PolarGrid stroke={C.panelBorder2} />
          <PolarAngleAxis dataKey="attr" tick={{ fill: C.textDim, fontSize: 11, fontFamily: "Rajdhani" }} />
          <Radar dataKey="value" stroke={C.violet} fill={C.violet} fillOpacity={0.35} />
        </RadarChart>
      </ResponsiveContainer>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginTop: 8 }}>
        {Object.entries(attributes).map(([k, v]) => {
          const meta = ATTR_META[k];
          return (
            <div key={k} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11 }}>
              <span style={{ width: 7, height: 7, borderRadius: 4, background: meta.color, display: "inline-block" }} />
              <span style={{ color: C.textDim }}>{k}</span>
              <span className="display" style={{ marginLeft: "auto", fontWeight: 700 }}>{v}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ============================== CHARACTER VIEW ============================== */
function CharacterView({ ctx }) {
  const { state, updatePlayer } = ctx;
  const p = state.player;
  const initials = p.name.slice(0, 2).toUpperCase();
  const unlockedCount = Object.keys(state.achievementsUnlocked).length;

  return (
    <div className="fadein" style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 16 }} >
      <style>{`@media (max-width: 800px) { .char-grid { grid-template-columns: 1fr !important; } }`}</style>
      <Panel style={{ textAlign: "center" }}>
        <div style={{
          width: 108, height: 108, borderRadius: "50%", margin: "0 auto 14px",
          background: `radial-gradient(circle at 40% 30%, ${C.violet}55, ${C.panel})`,
          border: `1px solid ${C.violetDim}`, display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: `0 0 40px -6px ${C.violet}66`,
        }}>
          <span className="display" style={{ fontSize: 34, fontWeight: 700 }}>{initials}</span>
        </div>
        <div className="display" style={{ fontSize: 20, fontWeight: 700 }}>{p.name}</div>
        <div style={{ color: C.violet, fontSize: 13, marginBottom: 10 }}>"{p.title}"</div>
        <div style={{ display: "flex", justifyContent: "center", gap: 18, fontSize: 12, color: C.textDim, marginBottom: 16 }}>
          <div><div className="display" style={{ fontSize: 18, color: C.text, fontWeight: 700 }}>{p.level}</div>LEVEL</div>
          <div><div className="display" style={{ fontSize: 18, color: C.text, fontWeight: 700 }}>{p.rank}</div>RANK</div>
          <div><div className="display" style={{ fontSize: 18, color: C.text, fontWeight: 700 }}>{unlockedCount}</div>BADGES</div>
        </div>
        <select value={p.title} onChange={(e) => updatePlayer({ title: e.target.value })} style={selectStyle}>
          {TITLES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <div style={{ height: 10 }} />
        <select value={p.class} onChange={(e) => updatePlayer({ class: e.target.value })} style={selectStyle}>
          {["Unclassed", "Scholar", "Warrior", "Builder", "Strategist", "Explorer"].map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </Panel>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Panel>
          <SectionLabel icon={Brain}>ATTRIBUTES</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {Object.entries(p.attributes).map(([k, v]) => {
              const meta = ATTR_META[k];
              const Icon = meta.icon;
              const pct = Math.min(100, (v / 30) * 100);
              return (
                <div key={k}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4, color: C.textDim }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Icon size={13} color={meta.color} /> {meta.label}</span>
                    <span className="display" style={{ color: C.text, fontWeight: 700 }}>{v}</span>
                  </div>
                  <XPBar pct={pct} color={meta.color} />
                </div>
              );
            })}
          </div>
        </Panel>

        <Panel>
          <SectionLabel icon={ScrollText}>DOMAIN RANKS</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px,1fr))", gap: 10 }}>
            {Object.entries(p.attributes).map(([k, v]) => {
              const idx = Math.min(RANKS.length - 1, Math.floor(v / 4));
              return (
                <div key={k} style={{ border: `1px solid ${C.panelBorder}`, borderRadius: 8, padding: 10, textAlign: "center" }}>
                  <div style={{ fontSize: 10, color: C.textFaint }}>{ATTR_META[k].label.toUpperCase()}</div>
                  <div className="display" style={{ fontSize: 18, fontWeight: 700, color: ATTR_META[k].color }}>{RANKS[idx]}</div>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>
    </div>
  );
}

const selectStyle = {
  width: "100%", background: "rgba(255,255,255,0.04)", border: `1px solid ${C.panelBorder2}`,
  color: C.text, padding: "8px 10px", borderRadius: 8, fontSize: 13, fontFamily: "Sora",
};

/* ============================== QUESTS VIEW ============================== */
function QuestsView({ ctx }) {
  const { state, completeQuest, addQuest, deleteQuest, pushToast } = ctx;
  const [showForm, setShowForm] = useState(false);
  const [showPresets, setShowPresets] = useState(state.quests.length <= 2);
  const [addedPacks, setAddedPacks] = useState({});
  const [form, setForm] = useState({ title: "", category: "Study", type: "side", difficulty: "medium" });
  const [filter, setFilter] = useState("all");

  const filtered = state.quests.filter((q) => filter === "all" ? true : q.type === filter);
  const active = filtered.filter((q) => q.status === "active");
  const completed = filtered.filter((q) => q.status === "completed");

  const submit = () => {
    if (!form.title.trim()) return;
    addQuest(form);
    setForm({ title: "", category: "Study", type: "side", difficulty: "medium" });
    setShowForm(false);
  };

  const addPack = (pack) => {
    const existingTitles = new Set(state.quests.map((q) => q.title));
    let added = 0;
    pack.quests.forEach((q) => {
      if (!existingTitles.has(q.title)) {
        addQuest(q);
        added += 1;
      }
    });
    setAddedPacks((p) => ({ ...p, [pack.id]: true }));
    pushToast(added > 0 ? `${pack.name} pack added — ${added} quests` : `${pack.name} already active`, "system");
  };

  return (
    <div className="fadein">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {["all", "main", "side", "daily"].map((f) => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: "6px 14px", borderRadius: 20, fontSize: 12, cursor: "pointer",
              border: `1px solid ${filter === f ? C.violet : C.panelBorder2}`,
              background: filter === f ? "rgba(139,127,255,0.15)" : "transparent",
              color: filter === f ? C.violet : C.textDim, fontFamily: "Sora",
            }}>{f.toUpperCase()}</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setShowPresets((s) => !s)} style={{
            display: "flex", alignItems: "center", gap: 6, background: "none",
            border: `1px solid ${showPresets ? C.cyan : C.panelBorder2}`,
            color: showPresets ? C.cyan : C.textDim, padding: "8px 16px", borderRadius: 8, cursor: "pointer",
            fontFamily: "Sora", fontSize: 13,
          }}>
            <Sparkles size={15} /> Presets
          </button>
          <button onClick={() => setShowForm((s) => !s)} style={{
            display: "flex", alignItems: "center", gap: 6, background: C.violet, border: "none",
            color: "#0A0A12", padding: "8px 16px", borderRadius: 8, fontWeight: 600, cursor: "pointer",
            fontFamily: "Sora", fontSize: 13,
          }}>
            <Plus size={15} /> New Quest
          </button>
        </div>
      </div>

      {showPresets && (
        <Panel style={{ marginBottom: 16 }}>
          <SectionLabel icon={Sparkles}>PRESET PACKS — CONTINUOUS GROWTH LOOPS</SectionLabel>
          <div style={{ fontSize: 12, color: C.textFaint, marginBottom: 14, maxWidth: 620 }}>
            Each pack pairs one easy recurring daily with a light side quest and a bigger main quest,
            so a realm gets a sustainable loop from day one instead of a wall of empty choices.
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px,1fr))", gap: 12 }}>
            {PRESETS.map((pack) => {
              const Icon = pack.icon;
              const done = !!addedPacks[pack.id];
              return (
                <div key={pack.id} style={{
                  border: `1px solid ${C.panelBorder}`, borderRadius: 10, padding: 14,
                  background: "rgba(255,255,255,0.02)",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <Icon size={16} color={pack.color} />
                    <div className="display" style={{ fontWeight: 700, fontSize: 14 }}>{pack.name}</div>
                  </div>
                  <div style={{ fontSize: 10.5, color: pack.color, marginBottom: 6, letterSpacing: 1 }}>{pack.domain.toUpperCase()} · {pack.quests.length} QUESTS</div>
                  <div style={{ fontSize: 11.5, color: C.textDim, marginBottom: 10, minHeight: 32 }}>{pack.blurb}</div>
                  <button onClick={() => addPack(pack)} style={{
                    width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    background: done ? "rgba(255,255,255,0.04)" : `${pack.color}22`,
                    border: `1px solid ${done ? C.panelBorder2 : pack.color}66`,
                    color: done ? C.textDim : pack.color, padding: "7px 10px", borderRadius: 8,
                    cursor: "pointer", fontFamily: "Sora", fontSize: 12, fontWeight: 600,
                  }}>
                    {done ? <><Check size={13} /> Added</> : <><Plus size={13} /> Add Pack</>}
                  </button>
                </div>
              );
            })}
          </div>
        </Panel>
      )}

      {showForm && (
        <Panel style={{ marginBottom: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr auto", gap: 10, alignItems: "center" }}>
            <input placeholder="Quest title…" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} style={selectStyle} />
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} style={selectStyle}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} style={selectStyle}>
              {["main", "side", "daily"].map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })} style={selectStyle}>
              {Object.entries(DIFFICULTY).map(([k, v]) => <option key={k} value={k}>{v.label} (+{v.xp})</option>)}
            </select>
            <button onClick={submit} style={{ background: C.cyan, border: "none", color: "#08131a", padding: "9px 14px", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>Add</button>
          </div>
        </Panel>
      )}

      <Panel style={{ marginBottom: 16 }}>
        <SectionLabel icon={ScrollText}>ACTIVE ({active.length})</SectionLabel>
        {active.length === 0 && <EmptyHint text="Nothing active in this filter." />}
        {active.map((q) => <QuestRow key={q.id} q={q} onComplete={completeQuest} onDelete={deleteQuest} />)}
      </Panel>

      <Panel>
        <SectionLabel icon={Check}>COMPLETED ({completed.length})</SectionLabel>
        {completed.length === 0 && <EmptyHint text="No completed quests yet." />}
        {completed.slice().reverse().slice(0, 20).map((q) => <QuestRow key={q.id} q={q} onComplete={completeQuest} onDelete={deleteQuest} />)}
      </Panel>
    </div>
  );
}

/* ============================== FOCUS VIEW ============================== */
function FocusView({ ctx }) {
  const { completeFocusSession, pushToast } = ctx;
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [label, setLabel] = useState("Deep Work");
  const intervalRef = useRef(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  const complete = (e) => {
    const minutes = Math.max(1, Math.round(seconds / 60));
    completeFocusSession(minutes, e);
    setRunning(false);
    setSeconds(0);
  };
  const abandon = () => {
    setRunning(false);
    setSeconds(0);
    pushToast("Focus session abandoned.", "system");
  };

  return (
    <div className="fadein" style={{ display: "flex", justifyContent: "center", paddingTop: 30 }}>
      <Panel glow={C.violet + "44"} style={{ width: "100%", maxWidth: 420, textAlign: "center", padding: 34 }}>
        <div className="display" style={{ fontSize: 12, letterSpacing: 3, color: C.cyan, marginBottom: 10 }}>
          {running ? "QUEST ACTIVE" : "FOCUS MODE"}
        </div>
        <input value={label} onChange={(e) => setLabel(e.target.value)} disabled={running} style={{
          ...selectStyle, textAlign: "center", background: "transparent", border: "none",
          fontFamily: "Rajdhani", fontSize: 18, marginBottom: 20, fontWeight: 600,
        }} />
        <div className="display" style={{ fontSize: 64, fontWeight: 700, letterSpacing: 2, textShadow: running ? `0 0 30px ${C.violet}88` : "none", marginBottom: 26 }}>
          {mm}:{ss}
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          {!running ? (
            <FocusBtn onClick={() => setRunning(true)} icon={Play} label="Start" color={C.violet} />
          ) : (
            <FocusBtn onClick={() => setRunning(false)} icon={Pause} label="Pause" color={C.amber} />
          )}
          <FocusBtn onClick={complete} icon={Check} label="Complete" color={C.cyan} disabled={seconds < 30} />
          <FocusBtn onClick={abandon} icon={Square} label="Abandon" color={C.rose} disabled={seconds === 0} />
        </div>
        <div style={{ fontSize: 11, color: C.textFaint, marginTop: 18 }}>+DISC · XP scales with focused minutes</div>
      </Panel>
    </div>
  );
}
function FocusBtn({ onClick, icon: Icon, label, color, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      display: "flex", flexDirection: "column", alignItems: "center", gap: 4, background: "none",
      border: `1px solid ${disabled ? C.panelBorder : color}`, color: disabled ? C.textFaint : color,
      borderRadius: 10, padding: "10px 16px", cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.4 : 1,
      fontFamily: "Sora", fontSize: 11,
    }}>
      <Icon size={17} /> {label}
    </button>
  );
}

/* ============================== JOURNAL VIEW ============================== */
const MOODS = ["🔥", "🙂", "😐", "😔", "⚡"];
function JournalView({ ctx }) {
  const { state, addJournalEntry } = ctx;
  const [text, setText] = useState("");
  const [mood, setMood] = useState("🙂");

  const submit = () => {
    if (!text.trim()) return;
    addJournalEntry({ text, mood });
    setText("");
  };

  return (
    <div className="fadein">
      <Panel style={{ marginBottom: 16 }}>
        <SectionLabel icon={BookOpen}>NEW ENTRY</SectionLabel>
        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          {MOODS.map((m) => (
            <button key={m} onClick={() => setMood(m)} style={{
              fontSize: 18, background: mood === m ? "rgba(139,127,255,0.18)" : "transparent",
              border: `1px solid ${mood === m ? C.violet : C.panelBorder}`, borderRadius: 8, padding: "4px 10px", cursor: "pointer",
            }}>{m}</button>
          ))}
        </div>
        <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Reflect on today — wins, lessons, next moves…" rows={4}
          style={{ ...selectStyle, resize: "vertical", fontFamily: "Sora" }} />
        <button onClick={submit} style={{ marginTop: 10, background: C.violet, border: "none", color: "#0A0A12", padding: "8px 18px", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>
          Save Entry
        </button>
      </Panel>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {state.journal.length === 0 && <EmptyHint text="Your journal is empty. Write your first entry above." />}
        {state.journal.map((e) => (
          <Panel key={e.id} style={{ padding: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.textFaint, marginBottom: 6 }}>
              <span>{e.mood} {new Date(e.date).toLocaleString()}</span>
            </div>
            <div style={{ fontSize: 13.5, whiteSpace: "pre-wrap" }}>{e.text}</div>
          </Panel>
        ))}
      </div>
    </div>
  );
}

/* ============================== ANALYTICS VIEW ============================== */
function AnalyticsView({ ctx }) {
  const { state } = ctx;
  const data = state.xpLog.length ? state.xpLog : [{ date: todayStr(), xp: state.player.totalXp }];
  return (
    <div className="fadein">
      <Panel style={{ marginBottom: 16 }}>
        <SectionLabel icon={BarChart3}>XP PROGRESSION</SectionLabel>
        <div style={{ width: "100%", height: 260 }}>
          <ResponsiveContainer>
            <LineChart data={data}>
              <CartesianGrid stroke={C.panelBorder} strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fill: C.textFaint, fontSize: 10 }} />
              <YAxis tick={{ fill: C.textFaint, fontSize: 10 }} />
              <Tooltip contentStyle={{ background: C.panel, border: `1px solid ${C.panelBorder}`, fontSize: 12 }} />
              <Line type="monotone" dataKey="xp" stroke={C.violet} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Panel>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px,1fr))", gap: 14 }}>
        <StatTile label="Total XP" value={state.player.totalXp} icon={Sparkles} color={C.violet} />
        <StatTile label="Quests Completed" value={state.stats.questsCompleted} icon={ScrollText} color={C.cyan} />
        <StatTile label="Focus Minutes" value={state.stats.focusMinutes} icon={Timer} color={C.amber} />
        <StatTile label="Journal Entries" value={state.journal.length} icon={BookOpen} color={C.rose} />
      </div>
    </div>
  );
}

/* ============================== ACHIEVEMENTS VIEW ============================== */
const RARITY_COLOR = { Common: "#9A9CB8", Uncommon: "#7FDD8E", Rare: "#5FE3E0", Epic: "#8B7FFF", Legendary: "#F2B65C", Mythic: "#E8607A" };
function AchievementsView({ ctx }) {
  const { state } = ctx;
  return (
    <div className="fadein" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px,1fr))", gap: 14 }}>
      {ACHIEVEMENTS.map((a) => {
        const unlocked = !!state.achievementsUnlocked[a.id];
        const color = RARITY_COLOR[a.rarity];
        return (
          <Panel key={a.id} style={{ opacity: unlocked ? 1 : 0.45, borderColor: unlocked ? color + "66" : C.panelBorder }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <Trophy size={18} color={unlocked ? color : C.textFaint} />
              <div className="display" style={{ fontSize: 14, fontWeight: 700 }}>{a.name}</div>
            </div>
            <div style={{ fontSize: 12, color: C.textDim, marginBottom: 8 }}>{a.desc}</div>
            <div style={{ fontSize: 10, letterSpacing: 1, color }}>{a.rarity.toUpperCase()} {unlocked ? "· UNLOCKED" : "· LOCKED"}</div>
          </Panel>
        );
      })}
    </div>
  );
}

/* ============================== SETTINGS VIEW ============================== */
function SettingsView({ ctx }) {
  const { state, updatePlayer, toggleStreaks, toggleSound, resetAll, buyStreakFreeze, STREAK_FREEZE_COST, STREAK_FREEZE_CAP } = ctx;
  const [confirmReset, setConfirmReset] = useState(false);
  const owned = state.player.streakFreezes || 0;
  const canBuy = owned < STREAK_FREEZE_CAP && (state.player.gems || 0) >= STREAK_FREEZE_COST;
  return (
    <div className="fadein" style={{ maxWidth: 480 }}>
      <Panel style={{ marginBottom: 16 }}>
        <SectionLabel icon={User}>PLAYER NAME</SectionLabel>
        <input value={state.player.name} onChange={(e) => updatePlayer({ name: e.target.value })} style={selectStyle} />
      </Panel>
      <Panel style={{ marginBottom: 16 }}>
        <SectionLabel icon={Gem}>GEM SHOP</SectionLabel>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 600 }}>Streak Freeze</div>
            <div style={{ fontSize: 11.5, color: C.textDim }}>Auto-protects your streak if you miss a day. Owned: {owned}/{STREAK_FREEZE_CAP}</div>
          </div>
          <button onClick={buyStreakFreeze} disabled={!canBuy} style={{
            display: "flex", alignItems: "center", gap: 6, flexShrink: 0,
            background: canBuy ? `${C.cyan}22` : "transparent",
            border: `1px solid ${canBuy ? C.cyan : C.panelBorder2}`,
            color: canBuy ? C.cyan : C.textFaint, padding: "8px 14px", borderRadius: 8, fontWeight: 600, fontSize: 12.5,
          }}>
            <Gem size={13} /> {STREAK_FREEZE_COST}
          </button>
        </div>
      </Panel>
      <Panel style={{ marginBottom: 16 }}>
        <SectionLabel icon={Flame}>STREAK MECHANICS</SectionLabel>
        <button onClick={toggleStreaks} style={{
          display: "flex", alignItems: "center", gap: 8, background: "none",
          border: `1px solid ${C.panelBorder2}`, color: C.text, padding: "8px 14px", borderRadius: 8, cursor: "pointer",
        }}>
          {state.settings.streaksEnabled ? "Enabled — click to disable" : "Disabled — click to enable"}
        </button>
      </Panel>
      <Panel style={{ marginBottom: 16 }}>
        <SectionLabel icon={state.settings.soundEnabled ? Volume2 : VolumeX}>SOUND EFFECTS</SectionLabel>
        <button onClick={toggleSound} style={{
          display: "flex", alignItems: "center", gap: 8, background: "none",
          border: `1px solid ${C.panelBorder2}`, color: C.text, padding: "8px 14px", borderRadius: 8, cursor: "pointer",
        }}>
          {state.settings.soundEnabled ? "Enabled — click to mute" : "Muted — click to enable"}
        </button>
      </Panel>
      <Panel>
        <SectionLabel icon={Trash2}>DANGER ZONE</SectionLabel>
        {!confirmReset ? (
          <button onClick={() => setConfirmReset(true)} style={{ background: "none", border: `1px solid ${C.rose}`, color: C.rose, padding: "8px 14px", borderRadius: 8, cursor: "pointer" }}>
            Reset all progress
          </button>
        ) : (
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => { resetAll(); setConfirmReset(false); }} style={{ background: C.rose, border: "none", color: "#1a0508", padding: "8px 14px", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>
              Confirm reset
            </button>
            <button onClick={() => setConfirmReset(false)} style={{ background: "none", border: `1px solid ${C.panelBorder2}`, color: C.textDim, padding: "8px 14px", borderRadius: 8, cursor: "pointer" }}>
              Cancel
            </button>
          </div>
        )}
      </Panel>
    </div>
  );
}
