const app = {
    state: {
        lives: 3,
        xp: 0,
        coins: 0,
        completedRecipes: 0,
        unlockedLevels: [1, 4, 5, 9, 11, 15],
        achievements: [],
        powerups: { extraTime: false },
        levelScores: {},
        perfectWins: 0,
        purchasedItems: [],
        lastLifeTime: Date.now(),
        gameCompleted: false
    },

    sounds: {},

    initAudio() {
        this.sounds = {
            win: new Audio('https://raw.githubusercontent.com/AnHeuermann/sounds/master/success.mp3'),
            lose: new Audio('https://raw.githubusercontent.com/the-m-m/sound-effects/master/fail-trombone-01.mp3')
        };
        
        // Pre-cargar y desbloquear audio en la primera interacción (Autoplay Policy)
        const unlockAudio = () => {
            Object.values(this.sounds).forEach(audio => {
                audio.play().then(() => {
                    audio.pause();
                    audio.currentTime = 0;
                }).catch(e => console.warn("Audio unlock failed:", e));
            });
            document.removeEventListener('click', unlockAudio);
            console.log("Audio desbloqueado para la sesión.");
        };
        document.addEventListener('click', unlockAudio);

        Object.values(this.sounds).forEach(audio => {
            audio.load();
        });
    },

    playSound(name) {
        if (this.sounds[name]) {
            console.log("Intentando reproducir:", name);
            this.sounds[name].currentTime = 0;
            this.sounds[name].play().catch(e => {
                console.error(`Error al reproducir ${name}:`, e);
            });
        }
    },

    saveState() {
        localStorage.setItem('chefManiaState', JSON.stringify(this.state));
    },

    loadState() {
        const saved = localStorage.getItem('chefManiaState');
        if (saved) {
            const parsed = JSON.parse(saved);
            // Merge to ensure new state properties are preserved if we update the app
            this.state = { ...this.state, ...parsed };
        }
    },
    
    categories: [
        { id: 'platillos', name: 'Platillos Principales' },
        { id: 'postres', name: 'Postres Deliciosos' },
        { id: 'bebidas', name: 'Bebidas Refrescantes' }
    ],

    levels: [
        {
            id: 1,
            categoryId: 'platillos',
            type: 'clicker',
            title: "Cortando Tomates",
            desc: "Pica todos los tomates antes de que se acabe el tiempo.",
            icon: "🍅",
            time: 10,
            targetClicks: 15
        },
        {
            id: 2,
            categoryId: 'platillos',
            type: 'selection',
            title: "Sopa de Verduras",
            desc: "Selecciona los ingredientes correctos para la sopa.",
            icon: "🍲",
            time: 15,
            ingredients: [
                { id: 'zanahoria', icon: '🥕', isCorrect: true, name: 'Zanahoria' },
                { id: 'cebolla', icon: '🧅', isCorrect: true, name: 'Cebolla' },
                { id: 'papa', icon: '🥔', isCorrect: true, name: 'Papa' },
                { id: 'caramelo', icon: '🍬', isCorrect: false, name: 'Dulce' },
                { id: 'zapato', icon: '👞', isCorrect: false, name: 'Zapato' },
                { id: 'helado', icon: '🍦', isCorrect: false, name: 'Helado' }
            ]
        },
        {
            id: 3,
            categoryId: 'platillos',
            type: 'sequence',
            title: "Pizza Margherita",
            desc: "Amasa y prepara la pizza perfecta.",
            icon: "🍕",
            time: 20,
            steps: [
                { name: 'Amasar', icon: '🍞', target: 5, action: 'amasa rápido' },
                { name: 'Salsa', icon: '🥫', target: 1, action: 'haz clic para añadir' },
                { name: 'Queso', icon: '🧀', target: 1, action: 'haz clic para añadir' }
            ]
        },
        {
            id: 4,
            categoryId: 'postres',
            type: 'clicker',
            title: "Decorando Pastel",
            desc: "Añade todas las cerezas al pastel.",
            icon: "🎂",
            time: 15,
            targetClicks: 10
        },
        {
            id: 5,
            categoryId: 'bebidas',
            type: 'clicker',
            title: "Limonada Fresca",
            desc: "Exprime los limones para la bebida.",
            icon: "🍋",
            time: 10,
            targetClicks: 12
        },
        {
            id: 6,
            categoryId: 'platillos',
            type: 'sequence',
            title: "Sushi Maki",
            desc: "Prepara el arroz y enrolla el sushi.",
            icon: "🍣",
            time: 20,
            steps: [
                { name: 'Arroz', icon: '🍚', target: 3, action: 'extiende el arroz' },
                { name: 'Pescado', icon: '🐟', target: 1, action: 'coloca el relleno' },
                { name: 'Enrollar', icon: '🥢', target: 4, action: 'enrolla firme' }
            ]
        },
        {
            id: 7,
            categoryId: 'postres',
            type: 'selection',
            title: "Helado Sundae",
            desc: "Elige ingredientes dulces para el helado.",
            icon: "🍨",
            time: 15,
            ingredients: [
                { id: 'fresa', icon: '🍓', isCorrect: true, name: 'Fresa' },
                { id: 'choco', icon: '🍫', isCorrect: true, name: 'Chocolate' },
                { id: 'cereza', icon: '🍒', isCorrect: true, name: 'Cereza' },
                { id: 'ajo', icon: '🧄', isCorrect: false, name: 'Ajo' },
                { id: 'chile', icon: '🌶️', isCorrect: false, name: 'Chile' },
                { id: 'sal', icon: '🧂', isCorrect: false, name: 'Sal' }
            ]
        },
        {
            id: 8,
            categoryId: 'bebidas',
            type: 'sequence',
            title: "Café Moka",
            desc: "Prepara un café con chocolate caliente.",
            icon: "☕",
            time: 20,
            steps: [
                { name: 'Molido', icon: '🫘', target: 3, action: 'muele los granos' },
                { name: 'Café', icon: '☕', target: 1, action: 'sirve el café' },
                { name: 'Chocolate', icon: '🍫', target: 1, action: 'añade chocolate' },
                { name: 'Leche', icon: '🥛', target: 2, action: 'espuma la leche' }
            ]
        },
        {
            id: 9,
            categoryId: 'platillos',
            type: 'precision',
            title: "El Punto de la Carne",
            desc: "Detén el fuego cuando esté en el punto ideal.",
            icon: "🥩",
            time: 15,
            targetSuccess: 3
        },
        {
            id: 10,
            categoryId: 'postres',
            type: 'sorting',
            title: "Organiza la Alacena",
            desc: "Guarda cada ingrediente en su lugar correspondiente.",
            icon: "📦",
            time: 20,
            items: [
                { icon: '🥛', bin: 'nevera', name: 'Leche' },
                { icon: '🥚', bin: 'nevera', name: 'Huevos' },
                { icon: '🌾', bin: 'despensa', name: 'Harina' },
                { icon: '🥫', bin: 'despensa', name: 'Lata' },
                { icon: '🥩', bin: 'nevera', name: 'Carne' },
                { icon: '🍝', bin: 'despensa', name: 'Pasta' }
            ]
        },
        {
            id: 11,
            categoryId: 'bebidas',
            type: 'precision',
            title: "Espresso Maestro",
            desc: "Detén la extracción en el momento justo.",
            icon: "☕",
            time: 12,
            targetSuccess: 2
        },
        {
            id: 12,
            categoryId: 'platillos',
            type: 'sorting',
            title: "Reciclaje en Cocina",
            desc: "Separa los restos orgánicos de los envases.",
            icon: "♻️",
            time: 15,
            items: [
                { icon: '🍎', bin: 'organico', name: 'Manzana' },
                { icon: '🧃', bin: 'envases', name: 'Brik' },
                { icon: '🍌', bin: 'organico', name: 'Plátano' },
                { icon: '🍼', bin: 'envases', name: 'Botella' },
                { icon: '🥚', bin: 'organico', name: 'Cáscara' }
            ],
            customBins: [
                { id: 'organico', name: 'Orgánico', icon: '🍃' },
                { id: 'envases', name: 'Envases', icon: '🟡' }
            ]
        },
        {
            id: 13,
            categoryId: 'postres',
            type: 'selection',
            title: "Tarta de Queso",
            desc: "Elige solo los ingredientes de la tarta.",
            icon: "🍰",
            time: 15,
            ingredients: [
                { id: 'queso', icon: '🧀', isCorrect: true, name: 'Queso Crema' },
                { id: 'galleta', icon: '🍪', isCorrect: true, name: 'Galletas' },
                { id: 'mermelada', icon: '🍓', isCorrect: true, name: 'Mermelada' },
                { id: 'pepino', icon: '🥒', isCorrect: false, name: 'Pepino' },
                { id: 'pollo', icon: '🍗', isCorrect: false, name: 'Pollo' }
            ]
        },
        {
            id: 14,
            categoryId: 'platillos',
            type: 'sequence',
            title: "Hamburguesa Gourmet",
            desc: "Monta las capas de la hamburguesa.",
            icon: "🍔",
            time: 20,
            steps: [
                { name: 'Pan', icon: '🍞', target: 1, action: 'base' },
                { name: 'Carne', icon: '🥩', target: 1, action: 'cocinar' },
                { name: 'Queso', icon: '🧀', target: 1, action: 'fundir' },
                { name: 'Lechuga', icon: '🥬', target: 1, action: 'frescura' }
            ]
        },
        {
            id: 15,
            categoryId: 'bebidas',
            type: 'clicker',
            title: "Batido Energético",
            desc: "Agita el batido con fuerza.",
            icon: "🥤",
            time: 8,
            targetClicks: 20
        },
        {
            id: 16,
            categoryId: 'postres',
            type: 'precision',
            title: "Caramelizar Azúcar",
            desc: "No dejes que el azúcar se queme.",
            icon: "🍯",
            time: 15,
            targetSuccess: 4
        },
        {
            id: 17,
            categoryId: 'bebidas',
            type: 'sorting',
            title: "Barista Junior",
            desc: "Separa las tazas de los vasos fríos.",
            icon: "🥛",
            time: 15,
            items: [
                { icon: '☕', bin: 'caliente', name: 'Taza' },
                { icon: '🥤', bin: 'frio', name: 'Vaso' },
                { icon: '🍵', bin: 'caliente', name: 'Infusión' },
                { icon: '🍹', bin: 'frio', name: 'Cóctel' }
            ],
            customBins: [
                { id: 'caliente', name: 'Caliente', icon: '🔥' },
                { id: 'frio', name: 'Frío', icon: '❄️' }
            ]
        },
        {
            id: 18,
            categoryId: 'platillos',
            type: 'selection',
            title: "Especias Curry",
            desc: "Selecciona las especias aromáticas.",
            icon: "🍛",
            time: 15,
            ingredients: [
                { id: 'curcuma', icon: '🟡', isCorrect: true, name: 'Cúrcuma' },
                { id: 'comino', icon: '🤎', isCorrect: true, name: 'Comino' },
                { id: 'pimenton', icon: '🔴', isCorrect: true, name: 'Pimentón' },
                { id: 'chocolate', icon: '🍫', isCorrect: false, name: 'Choco' }
            ]
        },
        {
            id: 19,
            categoryId: 'postres',
            type: 'sequence',
            title: "Montar Nata",
            desc: "Bate hasta que esté firme.",
            icon: "🍦",
            time: 15,
            steps: [
                { name: 'Nata', icon: '🥛', target: 2, action: 'verter' },
                { name: 'Azúcar', icon: '🍬', target: 1, action: 'endulzar' },
                { name: 'Batir', icon: '🌪️', target: 8, action: '¡rápido!' }
            ]
        },
        {
            id: 20,
            categoryId: 'platillos',
            type: 'precision',
            title: "Pasta al Dente",
            desc: "Saca la pasta en el segundo exacto.",
            icon: "🍝",
            time: 15,
            targetSuccess: 3
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
        this.loadState();
        this.startLifeRegenTimer();
        this.updateHeaderStats();
        this.updateProfileStats();
        this.renderLevelMap();
        this.renderAchievements();
        this.initAudio();
    },

    startLifeRegenTimer() {
        setInterval(() => {
            this.calculateLifeRegen();
            this.updateHeaderStats();
        }, 1000);
    },

    calculateLifeRegen() {
        if (this.state.lives >= 3) {
            this.state.lastLifeTime = Date.now();
            return;
        }

        const now = Date.now();
        const diff = now - this.state.lastLifeTime;
        const regenTime = 5 * 60 * 1000; // 5 minutos en ms

        if (diff >= regenTime) {
            const livesToGain = Math.floor(diff / regenTime);
            this.state.lives = Math.min(3, this.state.lives + livesToGain);
            this.state.lastLifeTime = now - (diff % regenTime);
            this.saveState();
        }
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
        const livesDisp = document.getElementById('lives-display');
        livesDisp.innerText = this.state.lives;
        document.getElementById('xp-display').innerText = this.state.xp;
        document.getElementById('coins-display').innerText = this.state.coins;

        // Mostrar contador si faltan vidas
        let timerSpan = document.getElementById('life-timer');
        if (this.state.lives < 3) {
            if (!timerSpan) {
                timerSpan = document.createElement('span');
                timerSpan.id = 'life-timer';
                timerSpan.style.fontSize = '0.7rem';
                timerSpan.style.color = 'var(--accent)';
                timerSpan.style.marginLeft = '5px';
                document.getElementById('nav-lives').appendChild(timerSpan);
            }
            const nextRegen = this.state.lastLifeTime + (5 * 60 * 1000);
            const timeLeft = Math.max(0, Math.round((nextRegen - Date.now()) / 1000));
            const mins = Math.floor(timeLeft / 60);
            const secs = timeLeft % 60;
            timerSpan.innerText = `${mins}:${secs < 10 ? '0'+secs : secs}`;
        } else if (timerSpan) {
            timerSpan.remove();
        }
    },

    updateProfileStats() {
        if (!document.getElementById('profile-xp')) return;

        document.getElementById('profile-xp').innerText = this.state.xp;
        document.getElementById('profile-recipes').innerText = this.state.completedRecipes;
        
        // Mostrar corona si el juego está completado
        const crown = document.getElementById('profile-crown');
        if (crown) {
            if (this.state.gameCompleted) crown.classList.remove('hidden');
            else crown.classList.add('hidden');
        }
        
        let rank = "Pinche de Cocina";
        if(this.state.xp >= 100) rank = "Aprendiz de Chef";
        if(this.state.xp >= 300) rank = "Cocinero de Línea";
        if(this.state.xp >= 600) rank = "Sous Chef";
        if(this.state.xp >= 1000) rank = "Chef Ejecutivo";
        if(this.state.xp >= 2000) rank = "Maestro Gastronómico";
        
        document.getElementById('profile-level').innerText = rank;
    },

    // Generar Mapa de Niveles
    renderLevelMap() {
        const container = document.getElementById('level-map-container');
        container.innerHTML = '';

        this.categories.forEach(category => {
            const categoryLevels = this.levels.filter(l => l.categoryId === category.id);
            if (categoryLevels.length === 0) return;

            const completedCount = categoryLevels.filter(l => this.state.levelScores[l.id]).length;
            const progressPercent = Math.round((completedCount / categoryLevels.length) * 100);

            const catContainer = document.createElement('div');
            catContainer.className = 'category-section';
            
            const catTitle = document.createElement('h3');
            catTitle.className = 'category-title';
            catTitle.innerHTML = `${category.name} <span class="category-progress">${progressPercent}%</span>`;
            catContainer.appendChild(catTitle);

            const mapWrapper = document.createElement('div');
            mapWrapper.className = 'category-map';

            categoryLevels.forEach((level, index) => {
                const isUnlocked = this.state.unlockedLevels.includes(level.id);
                const scoreData = this.state.levelScores[level.id];
                const isCompleted = !!scoreData;
                
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
        if (!container) return;

        const hasThreeStars = Object.values(this.state.levelScores).some(s => s.stars === 3);
        
        // Verificar si alguna categoría está completa (100%)
        const hasFullCategory = this.categories.some(cat => {
            const catLevels = this.levels.filter(l => l.categoryId === cat.id);
            return catLevels.every(l => this.state.levelScores[l.id]);
        });

        const achievements = [
            { id: 'first', name: 'Primer Corte', icon: '🔪', unlocked: this.state.completedRecipes > 0 },
            { id: 'perfect3', name: 'Cocina Impecable', icon: '✨', unlocked: this.state.perfectWins >= 3 },
            { id: 'speed', name: 'Chef Relámpago', icon: '⚡', unlocked: this.state.levelScores && Object.values(this.state.levelScores).some(s => s.fastWin) },
            { id: 'clutch', name: 'Al Filo', icon: '🕒', unlocked: this.state.levelScores && Object.values(this.state.levelScores).some(s => s.clutchWin) },
            { id: 'investor', name: 'Inversionista', icon: '💎', unlocked: this.state.purchasedItems.length >= 2 },
            { id: 'master', name: 'Dominio Temático', icon: '🎓', unlocked: hasFullCategory },
            { id: 'xp500', name: 'Chef de Oro', icon: '🏆', unlocked: this.state.xp >= 500 },
            { id: 'recipes5', name: 'Gourmet', icon: '🥗', unlocked: this.state.completedRecipes >= 5 }
        ];

        container.innerHTML = achievements.map(ach => `
            <div class="achievement ${ach.unlocked ? 'unlocked' : 'locked'}" title="${ach.unlocked ? '¡Logrado!' : 'Aún por descubrir'}">
                <div class="achievement-icon">${ach.icon}</div>
                <div class="achievement-name">${ach.name}</div>
            </div>
        `).join('');
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
            targetClicks: level.targetClicks || 10,
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

        switch(level.type) {
            case 'clicker':
                this.currentGame.targetClicks = level.targetClicks;
                this.currentGame.clicks = 0;
                
                const target = document.createElement('div');
                target.className = 'clicker-target';
                target.innerText = level.icon;
                target.onclick = () => {
                    this.currentGame.clicks++;
                    
                    target.style.transform = 'scale(0.8)';
                    setTimeout(() => target.style.transform = 'scale(1)', 50);

                    const progress = (this.currentGame.clicks / this.currentGame.targetClicks) * 100;
                    document.getElementById('game-progress-bar').style.width = `${progress}%`;

                    if (this.currentGame.clicks >= this.currentGame.targetClicks) {
                        this.endGame(true);
                    }
                };
                area.appendChild(target);
                break;

            case 'selection':
                const ingredients = [...level.ingredients];
                ingredients.sort(() => Math.random() - 0.5);
                
                this.currentGame.targetClicks = ingredients.filter(i => i.isCorrect).length;
                this.currentGame.clicks = 0;

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
                            
                            const progress = (this.currentGame.clicks / this.currentGame.targetClicks) * 100;
                            document.getElementById('game-progress-bar').style.width = `${progress}%`;

                            if (this.currentGame.clicks >= this.currentGame.targetClicks) {
                                setTimeout(() => this.endGame(true), 500);
                            }
                        } else {
                            card.classList.add('anim-error');
                            this.currentGame.mistakes++;
                            this.currentGame.timeLeft = Math.max(1, this.currentGame.timeLeft - 2);
                            
                            card.style.animation = 'shakeRed 0.5s';
                            setTimeout(()=> card.style.animation = '', 500);
                        }
                    };
                    area.appendChild(card);
                });
                break;

            case 'sequence':
                const steps = level.steps;
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

                    const targetSequence = document.createElement('div');
                    targetSequence.className = 'clicker-target';
                    targetSequence.innerText = step.icon;
                    targetSequence.onclick = () => {
                        currentStepClicks++;
                        this.currentGame.clicks++;
                        
                        targetSequence.style.transform = 'scale(0.8)';
                        setTimeout(() => targetSequence.style.transform = 'scale(1)', 50);

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
                    area.appendChild(targetSequence);
                };

                renderStep();
                break;

            case 'precision':
                this.currentGame.targetClicks = level.targetSuccess;
                this.currentGame.clicks = 0;
                
                const pContainer = document.createElement('div');
                pContainer.className = 'precision-container';
                
                const pTarget = document.createElement('div');
                pTarget.className = 'precision-target-zone';
                pContainer.appendChild(pTarget);
                
                const pMarker = document.createElement('div');
                pMarker.className = 'precision-marker';
                pContainer.appendChild(pMarker);
                
                area.appendChild(pContainer);
                
                const pBtn = document.createElement('button');
                pBtn.className = 'btn-primary btn-large';
                pBtn.innerText = '¡FUEGO!';
                area.appendChild(pBtn);

                let markerPos = 0;
                let direction = 1;
                const speed = 2.5;

                const moveMarker = () => {
                    if (!this.currentGame.timer) return;
                    markerPos += speed * direction;
                    if (markerPos >= 98 || markerPos <= 0) direction *= -1;
                    pMarker.style.left = `${markerPos}%`;
                    requestAnimationFrame(moveMarker);
                };
                requestAnimationFrame(moveMarker);

                pBtn.onclick = () => {
                    if (markerPos >= 37.5 && markerPos <= 62.5) { // Rango de la zona verde
                        this.currentGame.clicks++;
                        this.showFeedback('¡Perfecto!', '¡Sigue así!', false);
                        const progress = (this.currentGame.clicks / this.currentGame.targetClicks) * 100;
                        document.getElementById('game-progress-bar').style.width = `${progress}%`;
                        
                        if (this.currentGame.clicks >= this.currentGame.targetClicks) {
                            setTimeout(() => this.endGame(true), 500);
                        }
                    } else {
                        this.currentGame.mistakes++;
                        this.currentGame.timeLeft = Math.max(1, this.currentGame.timeLeft - 3);
                        this.showFeedback('¡Se quema!', 'Ten más cuidado con el tiempo.', true);
                    }
                };
                break;

            case 'sorting':
                this.currentGame.targetClicks = level.items.length;
                this.currentGame.clicks = 0;
                let currentItemIndex = 0;

                const renderItem = () => {
                    area.innerHTML = '';
                    const item = level.items[currentItemIndex];
                    
                    const sortContainer = document.createElement('div');
                    sortContainer.className = 'sorting-container';
                    
                    const sortItem = document.createElement('div');
                    sortItem.className = 'sorting-item';
                    sortItem.innerText = item.icon;
                    sortContainer.appendChild(sortItem);
                    
                    const sortBins = document.createElement('div');
                    sortBins.className = 'sorting-bins';
                    
                    const bins = level.customBins || [
                        { id: 'nevera', name: 'Nevera', icon: '❄️' },
                        { id: 'despensa', name: 'Despensa', icon: '📦' }
                    ];

                    bins.forEach(bin => {
                        const binDiv = document.createElement('div');
                        binDiv.className = 'sorting-bin';
                        binDiv.innerHTML = `
                            <div class="sorting-bin-icon">${bin.icon}</div>
                            <div class="sorting-bin-name">${bin.name}</div>
                        `;
                        binDiv.onclick = () => {
                            if (bin.id === item.bin) {
                                this.currentGame.clicks++;
                                currentItemIndex++;
                                const progress = (this.currentGame.clicks / this.currentGame.targetClicks) * 100;
                                document.getElementById('game-progress-bar').style.width = `${progress}%`;
                                
                                if (currentItemIndex < level.items.length) {
                                    renderItem();
                                } else {
                                    setTimeout(() => this.endGame(true), 500);
                                }
                            } else {
                                this.currentGame.mistakes++;
                                this.currentGame.timeLeft = Math.max(1, this.currentGame.timeLeft - 2);
                                binDiv.style.animation = 'shakeRed 0.5s';
                                setTimeout(() => binDiv.style.animation = '', 500);
                            }
                        };
                        sortBins.appendChild(binDiv);
                    });
                    
                    sortContainer.appendChild(sortBins);
                    area.appendChild(sortContainer);
                };

                renderItem();
                break;
                
            default:
                area.innerHTML = '<p>Minijuego en construcción... ¡Simulando victoria automática!</p>';
                setTimeout(() => {
                    if (this.currentGame.timer) {
                        this.endGame(true);
                    }
                }, 2000);
                break;
        }
    },

    quitGame() {
        clearInterval(this.currentGame.timer);
        this.currentGame.timer = null;
        
        if (this.state.lives === 3) {
            this.state.lastLifeTime = Date.now();
        }
        
        this.state.lives--;
        this.updateHeaderStats();
        this.showView('level-selection-view');
        
        if (this.state.lives <= 0) {
            this.showFeedback('¡Sin Vidas!', 'Te has quedado sin vidas. Vuelve en unos minutos para que se recarguen.', true);
        }
        this.saveState();
    },

    checkAllLevelsCompleted() {
        const totalLevels = this.levels.length;
        const completedLevels = Object.keys(this.state.levelScores).length;

        if (completedLevels >= totalLevels && !this.state.gameCompleted) {
            this.state.gameCompleted = true;
            this.saveState();
            setTimeout(() => this.triggerWinCelebration(), 1000);
        }
    },

    triggerWinCelebration() {
        // Lanzar confeti (requiere canvas-confetti)
        if (window.confetti) {
            const duration = 5 * 1000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

            const randomInRange = (min, max) => Math.random() * (max - min) + min;

            const interval = setInterval(function() {
                const timeLeft = animationEnd - Date.now();

                if (timeLeft <= 0) {
                    return clearInterval(interval);
                }

                const particleCount = 50 * (timeLeft / duration);
                window.confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
                window.confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
            }, 250);
        }

        this.showFeedback('👑 ¡MAESTRO CHEF! 👑', '¡Increíble! Has completado todas las recetas de la academia. Ahora llevas la Corona de Maestro en tu perfil.');
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
            const currentLevel = this.levels.find(l => l.id === this.currentGame.id);
            const categoryLevels = this.levels.filter(l => l.categoryId === currentLevel.categoryId);
            const currentIndex = categoryLevels.findIndex(l => l.id === currentLevel.id);

            if (!prevScore) {
                this.state.completedRecipes++;
            }

            // Nuevas métricas para insignias
            if (this.currentGame.mistakes === 0) {
                this.state.perfectWins++;
            }

            const timeSpent = this.currentGame.initialTime - this.currentGame.timeLeft;
            const isFastWin = timeSpent <= 5;
            const isClutchWin = this.currentGame.timeLeft <= 2;

            if (!prevScore || finalScore > prevScore.score || stars > prevScore.stars || isFastWin || isClutchWin) {
                this.state.levelScores[this.currentGame.id] = {
                    stars: Math.max(stars, prevScore ? prevScore.stars : 0),
                    score: Math.max(finalScore, prevScore ? prevScore.score : 0),
                    fastWin: isFastWin || (prevScore ? prevScore.fastWin : false),
                    clutchWin: isClutchWin || (prevScore ? prevScore.clutchWin : false)
                };
            }

            if (currentIndex !== -1 && currentIndex + 1 < categoryLevels.length) {
                const nextLevelId = categoryLevels[currentIndex + 1].id;
                if (!this.state.unlockedLevels.includes(nextLevelId)) {
                    this.state.unlockedLevels.push(nextLevelId);
                }
            }

            // Verificar si ha completado todo el juego
            this.checkAllLevelsCompleted();
            
            this.playSound('win');
            
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
            if (this.state.lives === 3) {
                this.state.lastLifeTime = Date.now();
            }
            this.state.lives--;
            this.playSound('lose');
            document.getElementById('results-title').innerText = "¡Se acabó el tiempo!";
            document.getElementById('results-title').style.color = "var(--accent)";
            document.getElementById('results-stars').innerHTML = "<span>★</span><span>★</span><span>★</span>";
            document.getElementById('results-score').innerText = 0;
            document.getElementById('results-mistakes').innerText = "-";
            document.getElementById('recap-text').innerText = "La cocina requiere rapidez. ¡Vuelve a intentarlo!";
        }

        this.updateHeaderStats();
        this.updateProfileStats();
        this.renderLevelMap();
        this.renderAchievements();
        this.saveState();
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
                if (!this.state.purchasedItems.includes('time')) this.state.purchasedItems.push('time');
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
                if (!this.state.purchasedItems.includes('life')) this.state.purchasedItems.push('life');
                this.updateHeaderStats();
                this.showFeedback('¡Compra Exitosa!', 'Has recuperado 1 vida. ¡Sigue cocinando!');
            } else {
                this.showFeedback('Fondos Insuficientes', 'No tienes suficientes monedas para comprar esto.', true);
            }
        }
        this.saveState();
    },

    inviteFriend() {
        const inviteLink = "https://chefmania.app/invite/chef" + Math.floor(Math.random() * 1000);
        
        if (navigator.share) {
            navigator.share({
                title: 'ChefManía - ¡Aprende a Cocinar!',
                text: '¡Oye! Mira este juego para aprender cocina. Si te unes con mi enlace, ¡nos dan monedas a los dos!',
                url: inviteLink,
            }).then(() => {
                this.showFeedback('¡Genial!', 'Has compartido la invitación con éxito.');
                this.giveInviteReward();
            }).catch((err) => {
                console.log("Error sharing:", err);
                this.copyToClipboard(inviteLink);
            });
        } else {
            this.copyToClipboard(inviteLink);
        }
    },

    copyToClipboard(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                this.handleCopySuccess(text);
            }).catch(() => {
                this.fallbackCopyTextToClipboard(text);
            });
        } else {
            this.fallbackCopyTextToClipboard(text);
        }
    },

    fallbackCopyTextToClipboard(text) {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            this.handleCopySuccess(text);
        } catch (err) {
            this.showFeedback('Error', 'No se pudo copiar el enlace. Inténtalo de nuevo.', true);
        }
        document.body.removeChild(textArea);
    },

    handleCopySuccess(text) {
        this.showFeedback('Enlace Copiado', 'Se ha copiado tu enlace de invitación: ' + text + '. ¡Envíalo a tus amigos!');
        this.giveInviteReward();
    },

    giveInviteReward() {
        // Evitar múltiples recompensas en la misma sesión si se desea
        setTimeout(() => {
            this.state.coins += 50;
            this.updateHeaderStats();
            this.saveState();
        }, 1500);
    }
};

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});
