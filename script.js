/* Version: #3 */

// === KONSTANTER OG GLOBAL TILSTAND ===
const SUITS = ['♠', '♣', '♥', '♦'];
const VALUES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

let deck = [];
let history = new Set(); // Lagrer hasher av tidligere stokkinger
let attempts = 0;
let duplicates = 0;
let isSimulating = false;
let simulationInterval = null;

// DOM Elementer
const visualDeck = document.getElementById('visual-deck');
const totalAttemptsEl = document.getElementById('total-attempts');
const uniqueCombinationsEl = document.getElementById('unique-combinations');
const duplicatesFoundEl = document.getElementById('duplicates-found');
const startBtn = document.getElementById('start-simulation-btn');
const stopBtn = document.getElementById('stop-simulation-btn');
const shuffleBtn = document.getElementById('shuffle-once-btn');
const resetBtn = document.getElementById('reset-btn');

// === INNITIELISERING ===
function init() {
    console.log("[System] Initialiserer kortstokk...");
    createDeck();
    renderDeck();
    console.log("[System] Klar til start. Totalt mulige kombinasjoner: 52!");
}

// Oppretter en standard kortstokk
function createDeck() {
    deck = [];
    for (let suit of SUITS) {
        for (let value of VALUES) {
            deck.push({ suit, value, color: (suit === '♥' || suit === '♦') ? 'card-red' : 'card-black' });
        }
    }
    console.log("[Deck] Ny kortstokk generert: 52 kort.");
}

// === KJERNEFUNKSJONALITET ===

/**
 * Fisher-Yates Shuffle Algoritme
 * Sikrer genuin tilfeldighet ved å bytte elementer bakover.
 */
function shuffle() {
    console.time("Shuffle-Time");
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    console.timeEnd("Shuffle-Time");
}

/**
 * Genererer en unik hash (SHA-256) av kortstokk-rekkefølgen.
 * Dette er nødvendig for å sjekke duplikater uten å lagre enorme strenger.
 */
async function getDeckHash() {
    const deckString = deck.map(c => c.value + c.suit).join('|');
    const msgUint8 = new TextEncoder().encode(deckString);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function processShuffle() {
    attempts++;
    shuffle();
    
    const hash = await getDeckHash();
    
    if (history.has(hash)) {
        duplicates++;
        console.warn(`[MATCH] WOW! Fant et duplikat etter ${attempts} forsøk! Hash: ${hash}`);
    } else {
        history.add(hash);
    }

    updateUI();
}

// === UI OPPDATERING ===
function renderDeck() {
    visualDeck.innerHTML = '';
    deck.forEach(card => {
        const cardDiv = document.createElement('div');
        cardDiv.className = `card-mini ${card.color}`;
        cardDiv.textContent = card.value + card.suit;
        visualDeck.appendChild(cardDiv);
    });
}

function updateUI() {
    totalAttemptsEl.textContent = attempts.toLocaleString();
    uniqueCombinationsEl.textContent = history.size.toLocaleString();
    duplicatesFoundEl.textContent = duplicates.toLocaleString();
    
    // Vi rendrer kun visuelt av og til under simulering for ytelse
    if (!isSimulating || attempts % 10 === 0) {
        renderDeck();
    }
}

// === KONTROLLER ===
async function runSingleShuffle() {
    console.log("[Action] Utfører manuell stokking...");
    await processShuffle();
}

function startSimulation() {
    console.log("[Action] Starter hurtig-simulering...");
    isSimulating = true;
    startBtn.disabled = true;
    stopBtn.disabled = false;
    shuffleBtn.disabled = true;

    simulationInterval = setInterval(async () => {
        await processShuffle();
    }, 50); // 20 stokkinger i sekundet
}

function stopSimulation() {
    console.log("[Action] Stopper simulering.");
    isSimulating = false;
    startBtn.disabled = false;
    stopBtn.disabled = true;
    shuffleBtn.disabled = false;
    clearInterval(simulationInterval);
}

function resetData() {
    if (confirm("Er du sikker på at du vil nullstille all statistikk?")) {
        console.log("[System] Nullstiller data...");
        attempts = 0;
        duplicates = 0;
        history.clear();
        createDeck();
        updateUI();
        renderDeck();
    }
}

// Event Listeners
shuffleBtn.addEventListener('click', runSingleShuffle);
startBtn.addEventListener('click', startSimulation);
stopBtn.addEventListener('click', stopSimulation);
resetBtn.addEventListener('click', resetData);

// Start appen
init();

/* Version: #3 */
