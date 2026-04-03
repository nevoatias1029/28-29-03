const API = {
    async fetchHP() {
        const res = await fetch("https://hp-api.onrender.com/api/characters");
        if (!res.ok) throw new Error(`HP API error: ${res.status}`);
        const data = await res.json();
        return data
            .filter(c => c.image && c.image.trim() !== "")
            .slice(0, 6)
            .map(c => ({ url: c.image, name: c.name }));
    },

    async fetchDogs() {
        const res = await fetch("https://dog.ceo/api/breeds/image/random/6");
        if (!res.ok) throw new Error(`Dogs API error: ${res.status}`);
        const data = await res.json();
        return data.message.map((url, i) => ({ url, name: `Dog ${i + 1}` }));
    },

    async fetchFlags() {
        const res = await fetch("https://restcountries.com/v3.1/all?fields=name,flags");
        if (!res.ok) throw new Error(`Flags API error: ${res.status}`);
        const data = await res.json();
        const shuffled = data
            .filter(c => c.flags && c.flags.png && c.name && c.name.common)
            .sort(() => Math.random() - 0.5);
        return shuffled.slice(0, 6).map(c => ({ url: c.flags.png, name: c.name.common }));
    }
};

const THEMES = {
    hp: { fetch: API.fetchHP.bind(API), title: "⚡ Harry Potter" },
    dogs: { fetch: API.fetchDogs.bind(API), title: "🐶 Dogs" },
    flags: { fetch: API.fetchFlags.bind(API), title: "🌍 Flags" }
};

class MemoryGame {
    constructor(images, title) {
        this.title = title;
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.moves = 0;
        this.isLocked = false;
        this.seconds = 0;
        this.timerInterval = null;
        this._images = images;
    }

    init() {
        this._resetState();
        this._buildCards();
        this._renderBoard();
        this._startTimer();
    }

    stopTimer() {
        clearInterval(this.timerInterval);
    }

    _resetState() {
        this.stopTimer();
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.moves = 0;
        this.isLocked = false;
        this.seconds = 0;
    }

    _buildCards() {
        const selected = this._images;
        this.cards = [...selected, ...selected]
            .sort(() => Math.random() - 0.5)
            .map((img, index) => ({
                id: index,
                url: img.url,
                name: img.name,
                isFlipped: false,
                isMatched: false
            }));
    }

    _renderBoard() {
        const board = document.getElementById("game-board");
        board.innerHTML = "";
        document.getElementById("game-title").textContent = this.title;
        document.getElementById("moves-count").textContent = "0";
        document.getElementById("timer").textContent = "0:00";
        this.cards.forEach(card => board.appendChild(this._createCardEl(card)));
    }

    _createCardEl(card) {
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
        el.addEventListener("click", () => this._handleFlip(el, card));
        return el;
    }

    _handleFlip(el, card) {
        if (this.isLocked || card.isFlipped || card.isMatched || this.flippedCards.length >= 2) return;

        card.isFlipped = true;
        el.classList.add("flipped");
        this.flippedCards.push({ el, card });

        if (this.flippedCards.length === 2) {
            this.moves++;
            document.getElementById("moves-count").textContent = this.moves;
            this._checkMatch();
        }
    }

    _checkMatch() {
        this.isLocked = true;
        const [a, b] = this.flippedCards;

        if (a.card.url === b.card.url) {
            a.card.isMatched = b.card.isMatched = true;
            a.el.classList.add("matched");
            b.el.classList.add("matched");
            this.matchedPairs++;
            this.flippedCards = [];
            this.isLocked = false;
            if (this.matchedPairs === 6) {
                this.stopTimer();
                setTimeout(() => this._showWin(), 600);
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

    _formatTime() {
        const m = Math.floor(this.seconds / 60);
        const s = this.seconds % 60;
        return `${m}:${String(s).padStart(2, "0")}`;
    }

    _startTimer() {
        this.timerInterval = setInterval(() => {
            this.seconds++;
            document.getElementById("timer").textContent = this._formatTime();
        }, 1000);
    }

    _showWin() {
        document.getElementById("win-stats").textContent =
            `You finished in ${this.moves} moves and ${this._formatTime()}!`;
        document.getElementById("win-modal").classList.remove("hidden");
    }
}

let currentGame = null;

function showScreen(id) {
    document.querySelectorAll(".screen").forEach(s => s.classList.add("hidden"));
    document.getElementById(id).classList.remove("hidden");
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
    const optionBtn = e.target.closest(".option-btn");
    if (optionBtn) return startGame(optionBtn.dataset.type);

    const id = e.target.id;
    if (id === "restart-btn") {
        if (currentGame) {
            document.getElementById("win-modal").classList.add("hidden");
            currentGame.init();
        }
    } else if (id === "back-btn") {
        if (currentGame) currentGame.stopTimer();
        showScreen("selection-screen");
    } else if (id === "play-again-btn") {
        document.getElementById("win-modal").classList.add("hidden");
        if (currentGame) currentGame.init();
    } else if (id === "change-theme-btn") {
        document.getElementById("win-modal").classList.add("hidden");
        if (currentGame) currentGame.stopTimer();
        showScreen("selection-screen");
    }
});