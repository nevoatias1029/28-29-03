const $ = id => document.getElementById(id);

const API = {
    async fetchHP() {
        const res = await fetch("https://hp-api.onrender.com/api/characters");
        console.log(res);
        if (res.status !== 200) throw new Error(`HP API error: ${res.status}`);
        const data = await res.json();
        return data.filter(c => c.image?.trim()).slice(0, 6).map(c => ({ url: c.image, name: c.name }));
    },

    async fetchDogs() {
        const res = await fetch("https://dog.ceo/api/breeds/image/random/6");
        console.log(res);
        if (res.status !== 200) throw new Error(`Dogs API error: ${res.status}`);
        const { message } = await res.json();
        return message.map((url, i) => ({ url, name: `Dog ${i + 1}` }));
    },

    async fetchFlags() {
        const res = await fetch("https://restcountries.com/v3.1/all?fields=name,flags");
        console.log(res);
        if (res.status !== 200) throw new Error(`Flags API error: ${res.status}`);
        const data = await res.json();
        return data
            .filter(c => c.flags?.png && c.name?.common)
            .sort(() => Math.random() - 0.5)
            .slice(0, 6)
            .map(c => ({ url: c.flags.png, name: c.name.common }));
    }
};

const THEMES = {
    hp: { fetch: () => API.fetchHP(), title: "⚡ Harry Potter" },
    dogs: { fetch: () => API.fetchDogs(), title: "🐶 Dogs" },
    flags: { fetch: () => API.fetchFlags(), title: "🌍 Flags" }
};

class MemoryGame {
    constructor(images, title) {
        this.images = images;
        this.title = title;
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.moves = 0;
        this.isLocked = false;
        this.seconds = 0;
        this.timerInterval = null;
    }

    init() {
        clearInterval(this.timerInterval);
        Object.assign(this, { cards: [], flippedCards: [], matchedPairs: 0, moves: 0, isLocked: false, seconds: 0 });

        this.cards = [...this.images, ...this.images]
            .sort(() => Math.random() - 0.5)
            .map((img, i) => ({ id: i, ...img, isFlipped: false, isMatched: false }));

        const board = $("game-board");
        board.innerHTML = "";
        $("game-title").textContent = this.title;
        $("moves-count").textContent = "0";
        $("timer").textContent = "0:00";
        this.cards.forEach(card => board.appendChild(this._createCard(card)));

        this.timerInterval = setInterval(() => {
            this.seconds++;
            const m = Math.floor(this.seconds / 60);
            const s = String(this.seconds % 60).padStart(2, "0");
            $("timer").textContent = `${m}:${s}`;
        }, 1000);
    }

    stopTimer() { clearInterval(this.timerInterval); }

    _createCard(card) {
        const el = document.createElement("div");
        el.className = "card";
        el.innerHTML = `
            <div class="card-inner">
                <div class="card-front">🃏</div>
                <div class="card-back">
                    <img src="${card.url}" alt="${card.name}"
                         onerror="this.style.display='none'; this.parentElement.style.background='#2d3748';">
                    <span class="card-label">${card.name}</span>
                </div>
            </div>`;
        el.addEventListener("click", () => this._flip(el, card));
        return el;
    }

    _flip(el, card) {
        if (this.isLocked || card.isFlipped || card.isMatched || this.flippedCards.length >= 2) return;
        card.isFlipped = true;
        el.classList.add("flipped");
        this.flippedCards.push({ el, card });

        if (this.flippedCards.length === 2) {
            this.moves++;
            $("moves-count").textContent = this.moves;
            this._check();
        }
    }

    _check() {
        this.isLocked = true;
        const [a, b] = this.flippedCards;

        if (a.card.url === b.card.url) {
            a.card.isMatched = b.card.isMatched = true;
            a.el.classList.add("matched");
            b.el.classList.add("matched");
            this.flippedCards = [];
            this.isLocked = false;
            if (++this.matchedPairs === 6) {
                this.stopTimer();
                setTimeout(() => {
                    const m = Math.floor(this.seconds / 60);
                    const s = String(this.seconds % 60).padStart(2, "0");
                    $("win-stats").textContent = `You finished in ${this.moves} moves and ${m}:${s}!`;
                    $("win-modal").classList.remove("hidden");
                }, 600);
            }
        } else {
            setTimeout(() => {
                a.card.isFlipped = b.card.isFlipped = false;
                a.el.classList.remove("flipped");
                b.el.classList.remove("flipped");
                this.flippedCards = [];
                this.isLocked = false;
            }, 1000);
        }
    }
}

let currentGame = null;

function showScreen(id) {
    document.querySelectorAll(".screen").forEach(s => s.classList.add("hidden"));
    $(id).classList.remove("hidden");
}

async function startGame(type) {
    if (type === "random") {
        const keys = Object.keys(THEMES);
        type = keys[Math.floor(Math.random() * keys.length)];
    }
    showScreen("loading-screen");
    try {
        const theme = THEMES[type];
        if (!theme) throw new Error(`Unknown theme: ${type}`);
        const images = await theme.fetch();
        if (!images || images.length < 6) throw new Error("Not enough images.");
        currentGame = new MemoryGame(images, theme.title);
        showScreen("game-screen");
        currentGame.init();
    } catch (err) {
        console.error(err);
        alert("Could not load images. Please check your internet connection and try again.");
        showScreen("selection-screen");
    }
}

document.addEventListener("click", e => {
    const btn = e.target.closest(".option-btn");
    if (btn) return startGame(btn.dataset.type);

    const id = e.target.id;
    if (id === "restart-btn" || id === "play-again-btn") {
        $("win-modal").classList.add("hidden");
        currentGame?.init();
    } else if (id === "back-btn" || id === "change-theme-btn") {
        $("win-modal").classList.add("hidden");
        currentGame?.stopTimer();
        showScreen("selection-screen");
    }
});
