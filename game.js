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
    icon: "💨",
    name: "Life support",
    hint: "Makes air. Needs 2 units a day to break even.",
  },
  {
    key: "G",
    icon: "🌱",
    name: "Greenhouse",
    hint: "Grows food and a little air. 1 unit feeds the crew.",
  },
  {
    key: "S",
    icon: "🛡️",
    name: "Storm shelter",
    hint: "Shields the crew. 3 units blocks nearly all radiation.",
  },
  {
    key: "R",
    icon: "🔬",
    name: "Science lab",
    hint: "Earns research points. Nothing else.",
  },
];

// Real, archived NASA events. Add your own here!
const STORMS = [
  {
    title: "Big solar flare (May 2024)",
    fact: "In May 2024 strong flares caused the biggest geomagnetic storm in about 20 years. NASA’s DONKI database logs events like this.",
  },
  {
    title: "Halloween solar storms (Oct 2003)",
    fact: "Many huge flares hit within days in 2003. Spacecraft had to protect their electronics.",
  },
  {
    title: "Giant flare (Aug 1972)",
    fact: "This storm happened between Apollo 16 and 17. Astronauts on the Moon would have needed shelter fast.",
  },
  {
    title: "Fast particle burst",
    fact: "Charged particles from the Sun can arrive within hours, so warning time is short.",
  },
];
const DUST = {
  title: "Mars dust storm",
  fact: "In 2018 a global dust storm blocked so much sunlight that NASA’s Opportunity rover lost power.",
};
const DELAYS = ["4 minutes", "9 minutes", "14 minutes", "20 minutes"]; // Earth-Mars signal time varies 3–22 min

// Surprise emergencies. Every emergency has a GOOD, an OK and a BAD choice (order is shuffled).
// grade: "good" | "ok" | "bad".  effect can change: air, food, dose (radiation), science,
// and powerNext (power change tomorrow, from damage). "lesson" is the real-world tip shown to the player.
const EMERGENCIES = [
  {
    title: "Air leak!",
    text: "A hissing sound! A small crack is letting air escape.",
    choices: [
      {
        grade: "good",
        label: "Find the leak and patch it",
        cost: "Lose 1 research point",
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
        label: "Turn up life support to cover it",
        cost: "Lose 3 air, and 2 less power tomorrow",
        effect: { air: -3, powerNext: -2 },
        result: "Life support worked too hard and wore out.",
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
    title: "Surprise particle burst!",
    text: "Sensors beep. Fast particles from the Sun are arriving with no warning.",
    choices: [
      {
        grade: "good",
        label: "Go to the shielded shelter",
        cost: "Lose 1 food (no time to harvest)",
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
        cost: "Gain 1 research point, but 3 radiation",
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
    title: "Greenhouse pump broke!",
    text: "The water pump stopped. The plants are getting thirsty.",
    choices: [
      {
        grade: "good",
        label: "Swap in the spare part",
        cost: "Lose 1 research point",
        effect: { science: -1 },
        result: "The pump works again and the plants are fine.",
        lesson: "Missions carry spare parts because help is far away.",
      },
      {
        grade: "ok",
        label: "Water the plants by hand",
        cost: "Lose 1 food and 1 research point",
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
        cost: "Lose 1 research point",
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
        cost: "Lose 2 research points, and 2 less power tomorrow",
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
    q: "How long does a message take to travel one way between Earth and Mars?",
    right: "3 to 22 minutes",
    wrong: ["About 1 second", "About 2 days"],
    why: "It depends on where the planets are in their orbits.",
  },
  {
    q: "What can send dangerous radiation toward astronauts?",
    right: "Solar flares",
    wrong: ["Moon dust", "Mars wind"],
    why: "NASA’s DONKI database tracks flares and other space weather.",
  },
  {
    q: "Why do astronauts go into a shelter during a solar storm?",
    right: "It blocks radiation",
    wrong: ["It is quieter", "It is warmer"],
    why: "Thick walls and supplies stop many fast particles.",
  },
  {
    q: "What do we call one day on Mars?",
    right: "A sol",
    wrong: ["A moon", "A rover"],
    why: "A sol is about 24 hours and 39 minutes.",
  },
  {
    q: "What blocked the Sun from NASA’s Opportunity rover in 2018?",
    right: "A giant dust storm",
    wrong: ["A volcano", "A comet"],
    why: "Without sunlight its solar panels could not make power.",
  },
  {
    q: "How can a greenhouse help astronauts?",
    right: "It grows food and some air",
    wrong: ["It makes rocket fuel", "It sends radio signals"],
    why: "Plants take in carbon dioxide and make oxygen.",
  },
  {
    q: "Does Mars have a thick atmosphere that blocks radiation?",
    right: "No, it is very thin",
    wrong: ["Yes, thicker than Earth’s", "Yes, the same as Earth’s"],
    why: "That is one reason Mars crews need shielding.",
  },
  {
    q: "What does NASA’s DONKI database keep track of?",
    right: "Space weather events",
    wrong: ["Rocket prices", "Rover paint colors"],
    why: "DONKI records flares and eruptions from the Sun.",
  },
];

/* ---------- VISUALS: emergency stages + live base scene ---------- */
// Emoji "pictures" for each emergency: the problem, then the result of each grade.
const EM_VIS = {
  "Air leak!": {
    problem: ["🏠", "💨", "💨"],
    good: ["🔧", "✨", "🏠"],
    ok: ["🚪", "🔒", "💨"],
    bad: ["⚙️", "💥", "💨"],
  },
  "Surprise particle burst!": {
    problem: ["☀️", "⚡", "⚡"],
    good: ["🛡️", "🧑‍🚀", "✨"],
    ok: ["🏠", "🧑‍🚀", "⚡"],
    bad: ["🧪", "☢️", "😵"],
  },
  "Greenhouse pump broke!": {
    problem: ["🌱", "🚰", "❌"],
    good: ["🔧", "🌿", "✨"],
    ok: ["🪣", "🌱", "😓"],
    bad: ["📡", "🥀", "⏳"],
  },
  "Dusty solar panels!": {
    problem: ["🌪️", "☀️", "🟫"],
    good: ["🤖", "☀️", "✨"],
    ok: ["🧑‍🚀", "🧽", "☢️"],
    bad: ["🟫", "🔋", "📉"],
  },
};
// kind: "problem" | "good" | "ok" | "bad"
function stage(title, kind) {
  const set = (EM_VIS[title] || {})[kind] || ["🚨"];
  return `<div class="stage st-${kind}">${set.map((e, i) => `<span style="animation-delay:${i * 0.15}s">${e}</span>`).join("")}</div>`;
}

// What today's power plan will do (used for the live scene and the preview chips)
function preview() {
  const a = game.alloc,
    ev = todayEvent();
  const storm = ev?.type === "storm";
  return {
    air: -4 + 2 * a.L + a.G,
    food: -2 + (2 + lv("seeds")) * a.G,
    hit: storm ? Math.max(0, 5 - lv("walls") - 2 * a.S) : 0,
    storm,
  };
}

function baseScene(noChips, fx = {}) {
  const a = game.alloc,
    ev = todayEvent(),
    pv = preview();
  const weather = ev?.type || "calm";
  const damaged = (game.penalty[game.sol] || 0) > 0;

  // Weather layer
  let sky = "";
  if (weather === "calm") sky = `<div class="sunl">☀️</div>`;
  if (weather === "dust")
    sky = [0, 1, 2, 3]
      .map(
        (i) =>
          `<div class="dustc" style="top:${8 + i * 22}px;animation-delay:${-i * 1.7}s">🌪️</div>`,
      )
      .join("");
  if (weather === "storm") {
    sky = `<div class="sunl flare">☀️</div>`;
    sky += Array.from({ length: 9 }, (_, i) => {
      const cls = pv.hit > 0 ? "hit" : a.S > 0 ? "block" : "hit";
      return `<i class="part ${cls}" style="left:${8 + i * 10}%;animation-delay:${-(i * 0.37)}s">⚡</i>`;
    }).join("");
  }

  // Four modules. Brighter and busier when they get more power.
  const pod = (cls, icon, n, extra) =>
    `<div class="pod ${cls} ${n ? "on" : "off"} ${fx.pod === cls.slice(2) ? "boost" : ""}" style="--lvl:${n}">
      ${n ? extra : '<span class="zzz">💤</span>'}
      <div class="picon">${icon}</div>
      <div class="lvl">${"●".repeat(n)}${"○".repeat(4 - n)}</div></div>`;
  const bubbles = Array.from(
    { length: a.L },
    (_, i) =>
      `<b class="bub" style="left:${20 + i * 18}%;animation-delay:${-i * 0.6}s">💨</b>`,
  ).join("");
  const plants = `<div class="plants">${Array.from({ length: a.G }, () => `<span style="font-size:${0.9 + a.G * 0.15}rem">${a.G >= 3 ? "🌿" : "🌱"}</span>`).join("")}</div>`;
  const sparks = Array.from(
    { length: a.R },
    (_, i) =>
      `<b class="spark" style="left:${15 + i * 20}%;animation-delay:${-i * 0.5}s">✨</b>`,
  ).join("");
  const pods =
    pod("p-L", "💨", a.L, bubbles) +
    pod("p-G", a.G ? "🌱" : "🥀", a.G, plants) +
    pod("p-S", "🛡️", a.S, "") +
    pod("p-R", "🔬", a.R, sparks);

  // Crew: mood depends on how the base is doing and what the plan will do
  const worry =
    game.air <= 3
      ? "💨 Air is low!"
      : game.food <= 3
        ? "🍎 So hungry..."
        : game.dose >= 6
          ? "☢️ Too much radiation"
          : pv.hit > 0
            ? "😖 Radiation will hit!"
            : "";
  const hurt = pv.hit > 0 || worry;
  const crew = `<div class="crew ${hurt ? "hurt" : ""}">${worry ? `<div class="say">${worry}</div>` : ""}<span>🧑‍🚀</span><span>👩‍🚀</span><span>🧑‍🚀</span></div>`;

  // Live preview chips: what this plan will do
  const fmt = (n) => (n > 0 ? "+" + n : n);
  const chip = (lbl, n, goodIfPos = true) =>
    `<span class="chip ${(goodIfPos ? n >= 0 : n <= 0) ? "plus" : "minus"}">${lbl} ${fmt(n)}</span>`;
  const shieldMsg = pv.storm
    ? pv.hit > 0
      ? `<span class="chip minus">☢️ Radiation +${pv.hit}</span>`
      : `<span class="chip plus">🛡️ Storm blocked</span>`
    : "";

  return `<div class="scene w-${weather} ${fx.fresh ? "dawn" : ""} ${fx.zap ? "zapped" : ""}">
      ${fx.zap ? '<div class="zapfx">🔋⚡</div>' : ""}
      ${sky}
      <div class="gnd"></div>
      <div class="shield" style="--lvl:${a.S}"></div>
      <div class="pods">${pods}</div>
      ${damaged ? `<div class="smoke">💨🔧</div>` : ""}
      ${crew}
    </div>
    ${noChips ? "" : `<div class="chips"><span class="fact">If you run today:</span>
      ${chip("💨 Air", pv.air)}${chip("🍎 Food", pv.food)}${shieldMsg}</div>`}`;
}

function dayChips(l) {
  if (!l) return "";
  const f = (lbl, n, inv) =>
    n
      ? `<span class="chip ${(inv ? n > 0 : n < 0) ? "minus" : "plus"}">${lbl} ${n > 0 ? "+" : ""}${n}</span>`
      : "";
  return `<div class="chips">${f("💨 Air", l.air)}${f("🍎 Food", l.food)}${f("☢️ Radiation", l.dose, true)}${f("🔬 Research", l.sci)}</div>`;
}

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
    icon: "☀️",
    name: "Better solar panels",
    desc: "+1 power every day.",
    costs: [15, 30],
  },
  {
    key: "walls",
    icon: "🧱",
    name: "Thicker shelter walls",
    desc: "Blocks 1 more radiation in every storm.",
    costs: [12, 25],
  },
  {
    key: "tanks",
    icon: "🛢️",
    name: "Bigger tanks",
    desc: "Start with +2 air and +2 food, and store more.",
    costs: [10, 20],
  },
  {
    key: "seeds",
    icon: "🥕",
    name: "Hardy seeds",
    desc: "Each greenhouse unit grows 1 more food.",
    costs: [20],
  },
  {
    key: "drills",
    icon: "⏱️",
    name: "Emergency drills",
    desc: "+4 seconds to decide in emergencies.",
    costs: [8, 16],
  },
];
// One-mission items. Used up when the next mission starts.
const ITEMS = [
  {
    key: "warning",
    icon: "🛰️",
    name: "Early-warning satellite",
    desc: "Next mission only: see storms 2 days ahead.",
    cost: 6,
  },
  {
    key: "battery",
    icon: "🔋",
    name: "Battery pack",
    desc: "Next mission only: +3 power on a day you choose.",
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
  game.fx = { pod: key };
  render();
}

function finishDay(prenotes = []) {
  const a = game.alloc,
    ev = todayEvent(),
    notes = [...prenotes];

  // Air: crew uses 4 a day. Life support adds 2 per unit, greenhouse adds 1 per unit.
  const airChange = -4 + 2 * a.L + a.G;
  // Food: crew eats 2 a day. Greenhouse grows 2 per unit.
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
        ? `Radiation got through! Dose +${hit}.`
        : "The shelter protected the crew!",
    );
  }
  game.dose += dose;
  game.science += a.R;
  if (a.R) notes.push(`+${a.R} research point${a.R > 1 ? "s" : ""}.`);
  game.last = { air: airChange, food: foodChange, dose, sci: a.R };
  game.report = `<b>Day ${game.sol} report:</b> ${notes.join(" ") || "A calm day."}${dayChips(game.last)}`;

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
  game.fx = { fresh: true };
  render();
  window.scrollTo(0, 0);
}

/* ---------- EMERGENCY POP-UP WITH COUNTDOWN ---------- */
// Called by the Run button. If an emergency is scheduled today, ask first.
function runSol() {
  const em = game.emergencies[game.sol];
  if (em) showEmergency(em);
  else playDay();
}

// A short "day passes" animation: sun crosses the sky, the base works, results float up.
function playDay(prenotes = []) {
  const a = game.alloc,
    pv = preview();
  if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches)
    return finishDay(prenotes);
  const dose = (a.S === 0 ? 0.25 : 0) + pv.hit;
  const items = [
    ["💨", pv.air, false],
    ["🍎", pv.food, false],
    ["☢️", dose, true],
    ["🔬", a.R, false],
  ].filter((x) => x[1]);
  const floats =
    items
      .map((x, i) => {
        const bad = x[2] ? x[1] > 0 : x[1] < 0;
        return `<span class="flt ${bad ? "bad" : "good"}" style="left:${6 + i * 24}%;animation-delay:${1 + i * 0.2}s">${x[0]} ${x[1] > 0 ? "+" : ""}${x[1]}</span>`;
      })
      .join("") +
    (pv.storm && pv.hit === 0
      ? `<span class="flt good" style="left:38%;top:40px;animation-delay:0.9s">🛡️ Blocked!</span>`
      : "");
  const box = popup(`<h2>🌅 Day ${game.sol}</h2>
    <div class="runwrap">${baseScene(true)}<div class="orb">☀️</div><div class="moon">🌙</div><div class="night"></div>
    ${pv.hit > 0 ? '<div class="hitflash"></div>' : ""}${floats}</div>
    <p class="fact" style="text-align:center">The crew works through the day… (tap to skip)</p>`);
  box.querySelector(".alert").classList.add("dayrun");
  let over = false;
  const end = () => {
    if (over) return;
    over = true;
    box.remove();
    finishDay(prenotes);
  };
  box.onclick = end;
  setTimeout(end, 3000);
}

function confetti() {
  return `<div class="confetti" aria-hidden="true">${Array.from({ length: 18 }, (_, i) => `<i style="left:${(i * 37) % 100}%;animation-delay:${(i % 6) * 0.35}s;animation-duration:${2.6 + (i % 4) * 0.5}s">${["🎉", "✨", "⭐", "🟡"][i % 4]}</i>`).join("")}</div>`;
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
    <h2>🚨 ${em.title}</h2>${stage(em.title, "problem")}<p>${em.text}</p>
    <div class="timer"><i></i></div>
    <p class="count">Decide in <b>${left}</b> seconds!</p>
    ${opts.map((c, i) => `<button class="choice" data-i="${i}"><b>${c.label}</b><small>${c.cost}</small></button>`).join("")}
    <p class="fact">📡 Earth would take about ${DELAYS[game.sol % 4]} to answer, which is too slow. You decide!</p>`);

  box.classList.add("alarm");
  const bar = box.querySelector(".timer i"),
    num = box.querySelector(".count b");
  const done = (choice, timedOut) => {
    clearInterval(timer);
    box.remove();
    applyEmergency(em, choice, timedOut);
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
  air: "💨 Air",
  food: "🍎 Food",
  dose: "☢️ Radiation",
  science: "🔬 Research",
  powerNext: "⚡ Power tomorrow",
};
const GRADES = {
  good: "✅ Great choice!",
  ok: "🤔 Not bad",
  bad: "❌ Risky choice",
};

function applyEmergency(em, choice, timedOut) {
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
  const box = popup(`
    <h2 class="g-${grade}">${timedOut ? "⏰ Time ran out!" : GRADES[grade]}</h2>
    ${stage(em.title, grade)}
    <p>${choice.result}</p><div class="chips">${chips}</div>
    <p class="fact">💡 ${choice.lesson}</p>
    <button class="go" id="cont">Continue ▶</button>`);
  box.querySelector("#cont").onclick = () => {
    box.remove();
    playDay([`🚨 ${timedOut ? "Time ran out! " : ""}${choice.result}`]);
  };
}

/* ---------- MAIN MENU + HOW TO PLAY ---------- */
function showMain() {
  game = null;
  app.innerHTML = `
    <div class="hero">
      <div class="logo">🚀</div>
      <h1>Mars Outpost</h1>
      <p class="sub">Can you keep your crew alive for ${CONFIG.totalSols} days?</p>
    </div>
    <button class="go" onclick="launch()">▶ Play</button>
    <button class="go alt" onclick="showMenu()">🔧 Upgrades <span class="pill">🔬 ${save.points}</span></button>
    <button class="go alt" onclick="showHow()">📖 How to play</button>`;
  window.scrollTo(0, 0);
}

function showHow() {
  app.innerHTML = `
    <h1>📖 How to play</h1>
    <div class="card"><h2>Your job</h2>
      <p>Each day you get a few <b>power units</b>. Share them between life support, the greenhouse, the storm shelter and the science lab. Press <b>Run Day</b> to see what happens.</p>
      <p>⚠️ Power is never enough for everything, so every choice has a cost.</p></div>
    <div class="card"><h2>Watch out for</h2>
      <p>☀️ <b>Radiation storms</b>: power the shelter when the forecast warns you.</p>
      <p>🌪️ <b>Dust storms</b>: less sunlight means less power.</p>
      <p>🚨 <b>Emergencies</b>: pick fast before the timer runs out!</p></div>
    <div class="card"><h2>After the mission</h2>
      <p>Research points you earn can buy upgrades for your next mission.</p></div>
    <div class="card"><h2>🌍 Real NASA science</h2>
      <p class="fact">The storms and dust storms are based on real, archived NASA records: DONKI space weather (May 2024 and Oct 2003 storms), the 1972 Apollo-era flare, and the 2018 Mars dust storm that stopped the Opportunity rover. They are not live data. Game numbers are simplified for play.</p></div>
    <button class="go" onclick="showMain()">◀ Back</button>`;
  window.scrollTo(0, 0);
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
  game.fx = { zap: true };
  render();
}
function startMission() {
  newGame();
}
// Rocket lift-off animation before the mission starts
function launch() {
  const l = document.querySelector(".hero .logo");
  if (!l || (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches))
    return startMission();
  l.classList.add("launch");
  setTimeout(startMission, 900);
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
  const ups = UPGRADES.map((u) => {
    const L = lv(u.key),
      cost = u.costs[L],
      maxed = cost === undefined;
    return `<div class="system"><div class="icon">${u.icon}</div>
      <div class="info"><b>${u.name}</b><small>${u.desc}</small><span class="pips">${"●".repeat(L)}${"○".repeat(u.costs.length - L)}</span></div>
      <button class="buy" onclick="buyUpgrade('${u.key}')" ${maxed || save.points < cost ? "disabled" : ""}>${maxed ? "Maxed" : "🔬 " + cost}</button></div>`;
  }).join("");
  const items = ITEMS.map(
    (it) => `<div class="system"><div class="icon">${it.icon}</div>
      <div class="info"><b>${it.name}</b><small>${it.desc}</small></div>
      <button class="buy" onclick="buyItem('${it.key}')" ${save.items[it.key] || save.points < it.cost ? "disabled" : ""}>${save.items[it.key] ? "Packed ✓" : "🔬 " + it.cost}</button></div>`,
  ).join("");
  app.innerHTML = `
    <h1>🚀 Mars Outpost</h1>
    <p class="sub">Get your crew through ${CONFIG.totalSols} days. Spend research points to make the next mission safer.</p>
    <div class="card"><h2>🔬 ${save.points} research points</h2>
      <p class="fact">Earn points from the science lab each mission, plus 10 for surviving.</p></div>
    <div class="card"><h2>Upgrades</h2><p class="fact">These stay forever.</p>${ups}</div>
    <div class="card"><h2>Pack for next mission</h2><p class="fact">These are used up on your next mission.</p>${items}</div>
    <button class="go" onclick="startMission()">Start mission ▶</button>
    <button class="go alt" onclick="showMain()">◀ Main menu</button>
    <p class="fact" style="text-align:center"><a href="#" onclick="resetSave();return false" style="color:inherit">Reset progress</a></p>`;
  window.scrollTo(0, 0);
}

/* ---------- ACTIVITIES: forecast, Earth quiz, rover mini-game ---------- */
function forecastStrip() {
  const look = game.warning ? 4 : 2; // days you can see (the satellite shows more)
  let tiles = "";
  for (let d = game.sol; d < game.sol + 4 && d <= CONFIG.totalSols; d++) {
    const known = d - game.sol < look,
      e = game.events[d];
    const icon = !known ? "❓" : e ? (e.type === "storm" ? "☀️" : "🌪️") : "🌤️";
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
          ? `<div class="advice storm">☀️ <b>Radiation storm tomorrow!</b> Plan to put 3 power into the Storm shelter tomorrow.</div>`
          : `<div class="advice dust">🌪️ <b>Dust storm tomorrow!</b> You will only have ${CONFIG.dustPower + lv("panels")} power. Stock up on air and food today.</div>`
        : `<div class="advice calm">🌤️ Tomorrow looks calm. A good time for science!</div>`;
  return `<div class="card"><h2>📡 Mission Control forecast</h2><div class="fgrid">${tiles}</div>${advice}</div>`;
}

function quizCard() {
  const d = game.sol,
    Q = QUIZ[game.quizOrder[(d - 1) % QUIZ.length]],
    res = game.quizRes[d];
  if (res) {
    const fresh = res.fresh;
    res.fresh = false;
    const fx =
      fresh && res.ok
        ? '<span class="burst b1">✨</span><span class="burst b2">⭐</span><span class="burst b3">✨</span><span class="flt good" style="left:40%;top:4px">🔬 +1</span>'
        : "";
    return `<div class="act ${fresh ? (res.ok ? "right" : "wrong") : ""}">${fx}<b>📡 Question from Earth</b><p class="fact">${res.ok ? "✅ Correct! +1 research point." : "❌ Not quite. The answer is: " + Q.right + "."} ${Q.why}</p></div>`;
  }
  if (!game.quizOpts[d])
    game.quizOpts[d] = [Q.right, ...Q.wrong].sort(() => Math.random() - 0.5);
  return `<div class="act"><b>📡 Quick question from Earth</b> <small>(+1 research point)</small><p>${Q.q}</p>
    ${game.quizOpts[d].map((o, i) => `<button class="opt" onclick="answerQuiz(${i})">${o}</button>`).join("")}</div>`;
}
function answerQuiz(i) {
  const d = game.sol,
    Q = QUIZ[game.quizOrder[(d - 1) % QUIZ.length]];
  const ok = game.quizOpts[d][i] === Q.right;
  game.quizRes[d] = { ok, fresh: true };
  if (ok) game.science++;
  render();
}

function roverButton() {
  if (game.roverDay === game.sol)
    return `<div class="act"><b>🤖 Rover</b><p class="fact">The rover is charging. Send it again tomorrow.</p></div>`;
  return `<button class="item" onclick="startRover()" ${used() >= power() ? "disabled" : ""}>🤖 Rover sample mission<br><small>Costs 1 power. Tap rocks to earn up to 4 research points.</small></button>`;
}
function startRover() {
  if (used() >= power() || game.roverDay === game.sol) return;
  game.roverDay = game.sol;
  game.bonus[game.sol] = (game.bonus[game.sol] || 0) - 1; // the rover uses 1 power
  render();
  let left = 10,
    got = 0;
  const box =
    popup(`<h2>🤖 Rover sample mission</h2><p>Tap the rocks before they roll away!</p>
    <div class="timer"><i></i></div>
    <p class="count">⏱️ <b>${left}</b>s · Samples: <span id="got">0</span></p><div class="arena"><div class="rover">🤖</div></div>`);
  const arena = box.querySelector(".arena"),
    gotEl = box.querySelector("#got"),
    num = box.querySelector(".count b"),
    bar = box.querySelector(".timer i");
  const sp = setInterval(() => {
    const r = document.createElement("button");
    r.className = "rock";
    r.textContent = "🪨";
    r.style.left = Math.random() * 80 + "%";
    r.style.top = Math.random() * 75 + "%";
    r.onclick = () => {
      got++;
      gotEl.textContent = got;
      gotEl.classList.remove("bump");
      void gotEl.offsetWidth;
      gotEl.classList.add("bump");
      const f = document.createElement("i");
      f.className = "plus1";
      f.textContent = "+1 🪨";
      f.style.left = r.style.left;
      f.style.top = r.style.top;
      arena.appendChild(f);
      setTimeout(() => f.remove(), 700);
      r.remove();
    };
    arena.appendChild(r);
    setTimeout(() => r.remove(), 1300);
  }, 650);
  const t = setInterval(() => {
    left--;
    num.textContent = left;
    bar.style.width = (left / 10) * 100 + "%";
    if (left > 0) return;
    clearInterval(t);
    clearInterval(sp);
    const pts = Math.min(4, Math.floor(got / 2));
    game.science += pts;
    box.querySelector(".alert").innerHTML =
      `<h2>🪨 ${got} samples collected!</h2>
      <div class="stage st-${pts ? "good" : "ok"}"><span>🤖</span><span>🪨</span><span>${pts ? "✨" : "😅"}</span></div>
      <p>${pts ? "+" + pts + " research points!" : "No points this time. Try again tomorrow!"}</p>
      <p class="fact">Real rovers like Curiosity and Perseverance collect rocks to study Mars. Their power is limited too.</p>
      <button class="go" id="ok">Back to base ▶</button>`;
    box.querySelector("#ok").onclick = () => {
      box.remove();
      render();
    };
  }, 1000);
}

/* ---------- DRAWING THE SCREEN ---------- */
function meter(icon, label, value, max, lowWhen) {
  const low = lowWhen(value);
  const shown = Number.isInteger(value) ? value : value.toFixed(1);
  return `<div class="meter ${low ? "low" : ""}">
    <div class="icon">${icon}</div>
    <div class="bar"><i style="width:${Math.max(0, (value / max) * 100)}%"></i></div>
    <div class="label">${label}: ${shown}</div></div>`;
}

function render() {
  if (game.result) return renderEnd();
  const ev = todayEvent(),
    next = game.events[game.sol + 1],
    p = power();
  const fx = game.fx || {}; // one-time effects (new day, battery zap, power change)
  game.fx = {};

  let eventCard = "";
  if (ev?.type === "storm")
    eventCard = `<div class="card warn"><h2>☀️ Radiation storm today!</h2><p><b>${ev.data.title}.</b> Radiation hits the base this day. Power the shelter to protect the crew.</p><p class="fact">${ev.data.fact}</p></div>`;
  if (ev?.type === "dust")
    eventCard = `<div class="card warn"><h2>🌪️ ${ev.data.title}!</h2><p>Dust blocks the Sun. Power drops to <b>${p} units</b> today.</p><p class="fact">${ev.data.fact}</p></div>`;

  const cells = Array.from(
    { length: Math.max(p, CONFIG.normalPower + lv("panels")) },
    (_, i) =>
      `<div class="cell ${i < used() ? "on" : ""} ${i >= p ? "dead" : ""}"></div>`,
  ).join("");

  const systems = SYSTEMS.map(
    (s) => `
    <div class="system">
      <div class="icon">${s.icon}</div>
      <div class="info"><b>${s.name}</b><small>${s.hint}</small></div>
      <div class="stepper">
        <button onclick="change('${s.key}',-1)" aria-label="Less power to ${s.name}" ${game.alloc[s.key] === 0 ? "disabled" : ""}>−</button>
        <span>${game.alloc[s.key]}</span>
        <button onclick="change('${s.key}',1)" aria-label="More power to ${s.name}" ${used() >= p || game.alloc[s.key] >= 4 ? "disabled" : ""}>+</button>
      </div>
    </div>`,
  ).join("");

  app.innerHTML = `
    <button class="back" onclick="quitMission()">◀ Menu</button>
    <h1>🚀 Mars Outpost</h1>
    <p class="sub">Keep your crew alive for ${CONFIG.totalSols} days on Mars.</p>
    <div class="card">
      <div class="progress"><i style="width:${(game.sol / CONFIG.totalSols) * 100}%"></i></div>
      <p class="fact">Day ${game.sol} of ${CONFIG.totalSols} · Research points: <b>${game.science}</b></p>
      <div class="meters ${fx.fresh ? "fresh" : ""}">
        ${meter("💨", "Air", game.air, game.maxStock, (v) => v <= 3)}
        ${meter("🍎", "Food", game.food, game.maxStock, (v) => v <= 3)}
        ${meter("☢️", "Radiation", game.dose, CONFIG.doseLimit, (v) => v >= 6)}
      </div>
      <p class="fact">Radiation dose never goes down. At ${CONFIG.doseLimit}, the crew must go home.</p>
    </div>
    ${game.report ? `<div class="card news ${fx.fresh ? "slide" : ""}">${game.report}</div>` : ""}
    <div class="card">${baseScene(false, fx)}</div>
    ${forecastStrip()}
    ${game.penalty[game.sol] ? `<div class="card warn"><h2>🔧 Damage from yesterday</h2><p>Broken equipment means <b>${game.penalty[game.sol]} less power</b> today.</p></div>` : ""}
    ${eventCard}
    <div class="card">
      <h2>⚡ Power: ${used()} of ${p} units</h2>
      <div class="cells ${fx.zap ? "zap" : ""}">${cells}</div>
      ${systems}
      <p class="fact">📡 Messages from Earth take about ${DELAYS[game.sol % 4]} to arrive, so you decide.</p>
      <div class="acts">${quizCard()}${roverButton()}</div>
      ${game.battery > 0 && game.batteryDay !== game.sol ? `<button class="item" onclick="useBattery()">🔋 Use battery pack (+3 power today)</button>` : ""}
      <button class="go" onclick="runSol()">Run Day ${game.sol} ▶</button>
    </div>`;
}

function renderEnd() {
  const msg = {
    win: `🎉 You made it! ${game.science} research points.`,
    air: "💨 The air ran out.",
    food: "🍎 The food ran out.",
    dose: "☢️ The crew reached the radiation limit and had to go home.",
  }[game.result];
  const endVis = {
    win: ["🏠", "🎉", "🧑‍🚀"],
    air: ["🏠", "💨", "😵"],
    food: ["🏠", "🥀", "😫"],
    dose: ["☢️", "🚀", "🌍"],
  }[game.result];
  const endKind = game.result === "win" ? "good" : "bad";
  app.innerHTML = `
    ${game.result === "win" ? confetti() : ""}
    <h1>${msg}</h1>
    <div class="stage st-${endKind}">${endVis.map((e, i) => `<span style="animation-delay:${i * 0.15}s">${e}</span>`).join("")}</div>
    <div class="card"><h2>What you learned</h2>
      <p>🔋 <b>Power is limited.</b> Every unit for science was a unit not used to stay safe.</p>
      <p>☢️ <b>Space weather matters.</b> Mission planners watch NASA’s DONKI database for flares, then decide when to shelter.</p>
      <p>🌪️ <b>Mars can surprise you.</b> Dust storms cut solar power, like the one in 2018 that stopped the Opportunity rover.</p>
      <p>📡 <b>Help is far away.</b> Signals between Earth and Mars take 3 to 22 minutes, so crews decide on their own.</p>
    </div>
    <div class="card news"><h2>🔬 You earned ${game.earned} research points!</h2>
      <p>${game.science} from science${game.result === "win" ? " + 10 for surviving" : ""}. You now have <b>${save.points}</b> to spend.</p></div>
    <button class="go" onclick="showMenu()">Upgrade menu 🔧</button>
    <button class="go alt" onclick="startMission()">Play again now</button>
    <button class="go alt" onclick="showMain()">◀ Main menu</button>`;
}

showMain();
