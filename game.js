
// Hello Kitty Adventure - Parallax Scrolling Engine V3 (Ladders & Secrets)
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');



    // Controls
    const btnStartGame = document.getElementById('btn-start-game');
    const itemCountElement = document.getElementById('item-count');

    // Physics & Game Constants
    const PHYSICS = {
        GRAVITY: 0.5,
        FRICTION: 0.8,
        ACCELERATION: 0.4,
        MAX_SPEED: 5,
        JUMP_FORCE: -9, // Lowered from -10
        CLIMB_SPEED: 3
    };

    const TOTAL_ITEMS = 8;
    const LEVEL_FLOOR = 350;

    // Auto-update HTML
    const totalElement = document.getElementById('total-item-count');
    const missionElement = document.getElementById('mission-count');
    if (totalElement) totalElement.textContent = TOTAL_ITEMS;
    if (missionElement) missionElement.textContent = TOTAL_ITEMS;

    // Assets
    const assets = {
        player: new Image(),
        boyfriend: new Image(),
        castle: new Image(),
        tree: new Image(),
        cake: new Image(),
        lipstick: new Image(),
        guitar: new Image(),
        love_letter: new Image(),
        chocolate: new Image(),
        necklace: new Image(),
        teddy: new Image(),
        flower: new Image()
    };
    assets.player.src = 'assets/girl_player.png';
    assets.player.onload = () => {
        const scale = 0.25; // 0.25 scale as requested
        player.w = assets.player.naturalWidth * scale;
        player.h = assets.player.naturalHeight * scale;

        // Reset Position to avoid clipping on startup
        player.y = LEVEL_FLOOR - player.h;

        // Force redraw to remove red box on startup
        if (!state.playing) draw();
    };
    assets.boyfriend.src = 'assets/boyfriend.png';
    assets.tree.src = 'assets/tree.png';
    assets.cake.src = 'assets/cake.png';
    assets.lipstick.src = 'assets/lipstick.png';
    assets.guitar.src = 'assets/guitar.png';
    assets.love_letter.src = 'assets/love letter.png';
    assets.chocolate.src = 'assets/chocolate.png';
    assets.necklace.src = 'assets/necklace.png';
    assets.teddy.src = 'assets/teddy.png';
    assets.flower.src = 'assets/flower.png';
    assets.castle.src = 'assets/castle.png';
    assets.castle.onload = () => {
        // Use Original Size as requested
        castle.w = assets.castle.naturalWidth;
        castle.h = assets.castle.naturalHeight;
    };
    assets.castle.onload = () => {
        const naturalW = assets.castle.naturalWidth;
        const naturalH = assets.castle.naturalHeight;

        // Smart Sizing Logic
        if (naturalH > LEVEL_FLOOR) {
            // Too big! Resize to 4x player height (~60px * 4 = 240px)
            // Use a base player height of 60 if player isn't loaded yet
            const basePlayerH = player.h || 60;
            const targetH = basePlayerH * 4;
            const ratio = naturalW / naturalH;

            castle.h = targetH;
            castle.w = targetH * ratio;
        } else {
            // Fits! Use original size
            castle.w = naturalW;
            castle.h = naturalH;
        }
    };

    // Game State
    let state = {
        playing: false,
        score: 0,
        cameraX: 0,
        animationId: null,
        lives: 3, // New Life System
        gameOver: false
    };

    // Entities
    let player = {
        x: 50, y: 300, w: 40, h: 60,
        dx: 0, dy: 0,
        grounded: false,
        climbing: false,
        facingRight: true,
        invulnerableUntil: 0 // New Invulnerability Timer
    };



    // --- LEVEL DESIGN V4 (Sky Expansion) ---
    // Width: ~3000px, Height: Vertical!

    const platforms = [
        // 1. Starting Area
        { x: -50, y: LEVEL_FLOOR, w: 500, h: 60, type: 'ground' },

        // 2. Ladder Area 1 (Low)
        { x: 550, y: 200, w: 150, h: 20, type: 'cloud' },

        // ** NEW SKY LAYER (Left) **
        { x: 300, y: 100, w: 150, h: 20, type: 'cloud' }, // High Cloud 1

        // 3. The Gap
        { x: 800, y: LEVEL_FLOOR, w: 300, h: 60, type: 'ground' },

        // 4. The Staircase & High Road
        { x: 1200, y: 280, w: 40, h: 40, type: 'block' },
        { x: 1240, y: 240, w: 40, h: 40, type: 'block' },
        { x: 1280, y: 200, w: 40, h: 40, type: 'block' },
        { x: 1320, y: 160, w: 40, h: 40, type: 'block' },
        { x: 1400, y: 160, w: 150, h: 20, type: 'cloud' }, // Top of stairs

        // ** NEW SKY LAYER (Mid) **
        { x: 1400, y: 60, w: 200, h: 20, type: 'cloud' }, // Super High Cloud

        // 5. Sky High Platforms (Right)
        { x: 1800, y: 100, w: 150, h: 20, type: 'cloud' },

        // Extra Platform (Under Lipstick/Super High Cloud) - CHOCOLATE PLATFORM
        // Hard to reach! Requires moving platform.
        { x: 1300, y: 335, w: 60, h: 20, type: 'cloud' },

        // 6. The Drop
        { x: 1700, y: LEVEL_FLOOR, w: 400, h: 60, type: 'ground' },

        // 7. Floating Islands
        { x: 2200, y: 250, w: 80, h: 20, type: 'cloud' },
        { x: 2400, y: 180, w: 80, h: 20, type: 'cloud' },

        // 8. End
        // 8. End
        { x: 2600, y: LEVEL_FLOOR, w: 800, h: 60, type: 'ground' },

        // 9. Post-Game Challenge (3 Hops + Secret)
        { x: 3500, y: 300, w: 60, h: 20, type: 'cloud' },
        { x: 3700, y: 250, w: 60, h: 20, type: 'cloud' },
        { x: 3900, y: 200, w: 60, h: 20, type: 'cloud' },
        { x: 4100, y: 150, w: 200, h: 20, type: 'cloud' } // Final Secret Platform
    ];

    const ladders = [
        // { x: 600, y: 200, w: 40, h: 150 }, // REMOVED: Redundant second ladder
        { x: 350, y: 100, w: 40, h: 250 }, // Long ladder to High Cloud 1
        { x: 1450, y: 60, w: 40, h: 100 }, // Ladder from Stairs to Super High
        { x: 1850, y: 100, w: 40, h: 250 } // Long ladder to Sky High Right
    ];

    // Items (3 Visible, 5 Hidden)
    // Items (3 Visible, 5 Hidden)
    const items = [
        // Visible (Sky High!) - Now using Images
        { x: 370, y: 50, image: 'cake', collected: false, hidden: false }, // Higher (y-10)
        { x: 1500, y: 0, image: 'lipstick', collected: false, hidden: false }, // Higher (y-10 -> y=0)
        { x: 1870, y: 30, image: 'guitar', collected: false, hidden: false }, // SWAPPED with Ring (Was 3000, now 1870) - HIGHER (y=60 -> y=30)

        // Hidden / Hard
        { x: 620, y: 160, image: 'love_letter', collected: false, hidden: true, description: "You have my heart in words 💖" },
        { x: 1320, y: 300, image: 'chocolate', collected: false, hidden: true, description: "Sweet but not as sweet as you! 🍫" },
        { x: 3000, y: LEVEL_FLOOR - 150, image: 'necklace', collected: false, hidden: true, description: "Dazzling like you! 💎" },
        { x: 2200, y: 100, image: 'teddy', collected: false, hidden: true, description: "Soft and cuddly, like you! 🧸" },
        { x: 4180, y: 100, image: 'flower', collected: false, hidden: true, description: "A bouquet for my love! 🌹" }
    ];



    // Interactive Signs (Minecraft Style)
    const signs = [
        { x: 2700, y: LEVEL_FLOOR - 60, w: 40, h: 40, message: "You make my heart\nskip a beat! 💓" },
        { x: 3000, y: LEVEL_FLOOR - 60, w: 40, h: 40, message: "I love you more\nthan everything! 😈" },
        { x: 3300, y: LEVEL_FLOOR - 60, w: 40, h: 40, message: "Will you be my\nValentine? 🌹" }
    ];

    const castle = { x: 2900, y: LEVEL_FLOOR - 100, w: 80, h: 100 };

    // New Mechanics
    let levers = [
        { x: 2060, y: LEVEL_FLOOR - 30, w: 30, h: 30, pulled: false, id: 1 } // Right edge of Platform 6 (1700+400=2100)
    ];

    let flowers = [];
    // Generate Flowers on Ground Platforms
    platforms.forEach(p => {
        if (p.type === 'ground') {
            // Add flowers randomly across the width
            for (let i = 20; i < p.w - 20; i += Math.random() * 50 + 30) {
                flowers.push({ x: p.x + i, y: p.y });
            }
        }
    });

    let movingPlatforms = [
        // Bridge to Chocolate.
        // Chocolate Platform (Left): x=1300, w=60 => Ends 1360. Target 1420 (60px gap).
        // Ground (Right): x=1700.
        // New Width: 80 (Shorter).
        // New Start: 1610. Ends at 1610+80 = 1690. (10px gap from 1700).
        { x: 1610, y: 335, w: 80, h: 20, type: 'cloud', active: false, targetX: 1420, startX: 1610, speed: 2 }
    ];

    // Inputs
    const keys = { left: false, right: false, up: false, down: false };

    // Particles System (Global for access)
    let particles = [];
    function spawnParticle(x, y, text, color, fontSize = 10) {
        particles.push({ x, y, text, color, life: 60, fontSize });
    }

    function updateParticles() {
        particles.forEach(p => {
            p.y -= 1; p.life--;
        });
        particles = particles.filter(p => p.life > 0);
    }

    // --- Core Logic ---

    function startNewGame() {
        if (state.animationId) cancelAnimationFrame(state.animationId);

        player.x = 50; player.y = 200; player.dx = 0; player.dy = 0;
        player.climbing = false;
        player.facingRight = true;
        player.invulnerableUntil = 0;

        state.score = 0; state.cameraX = 0; state.playing = true;
        state.lives = 3; state.gameOver = false;

        // Reset Items
        items.forEach(i => i.collected = false);
        items.forEach(i => i.collected = false);
        levers.forEach(l => l.pulled = false);
        movingPlatforms.forEach(p => { p.x = p.startX; p.active = false; }); // Reset movers

        // Play Music
        const bgm = document.getElementById('bgm');
        const vBgm = document.getElementById('victory-bgm');

        if (vBgm) {
            vBgm.pause();
            vBgm.currentTime = 0;
        }

        if (bgm) {
            bgm.currentTime = 0;
            bgm.volume = 0.5; // 50% volume
            bgm.play().catch(e => console.log("Audio play failed:", e));
        }

        itemCountElement.innerText = "0";
        particles = [];

        // Hide overlays
        document.getElementById('sign-overlay').classList.add('hidden');
        document.getElementById('game-over-overlay').classList.add('hidden'); // Use remove('flex') if using flex
        document.getElementById('game-over-overlay').style.display = 'none';
        document.getElementById('start-screen-overlay').style.display = 'none'; // Hide Start Screen
        document.getElementById('victory-overlay').style.display = 'none'; // Hide Victory

        if (btnStartGame) btnStartGame.blur();

        loop();
    }

    function update() {
        if (!state.playing) return;

        // Check Ladder
        checkLadderState();

        if (player.climbing) {
            // Climbing Physics
            player.dx = 0;
            player.dy = 0;

            if (keys.up) player.dy = -PHYSICS.CLIMB_SPEED;
            if (keys.down) player.dy = PHYSICS.CLIMB_SPEED;
            if (keys.left) player.x -= 2; // Slight strafe
            if (keys.right) player.x += 2;

            player.y += player.dy;

            // Prevent clipping through floor while climbing down
            if (player.y + player.h > LEVEL_FLOOR) {
                player.y = LEVEL_FLOOR - player.h;
            }
        } else {
            // Normal Physics
            if (keys.right) {
                player.dx += PHYSICS.ACCELERATION;
                player.facingRight = true;
            } else if (keys.left) {
                player.dx -= PHYSICS.ACCELERATION;
                player.facingRight = false;
            } else {
                player.dx *= PHYSICS.FRICTION;
            }
            player.dx = Math.max(Math.min(player.dx, PHYSICS.MAX_SPEED), -PHYSICS.MAX_SPEED);

            player.dy += PHYSICS.GRAVITY;

            if (keys.up && player.grounded) {
                player.dy = PHYSICS.JUMP_FORCE;
                player.grounded = false;
                // Jump Dust
                spawnParticle(player.x + player.w / 2, player.y + player.h, "💨", 30, true);
                spawnParticle(player.x, player.y + player.h, "💨", 20, true);
            }

            player.x += player.dx;
            checkCollisionX();

            player.y += player.dy;
            player.grounded = false;
            checkCollisionY();
        }

        // Camera
        const targetCamX = player.x - canvas.width * 0.3;
        state.cameraX += (targetCamX - state.cameraX) * 0.1;
        if (state.cameraX < 0) state.cameraX = 0;

        // Bounds
        // Bounds
        if (player.y > canvas.height + 100) {
            // Death Logic
            if (state.lives > 0) {
                state.lives--;
                if (state.lives <= 0) {
                    triggerGameOver();
                } else {
                    // Respawn
                    player.x = 50; player.y = 200; player.dx = 0; player.dy = 0;
                    player.invulnerableUntil = Date.now() + 1500; // 1.5s invincibility
                    spawnParticle(player.x, player.y, "OUCH!", 60);
                }
            }
        }

        checkItems();
        checkWin();

        updateParticles();
        updateMovingPlatforms();
    }



    function updateMovingPlatforms() {
        movingPlatforms.forEach(p => {
            if (p.active) {
                // Move towards target
                if (Math.abs(p.x - p.targetX) > 1) {
                    p.x += (p.targetX - p.x) * 0.05; // Smooth ease
                }
            } else {
                // Move back to start? Or just stay? Let's stay for now to be simple, 
                // or move back if we want it to reset. User didn't specify reset.
                // Let's make it move back to startX if inactive
                if (Math.abs(p.x - p.startX) > 1) {
                    p.x += (p.startX - p.x) * 0.05;
                }
            }
        });
    }

    function createMob(x, y, minX, maxX) {
        return {
            x, y, w: 35, h: 35, // Wider 35x35
            minX, maxX,
            dx: -1.5, // Move left first
            alive: true,
            squished: false,
            timer: 0
        };
    }

    function updateMobs() {
        mobs.forEach((m, index) => {
            if (!m.alive) return;

            if (m.squished) {
                m.timer--;
                if (m.timer <= 0) m.alive = false; // Despawn
                return;
            }

            // Patrol
            m.x += m.dx;
            if (m.x <= m.minX || m.x + m.w >= m.maxX) {
                m.dx = -m.dx;
            }

            // Collision with Player
            if (overlap(player, m)) {
                // Check Stomp
                // Player must be falling and above the mob
                const hitTop = player.dy > 0 && (player.y + player.h) < (m.y + m.h / 2);

                if (hitTop) {
                    // SQUISH!
                    m.squished = true;
                    m.timer = 60; // 1 second (at 60fps)
                    player.dy = -7; // Bounce
                    spawnParticle(m.x, m.y, "SQUISH!", "#fff", 15);
                } else {
                    // HURT!
                    if (Date.now() > player.invulnerableUntil) {
                        state.lives--;
                        if (state.lives <= 0) {
                            triggerGameOver();
                        } else {
                            player.invulnerableUntil = Date.now() + 1000;
                            spawnParticle(player.x, player.y, "OUCH!", "#ff0000", 20);
                            // Knockback?
                            player.dx = m.dx > 0 ? 5 : -5;
                            player.dy = -4;
                        }
                    }
                }
            }
        });
    }

    function checkLadderState() {
        let touchingLadder = false;
        ladders.forEach(l => {
            // Ladder hitbox NARROWER for precision (was +10 offset, -20 width = 20px effective)
            // New: +15 offset, -30 width = 10px effective width (since l.w is 40)
            if (overlap(player, { x: l.x + 15, y: l.y, w: l.w - 30, h: l.h })) {
                touchingLadder = true;
            }
        });

        if (touchingLadder) {
            if (keys.up || keys.down) player.climbing = true;
        } else {
            player.climbing = false;
        }

        // Jump off ladder
        if (player.climbing && keys.up && isGroundedOnSomething()) {
            player.climbing = false; // Normal jump logic takes over next frame if grounded
        }
    }

    function isGroundedOnSomething() {
        // Simple check if close to ground (simplified)
        return player.y >= LEVEL_FLOOR - player.h - 5;
    }

    function checkCollisionX() {
        // Static Platforms
        platforms.forEach(p => {
            if (p.type === 'cloud') return;
            resolveX(p);
        });
        // Moving Platforms
        movingPlatforms.forEach(p => {
            resolveX(p);
        });
    }

    function resolveX(p) {
        if (overlap(player, p)) {
            if (player.dx > 0) player.x = p.x - player.w;
            else if (player.dx < 0) player.x = p.x + p.w;
            player.dx = 0;
        }
    }

    function checkCollisionY() {
        // Static
        platforms.forEach(p => {
            resolveY(p);
        });
        // Moving
        movingPlatforms.forEach(p => {
            resolveY(p);
            // Carry player logic could go here if we wanted strict physics
            if (p.active && overlap(player, { x: p.x, y: p.y - 10, w: p.w, h: 10 }) && player.grounded) {
                // Simple friction/carrying
                player.x += (p.targetX - p.x) * 0.05;
            }
        });
    }

    function resolveY(p) {
        if (p.type === 'cloud' && player.dy < 0) return;
        if (overlap(player, p)) {
            if (player.dy > 0 && player.y + player.h - player.dy <= p.y + 10) {
                player.grounded = true;
                player.dy = 0;
                player.y = p.y - player.h;
            } else if (player.dy < 0 && p.type !== 'cloud') {
                player.dy = 0;
                player.y = p.y + p.h;
            }
        }
    }

    function overlap(a, b) {
        return a.x < b.x + b.w && a.x + a.w > b.x &&
            a.y < b.y + b.h && a.y + a.h > b.y;
    }

    function triggerGameOver() {
        state.playing = false;
        state.gameOver = true;
        const goOverlay = document.getElementById('game-over-overlay');
        goOverlay.classList.remove('hidden');
        goOverlay.style.display = 'flex'; // Show overlay

        // Reset Animations to ensure they play
        const h1s = goOverlay.querySelectorAll('h1');
        const btn = document.getElementById('try-again-btn');

        if (h1s[0]) {
            h1s[0].style.animation = 'none';
            h1s[0].offsetHeight; /* trigger reflow */
            h1s[0].style.animation = null;
        }
        if (h1s[1]) {
            h1s[1].style.animation = 'none';
            h1s[1].offsetHeight; /* trigger reflow */
            h1s[1].style.animation = null;
        }
        if (btn) {
            btn.style.animation = 'none';
            btn.offsetHeight; /* trigger reflow */
            btn.style.animation = null;
        }

        const bgm = document.getElementById('bgm');
        if (bgm) bgm.pause();
        const vBgm = document.getElementById('victory-bgm');
        if (vBgm) vBgm.pause();

        // Play Game Over Music
        const goBgm = document.getElementById('gameover-bgm');
        if (goBgm) {
            goBgm.currentTime = 0;
            goBgm.volume = 0.5;
            goBgm.play().catch(e => console.log("Game Over Audio play failed:", e));
        }
    }

    function checkItems() {
        items.forEach(i => {
            const hitBoxSize = i.image ? 55 : 30; // Larger hitbox for images (65px visual -> 55px hit)
            if (!i.collected && overlap(player, { x: i.x, y: i.y, w: hitBoxSize, h: hitBoxSize })) {
                i.collected = true;
                state.score++;
                itemCountElement.innerText = state.score;

                // Spawn Pop Particle
                // If it's an image item, maybe use a specific icon? 
                // For now, let's use the emoji mapped or a default sparkle
                const icon = i.icon || (i.image === 'lipstick' ? '💄' : i.image === 'cake' ? '🍰' : i.image === 'guitar' ? '🎸' : '✨');
                spawnParticle(player.x, player.y - 20, icon, "#ff4081", 20); // Larger, moving up

                if (i.hidden) {
                    spawnParticle(i.x, i.y, "SECRET FOUND!", "#ffd700", 15);

                    // Trigger Secret Gift Popup
                    const giftOverlay = document.getElementById('gift-overlay');
                    const giftImg = document.getElementById('gift-reveal-img');
                    const giftDesc = document.getElementById('gift-description');

                    if (giftImg && i.image && assets[i.image]) {
                        giftImg.src = assets[i.image].src;
                    }
                    if (giftDesc && i.description) {
                        giftDesc.innerText = i.description;
                    }

                    giftOverlay.classList.remove('hidden');
                    state.playing = false; // Pause Game
                }
                else spawnParticle(i.x, i.y, "YEAY! +100", 60);
            }
        });
    }

    function checkWin() {
        // Door Hitbox: Center 3000. Visually drawn at 3000.
        // Make it small and low (Door size).
        // Center X = 3000. Width = 40. X = 2980.
        // Bottom Y = LEVEL_FLOOR (350). Height = 60. Y = 290.
        const castleRect = { x: 2980, y: 290, w: 40, h: 60 };

        if (overlap(player, castleRect) && state.score >= TOTAL_ITEMS) {
            state.playing = false;
            // Show Victory Overlay!
            const victoryOverlay = document.getElementById('victory-overlay');
            victoryOverlay.style.display = 'flex';

            // Text Animation Re-trigger (hacky reflow)
            const vText = victoryOverlay.querySelector('.victory-text');
            if (vText) { // Check if vText exists
                vText.style.animation = 'none';
                vText.offsetHeight; /* trigger reflow */
                vText.style.animation = null;
            }

            // Stop Music
            const bgm = document.getElementById('bgm');
            if (bgm) bgm.pause();

            // Play Victory Music
            const vBgm = document.getElementById('victory-bgm');
            if (vBgm) {
                vBgm.currentTime = 0;
                vBgm.volume = 0.5;
                vBgm.play().catch(e => console.log("Victory Audio play failed:", e));
            }
        }
    }

    function respawn() {
        player.x = 50; player.y = 200; player.dy = 0; player.climbing = false;
    }

    function updateParticles() {
        for (let i = particles.length - 1; i >= 0; i--) {
            particles[i].y -= particles[i].speedY || 1;
            particles[i].life--;
            if (particles[i].dust) {
                particles[i].x += (Math.random() - 0.5) * 2; // Spread dust
            }
            if (particles[i].life <= 0) particles.splice(i, 1);
        }
    }

    function spawnParticle(x, y, text, life = 60, dust = false) {
        particles.push({
            x, y, text, life, dust,
            speedY: dust ? 0.5 : 2 // Text floats faster
        });
    }

    function checkSignInteraction() {

        // LEVER INTERACTION
        levers.forEach(l => {
            const dist = Math.abs((player.x + player.w / 2) - (l.x + l.w / 2));
            if (dist < 50 && Math.abs(player.y - l.y) < 100) {
                l.pulled = !l.pulled; // Toggle
                // SFX or Particle?
                spawnParticle(l.x, l.y - 20, l.pulled ? "ON!" : "OFF", 40);

                // Trigger Platform
                if (l.id === 1) {
                    movingPlatforms[0].active = l.pulled;
                }
                return; // prioritize lever
            }
        });

        const overlay = document.getElementById('sign-overlay');
        const textElement = document.getElementById('sign-text');
        // ... (rest of sign logic)

        // If overlay is open, close it
        if (!overlay.classList.contains('hidden')) {
            overlay.classList.add('hidden');
            state.playing = true; // Resume if we paused? (Optional)
            return;
        }

        // Check distance to signs
        if (state.score < TOTAL_ITEMS) {
            let found = false;
            signs.forEach(s => {
                const dist = Math.abs((player.x + player.w / 2) - (s.x + s.w / 2));
                if (dist < 50) { // Close enough
                    textElement.innerText = s.message;
                    overlay.classList.remove('hidden');
                    found = true;
                }
            });

            if (!found) {
                // creating a particle if pressing F nowhere? Nah.
            }
        }
    }

    // --- Rendering ---

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Sky
        const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        grad.addColorStop(0, '#bae6fd'); grad.addColorStop(1, '#f0f9ff');
        ctx.fillStyle = grad; ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Parallax
        ctx.save(); ctx.translate(-(state.cameraX * 0.2), 0); drawHillsLayer(); ctx.restore();
        ctx.save(); ctx.translate(-(state.cameraX * 0.5), 0); drawBushesLayer(); ctx.restore();

        // World
        ctx.save();
        ctx.translate(-Math.floor(state.cameraX), 0);

        // Clouds
        drawCloud(100, 50); drawCloud(800, 80); drawCloud(1600, 40);

        // Ladders (Behind Player)
        ctx.fillStyle = '#8B4513'; // SaddleBrown
        ladders.forEach(l => {
            // Rails (Pixelated - Thicker)
            ctx.fillRect(l.x, l.y, 6, l.h);
            ctx.fillRect(l.x + l.w - 6, l.y, 6, l.h);
            // Rungs (Chunky)
            for (let y = l.y; y < l.y + l.h; y += 20) {
                ctx.fillRect(l.x, y, l.w, 6);
            }
        });

        // Platforms
        platforms.forEach(p => {
            if (p.type === 'ground') {
                // Pixelated Ground
                ctx.fillStyle = '#ff99cc'; ctx.fillRect(p.x, p.y, p.w, p.h);
                ctx.fillStyle = '#ff66b2'; ctx.fillRect(p.x, p.y, p.w, 10);
                // 8-Bit Texture (Checkerboard-ish)
                ctx.fillStyle = 'rgba(255,255,255,0.3)';
                for (let i = 0; i < p.w; i += 20) {
                    for (let j = 0; j < p.h; j += 20) {
                        if (((i + j) / 20) % 2 === 0) ctx.fillRect(p.x + i, p.y + j, 10, 10);
                    }
                }
            } else if (p.type === 'block') {
                // 8-Bit Box
                ctx.fillStyle = '#fdba74'; ctx.fillRect(p.x, p.y, p.w, p.h);
                // Pixel Border (Manual rects instead of stroke)
                ctx.fillStyle = '#c2410c';
                ctx.fillRect(p.x, p.y, p.w, 4); // Top
                ctx.fillRect(p.x, p.y + p.h - 4, p.w, 4); // Bottom
                ctx.fillRect(p.x, p.y, 4, p.h); // Left
                ctx.fillRect(p.x + p.w - 4, p.y, 4, p.h); // Right

                // Bolts (Big Pixels)
                ctx.fillStyle = '#7c2d12';
                ctx.fillRect(p.x + 6, p.y + 6, 6, 6); ctx.fillRect(p.x + p.w - 12, p.y + 6, 6, 6);
                ctx.fillRect(p.x + 6, p.y + p.h - 12, 6, 6); ctx.fillRect(p.x + p.w - 12, p.y + p.h - 12, 6, 6);
            } else {
                // Cloud Platforms (Pixelated)
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(p.x, p.y, p.w, p.h);
                // Simple shading or "stepped" corners? Just keep it as a clean rect for now or add a bottom shadow
                ctx.fillStyle = '#e2e8f0';
                ctx.fillRect(p.x, p.y + p.h - 5, p.w, 5);
            }
        });

        // Moving Platforms (Cloud Style)
        movingPlatforms.forEach(p => {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(p.x, p.y, p.w, p.h);
            ctx.fillStyle = '#e2e8f0';
            ctx.fillRect(p.x, p.y + p.h - 5, p.w, 5);
        });

        // Levers (8-Bit Style)
        levers.forEach(l => {
            ctx.fillStyle = '#555'; // Base
            ctx.fillRect(l.x, l.y + 20, 30, 10); // Base at y+20. If y=70, Base=90. Platform is at 100.
            // Wait, platform is at y=100. Base should be at y=90 to sit on it? 
            // Previous: y=80 -> Base=100.
            // Let's make sure it sits ON the platform (y=100). So Base bottom = 100. 
            // Rect is height 10. So y+20 should be 90. So y should be 70.

            if (l.pulled) {
                // Handle Right (ON)
                ctx.fillStyle = '#32CD32'; // Green Handle
                ctx.fillRect(l.x + 15, l.y + 10, 20, 10);
                ctx.fillRect(l.x + 30, l.y, 10, 10);
            } else {
                // Handle Left (OFF)
                ctx.fillStyle = '#FF4500'; // Red Handle
                ctx.fillRect(l.x - 5, l.y + 10, 20, 10);
                ctx.fillRect(l.x - 10, l.y, 10, 10);
            }

            // Interaction Hint
            if (Math.abs((player.x + player.w / 2) - (l.x + l.w / 2)) < 50) {
                ctx.fillStyle = 'white';
                ctx.font = '10px "Press Start 2P"';
                ctx.fillText("F", l.x + 10, l.y - 10);
            }
        });

        // Flowers
        flowers.forEach(f => drawPixelFlower(f.x, f.y));

        // Signs & Castle Logic
        if (state.score < TOTAL_ITEMS) {
            // Draw Trees (Decoration) - Between Signs
            // Signs are at 2700, 3000, 3300.
            // Trees at: 2850, 3150
            drawCherryTree(2850, LEVEL_FLOOR);
            drawCherryTree(3150, LEVEL_FLOOR);

            // Draw Signs ONLY if castle hasn't appeared
            signs.forEach(s => drawSign(s.x, s.y));

            // Instruction Text in Sky
            ctx.save();
            ctx.fillStyle = '#FF69B4'; // Hot Pink
            ctx.font = '20px "Press Start 2P", cursive'; // Pixel Font
            ctx.textAlign = 'center';
            ctx.shadowColor = 'white';
            ctx.shadowBlur = 4;
            // Moved up to 100 to clear 300px trees
            ctx.fillText("Go Near Board & Press F", 3000, 100);

            // Intro Text (Bigger & Pink)
            if (state.cameraX < 300) {
                ctx.save();
                ctx.fillStyle = '#FF69B4'; // Hot Pink
                ctx.font = '12px "Press Start 2P"'; // Smaller (was 16px)
                ctx.textAlign = 'center';
                ctx.shadowColor = 'white'; ctx.shadowBlur = 4;
                ctx.fillText("Can you find the things", 150, 140);
                ctx.fillText("prepared by Lathina?", 150, 170);
                ctx.restore();
            }
            ctx.restore();
        } else {
            // Draw Castle ONLY if all items collected
            if (assets.castle.complete && assets.castle.naturalWidth !== 0) {
                // Use Original Size
                const w = assets.castle.naturalWidth;
                const h = assets.castle.naturalHeight;
                // Center on Platform (Platform 8 is x=2600, w=800. Center = 3000)
                const centerX = 3000;
                ctx.drawImage(assets.castle, centerX - (w / 2), LEVEL_FLOOR - h, w, h);
            } else {
                drawProceduralCastle(castle.x - 85, LEVEL_FLOOR - 250, 250, 250);
            }
        }

        // Items
        // Items
        items.forEach(i => {
            if (!i.collected) {
                if (!i.hidden && i.image) {
                    // Draw Image Item with Hover Animation
                    ctx.save();
                    const bounce = Math.sin(Date.now() / 200) * 5;
                    const img = assets[i.image];
                    if (img && img.complete && img.naturalWidth !== 0) {
                        // Draw 65px
                        ctx.drawImage(img, i.x, i.y + bounce, 65, 65);
                    } else {
                        // Fallback text if image fails
                        ctx.font = '20px "Press Start 2P"'; ctx.fillText('?', i.x, i.y + bounce);
                    }
                    ctx.restore();
                } else if (!i.hidden) {
                    // Start of old visible logic (shouldn't happen for these 3, but good fallback)
                    ctx.save();
                    ctx.fillStyle = 'rgba(0, 0, 0, 1)'; ctx.shadowColor = 'white'; ctx.shadowBlur = 10;
                    const bounce = Math.sin(Date.now() / 200) * 5;
                    ctx.font = '20px "Press Start 2P"'; ctx.fillText(i.icon, i.x, i.y + bounce);
                    ctx.restore();
                } else {
                    // Hidden items logic - 8-bit style & difficulty tweak
                    // Faint longer, quick flash.
                    const time = Date.now();
                    // Sharp pulse: Stay low most of the time, spike briefly
                    const pulse = Math.pow((Math.sin(time / 200) + 1) / 2, 10); // Power 10 makes it very sharp
                    const alpha = 0.05 + (pulse * 0.8); // Base 0.05 (very faint) -> Flash to 0.85

                    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
                    ctx.font = '20px "Press Start 2P"'; ctx.fillText('✨', i.x + 5, i.y + 5);
                }
            }
        });



        // Player
        if (assets.player.complete && assets.player.naturalWidth !== 0) {
            ctx.save();

            // Invulnerability Effect (Flicker)
            if (Date.now() < player.invulnerableUntil) {
                ctx.globalAlpha = Math.sin(Date.now() / 50) > 0 ? 0.5 : 0.2;
            }

            if (!player.facingRight) {
                ctx.translate(player.x + player.w, player.y);
                ctx.scale(-1, 1);
                ctx.drawImage(assets.player, 0, 0, player.w, player.h);
            } else {
                ctx.drawImage(assets.player, player.x, player.y, player.w, player.h);
            }

            ctx.restore();

            // ** LIFE INDICATOR (Hearts above Head) **
            // Draw 3 hearts, empty or full
            for (let i = 0; i < 3; i++) {
                // Offset x centered above player
                const hx = player.x + (player.w / 2) - 20 + (i * 15);
                const hy = player.y - 15;
                ctx.font = '10px "Press Start 2P"';
                ctx.fillStyle = i < state.lives ? '#ef4444' : '#555'; // Red or Gray
                ctx.fillText('❤', hx, hy);
            }

        } else {
            ctx.fillStyle = 'red'; ctx.fillRect(player.x, player.y, player.w, player.h);
        }

        // Particles
        particles.forEach(p => {
            ctx.font = (p.fontSize || 10) + 'px "Press Start 2P"';
            ctx.fillStyle = p.color;
            ctx.fillText(p.text, p.x, p.y);
        });

        ctx.restore();
    }

    // Helpers
    function drawHillsLayer() {
        ctx.fillStyle = '#fbcfe8';
        for (let i = -200; i < 5000; i += 400) {
            ctx.beginPath(); ctx.ellipse(i, 350, 250, 200, 0, Math.PI, 0); ctx.fill();
            ctx.fillStyle = 'rgba(255,255,255,0.4)';
            ctx.beginPath(); ctx.arc(i, 250, 20, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#fbcfe8';
        }
    }

    function drawBushesLayer() {
        ctx.fillStyle = '#a7f3d0';
        for (let i = 0; i < 5000; i += 300) {
            let x = i + 100; let y = 350;
            ctx.beginPath(); ctx.arc(x, y, 40, 0, Math.PI * 2); ctx.arc(x + 50, y - 20, 50, 0, Math.PI * 2); ctx.arc(x + 100, y, 40, 0, Math.PI * 2); ctx.fill();
        }
    }

    function drawCloud(x, y) {
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        // Pixelated Cloud Shape (Rectangles)
        // Center
        ctx.fillRect(x + 20, y - 20, 80, 60);
        // Left Bump
        ctx.fillRect(x - 10, y + 10, 30, 30);
        // Right Bump
        ctx.fillRect(x + 100, y, 30, 40);
        // Top Bump
        ctx.fillRect(x + 40, y - 40, 40, 20);

        // Eyes (Pixelated)
        ctx.fillStyle = 'black';
        ctx.fillRect(x + 40, y - 5, 6, 6);
        ctx.fillRect(x + 70, y - 5, 6, 6);
    }

    function drawPixelFlower(x, y) {
        // Simple 8-bit flower
        // Stem
        ctx.fillStyle = '#22c55e'; // Green
        ctx.fillRect(x, y - 10, 2, 10);
        // Petals
        ctx.fillStyle = '#ec4899'; // Pink
        ctx.fillRect(x - 2, y - 12, 2, 2);
        ctx.fillRect(x + 2, y - 12, 2, 2);
        ctx.fillRect(x, y - 14, 2, 2);
        ctx.fillRect(x, y - 10, 2, 2);
        // Center
        ctx.fillStyle = 'yellow';
        ctx.fillRect(x, y - 12, 2, 2);
    }

    function drawProceduralCastle(x, y, w, h) {
        ctx.save();
        ctx.translate(x, y);
        const scale = w / 200; // Base design on 200x200 grid
        ctx.scale(scale, scale);

        // Main Body
        ctx.fillStyle = '#f9a8d4'; // Light Pink
        ctx.fillRect(50, 60, 100, 140);

        // Side Towers
        ctx.fillStyle = '#f472b6';
        ctx.fillRect(20, 80, 40, 120);
        ctx.fillRect(140, 80, 40, 120);

        // Roofs
        ctx.fillStyle = '#db2777'; // Dark Pink
        // Center Roof
        ctx.beginPath(); ctx.moveTo(50, 60); ctx.lineTo(100, 10); ctx.lineTo(150, 60); ctx.fill();
        // Side Roofs
        ctx.beginPath(); ctx.moveTo(20, 80); ctx.lineTo(40, 40); ctx.lineTo(60, 80); ctx.fill();
        ctx.beginPath(); ctx.moveTo(140, 80); ctx.lineTo(160, 40); ctx.lineTo(180, 80); ctx.fill();

        // Door
        ctx.fillStyle = '#831843'; // Dark Red/Purple
        ctx.beginPath(); ctx.arc(100, 200, 30, Math.PI, 0); ctx.fill();

        // Windows
        ctx.fillStyle = '#fdf2f8'; // White-ish
        ctx.fillRect(40, 100, 10, 20);
        ctx.fillRect(150, 100, 10, 20);
        ctx.beginPath(); ctx.arc(100, 90, 15, 0, Math.PI * 2); ctx.fill();

        // Flags
        ctx.strokeStyle = '#831843'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(100, 10); ctx.lineTo(100, -10); ctx.stroke();
        ctx.fillStyle = '#ef4444'; // Red Flag
        ctx.beginPath(); ctx.moveTo(100, -10); ctx.lineTo(120, -5); ctx.lineTo(100, 0); ctx.fill();

        ctx.restore();
    }

    function drawSign(x, y) {
        ctx.fillStyle = '#8B4513'; // Post
        ctx.fillRect(x + 15, y + 20, 10, 40);
        ctx.fillStyle = '#A0522D'; // Board
        ctx.fillRect(x, y, 40, 25);
        ctx.fillStyle = '#6D4C41'; // Border
        ctx.strokeRect(x, y, 40, 25);

        // Fake text lines (8-bit style details)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fillRect(x + 5, y + 5, 20, 2);
        ctx.fillRect(x + 5, y + 10, 30, 2);
        ctx.fillRect(x + 5, y + 15, 15, 2);
    }

    function drawCherryTree(x, y) {
        if (assets.tree.complete && assets.tree.naturalWidth !== 0) {
            // Draw Tree Image (Centered on x, Bottom at y)
            // Requested height: 300px
            const h = 300;
            const ratio = assets.tree.naturalWidth / assets.tree.naturalHeight;
            const w = h * ratio;
            ctx.drawImage(assets.tree, x - (w / 2), y - h, w, h);
        } else {
            // Fallback if image not loaded yet
            ctx.save();
            ctx.translate(x, y);
            ctx.fillStyle = '#5D4037'; ctx.fillRect(-10, -80, 20, 80); // Trunk
            ctx.fillStyle = '#FFB7C5'; ctx.beginPath(); ctx.arc(0, -90, 40, 0, Math.PI * 2); ctx.fill(); // Leaves
            ctx.restore();
        }
    }

    // Loop
    function loop() {
        update();
        draw();
        if (state.playing) state.animationId = requestAnimationFrame(loop);
    }

    // Event Listeners
    window.addEventListener('keydown', e => {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
            e.preventDefault();
        }

        if (e.code === 'ArrowRight') keys.right = true;
        if (e.code === 'ArrowLeft') keys.left = true;
        if (e.code === 'ArrowUp' || e.code === 'Space') keys.up = true; // Use ArrowUp for climbing too
        if (e.code === 'ArrowDown') keys.down = true;

        // Sign Interaction
        if (e.code === 'KeyF') {
            checkSignInteraction();

            // Close Gift Popup
            const giftOverlay = document.getElementById('gift-overlay');
            if (!giftOverlay.classList.contains('hidden')) {
                giftOverlay.classList.add('hidden');
                state.playing = true; // Resume Game
                loop(); // Restart loop if stopped
            }
        }
        if (e.code === 'Escape') {
            document.getElementById('sign-overlay').classList.add('hidden');
        }
    });

    window.addEventListener('keyup', e => {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
            e.preventDefault();
        }

        if (e.code === 'ArrowRight') keys.right = false;
        if (e.code === 'ArrowLeft') keys.left = false;
        if (e.code === 'ArrowUp' || e.code === 'Space') keys.up = false;
        if (e.code === 'ArrowDown') keys.down = false;
    });

    const btnLeft = document.getElementById('btn-left');
    const btnRight = document.getElementById('btn-right');
    const btnJump = document.getElementById('btn-jump');
    // Add mobile climb? Maybe just jump for now.

    if (btnLeft) btnLeft.addEventListener('touchend', (e) => { e.preventDefault(); keys.left = false; });
    if (btnRight) btnRight.addEventListener('touchstart', (e) => { e.preventDefault(); keys.right = true; });
    if (btnRight) btnRight.addEventListener('touchend', (e) => { e.preventDefault(); keys.right = false; });

    if (btnJump) btnJump.addEventListener('touchstart', (e) => { e.preventDefault(); keys.up = true; });
    if (btnJump) btnJump.addEventListener('touchend', (e) => { e.preventDefault(); keys.up = false; });

    if (btnStartGame) {
        btnStartGame.addEventListener('click', () => {
            startNewGame();
        });
    }

    // Mute Button Logic
    const btnMute = document.getElementById('btn-mute');
    if (btnMute) {
        btnMute.addEventListener('click', () => {
            const bgm = document.getElementById('bgm');
            const vBgm = document.getElementById('victory-bgm');
            const goBgm = document.getElementById('gameover-bgm');

            let isMuted = false;

            if (bgm) {
                bgm.muted = !bgm.muted;
                isMuted = bgm.muted;
            }
            if (vBgm) {
                vBgm.muted = isMuted; // Sync mute state
            }
            if (goBgm) {
                goBgm.muted = isMuted; // Sync mute state
            }

            btnMute.innerText = isMuted ? '🔇' : '🔊';
        });
    }

    // Handle Window Resize (if fluid) or Zoom changes;
});
