/* Version: #4 */

// === KONSTANTER OG GLOBAL TILSTAND ===
const SUITS = ['♠', '♣', '♥', '♦'];
const VALUES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

let deck = [];
let history = new Set(); 
let attempts = 0;
let duplicates = 0;
let isSimulating = false;

// Ytelsesvariabler
let lastTimestamp = 0;
let batchSize = 500; // Antall stokkinger per frame

// DOM Elementer
const visualDeck = document.getElementById('visual-deck');
const totalAttemptsEl = document.getElementById('total-attempts');
const uniqueCombinationsEl = document.getElementById('unique-combinations');
const duplicatesFoundEl = document.getElementById('duplicates-found');
const startBtn = document.getElementById('start-simulation-btn');
const stopBtn = document.getElementById('stop-simulation-btn');
const shuffleBtn = document.getElementById('shuffle-once-btn');
const resetBtn = document.getElementById('reset-btn');

// === INITIALISERING ===
function init() {
    console.log("[System] Versjon #4 starter. Optimaliserer for hastighet...");
    createDeck();
    renderDeck();
}

function createDeck() {
    deck = [];
    for (let suit of SUITS) {
        for (let value of VALUES) {
            deck.push({ suit, value, color: (suit === '♥' || suit === '♦') ? 'card-red' : 'card-black' });
        }
    }
}

// === KJERNEFUNKSJONALITET (OPTIMALISERT) ===

function fastShuffle(targetDeck) {
    // Fisher-Yates in-place
    for (let i = targetDeck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = targetDeck[i];
        targetDeck[i] = targetDeck[j];
        targetDeck[j] = temp;
    }
}

function getQuickHash(targetDeck) {
    // For ekstrem hastighet bruker vi en enkel streng-join i batchen.
    // SHA-256 er for treg for 5000+ iterasjoner i sekundet i hovedtråden.
    return targetDeck.map(c => c.value + c.suit).join('');
}

/**
 * Hovedløkke for simulering
 * Kjører så fort nettleseren tillater (ca 60 FPS), med mange stokkinger per frame.
 */
function simulationLoop(timestamp) {
    if (!isSimulating) return;

    // Beregn SPS (Stokkinger per sekund) for logging
    if (lastTimestamp === 0) lastTimestamp = timestamp;
    const deltaTime = timestamp - lastTimestamp;

    // Kjør en "batch" med tunge operasjoner
    for (let i = 0; i < batchSize; i++) {
        attempts++;
        fastShuffle(deck);
        
        const hash = getQuickHash(deck);
        if (history.has(hash)) {
            duplicates++;
            console.warn(`[DUPLIKAT FUNNET] Forsøk nr: ${attempts}`);
        } else {
            history.add(hash);
        }
    }

    // Oppdater grensesnitt
    updateUI();

    if (deltaTime >= 1000) {
        console.log(`[Performance] SPS: ${Math.round((batchSize / deltaTime) * 1000 * 60)}`);
        lastTimestamp = timestamp;
    }

    requestAnimationFrame(simulationLoop);
}

// === UI OPPDATERING ===
function renderDeck() {
    visualDeck.innerHTML = '';
    // Vis kun de første 13 kortene under hurtigsimulering for å spare CPU
    const displayLimit = isSimulating ? 13 : 52;
    
    for (let i = 0; i < displayLimit; i++) {
        const card = deck[i];
        const cardDiv = document.createElement('div');
        cardDiv.className = `card-mini ${card.color}`;
        cardDiv.textContent = card.value + card.suit;
        visualDeck.appendChild(cardDiv);
    }
}

function updateUI() {
    totalAttemptsEl.textContent = attempts.toLocaleString();
    uniqueCombinationsEl.textContent = history.size.toLocaleString();
    duplicatesFoundEl.textContent = duplicates.toLocaleString();
    
    // Oppdaterer kortvisning (men ikke for ofte for å spare ressurser)
    if (attempts % 1000 === 0 || !isSimulating) {
        renderDeck();
    }
}

// === KONTROLLER ===
function startSimulation() {
    console.log("[Action] Starter turbo-simulering...");
    isSimulating = true;
    lastTimestamp = 0;
    startBtn.disabled = true;
    stopBtn.disabled = false;
    shuffleBtn.disabled = true;
    
    requestAnimationFrame(simulationLoop);
}

function stopSimulation() {
    console.log("[Action] Stopper simulering.");
    isSimulating = false;
    startBtn.disabled = false;
    stopBtn.disabled = true;
    shuffleBtn.disabled = false;
}

function resetData() {
    if (confirm("Nullstille all statistikk?")) {
        attempts = 0;
        duplicates = 0;
        history.clear();
        updateUI();
        renderDeck();
        console.log("[System] Data slettet.");
    }
}

// Event Listeners
shuffleBtn.addEventListener('click', () => {
    attempts++;
    fastShuffle(deck);
    history.add(getQuickHash(deck));
    updateUI();
    renderDeck();
});
startBtn.addEventListener('click', startSimulation);
stopBtn.addEventListener('click', stopSimulation);
resetBtn.addEventListener('click', resetData);

init();

/* Version: #4 */
