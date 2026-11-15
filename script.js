class WhackAMoleGame {
    constructor() {
        this.score = 0;
        this.timeLeft = 30;
        this.gameActive = false;
        this.difficulty = 'easy';
        this.activeMoles = new Set();
        this.gameTimer = null;
        this.moleTimer = null;

        this.difficultySettings = {
            easy: { time: 30, speed: 800, holes: 8 },
            medium: { time: 25, speed: 600, holes: 9 },
            hard: { time: 20, speed: 400, holes: 16 }
        };

        this.initElements();
        this.createHoles();
        this.attachEventListeners();
    }

    initElements() {
        this.gameBoard = document.getElementById('gameBoard');
        this.scoreDisplay = document.getElementById('score');
        this.timerDisplay = document.getElementById('timer');
        this.difficultyDisplay = document.getElementById('difficulty');
        this.startBtn = document.getElementById('startBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.gameOverModal = document.getElementById('gameOverModal');
        this.finalScoreDisplay = document.getElementById('finalScore');
        this.gameMessageDisplay = document.getElementById('gameMessage');
    }

    createHoles() {
        this.gameBoard.innerHTML = '';
        const numHoles = this.difficultySettings[this.difficulty].holes;

        for (let i = 0; i < numHoles; i++) {
            const hole = document.createElement('div');
            hole.className = 'hole';
            hole.id = `hole-${i}`;
            hole.innerHTML = `
                <div class="mole">
                    <div class="mole-body">🐭</div>
                </div>
            `;
            hole.addEventListener('click', () => this.hitMole(hole));
            this.gameBoard.appendChild(hole);
        }
    }

    attachEventListeners() {
        this.startBtn.addEventListener('click', () => this.startGame());
        this.resetBtn.addEventListener('click', () => this.resetGame());

        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.changeDifficulty(e.target));
        });
    }

    changeDifficulty(btn) {
        document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.difficulty = btn.dataset.difficulty;
        
        const difficultyNames = { easy: '簡單', medium: '中等', hard: '困難' };
        this.difficultyDisplay.textContent = difficultyNames[this.difficulty];

        if (!this.gameActive) {
            this.createHoles();
        }
    }

    startGame() {
        this.score = 0;
        this.timeLeft = this.difficultySettings[this.difficulty].time;
        this.gameActive = true;
        this.activeMoles.clear();

        this.startBtn.disabled = true;
        this.resetBtn.disabled = false;
        document.querySelectorAll('.difficulty-btn').forEach(btn => btn.disabled = true);

        this.updateDisplay();
        this.startGameTimer();
        this.spawnMole();
    }

    startGameTimer() {
        this.gameTimer = setInterval(() => {
            this.timeLeft--;
            this.updateDisplay();

            if (this.timeLeft <= 0) {
                this.endGame();
            }
        }, 1000);
    }

    spawnMole() {
        if (!this.gameActive) return;

        const holes = document.querySelectorAll('.hole');
        const randomIndex = Math.floor(Math.random() * holes.length);
        const randomHole = holes[randomIndex];

        if (!this.activeMoles.has(randomIndex)) {
            this.activeMoles.add(randomIndex);
            randomHole.classList.add('active');

            const duration = this.difficultySettings[this.difficulty].speed;
            const hideTimer = setTimeout(() => {
                randomHole.classList.remove('active');
                this.activeMoles.delete(randomIndex);
            }, duration);

            randomHole.dataset.hideTimer = hideTimer;
        }

        const nextSpawn = this.difficultySettings[this.difficulty].speed * 0.5;
        this.moleTimer = setTimeout(() => this.spawnMole(), nextSpawn);
    }

    hitMole(hole) {
        if (!this.gameActive) return;

        const holeIndex = parseInt(hole.id.split('-')[1]);

        if (hole.classList.contains('active')) {
            this.score++;
            this.updateDisplay();

            hole.classList.remove('active');
            this.activeMoles.delete(holeIndex);

            if (hole.dataset.hideTimer) {
                clearTimeout(hole.dataset.hideTimer);
                delete hole.dataset.hideTimer;
            }

            this.showHitEffect(hole);
        }
    }

    showHitEffect(hole) {
        const effect = document.createElement('div');
        effect.className = 'hit-effect';
        effect.textContent = '+1 🎉';
        hole.appendChild(effect);

        setTimeout(() => effect.remove(), 600);
    }

    updateDisplay() {
        this.scoreDisplay.textContent = this.score;
        this.timerDisplay.textContent = this.timeLeft;
    }

    endGame() {
        this.gameActive = false;
        clearInterval(this.gameTimer);
        clearTimeout(this.moleTimer);

        this.startBtn.disabled = false;
        this.resetBtn.disabled = true;
        document.querySelectorAll('.difficulty-btn').forEach(btn => btn.disabled = false);
        document.querySelectorAll('.hole').forEach(hole => {
            hole.classList.remove('active');
            if (hole.dataset.hideTimer) {
                clearTimeout(hole.dataset.hideTimer);
            }
        });
        this.activeMoles.clear();

        this.showGameOverModal();
    }

    showGameOverModal() {
        const messages = [
            this.score === 0 ? '加油！下次會更好！' :
            this.score < 10 ? '不錯啊！' :
            this.score < 20 ? '很棒！' :
            this.score < 30 ? '太厲害了！🌟' :
            '你是打地鼠大師！👑'
        ];

        this.finalScoreDisplay.textContent = this.score;
        this.gameMessageDisplay.textContent = messages[0];
        this.gameOverModal.style.display = 'flex';
    }

    resetGame() {
        if (this.gameTimer) clearInterval(this.gameTimer);
        if (this.moleTimer) clearTimeout(this.moleTimer);

        this.gameActive = false;
        this.score = 0;
        this.timeLeft = this.difficultySettings[this.difficulty].time;
        this.activeMoles.clear();

        document.querySelectorAll('.hole').forEach(hole => {
            hole.classList.remove('active');
            if (hole.dataset.hideTimer) {
                clearTimeout(hole.dataset.hideTimer);
            }
        });

        this.updateDisplay();
        this.startBtn.disabled = false;
        this.resetBtn.disabled = true;
        document.querySelectorAll('.difficulty-btn').forEach(btn => btn.disabled = false);
    }
}

// 初始化遊戲
document.addEventListener('DOMContentLoaded', () => {
    new WhackAMoleGame();
});