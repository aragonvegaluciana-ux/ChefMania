const app = {
    state: {
        lives: 3,
        xp: 0,
        coins: 0,
        completedRecipes: 0,
        unlockedLevels: [1],
        achievements: [],
        powerups: { extraTime: false },
        levelScores: {}
    },
    
    categories: [
        { id: 'basics', name: 'Técnicas Básicas' },
        { id: 'advanced', name: 'Platos Avanzados' }
    ],

    levels: [
        {
            id: 1,
            categoryId: 'basics',
            title: "Cortando Tomates",
            desc: "Pica todos los tomates antes de que se acabe el tiempo.",
            icon: "🍅",
            time: 10,
            targetClicks: 15
        },
        {
            id: 2,
            categoryId: 'basics',
            title: "Sopa de Verduras",
            desc: "Selecciona los ingredientes correctos para la sopa.",
            icon: "🍲",
            time: 15,
            targetClicks: 10
        },
        {
            id: 3,
            categoryId: 'advanced',
            title: "Pizza Margherita",
            desc: "Amasa y prepara la pizza perfecta.",
            icon: "🍕",
            time: 20,
            targetClicks: 20
        }
    ],

    currentGame: {
        id: null,
        initialTime: 0,
        timer: null,
        timeLeft: 0,
        clicks: 0,
        targetClicks: 0,
        mistakes: 0
    },

    init() {
        this.updateHeaderStats();
        this.renderLevelMap();
        this.renderAchievements();
    },

    // Navegación
    showView(viewId) {
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active-view', 'hidden'));
        document.querySelectorAll('.view').forEach(v => {
            if(v.id !== viewId) v.classList.add('hidden');
        });
        document.getElementById(viewId).classList.add('active-view');
        
        if (viewId === 'profile-view') {
            this.updateProfileStats();
        }
    },

    // Actualizaciones de UI
    updateHeaderStats() {
        document.getElementById('lives-display').innerText = this.state.lives;
        document.getElementById('xp-display').innerText = this.state.xp;
        document.getElementById('coins-display').innerText = this.state.coins;
    },

    updateProfileStats() {
        document.getElementById('profile-xp').innerText = this.state.xp;
        document.getElementById('profile-recipes').innerText = this.state.completedRecipes;
        
        let rank = "Principiante";
        if(this.state.xp > 50) rank = "Cocinero Novato";
        if(this.state.xp > 150) rank = "Chef de Partie";
        document.getElementById('profile-level').innerText = rank;
    },

    // Generar Mapa de Niveles
    renderLevelMap() {
        const container = document.getElementById('level-map-container');
        container.innerHTML = '';

        this.categories.forEach(category => {
            const categoryLevels = this.levels.filter(l => l.categoryId === category.id);
            if (categoryLevels.length === 0) return;

            const catContainer = document.createElement('div');
            catContainer.className = 'category-section';
            
            const catTitle = document.createElement('h3');
            catTitle.className = 'category-title';
            catTitle.innerText = category.name;
            catContainer.appendChild(catTitle);

            const mapWrapper = document.createElement('div');
            mapWrapper.className = 'category-map';

            categoryLevels.forEach((level, index) => {
                const isUnlocked = this.state.unlockedLevels.includes(level.id);
                const isCompleted = this.state.unlockedLevels.includes(level.id + 1) || this.state.completedRecipes >= level.id;
                const scoreData = this.state.levelScores[level.id];
                
                const node = document.createElement('div');
                node.className = `node ${isUnlocked ? '' : 'locked'} ${isCompleted ? 'active' : ''}`;
                node.onclick = () => isUnlocked ? this.startGame(level.id) : this.showFeedback('Nivel Bloqueado', 'Completa los niveles anteriores para desbloquear esta receta.');
                
                let starsHTML = '';
                if (scoreData) {
                    const stars = scoreData.stars;
                    starsHTML = `<div class="node-stars">
                        <span class="${stars >= 1 ? 'earned' : ''}">★</span>
                        <span class="${stars >= 2 ? 'earned' : ''}">★</span>
                        <span class="${stars >= 3 ? 'earned' : ''}">★</span>
                    </div>`;
                }

                node.innerHTML = `
                    <div class="node-icon">${level.icon}</div>
                    <div class="node-title">${level.title}</div>
                    ${starsHTML}
                `;
                mapWrapper.appendChild(node);

                if (index < categoryLevels.length - 1) {
                    const connector = document.createElement('div');
                    connector.className = `connector ${isCompleted ? 'active' : ''}`;
                    mapWrapper.appendChild(connector);
                }
            });

            catContainer.appendChild(mapWrapper);
            container.appendChild(catContainer);
        });
    },

    renderAchievements() {
        const container = document.getElementById('achievements-container');
        container.innerHTML = `
            <div class="achievement ${this.state.completedRecipes > 0 ? 'unlocked' : ''}">
                <div class="achievement-icon">🔪</div>
                <div class="achievement-name">Primer Corte</div>
            </div>
            <div class="achievement ${this.state.xp >= 100 ? 'unlocked' : ''}">
                <div class="achievement-icon">🌟</div>
                <div class="achievement-name">Cien Estrellas</div>
            </div>
        `;
    },

    // Lógica del Juego
    startGame(levelId) {
        if(this.state.lives <= 0) {
            this.showFeedback('¡Sin Vidas!', 'Espera a que se recarguen tus vidas para seguir jugando.', true);
            return;
        }

        const level = this.levels.find(l => l.id === levelId);
        if(!level) return;

        let levelTime = level.time;
        if (this.state.powerups.extraTime) {
            levelTime += 5;
            this.state.powerups.extraTime = false; // Consumir el powerup
            document.getElementById('badge-time').classList.add('hidden'); // Ocultar badge
            this.showFeedback('¡Mejora Activa!', 'Tienes +5 Segundos adicionales en este nivel.');
        }

        this.currentGame = {
            id: level.id,
            initialTime: levelTime,
            timeLeft: levelTime,
            clicks: 0,
            targetClicks: level.targetClicks,
            mistakes: 0
        };

        document.getElementById('game-task-title').innerText = level.title;
        document.getElementById('game-task-desc').innerText = level.desc;
        document.getElementById('time-left').innerText = `00:${levelTime < 10 ? '0'+levelTime : levelTime}`;
        document.getElementById('game-progress-bar').style.width = '0%';

        this.setupMinigame();
        this.showView('game-view');

        this.currentGame.timer = setInterval(() => {
            this.currentGame.timeLeft--;
            const t = this.currentGame.timeLeft;
            document.getElementById('time-left').innerText = `00:${t < 10 ? '0'+t : t}`;
            
            if (t <= 0) {
                this.endGame(false);
            }
        }, 1000);
    },

    setupMinigame() {
        const area = document.getElementById('game-area');
        area.innerHTML = '';
        const level = this.levels.find(l => l.id === this.currentGame.id);

        if (level.id === 1) {
            // Clicker game
            const target = document.createElement('div');
            target.className = 'clicker-target';
            target.innerText = level.icon;
            target.onclick = () => {
                this.currentGame.clicks++;
                
                // Animar el objetivo
                target.style.transform = 'scale(0.8)';
                setTimeout(() => target.style.transform = 'scale(1)', 50);

                // Actualizar barra
                const progress = (this.currentGame.clicks / this.currentGame.targetClicks) * 100;
                document.getElementById('game-progress-bar').style.width = `${progress}%`;

                if (this.currentGame.clicks >= this.currentGame.targetClicks) {
                    this.endGame(true);
                }
            };
            area.appendChild(target);
        } else if (level.id === 2) {
            // Juego de Selección de Ingredientes
            const ingredients = [
                { id: 'zanahoria', icon: '🥕', isCorrect: true, name: 'Zanahoria' },
                { id: 'cebolla', icon: '🧅', isCorrect: true, name: 'Cebolla' },
                { id: 'papa', icon: '🥔', isCorrect: true, name: 'Papa' },
                { id: 'caramelo', icon: '🍬', isCorrect: false, name: 'Dulce' },
                { id: 'zapato', icon: '👞', isCorrect: false, name: 'Zapato' },
                { id: 'helado', icon: '🍦', isCorrect: false, name: 'Helado' }
            ];
            
            // Mezclar ingredientes
            ingredients.sort(() => Math.random() - 0.5);
            
            this.currentGame.targetClicks = ingredients.filter(i => i.isCorrect).length; // Necesitamos 3 correctos
            this.currentGame.clicks = 0; // Correctos encontrados

            ingredients.forEach(ing => {
                const card = document.createElement('div');
                card.className = 'ingredient-card';
                card.innerHTML = `
                    <div class="ingredient-icon">${ing.icon}</div>
                    <div class="ingredient-name">${ing.name}</div>
                `;
                
                card.onclick = () => {
                    if (card.classList.contains('anim-correct') || card.classList.contains('anim-error')) return;

                    if (ing.isCorrect) {
                        card.classList.add('anim-correct');
                        this.currentGame.clicks++;
                        
                        // Actualizar barra
                        const progress = (this.currentGame.clicks / this.currentGame.targetClicks) * 100;
                        document.getElementById('game-progress-bar').style.width = `${progress}%`;

                        if (this.currentGame.clicks >= this.currentGame.targetClicks) {
                            setTimeout(() => this.endGame(true), 500); // Pequeña pausa antes de ganar
                        }
                    } else {
                        card.classList.add('anim-error');
                        this.currentGame.mistakes++;
                        // Penalización de tiempo opcional
                        this.currentGame.timeLeft = Math.max(1, this.currentGame.timeLeft - 2);
                        
                        // Pequeño aviso visual extra del error (vibración)
                        card.style.animation = 'shakeRed 0.5s';
                        setTimeout(()=> card.style.animation = '', 500);
                    }
                };
                area.appendChild(card);
            });
        } else if (level.id === 3) {
            // Juego de Secuencia de Pizza
            const steps = [
                { name: 'Amasar', icon: '🍞', target: 5, action: 'amasa rápido' },
                { name: 'Salsa', icon: '🥫', target: 1, action: 'haz clic para añadir' },
                { name: 'Queso', icon: '🧀', target: 1, action: 'haz clic para añadir' }
            ];
            
            let currentStepIndex = 0;
            let currentStepClicks = 0;
            this.currentGame.targetClicks = steps.reduce((total, step) => total + step.target, 0);
            this.currentGame.clicks = 0;

            const renderStep = () => {
                area.innerHTML = '';
                const step = steps[currentStepIndex];
                
                const title = document.createElement('h3');
                title.style.width = '100%';
                title.style.textAlign = 'center';
                title.style.marginBottom = '1rem';
                title.innerText = `Paso ${currentStepIndex + 1}: ${step.name} (${step.action})`;
                area.appendChild(title);

                const target = document.createElement('div');
                target.className = 'clicker-target';
                target.innerText = step.icon;
                target.onclick = () => {
                    currentStepClicks++;
                    this.currentGame.clicks++;
                    
                    target.style.transform = 'scale(0.8)';
                    setTimeout(() => target.style.transform = 'scale(1)', 50);

                    const progress = (this.currentGame.clicks / this.currentGame.targetClicks) * 100;
                    document.getElementById('game-progress-bar').style.width = `${progress}%`;

                    if (currentStepClicks >= step.target) {
                        currentStepIndex++;
                        currentStepClicks = 0;
                        if (currentStepIndex < steps.length) {
                            renderStep();
                        } else {
                            setTimeout(() => this.endGame(true), 500);
                        }
                    }
                };
                area.appendChild(target);
            };

            renderStep();
        } else {
            area.innerHTML = '<p>Minijuego en construcción... ¡Simulando victoria automática!</p>';
            setTimeout(() => {
                if (this.currentGame.timer) {
                    this.endGame(true);
                }
            }, 2000);
        }
    },

    quitGame() {
        clearInterval(this.currentGame.timer);
        this.currentGame.timer = null;
        this.state.lives--;
        this.updateHeaderStats();
        this.showView('level-selection-view');
        
        if (this.state.lives <= 0) {
            this.showFeedback('¡Sin Vidas!', 'Te has quedado sin vidas. Vuelve más tarde.', true);
        }
    },

    endGame(success) {
        clearInterval(this.currentGame.timer);
        this.currentGame.timer = null;
        
        let stars = 0;
        
        if (success) {
            const timePercentage = this.currentGame.timeLeft / this.currentGame.initialTime;
            
            if (timePercentage > 0.5 && this.currentGame.mistakes === 0) stars = 3;
            else if (timePercentage > 0.2 || this.currentGame.mistakes <= 2) stars = 2;
            else stars = 1;

            const score = 50 + (this.currentGame.timeLeft * 2) - (this.currentGame.mistakes * 5);
            const finalScore = Math.max(10, score);
            const earnedCoins = 10 + (stars * 5);
            
            this.state.xp += finalScore;
            this.state.coins += earnedCoins;

            const prevScore = this.state.levelScores[this.currentGame.id];
            if (!prevScore || finalScore > prevScore.score || stars > prevScore.stars) {
                this.state.levelScores[this.currentGame.id] = {
                    stars: Math.max(stars, prevScore ? prevScore.stars : 0),
                    score: Math.max(finalScore, prevScore ? prevScore.score : 0)
                };
            }
            
            if(this.currentGame.id === this.state.unlockedLevels[this.state.unlockedLevels.length - 1]) {
                 this.state.completedRecipes++;
                 if(this.currentGame.id < this.levels.length) {
                    this.state.unlockedLevels.push(this.currentGame.id + 1);
                 }
            }
            
            document.getElementById('results-title').innerText = "¡Receta Completada!";
            document.getElementById('results-title').style.color = "var(--primary)";
            
            let starsHTML = "";
            for(let i = 1; i <= 3; i++) {
                starsHTML += `<span class="${i <= stars ? 'earned' : ''}">★</span>`;
            }
            document.getElementById('results-stars').innerHTML = starsHTML;
            
            document.getElementById('results-score').innerText = `${finalScore} ⭐ | ${earnedCoins} 🪙`;
            document.getElementById('results-mistakes').innerText = this.currentGame.mistakes;
            document.getElementById('recap-text').innerText = "¡Excelente trabajo! Has ganado algunas monedas.";
        } else {
            this.state.lives--;
            document.getElementById('results-title').innerText = "¡Se acabó el tiempo!";
            document.getElementById('results-title').style.color = "var(--accent)";
            document.getElementById('results-stars').innerHTML = "<span>★</span><span>★</span><span>★</span>";
            document.getElementById('results-score').innerText = 0;
            document.getElementById('results-mistakes').innerText = "-";
            document.getElementById('recap-text').innerText = "La cocina requiere rapidez. ¡Vuelve a intentarlo!";
        }

        this.updateHeaderStats();
        this.renderLevelMap();
        this.renderAchievements();
        this.showView('results-view');
    },

    // Modales
    showFeedback(title, message, isError = false) {
        const modal = document.getElementById('feedback-modal');
        const content = document.getElementById('feedback-content');
        
        document.getElementById('feedback-title').innerText = title;
        document.getElementById('feedback-message').innerText = message;
        
        content.className = `modal-content ${isError ? 'error' : 'info'}`;
        modal.classList.remove('hidden');
    },

    closeFeedbackModal() {
        document.getElementById('feedback-modal').classList.add('hidden');
    },

    // Lógica de Tienda
    buyItem(itemId) {
        if (itemId === 'time') {
            if (this.state.powerups.extraTime) {
                this.showFeedback('Ya Equipado', 'Ya tienes el Reloj de Arena equipado para el próximo nivel.');
                return;
            }
            if (this.state.coins >= 30) {
                this.state.coins -= 30;
                this.state.powerups.extraTime = true;
                this.updateHeaderStats();
                document.getElementById('badge-time').classList.remove('hidden');
                this.showFeedback('¡Compra Exitosa!', 'Has equipado el Reloj de Arena. Tendrás +5 segundos en tu próxima receta.');
            } else {
                this.showFeedback('Fondos Insuficientes', 'No tienes suficientes monedas para comprar esto.', true);
            }
        } else if (itemId === 'life') {
            if (this.state.lives >= 3) { // Asumimos un máximo de 3 vidas
                this.showFeedback('Vidas al Máximo', 'Ya tienes el máximo de vidas.');
                return;
            }
            if (this.state.coins >= 50) {
                this.state.coins -= 50;
                this.state.lives++;
                this.updateHeaderStats();
                this.showFeedback('¡Compra Exitosa!', 'Has recuperado 1 vida. ¡Sigue cocinando!');
            } else {
                this.showFeedback('Fondos Insuficientes', 'No tienes suficientes monedas para comprar esto.', true);
            }
        }
    }
};

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});
