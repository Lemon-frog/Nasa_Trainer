/* ============================================================
   MARS OUTPOST – game logic
   Edit the CONFIG section to change balance, events and text.
   ============================================================ */

/* ---------- CONFIG: tweak the game here ---------- */
const CONFIG = {
  totalSols: 20, // how long the mission lasts
  normalPower: 8, // power units on a normal day
  dustPower: 4, // power units on a dust storm day
  startAir: 8,
  startFood: 8,
  maxStock: 12,
  doseLimit: 10, // reach this and the crew goes home
  stormCount: 4,
  dustCount: 3,
  emergencyCount: 3, // surprise emergencies per mission
  emergencyTime: 12, // seconds the player has to decide
};

// The four things the player powers. "icon" is shown in the UI.
const SYSTEMS = [
  {
    key: "L",
    icon: "",
    name: "Air maker",
    hint: "Makes air 💨",
  },
  {
    key: "G",
    icon: "",
    name: "Garden",
    hint: "Grows food 🍎",
  },
  {
    key: "S",
    icon: "",
    name: "Storm shelter",
    hint: "Blocks rays. Use 3!",
  },
  {
    key: "R",
    icon: "",
    name: "Science lab",
    hint: "Earns stars ⭐",
  },
];

// Real, archived NASA events. Add your own here!
const STORMS = [
  {
    title: "Big solar flare (May 2024)",
    fact: "In May 2024 the Sun shot out huge flares. It was the biggest space storm in about 20 years. NASA writes down storms like this.",
  },
  {
    title: "Halloween solar storms (Oct 2003)",
    fact: "In 2003 the Sun shot out many big flares in a few days. Spacecraft had to protect their gadgets.",
  },
  {
    title: "Giant flare (Aug 1972)",
    fact: "This storm came between two Moon trips. Astronauts on the Moon would have had to hide fast!",
  },
  {
    title: "Fast particle burst",
    fact: "Tiny bits from the Sun can zoom in within hours. There is not much time to get ready.",
  },
];
const DUST = {
  title: "Mars dust storm",
  fact: "In 2018 dust covered all of Mars. NASA’s Opportunity rover got too little sun and ran out of power.",
};
const DELAYS = ["4 minutes", "9 minutes", "14 minutes", "20 minutes"]; // Earth-Mars signal time varies 3–22 min

// Surprise emergencies. Every emergency has a GOOD, an OK and a BAD choice (order is shuffled).
// grade: "good" | "ok" | "bad".  effect can change: air, food, dose (radiation), science,
// and powerNext (power change tomorrow, from damage). "lesson" is the real-world tip shown to the player.
const EMERGENCIES = [
  {
    title: "Air leak!",
    text: "Hiss! A crack is letting air out.",
    choices: [
      {
        grade: "good",
        label: "Find the crack and fix it",
        cost: "Lose 1 star point",
        effect: { science: -1 },
        result: "The leak is sealed fast and almost no air was lost.",
        lesson: "Real crews find the leak first, then patch it.",
      },
      {
        grade: "ok",
        label: "Close the door to that room",
        cost: "Lose 2 air",
        effect: { air: -2 },
        result: "The leak is cut off, but the air in that room is gone.",
        lesson:
          "Sealing a room stops the problem spreading, but does not fix the hole.",
      },
      {
        grade: "bad",
        label: "Make extra air to cover it",
        cost: "Lose 3 air, and 2 less power tomorrow",
        effect: { air: -3, powerNext: -2 },
        result: "Air maker worked too hard and wore out.",
        lesson: "Making more air does not fix a hole. It wastes power.",
      },
    ],
    timeout: {
      grade: "bad",
      label: "",
      effect: { air: -5 },
      result: "Nobody acted, so a lot of air escaped.",
      lesson: "In an emergency, a quick plan beats no plan.",
    },
  },
  {
    title: "Surprise space rays!",
    text: "Beep beep! Fast bits from the Sun are coming!",
    choices: [
      {
        grade: "good",
        label: "Hide in the safe shelter",
        cost: "Lose 1 food (no time to pick it)",
        effect: { food: -1 },
        result: "The crew stayed safe behind thick walls.",
        lesson: "Crews plan a shielded safe room for exactly this.",
      },
      {
        grade: "ok",
        label: "Move to the middle of the base",
        cost: "Gain 1 radiation",
        effect: { dose: 1 },
        result: "Being deeper inside helped a little.",
        lesson: "Walls help, but only a shelter is built to block particles.",
      },
      {
        grade: "bad",
        label: "Finish the experiment first",
        cost: "Win 1 star point, but get 3 radiation",
        effect: { science: 1, dose: 3 },
        result: "The experiment worked, but the crew took a big dose.",
        lesson: "Radiation dose adds up and cannot be undone.",
      },
    ],
    timeout: {
      grade: "bad",
      label: "",
      effect: { dose: 4 },
      result: "The crew froze and took a big dose.",
      lesson: "Warning alarms only help if you act on them.",
    },
  },
  {
    title: "Garden pump broke!",
    text: "The water pump stopped. The plants are getting thirsty.",
    choices: [
      {
        grade: "good",
        label: "Swap in the spare part",
        cost: "Lose 1 star point",
        effect: { science: -1 },
        result: "The pump works again and the plants are fine.",
        lesson: "Missions carry spare parts because help is far away.",
      },
      {
        grade: "ok",
        label: "Water the plants by hand",
        cost: "Lose 1 food and 1 star point",
        effect: { food: -1, science: -1 },
        result: "Some plants made it, but it took all day.",
        lesson: "A workaround works, but fixing the cause is better.",
      },
      {
        grade: "bad",
        label: "Wait for Earth to reply",
        cost: "Lose 3 food",
        effect: { food: -3 },
        result: "Earth’s answer came too late and the plants wilted.",
        lesson: "Messages to Earth take minutes, so crews must decide alone.",
      },
    ],
    timeout: {
      grade: "bad",
      label: "",
      effect: { food: -4 },
      result: "The plants wilted badly.",
      lesson: "Waiting is also a choice, and often a costly one.",
    },
  },
  {
    title: "Dusty solar panels!",
    text: "Dust covers the solar panels and power is dropping.",
    choices: [
      {
        grade: "good",
        label: "Clean them with the robot arm",
        cost: "Lose 1 star point",
        effect: { science: -1 },
        result: "The panels shine again and power is back.",
        lesson: "Robots can do dusty jobs without risking the crew.",
      },
      {
        grade: "ok",
        label: "Wipe them by hand (spacewalk)",
        cost: "Gain 1 radiation",
        effect: { dose: 1 },
        result: "Clean panels, but the crew spent time in the open.",
        lesson: "Spacewalks mean more radiation and more risk.",
      },
      {
        grade: "bad",
        label: "Ignore it",
        cost: "Lose 2 star points, and 2 less power tomorrow",
        effect: { science: -2, powerNext: -2 },
        result: "More dust piled up and power kept falling.",
        lesson: "Dust builds up, so waiting makes it worse.",
      },
    ],
    timeout: {
      grade: "bad",
      label: "",
      effect: { science: -3, powerNext: -2 },
      result: "The dust kept piling up.",
      lesson: "Small problems grow if you wait.",
    },
  },
];

// Daily "question from Earth". Put the right answer in "right"; answers are shuffled when shown.
const QUIZ = [
  {
    q: "How long does a message take to get from Earth to Mars?",
    right: "3 to 22 minutes",
    wrong: ["About 1 second", "About 2 days"],
    why: "It depends on where the planets are.",
  },
  {
    q: "What can send harmful space rays at astronauts?",
    right: "Solar flares",
    wrong: ["Moon dust", "Mars wind"],
    why: "NASA keeps a list of flares and space weather.",
  },
  {
    q: "Why do astronauts hide in a shelter in a solar storm?",
    right: "It blocks radiation",
    wrong: ["It is quieter", "It is warmer"],
    why: "Thick walls stop many fast bits from the Sun.",
  },
  {
    q: "What do we call one day on Mars?",
    right: "A sol",
    wrong: ["A moon", "A rover"],
    why: "A sol is a little longer than a day on Earth.",
  },
  {
    q: "What hid the Sun from the Opportunity rover in 2018?",
    right: "A giant dust storm",
    wrong: ["A volcano", "A comet"],
    why: "With no sun, its panels could not make power.",
  },
  {
    q: "How can a garden help astronauts?",
    right: "It grows food and some air",
    wrong: ["It makes rocket fuel", "It sends radio signals"],
    why: "Plants take in the air we breathe out and make fresh air.",
  },
  {
    q: "Does Mars have thick air that blocks space rays?",
    right: "No, it is very thin",
    wrong: ["Yes, thicker than Earth’s", "Yes, the same as Earth’s"],
    why: "That is why Mars crews need a safe shelter.",
  },
  {
    q: "What does NASA’s DONKI list keep track of?",
    right: "Space weather events",
    wrong: ["Rocket prices", "Rover paint colors"],
    why: "DONKI lists flares and big bursts from the Sun.",
  },
];

/* ---------- ICONS (simple line icons, edit paths freely) ---------- */
const ICON = {
  L: '<path d="M3 8h10a3 3 0 1 0-3-3M3 12h15a3 3 0 1 1-3 3M3 16h7"/>',
  G: '<path d="M12 21v-9M12 12C12 7 8 5 4 5c0 5 3 7 8 7zM12 14c0-4 3-6 8-6 0 5-3 7-8 6z"/>',
  S: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/>',
  R: '<path d="M9 3h6M10 3v6L4.5 19a1.5 1.5 0 0 0 1.3 2h12.4a1.5 1.5 0 0 0 1.3-2L14 9V3M7.5 15h9"/>',
  bolt: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
  dose: '<g fill="currentColor" stroke="none"><circle cx="12" cy="12" r="2"/><path d="M7 3.34A10 10 0 0 1 17 3.34L14.25 8.1A4.5 4.5 0 0 0 9.75 8.1z"/><path transform="rotate(120 12 12)" d="M7 3.34A10 10 0 0 1 17 3.34L14.25 8.1A4.5 4.5 0 0 0 9.75 8.1z"/><path transform="rotate(240 12 12)" d="M7 3.34A10 10 0 0 1 17 3.34L14.25 8.1A4.5 4.5 0 0 0 9.75 8.1z"/></g>',
  food: '<path d="M12 7c-4-3-9 0-7 6 1 4 4 8 7 6 3 2 6-2 7-6 2-6-3-9-7-6zM12 7c0-2 1-4 3-4"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>',
  dust: '<path d="M2 8c3-3 5 3 8 0s5 3 8 0M2 14c3-3 5 3 8 0s5 3 8 0M2 20c3-3 5 3 8 0s5 3 8 0"/>',
  walls: '<path d="M3 5h18v14H3zM3 12h18M9 5v7M15 12v7"/>',
  tanks: '<rect x="6" y="3" width="12" height="18" rx="5"/><path d="M6 9h12"/>',
  drills: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2M9 2h6"/>',
  warning:
    '<rect x="9" y="9" width="6" height="6" rx="1"/><path d="M3 11l4-4 3 3-4 4zM21 13l-4 4-3-3 4-4zM12 9V5"/>',
  battery:
    '<rect x="2" y="7" width="17" height="10" rx="2"/><path d="M22 11v2M7 10v4M11 10v4"/>',
  rover:
    '<circle cx="7" cy="17" r="2.5"/><circle cx="17" cy="17" r="2.5"/><path d="M4 14h16l-2-5h-6l-1-3H8l1 3H6z"/>',
};
ICON.panels = ICON.sun;
ICON.seeds = ICON.G;
const ic = (k) =>
  `<svg class="ic" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[k] || ""}</svg>`;
const AVC = ["#62c3ff", "#35d8a0", "#ffc933", "#ff8fa0"];

/* ---------- STATE ---------- */
let game = null;
const app = document.getElementById("app");

/* ---------- SAVE DATA (stays in the browser between missions) ---------- */
const SAVE_KEY = "marsOutpostSave";
let save = { points: 0, up: {}, items: {} };
try {
  const t = JSON.parse(localStorage.getItem(SAVE_KEY));
  if (t) save = { points: t.points || 0, up: t.up || {}, items: t.items || {} };
} catch (e) {}
const persist = () => {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(save));
  } catch (e) {}
};
const lv = (k) => save.up[k] || 0; // current level of an upgrade
const take = (k) => {
  const n = save.items[k] || 0;
  save.items[k] = 0;
  persist();
  return n;
}; // one-mission items

// Permanent upgrades. costs = price of each level. Add your own and use lv("key") in the rules below.
const UPGRADES = [
  {
    key: "panels",
    icon: "",
    name: "Better solar panels",
    desc: "+1 power every day.",
    costs: [15, 30],
  },
  {
    key: "walls",
    icon: "",
    name: "Thicker shelter walls",
    desc: "Safer in storms",
    costs: [12, 25],
  },
  {
    key: "tanks",
    icon: "",
    name: "Bigger tanks",
    desc: "More air and food",
    costs: [10, 20],
  },
  {
    key: "seeds",
    icon: "",
    name: "Tough seeds",
    desc: "More food",
    costs: [20],
  },
  {
    key: "drills",
    icon: "⏱",
    name: "Practice drills",
    desc: "More time",
    costs: [8, 16],
  },
];
// One-mission items. Used up when the next mission starts.
const ITEMS = [
  {
    key: "warning",
    icon: "",
    name: "Storm-spotter satellite",
    desc: "See storms early",
    cost: 6,
  },
  {
    key: "battery",
    icon: "",
    name: "Battery pack",
    desc: "+3 power, one day",
    cost: 8,
  },
];

function newGame() {
  // Schedule random events, never on day 1 and never back-to-back
  const events = Array(CONFIG.totalSols + 2).fill(null);
  const pick = () => {
    let s;
    do {
      s = 2 + Math.floor(Math.random() * (CONFIG.totalSols - 2));
    } while (events[s] || events[s - 1] || events[s + 1]);
    return s;
  };
  const stormOrder = STORMS.map((_, i) => i).sort(() => Math.random() - 0.5);
  for (let i = 0; i < CONFIG.stormCount; i++)
    events[pick()] = {
      type: "storm",
      data: STORMS[stormOrder[i % STORMS.length]],
    };
  for (let i = 0; i < CONFIG.dustCount; i++)
    events[pick()] = { type: "dust", data: DUST };

  // Schedule surprise emergencies on random days (never day 1)
  const emergencies = {};
  const order = EMERGENCIES.map((_, i) => i).sort(() => Math.random() - 0.5);
  let n = 0;
  while (Object.keys(emergencies).length < CONFIG.emergencyCount) {
    const d = 2 + Math.floor(Math.random() * (CONFIG.totalSols - 1));
    if (!emergencies[d])
      emergencies[d] = EMERGENCIES[order[n++ % EMERGENCIES.length]];
  }

  game = {
    sol: 1,
    air: CONFIG.startAir + 2 * lv("tanks"),
    food: CONFIG.startFood + 2 * lv("tanks"),
    maxStock: CONFIG.maxStock + 2 * lv("tanks"),
    bonus: {},
    quizOrder: QUIZ.map((_, i) => i).sort(() => Math.random() - 0.5),
    quizOpts: {},
    quizRes: {},
    battery: take("battery"),
    warning: take("warning"),
    dose: 0,
    science: 0,
    alloc: { L: 2, G: 1, S: 0, R: 0 },
    events,
    emergencies,
    penalty: {},
    report: "",
    result: null,
  };
  render();
  fresh();
}

/* ---------- RULES ---------- */
const todayEvent = () => game.events[game.sol];
const power = () =>
  Math.max(
    2,
    (todayEvent()?.type === "dust" ? CONFIG.dustPower : CONFIG.normalPower) +
      lv("panels") +
      (game.bonus[game.sol] || 0) -
      (game.penalty[game.sol] || 0),
  );
const used = () => Object.values(game.alloc).reduce((a, b) => a + b, 0);

function change(key, delta) {
  const next = game.alloc[key] + delta;
  if (next < 0 || next > 4) return;
  if (delta > 0 && used() >= power()) return;
  game.alloc[key] = next;
  render();
}

function finishDay(prenotes = []) {
  const a = game.alloc,
    ev = todayEvent(),
    notes = [...prenotes];

  // Air: crew uses 4 a day. Air maker adds 2 per unit, garden adds 1 per unit.
  const airChange = -4 + 2 * a.L + a.G;
  // Food: crew eats 2 a day. Garden grows 2 per unit.
  const foodChange = -2 + (2 + lv("seeds")) * a.G;
  game.air = Math.min(game.maxStock, game.air + airChange);
  game.food = Math.min(game.maxStock, game.food + foodChange);
  if (airChange < 0) notes.push("The air tank went down.");
  if (foodChange < 0) notes.push("The crew ate stored food.");

  // Radiation: a little each day with no shelter. A storm adds a lot unless the shelter is powered.
  let dose = a.S === 0 ? 0.25 : 0;
  if (ev?.type === "storm") {
    const hit = Math.max(0, 5 - lv("walls") - 2 * a.S);
    dose += hit;
    notes.push(
      hit > 0
        ? `Space rays got in! Radiation +${hit}.`
        : "The shelter protected the crew!",
    );
  }
  game.dose += dose;
  game.science += a.R;
  if (a.R) notes.push(`+${a.R} star point${a.R > 1 ? "s" : ""}.`);
  game.report = `<b>Day ${game.sol} report:</b> ${notes.join(" ") || "A calm day."}`;

  // Win or lose?
  if (game.air <= 0) game.result = "air";
  else if (game.food <= 0) game.result = "food";
  else if (game.dose >= CONFIG.doseLimit) game.result = "dose";
  else if (game.sol >= CONFIG.totalSols) game.result = "win";
  else {
    game.sol++;
    // If tomorrow has less power, trim the plan so it still fits
    while (used() > power()) {
      for (const k of ["R", "S", "G", "L"])
        if (used() > power() && game.alloc[k] > 0) game.alloc[k]--;
    }
  }
  if (game.result) award();
  render();
  window.scrollTo(0, 0);
  fresh();
}

/* ---------- EMERGENCY POP-UP WITH COUNTDOWN ---------- */
// Called by the Run button. If an emergency is scheduled today, ask first.
function runSol() {
  const em = game.emergencies[game.sol];
  if (em) showEmergency(em);
  else finishDay();
}

function popup(html) {
  const box = document.createElement("div");
  box.className = "overlay";
  box.setAttribute("role", "alertdialog");
  box.innerHTML = `<div class="alert">${html}</div>`;
  document.body.appendChild(box);
  return box;
}

function showEmergency(em) {
  const total = CONFIG.emergencyTime + 4 * lv("drills");
  let left = total;
  const opts = [...em.choices].sort(() => Math.random() - 0.5); // shuffle so the best one moves around
  const box = popup(`
    <h2>${em.title}</h2><p>${em.text}</p>
    <div class="timer"><i></i></div>
    <p class="count">Hurry! <b>${left}</b> seconds left!</p>
    ${opts.map((c, i) => `<button class="choice" data-i="${i}"><b>${c.label}</b><small>${c.cost}</small></button>`).join("")}
    <p class="fact">Earth is too far to help. You decide!</p>`);

  const bar = box.querySelector(".timer i"),
    num = box.querySelector(".count b");
  const done = (choice, timedOut) => {
    clearInterval(timer);
    box.remove();
    applyEmergency(choice, timedOut);
  };
  const timer = setInterval(() => {
    left--;
    num.textContent = left;
    bar.style.width = (left / total) * 100 + "%";
    if (left <= 0) done(em.timeout, true);
  }, 1000);
  box
    .querySelectorAll(".choice")
    .forEach((b) => (b.onclick = () => done(opts[b.dataset.i], false)));
}

const CHIPS = {
  air: "Air",
  food: "Food",
  dose: "Radiation",
  science: "Stars",
  powerNext: "Power tomorrow",
};
const GRADES = { good: "Great choice!", ok: "Not bad", bad: "Risky choice" };

function applyEmergency(choice, timedOut) {
  const e = choice.effect;
  game.air = Math.max(0, Math.min(game.maxStock, game.air + (e.air || 0)));
  game.food = Math.max(0, Math.min(game.maxStock, game.food + (e.food || 0)));
  game.dose = Math.max(0, game.dose + (e.dose || 0));
  game.science = Math.max(0, game.science + (e.science || 0));
  if (e.powerNext)
    game.penalty[game.sol + 1] =
      (game.penalty[game.sol + 1] || 0) - e.powerNext;

  // Show the consequence, then play the day
  const chips = Object.keys(e)
    .map(
      (k) =>
        `<span class="chip ${(k === "dose" ? e[k] > 0 : e[k] < 0) ? "minus" : "plus"}">${CHIPS[k]} ${e[k] > 0 ? "+" : ""}${e[k]}</span>`,
    )
    .join("");
  const grade = timedOut ? "bad" : choice.grade;
  if (grade === "good") confetti(26);
  const box = popup(`
    <h2 class="g-${grade}">${timedOut ? "⏰ Time ran out!" : GRADES[grade]}</h2>
    <p>${choice.result}</p><div class="chips">${chips}</div>
    <p class="fact">${choice.lesson}</p>
    <button class="go" id="cont">Continue ▶</button>`);
  box.querySelector("#cont").onclick = () => {
    box.remove();
    finishDay([`${timedOut ? "Time ran out! " : ""}${choice.result}`]);
  };
}

/* ---------- MAIN MENU + HOW TO PLAY ---------- */
function showMain() {
  game = null;
  app.className = "";
  app.innerHTML = `
    <div class="hero">
      <svg class="logo" width="96" height="96" viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="#c4553b" stroke="#1e1a3c" stroke-width="4"/><ellipse cx="32" cy="34" rx="30" ry="9" fill="none" stroke="#ffc933" stroke-width="4" transform="rotate(-20 32 34)"/><circle cx="24" cy="26" r="4" fill="#8e3a3a"/><circle cx="38" cy="40" r="3" fill="#8e3a3a"/></svg>
      <h1>Mars Outpost</h1>
      <p class="sub">Can you keep your crew safe for ${CONFIG.totalSols} days?</p>
    </div>
    <button class="go" onclick="startMission()">▶ Play</button>
    <button class="go alt" onclick="showMenu()">Upgrades <span class="pill">${save.points}</span></button>
    <button class="go alt" onclick="showHow()">How to play</button>`;
  window.scrollTo(0, 0);
  fresh();
}

function showHow() {
  app.innerHTML = `
    <h1>How to play</h1>
    <div class="card"><h2>Your job</h2>
      <p>Share <b>power</b> ⚡ with the air maker, garden, shelter and lab. Then press <b>Run Day</b>!</p>
      <p>Not enough for all. Pick well!</p></div>
    <div class="card"><h2>Watch out for</h2>
      <p>🛡️ <b>Space rays</b>: use the shelter!</p>
      <p>🌪️ <b>Dust</b>: less power.</p>
      <p>⏰ <b>Surprises</b>: pick fast!</p></div>
    <div class="card"><h2>After the mission</h2>
      <p>⭐ buy upgrades!</p></div>
    <div class="card"><h2>Real NASA facts</h2>
      <p class="fact">These storms really happened! 🚀</p></div>
    <button class="go" onclick="showMain()">◀ Back</button>`;
  window.scrollTo(0, 0);
  fresh();
}

/* ---------- RESEARCH POINTS + UPGRADE MENU ---------- */
function award() {
  game.earned = game.science + (game.result === "win" ? 10 : 0); // +10 bonus for surviving
  save.points += game.earned;
  persist();
}
function quitMission() {
  if (
    confirm("Leave this mission? Your progress in this mission will be lost.")
  )
    showMain();
}
function useBattery() {
  game.bonus[game.sol] = (game.bonus[game.sol] || 0) + 3;
  game.batteryDay = game.sol;
  game.battery--;
  render();
}
function startMission() {
  newGame();
}
function buyUpgrade(k) {
  const u = UPGRADES.find((x) => x.key === k),
    cost = u.costs[lv(k)];
  if (cost === undefined || save.points < cost) return;
  save.points -= cost;
  save.up[k] = lv(k) + 1;
  persist();
  showMenu();
}
function buyItem(k) {
  const it = ITEMS.find((x) => x.key === k);
  if (save.items[k] || save.points < it.cost) return;
  save.points -= it.cost;
  save.items[k] = 1;
  persist();
  showMenu();
}
function resetSave() {
  if (confirm("Erase all points and upgrades?")) {
    save = { points: 0, up: {}, items: {} };
    persist();
    showMenu();
  }
}

function showMenu() {
  game = null;
  app.className = "";
  const ups = UPGRADES.map((u) => {
    const L = lv(u.key),
      cost = u.costs[L],
      maxed = cost === undefined;
    return `<div class="system"><div class="icon">${ic(u.key)}</div>
      <div class="info"><b>${u.name}</b><small>${u.desc}</small><span class="pips">${"●".repeat(L)}${"○".repeat(u.costs.length - L)}</span></div>
      <button class="buy" onclick="buyUpgrade('${u.key}')" ${maxed || save.points < cost ? "disabled" : ""}>${maxed ? "Maxed" : "" + cost}</button></div>`;
  }).join("");
  const items = ITEMS.map(
    (it) => `<div class="system"><div class="icon">${ic(it.key)}</div>
      <div class="info"><b>${it.name}</b><small>${it.desc}</small></div>
      <button class="buy" onclick="buyItem('${it.key}')" ${save.items[it.key] || save.points < it.cost ? "disabled" : ""}>${save.items[it.key] ? "Packed " : "" + it.cost}</button></div>`,
  ).join("");
  app.innerHTML = `
    <h1>Mars Outpost</h1>
    <p class="sub">Spend ⭐ to get stronger!</p>
    <div class="card"><h2>⭐ ${save.points}</h2>
      </div>
    <div class="card"><h2>Upgrades</h2><p class="fact">Keep forever</p>${ups}</div>
    <div class="card"><h2>Pack for your next trip</h2><p class="fact">One trip only</p>${items}</div>
    <button class="go" onclick="startMission()">Start mission ▶</button>
    <button class="go alt" onclick="showMain()">◀ Main menu</button>
    <p class="fact" style="text-align:center"><a href="#" onclick="resetSave();return false" style="color:inherit">Reset progress</a></p>`;
  window.scrollTo(0, 0);
  fresh();
}

/* ---------- ACTIVITIES: forecast, Earth quiz, rover mini-game ---------- */
function forecastStrip() {
  const look = game.warning ? 4 : 2; // days you can see (the satellite shows more)
  let tiles = "";
  for (let d = game.sol; d < game.sol + 4 && d <= CONFIG.totalSols; d++) {
    const known = d - game.sol < look,
      e = game.events[d];
    const icon = !known
      ? "?"
      : e
        ? ic(e.type === "storm" ? "dose" : "dust")
        : ic("sun");
    const name = !known
      ? "Unknown"
      : e
        ? e.type === "storm"
          ? "Radiation"
          : "Dust storm"
        : "Calm";
    tiles += `<div class="ftile ${known && e ? e.type : ""} ${d === game.sol ? "now" : ""}"><small>${d === game.sol ? "Today" : "Day " + d}</small><span>${icon}</span><small>${name}</small></div>`;
  }
  const nx = game.events[game.sol + 1];
  const advice =
    game.sol >= CONFIG.totalSols
      ? ""
      : nx
        ? nx.type === "storm"
          ? `<div class="advice storm">🛡️ <b>Storm tomorrow!</b> Put 3 power in the shelter.</div>`
          : `<div class="advice dust">🌪️ <b>Dust tomorrow!</b> Only ${CONFIG.dustPower + lv("panels")} power. Fill up air and food!</div>`
        : `<div class="advice calm">☀️ Calm tomorrow. Time for science! 🔬</div>`;
  return `<div class="card"><h2>🔮 Forecast</h2><div class="fgrid">${tiles}</div>${advice}</div>`;
}

function quizCard() {
  const d = game.sol,
    Q = QUIZ[game.quizOrder[(d - 1) % QUIZ.length]],
    res = game.quizRes[d];
  if (res)
    return `<div class="act"><b>🧠 Quiz</b><p class="fact">${res.ok ? "🎉 Yay! +1 ⭐" : "Oops! The answer is: " + Q.right + "."} ${Q.why}</p></div>`;
  if (!game.quizOpts[d])
    game.quizOpts[d] = [Q.right, ...Q.wrong].sort(() => Math.random() - 0.5);
  return `<div class="act"><b>🧠 Quiz time!</b> <small>(+1 ⭐)</small><p>${Q.q}</p>
    ${game.quizOpts[d].map((o, i) => `<button class="opt" onclick="answerQuiz(${i})">${o}</button>`).join("")}</div>`;
}
function answerQuiz(i) {
  const d = game.sol,
    Q = QUIZ[game.quizOrder[(d - 1) % QUIZ.length]];
  const ok = game.quizOpts[d][i] === Q.right;
  game.quizRes[d] = { ok };
  if (ok) {
    game.science++;
    confetti(20);
  }
  render();
}

function roverButton() {
  if (game.roverDay === game.sol)
    return `<div class="act"><b>Rover</b><p class="fact">The rover is charging 🔋</p></div>`;
  return `<button class="item" onclick="startRover()" ${used() >= power() ? "disabled" : ""}>${ic("rover")} Rover rock hunt<br><small>1 power · win up to 4 ⭐</small></button>`;
}
function startRover() {
  if (used() >= power() || game.roverDay === game.sol) return;
  game.roverDay = game.sol;
  game.bonus[game.sol] = (game.bonus[game.sol] || 0) - 1; // the rover uses 1 power
  render();
  let left = 10,
    got = 0;
  const box =
    popup(`<h2>Rover rock hunt</h2><p>Tap the rocks! 🪨</p>
    <p class="count">⏱<b>${left}</b>s · Rocks: <span id="got">0</span></p><div class="arena"></div>`);
  const arena = box.querySelector(".arena"),
    gotEl = box.querySelector("#got"),
    num = box.querySelector(".count b");
  const sp = setInterval(() => {
    const r = document.createElement("button");
    r.className = "rock";
    r.textContent = "🪨";
    r.style.left = Math.random() * 80 + "%";
    r.style.top = Math.random() * 75 + "%";
    r.onclick = () => {
      got++;
      gotEl.textContent = got;
      r.remove();
    };
    arena.appendChild(r);
    setTimeout(() => r.remove(), 1300);
  }, 650);
  const t = setInterval(() => {
    left--;
    num.textContent = left;
    if (left > 0) return;
    clearInterval(t);
    clearInterval(sp);
    const pts = Math.min(4, Math.floor(got / 2));
    game.science += pts;
    if (pts) confetti(24);
    box.querySelector(".alert").innerHTML = `<h2>${got} rocks collected!</h2>
      <p>${pts ? "+" + pts + " star points!" : "No points this time. Try again tomorrow!"}</p>
      <p class="fact">Real rovers like Curiosity and Perseverance pick up rocks to learn about Mars!</p>
      <button class="go" id="ok">Back to base ▶</button>`;
    box.querySelector("#ok").onclick = () => {
      box.remove();
      render();
    };
  }, 1000);
}

/* ---------- SIDE PANELS: news + messages from Earth ---------- */
// Real facts about Mars and NASA missions. Add your own!
const NEWS = [
  "Curiosity rover has explored Gale Crater on Mars since 2012.",
  "Perseverance landed in Jezero Crater in February 2021.",
  "The Ingenuity helicopter made the first powered flights on another planet.",
  "Mars sunsets look blue, the opposite of Earth’s.",
  "Mars gravity is only about 38% of Earth’s gravity.",
  "Mars looks red because its dust contains iron oxide, like rust.",
  "Olympus Mons on Mars is the tallest known volcano in the solar system.",
  "Mars has two small moons named Phobos and Deimos.",
  "NASA’s InSight lander recorded marsquakes, Mars’ version of earthquakes.",
  "Astronauts have lived on the Space Station nonstop since November 2000.",
  "NASA’s Artemis program plans to send astronauts back to the Moon.",
  "DONKI is NASA’s database that logs solar flares and other space weather.",
];
const MESSAGES = [
  {
    from: "Mission Control",
    icon: "",
    text: "Good morning, crew! Check the forecast before you share out power.",
  },
  {
    from: "Dr. Rivera, solar scientist",
    icon: "",
    text: "We watch the Sun every day. Flares can reach Mars fast, so shelter early.",
  },
  {
    from: "Your family",
    icon: "",
    text: "We looked up at Mars tonight. It was a tiny red dot. We are so proud of you!",
  },
  {
    from: "Class 5, Earth School",
    icon: "",
    text: "We are growing beans in class, just like your garden!",
  },
  {
    from: "Engineer Sam",
    icon: "",
    text: "Tip: spare parts and a calm plan fix most problems.",
  },
  {
    from: "Mission Control",
    icon: "",
    text: "Remember: radiation dose never goes down. Shelter is cheaper than going home.",
  },
  {
    from: "Chef Amara",
    icon: "",
    text: "One garden unit feeds the crew for a day. Plants make a little air too!",
  },
  {
    from: "Mission Control",
    icon: "",
    text: "Our messages take minutes to reach you. You are the experts on the ground.",
  },
];

// Messages react to what is happening in the game.
function todaysMessages() {
  const ev = todayEvent(),
    nx = game.events[game.sol + 1],
    MC = { from: "Mission Control", icon: "" };
  let hot = null;
  if (ev?.type === "storm")
    hot = {
      ...MC,
      text: "ALERT! Space rays are here! Everyone to the shelter!",
      urgent: true,
    };
  else if (nx?.type === "storm")
    hot = {
      ...MC,
      text: "We saw a flare! A storm comes tomorrow. Get the shelter ready.",
      urgent: true,
    };
  else if (nx?.type === "dust")
    hot = {
      ...MC,
      text: "A big dust cloud is coming. Tomorrow has less sun. Fill up today!",
      urgent: true,
    };
  else if (game.air <= 3)
    hot = {
      ...MC,
      text: "Air is low! Give the air maker more power!",
      urgent: true,
    };
  else if (game.food <= 3)
    hot = {
      ...MC,
      text: "Food is low. Give the garden some power!",
      urgent: true,
    };
  else if (game.dose >= 6)
    hot = {
      ...MC,
      text: "Radiation is high. Use the shelter more.",
      urgent: true,
    };
  const list = [
    hot || MESSAGES[game.sol % MESSAGES.length],
    MESSAGES[(game.sol + 3) % MESSAGES.length],
  ];
  return list.map((m, i) => ({ ...m, ago: DELAYS[(game.sol + i) % 4] }));
}
const msgHTML = (m) =>
  `<div class="msg ${m.urgent ? "urgent" : ""}"><span class="av" style="background:${AVC[m.from.length % 4]}">${m.from[0]}</span><div><b>${m.from}</b><p>${m.text}</p><small>Sent ${m.ago} ago</small></div></div>`;
function messagePanel() {
  return `<div class="card"><h2>From Earth</h2>${todaysMessages().map(msgHTML).join("")}</div>`;
}
function mobileMsg() {
  return `<div class="card only-narrow">${msgHTML(todaysMessages()[0])}</div>`;
}
function newsPanel() {
  const ev = todayEvent(),
    lines = [];
  if (ev?.type === "storm")
    lines.push("BREAKING: Space ray storm!");
  else if (ev?.type === "dust")
    lines.push("BREAKING: Dust storm cuts solar power!");
  else lines.push(`Crew has earned ${game.science} star points so far.`);
  for (let i = 0; i < 3; i++)
    lines.push(NEWS[(game.sol * 3 + i) % NEWS.length]);
  return `<div class="card"><h2>Mars Daily</h2><small class="fact">Day ${game.sol} edition</small>
    ${lines.map((l, i) => `<p class="headline ${i === 0 && l.startsWith("BREAKING") ? "breaking" : ""}">${l}</p>`).join("")}</div>`;
}

function projection() {
  const a = game.alloc,
    ev = todayEvent();
  let dose = a.S ? 0 : 0.25;
  if (ev?.type === "storm") dose += Math.max(0, 5 - lv("walls") - 2 * a.S);
  return { air: -4 + 2 * a.L + a.G, food: -2 + (2 + lv("seeds")) * a.G, dose };
}
// Little picture of the base. Lights turn on when you give a building power.
function scene() {
  const a = game.alloc,
    ev = todayEvent(),
    t = ev ? ev.type : "";
  const lamp = (v, x, y) =>
    `<circle cx="${x}" cy="${y}" r="5" fill="${v > 0 ? "#ffc933" : "#6b6690"}" stroke="#1e1a3c" stroke-width="2"/>`;
  const st = 'stroke="#1e1a3c" stroke-width="3" stroke-linejoin="round"';
  return `<svg class="scene only-narrow ${t}" viewBox="0 0 600 170" role="img" aria-label="Your Mars outpost">
    <defs><linearGradient id="sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a2f78"/><stop offset="1" stop-color="#f2a37f"/></linearGradient></defs>
    <rect width="600" height="170" fill="url(#sk)"/>
    <circle cx="505" cy="46" r="20" fill="#ffe08a"/>
    ${t === "storm" ? '<g class="rays" stroke="#ff5a6e" stroke-width="4" stroke-linecap="round"><path d="M505 8v-4M505 84v4M467 46h-5M543 46h5M478 19l-3-3M532 73l3 3M532 19l3-3M478 73l-3 3"/></g>' : ""}
    <path d="M0 118Q150 88 300 116T600 106V170H0z" fill="#c4553b"/>
    <path d="M0 142Q200 126 400 142T600 136V170H0z" fill="#8e3a3a"/>
    <g fill="#62c3ff" ${st}><path d="M24 142l12-18h30l-12 18z"/><path d="M66 142l12-18h30l-12 18z"/><path d="M108 142l12-18h30l-12 18z"/></g>
    <path d="M195 142a42 42 0 0 1 84 0z" fill="#cfeaff" ${st}/>${lamp(a.L, 237, 128)}
    <path d="M305 142v-30l26-18 26 18v30z" fill="#9ff0c9" ${st}/><path d="M318 142v-12M331 142v-18M344 142v-10" stroke="#25a06a" stroke-width="3"/>${lamp(a.G, 331, 108)}
    <path d="M385 142v-20h62v20z" fill="#ffc933" ${st}/>${lamp(a.S, 416, 132)}
    <rect x="465" y="120" width="42" height="22" fill="#d9d2ff" ${st}/><path d="M486 120V102" ${st}/>${lamp(a.R, 486, 131)}
    ${t === "dust" ? '<rect width="600" height="170" fill="#b8742f" opacity=".5"/>' : ""}
  </svg>`;
}

/* ---------- SIDE VISUALS (shown in the empty space on wide screens) ---------- */
// Outpost cam: a live picture of the base. Buildings light up and get busy when powered.
function camPanel() {
  const a = game.alloc,
    ev = todayEvent(),
    t = ev ? ev.type : "calm";
  const hit = t === "storm" ? Math.max(0, 5 - lv("walls") - 2 * a.S) : 0;
  const st = 'stroke="#1e1a3c" stroke-width="2.5" stroke-linejoin="round"';
  const lamp = (v, x, y) =>
    `<circle cx="${x}" cy="${y}" r="4" class="${v > 0 ? "lit" : ""}" fill="${v > 0 ? "#ffc933" : "#6b6690"}" stroke="#1e1a3c" stroke-width="2"/>`;
  // height of the shield dome at a given x, so blocked particles stop on it
  const domeY = (x) =>
    198 - 118 * Math.sqrt(Math.max(0, 1 - ((x - 130) / 124) ** 2));

  let sky = "";
  if (t === "calm")
    sky =
      '<circle class="cam-sun" cx="212" cy="40" r="16" fill="#ffe08a" stroke="#1e1a3c" stroke-width="2.5"/>';
  if (t === "storm") {
    sky =
      '<circle class="cam-sun" cx="212" cy="40" r="16" fill="#ffd1a0" stroke="#1e1a3c" stroke-width="2.5"/><g class="rays" stroke="#ff5a6e" stroke-width="3" stroke-linecap="round"><path d="M212 12v-5M212 68v5M184 40h-5M240 40h5M192 20l-3-3M232 60l3 3M232 20l3-3M192 60l-3 3"/></g>';
    for (let i = 0; i < 8; i++) {
      const x = 22 + i * 30;
      const d = hit > 0 || a.S === 0 ? 190 : Math.max(20, domeY(x) - 14);
      sky += `<g transform="translate(${x} 4)"><g class="pt" style="--d:${d}px;animation-delay:${-(i * 0.23)}s"><path d="M0 0l-4 9h5l-4 9" fill="none" stroke="#ff5a6e" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></g></g>`;
    }
  }
  if (t === "dust") {
    const wave = (y) => `M-30 ${y}q15-10 30 0${"t30 0".repeat(9)}`;
    sky = `<g class="drift" stroke="#f0c48a" stroke-width="4" stroke-linecap="round" fill="none" opacity=".8"><path d="${wave(40)}"/><path d="${wave(85)}"/><path d="${wave(130)}"/></g>`;
  }

  const air = Array.from(
    { length: a.L },
    (_, i) =>
      `<circle class="puff" cx="${26 + i * 9}" cy="168" r="3" fill="#fff" stroke="#1e1a3c" stroke-width="1.5" style="animation-delay:${i * 0.8}s"/>`,
  ).join("");
  const plants = Array.from(
    { length: a.G },
    (_, i) =>
      `<g transform="translate(${80 + i * 10} 198)"><g class="sway"><path d="M0 0v-${9 + i}" stroke="#25a06a" stroke-width="3" stroke-linecap="round"/><ellipse cx="-4" cy="-${10 + i}" rx="4" ry="2.5" fill="#35d8a0" stroke="#1e1a3c" stroke-width="1.5"/><ellipse cx="4" cy="-${13 + i}" rx="4" ry="2.5" fill="#35d8a0" stroke="#1e1a3c" stroke-width="1.5"/></g></g>`,
  ).join("");
  const sparks = Array.from(
    { length: a.R },
    (_, i) =>
      `<path class="twinkle" d="M${196 + i * 10} ${148 - (i % 2) * 8}l2 4 4 2-4 2-2 4-2-4-4-2 4-2z" fill="#ffc933" stroke="#1e1a3c" stroke-width="1.2" style="animation-delay:${i * 0.4}s"/>`,
  ).join("");
  const shield = a.S
    ? `<path class="shield" d="M6 198A124 118 0 0 1 254 198" fill="#35d8a0" fill-opacity="${0.04 * a.S}" stroke="#35d8a0" stroke-width="4" stroke-opacity="${0.35 + 0.16 * a.S}"/>`
    : "";

    const grit = Array.from({ length: 10 }, (_, i) => `<circle class="grit" cx="-6" cy="${20 + i * 17}" r="2" fill="#f0c48a" style="animation-delay:${-i * 0.5}s;animation-duration:${2 + (i % 3)}s"/>`).join("");
  const extra =
    t === "calm"
      ? `<g fill="#fff"><circle class="twinkle" cx="30" cy="30" r="1.5"/><circle class="twinkle" cx="90" cy="20" r="1.5" style="animation-delay:.6s"/><circle class="twinkle" cx="150" cy="48" r="1.5" style="animation-delay:1.2s"/></g><text class="sat" x="0" y="60" font-size="16">🛰️</text><text class="walk" x="96" y="211" font-size="14">🧑‍🚀</text><text class="roam" x="4" y="214" font-size="15">🚙</text><text class="launch" x="238" y="200" font-size="16">🚀</text>`
      : t === "storm"
        ? `<rect class="flash" width="260" height="220" fill="#ff5a6e"/><text class="hop2" x="143" y="174" font-size="14">${hit > 0 ? "😱" : "😎"}</text>`
        : `${grit}<text class="hop2" x="143" y="174" font-size="14">😷</text>`;
  const caption =
    t === "storm"
      ? hit > 0
        ? "😱 Space rays! Power the shelter!"
        : "😎 Shield works!"
      : t === "dust"
        ? "🌪️ Dusty! Less sun."
        : "☀️ Calm day!";

  return `<div class="card"><h2>🔭 Outpost <span class="live">LIVE</span></h2>
    <svg class="cam" viewBox="0 0 260 220" role="img" aria-label="Live picture of your Mars outpost">
      <defs>
        <linearGradient id="cam-calm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a2f78"/><stop offset="1" stop-color="#f2a37f"/></linearGradient>
        <linearGradient id="cam-storm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a1d5e"/><stop offset="1" stop-color="#ff8f8f"/></linearGradient>
        <linearGradient id="cam-dust" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9a6a3e"/><stop offset="1" stop-color="#e0a566"/></linearGradient>
      </defs>
      <rect width="260" height="220" fill="url(#cam-${t})"/>
      ${sky}
      <path d="M0 175Q70 160 130 173T260 167V220H0z" fill="#c4553b"/>
      <path d="M0 205Q90 196 180 207T260 201V220H0z" fill="#8e3a3a"/>
      <path d="M10 198a26 26 0 0 1 52 0z" fill="#cfeaff" ${st}/>${air}${lamp(a.L, 36, 190)}
      <path d="M70 198v-22l24-17 24 17v22z" fill="#9ff0c9" ${st}/>${plants}${lamp(a.G, 94, 178)}
      <path d="M128 198v-20h46v20z" fill="#ffc933" ${st}/>${lamp(a.S, 151, 189)}
      <path d="M190 198v-24h40v24z" fill="#d9d2ff" ${st}/><path d="M210 174v-14" ${st}/><circle class="${a.R ? "dish" : ""}" cx="210" cy="157" r="4" fill="${a.R ? "#ff5a6e" : "#6b6690"}" stroke="#1e1a3c" stroke-width="2"/>${sparks}${lamp(a.R, 210, 188)}
      ${extra}${shield}
      ${t === "dust" ? '<rect width="260" height="220" fill="#b8742f" opacity=".3"/>' : ""}
    </svg>
    <p class="fact">${caption}</p></div>`;
}

// Crew faces change with how the base is doing.
function crewPanel() {
  const ev = todayEvent();
  const hit =
    ev?.type === "storm"
      ? Math.max(0, 5 - lv("walls") - 2 * game.alloc.S)
      : 0;
  const mood =
    game.air <= 3
      ? "air"
      : game.food <= 3
        ? "food"
        : game.dose >= 6 || hit > 0
          ? "dose"
          : "ok";
  const note = {
    ok: "The crew is happy and healthy!",
    air: "We need more air!",
    food: "Our tummies are rumbling!",
    dose: hit > 0 ? "Radiation is coming! Power the shelter!" : "Too much radiation. Hide in the shelter!",
  }[mood];
  const eyes =
    '<circle cx="26" cy="29" r="2.6" fill="#fff"/><circle cx="38" cy="29" r="2.6" fill="#fff"/>';
  const line = 'fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round"';
  const mouths = {
    ok: `<path d="M26 36q6 5 12 0" ${line}/>`,
    air: '<ellipse cx="32" cy="37" rx="3" ry="3.5" fill="#fff"/><path d="M47 17q4 6 0 8q-4-2 0-8z" fill="#62c3ff" stroke="#1e1a3c" stroke-width="1.5"/>',
    food: `<path d="M26 38q2-3 4 0t4 0t4 0" ${line}/>`,
    dose: `<path d="M23 24l6 2M41 24l-6 2" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/><path d="M27 38q5-4 10 0" ${line}/>`,
  };
  const suits = ["#62c3ff", "#35d8a0", "#ffc933"];
  const astro = (i) =>
    `<svg class="astro ${mood}" width="80" height="88" viewBox="0 0 64 70" style="animation-delay:${i * 0.6}s" aria-hidden="true">
      <path d="M8 70a24 20 0 0 1 48 0z" fill="${suits[i]}" stroke="#1e1a3c" stroke-width="3"/>
      <circle cx="32" cy="30" r="22" fill="#f4f1ff" stroke="#1e1a3c" stroke-width="3"/>
      <rect x="15" y="18" width="34" height="26" rx="13" fill="#2b2a5e" stroke="#1e1a3c" stroke-width="2"/>
      ${eyes}${mouths[mood]}</svg>`;
  return `<div class="card"><h2>Your crew</h2>
    <div class="crew-row">${[0, 1, 2].map(astro).join("")}</div>
    <p class="crew-note mood-${mood === "ok" ? "ok" : "bad"}">${note}</p></div>`;
}

// A little message flying from Mars to Earth.
function signalPanel() {
  return `<div class="card"><h2>Signal to Earth</h2>
    <svg class="sig" viewBox="0 0 260 80" role="img" aria-label="A message travelling from Mars to Earth">
      <g fill="#fff"><circle cx="90" cy="14" r="1.2"/><circle cx="140" cy="66" r="1.2"/><circle cx="180" cy="18" r="1.2"/><circle cx="110" cy="40" r="1"/></g>
      <path d="M54 40H212" stroke="#c9c3ee" stroke-width="2" stroke-dasharray="3 7" stroke-linecap="round"/>
      <circle cx="30" cy="40" r="20" fill="#62c3ff" stroke="#1e1a3c" stroke-width="3"/>
      <path d="M18 34q6-8 12-2t-2 10q-6 2-10-8zM34 48q6-2 8 4t-6 4z" fill="#35d8a0"/>
      <circle cx="230" cy="40" r="14" fill="#c4553b" stroke="#1e1a3c" stroke-width="3"/>
      <circle cx="225" cy="36" r="3" fill="#8e3a3a"/><circle cx="234" cy="46" r="2" fill="#8e3a3a"/>
      <g class="pkt"><rect x="52" y="34" width="16" height="11" rx="2" fill="#ffc933" stroke="#1e1a3c" stroke-width="2"/><path d="M52 35l8 5 8-5" fill="none" stroke="#1e1a3c" stroke-width="2"/></g>
    </svg>
    <p class="fact">Messages take about <b>${DELAYS[game.sol % 4]}</b> to reach Earth.</p></div>`;
}

// Mission trail: one dot per day. Known storm and dust days are tinted.
function trail() {
  const look = game.warning ? 4 : 2;
  const dots = Array.from({ length: CONFIG.totalSols }, (_, i) => {
    const d = i + 1,
      e = game.events[d],
      known = d >= game.sol && d - game.sol < look;
    const cls = d < game.sol ? "done" : d === game.sol ? "now" : "";
    return `<i class="${known && e ? e.type : ""} ${cls}"></i>`;
  }).join("");
  return `<div class="trail" role="img" aria-label="Day ${game.sol} of ${CONFIG.totalSols}"><span class="tl">Start</span><div class="tdots">${dots}</div><span class="tl">Goal</span></div>`;
}

/* ---------- DRAWING THE SCREEN ---------- */
function meter(icon, label, value, max, lowWhen) {
  const low = lowWhen(value);
  const shown = Number.isInteger(value) ? value : value.toFixed(1);
  return `<div class="meter ${low ? "low" : ""}">
    <div class="icon">${ic(icon)}</div>
    <div class="bar"><i style="width:${Math.max(0, (value / max) * 100)}%"></i></div>
    <div class="label">${label}: ${shown}</div></div>`;
}

function render() {
  if (game.result) return renderEnd();
  const ev = todayEvent(),
    next = game.events[game.sol + 1],
    p = power();

  let eventCard = "";
  if (ev?.type === "storm")
    eventCard = `<div class="card warn"><h2>Space ray storm today!</h2><p>🛡️ <b>Turn on the shelter!</b></p><details class="more"><summary>🔎 Fun fact</summary><p class="fact">${ev.data.fact}</p></details></div>`;
  if (ev?.type === "dust")
    eventCard = `<div class="card warn"><h2>${ev.data.title}!</h2><p>🌪️ Only <b>${p} power</b> today.</p><details class="more"><summary>🔎 Fun fact</summary><p class="fact">${ev.data.fact}</p></details></div>`;

  const cells = Array.from(
    { length: Math.max(p, CONFIG.normalPower + lv("panels")) },
    (_, i) =>
      `<div class="cell ${i < used() ? "on" : ""} ${i >= p ? "dead" : ""}"></div>`,
  ).join("");

  const sgn = (n) => (n > 0 ? "+" + n : n < 0 ? "−" + Math.abs(n) : "0");
  const pr = projection();
  const proj = `<div class="proj"><b>What will happen:</b>
    <span class="${pr.air < 0 ? "neg" : "pos"}">${ic("L")} Air ${sgn(pr.air)}</span>
    <span class="${pr.food < 0 ? "neg" : "pos"}">${ic("food")} Food ${sgn(pr.food)}</span>
    <span class="${pr.dose > 0 ? "neg" : "pos"}">${ic("dose")} Radiation ${sgn(pr.dose)}</span></div>`;
  const systems = SYSTEMS.map(
    (s) => `
    <div class="mod m-${s.key}">
      <div class="mh">${ic(s.key)}<b>${s.name}</b><span class="emo">${{ L: "💨", G: "🌱", S: "🛡️", R: "🔬" }[s.key]}</span></div>
      <p class="hint">${s.hint}</p>
      <div class="slots">${[1, 2, 3, 4].map((i) => `<i class="${i <= game.alloc[s.key] ? "on" : ""}"></i>`).join("")}</div>
      <div class="stepper">
        <button onclick="change('${s.key}',-1)" aria-label="Less power to ${s.name}" ${game.alloc[s.key] === 0 ? "disabled" : ""}>−</button>
        <span>${game.alloc[s.key]}</span>
        <button onclick="change('${s.key}',1)" aria-label="More power to ${s.name}" ${used() >= p || game.alloc[s.key] >= 4 ? "disabled" : ""}>+</button>
      </div>
    </div>`,
  ).join("");

  app.className = "wide";
  app.innerHTML = `<div class="layout"><aside class="side">${newsPanel()}</aside><div class="center">
    <button class="back" onclick="quitMission()">◀ Menu</button>
    ${mobileMsg()}
    <h1>Mars Outpost</h1>
    ${camPanel()}
    <div class="card hud">
      ${trail()}
      <p class="fact">Day ${game.sol} / ${CONFIG.totalSols} · ⭐ <b>${game.science}</b></p>
      <div class="meters">
        ${meter("L", "Air", game.air, game.maxStock, (v) => v <= 3)}
        ${meter("food", "Food", game.food, game.maxStock, (v) => v <= 3)}
        ${meter("dose", "Radiation", game.dose, CONFIG.doseLimit, (v) => v >= 6)}
      </div>
      <p class="fact">⚠️ Radiation never goes down. At ${CONFIG.doseLimit}: home time!</p>
    </div>
    ${game.report ? `<div class="card news">${game.report}</div>` : ""}
    ${forecastStrip()}
    ${game.penalty[game.sol] ? `<div class="card warn"><h2>🔧 Broken!</h2><p><b>−${game.penalty[game.sol]} power</b> today.</p></div>` : ""}
    ${eventCard}
    <div class="card">
      <h2>Power:  ${used()} of ${p}</h2>
      <div class="cells">${cells}</div>
      <div class="mods">${systems}</div>${proj}
      
      <div class="acts">${quizCard()}${roverButton()}</div>
      ${game.battery > 0 && game.batteryDay !== game.sol ? `<button class="item" onclick="useBattery()">${ic("battery")} Use battery pack (+3 power today)</button>` : ""}
      <button class="go" onclick="runSol()">Run Day ${game.sol} ▶</button>
    </div></div><aside class="side">${crewPanel()}${signalPanel()}${messagePanel()}</aside></div>`;
}

function renderEnd() {
  app.className = "";
  const msg = {
    win: `You did it! ${game.science} star points!`,
    air: "Oh no! The air ran out.",
    food: "Oh no! The food ran out.",
    dose: "Too many space rays. The crew went home.",
  }[game.result];
  app.innerHTML = `
    <div class="trophy ${game.result === "win" ? "win" : "lose"}">${game.result === "win" ? "🏆" : "😢"}</div>
    <h1>${msg}</h1>
    <div class="card"><h2>What you learned</h2>
      <p>⚡ <b>Power is small.</b></p>
      <p>☀️ <b>Watch the Sun.</b></p>
      <p>🌪️ <b>Mars has surprises.</b></p>
      <p>📡 <b>Help is far away.</b></p>
    </div>
    <div class="card news"><h2>⭐ +${game.earned}</h2>
      <p>You now have ⭐ <b>${save.points}</b></p></div>
    <button class="go" onclick="showMenu()">Upgrade menu </button>
    <button class="go alt" onclick="startMission()">Play again now</button>
    <button class="go alt" onclick="showMain()">◀ Main menu</button>`;
  if (game.result === "win") confetti(60);
  fresh();
}

// If style.css is missing or an old copy, say so instead of showing a broken page.
if (
  typeof getComputedStyle === "function" &&
  !getComputedStyle(document.documentElement).getPropertyValue("--ink").trim()
)
  document.body.insertAdjacentHTML(
    "afterbegin",
    '<p style="background:#ffc933;color:#1e1a3c;padding:10px;margin:0;font:700 16px sans-serif;text-align:center">The game styles did not load. Upload the newest style.css next to index.html and game.js, then refresh (Ctrl+Shift+R).</p>',
  );

/* ---------- FUN STUFF: sky, sparkles, confetti, screen pop-in ---------- */
const calmMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
function fresh() {
  app.classList.add("fresh");
  app
    .querySelectorAll(".card,.go,.hero,h1,.back")
    .forEach((el, i) => el.style.setProperty("--i", Math.min(i, 8)));
  setTimeout(() => app.classList.remove("fresh"), 1200);
}
function spark(x, y) {
  if (calmMotion()) return;
  for (let i = 0; i < 6; i++) {
    const s = document.createElement("span"),
      a = (i / 6) * 6.28 + Math.random();
    s.className = "spark";
    s.textContent = ["⭐", "✨", "🌟"][i % 3];
    s.style.cssText = `left:${x}px;top:${y}px;--x:${Math.cos(a) * 60}px;--y:${Math.sin(a) * 60}px`;
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 800);
  }
}
document.addEventListener("click", (e) => {
  if (e.target.closest("button")) spark(e.clientX, e.clientY);
});
function confetti(n = 30) {
  if (calmMotion()) return;
  const bits = ["🎉", "⭐", "🌟", "🚀", "🪐", "✨"];
  for (let i = 0; i < n; i++) {
    const c = document.createElement("span");
    c.className = "conf";
    c.textContent = bits[i % bits.length];
    c.style.cssText = `left:${Math.random() * 100}vw;font-size:${18 + Math.random() * 18}px;--x:${Math.random() * 160 - 80}px;--r:${Math.random() * 720}deg;--t:${2 + Math.random() * 1.5}s;animation-delay:${Math.random() * 0.5}s`;
    document.body.appendChild(c);
    setTimeout(() => c.remove(), 4400);
  }
}
(function buildSky() {
  const sky = document.createElement("div");
  sky.className = "sky";
  sky.setAttribute("aria-hidden", "true");
  let h = "";
  for (let i = 0; i < 16; i++)
    h += `<i class="st" style="left:${Math.random() * 100}%;top:${Math.random() * 55}%;animation-delay:${-Math.random() * 3}s"></i>`;
  h +=
    '<span class="fly" style="top:70%">🚀</span><span class="fly f2" style="top:35%">🛸</span><span class="fly f3" style="top:12%">🛰️</span><i class="shoot" style="left:85%;top:8%"></i><i class="shoot" style="left:60%;top:22%;animation-delay:-3s"></i>';
  sky.innerHTML = h;
  document.body.insertBefore(sky, app);
})();

(function theme() {
  const root = document.documentElement,
    b = document.createElement("button");
  b.id = "theme";
  b.setAttribute("aria-label", "Light or dark mode");
  let t = null;
  try { t = localStorage.getItem("marsTheme"); } catch (e) {}
  if (!t) t = matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  const set = (v) => {
    root.dataset.theme = v;
    b.textContent = v === "dark" ? "☀️" : "🌙";
    try { localStorage.setItem("marsTheme", v); } catch (e) {}
  };
  b.onclick = () => set(root.dataset.theme === "dark" ? "light" : "dark");
  set(t);
  document.body.appendChild(b);
})();

showMain();
