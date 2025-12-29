// ============================================
// GAME CONSTANTS - See config.js for all constants
// ============================================

// ============================================
// SCENE AUDIO MANAGEMENT
// ============================================
const introMusic = document.getElementById('introMusic');
const foremanMusic = document.getElementById('foremanMusic');
const bgMusic = document.getElementById('bgMusic');
let introMusicFading = false;
let foremanMusicFading = false;

// Track current scene for audio failsafes
let currentSceneAudio = null; // 'intro', 'foreman', 'background', or null

// Stop all scene music - failsafe function
function stopAllSceneMusic() {
    // Stop intro music
    if (introMusic) {
        introMusic.pause();
        introMusic.currentTime = 0;
        introMusic.volume = 0.75;
    }
    introMusicFading = false;

    // Stop foreman music
    if (foremanMusic) {
        foremanMusic.pause();
        foremanMusic.currentTime = 0;
        foremanMusic.volume = 0.75;
    }
    foremanMusicFading = false;

    // Stop background music
    if (bgMusic) {
        bgMusic.pause();
    }

    currentSceneAudio = null;
}

// Ensure only the specified audio is playing
function ensureOnlyAudioPlaying(audioType) {
    // Stop everything first
    if (audioType !== 'intro' && introMusic && !introMusic.paused) {
        introMusic.pause();
        introMusic.currentTime = 0;
    }
    if (audioType !== 'foreman' && foremanMusic && !foremanMusic.paused) {
        foremanMusic.pause();
        foremanMusic.currentTime = 0;
    }
    if (audioType !== 'background' && bgMusic && !bgMusic.paused) {
        bgMusic.pause();
    }

    currentSceneAudio = audioType;
}

function playIntroMusic() {
    if (!introMusic) return;
    ensureOnlyAudioPlaying('intro');
    introMusic.volume = 0.75;
    introMusic.currentTime = 0;
    introMusic.play().catch(e => console.log('Intro music autoplay blocked:', e));
}

function fadeOutIntroMusic(duration = 500, callback = null) {
    if (!introMusic || introMusicFading) {
        if (callback) callback();
        return;
    }

    introMusicFading = true;
    const startVolume = introMusic.volume;
    const steps = 20;
    const stepDuration = duration / steps;
    const volumeStep = startVolume / steps;

    let currentStep = 0;
    const fadeInterval = setInterval(() => {
        currentStep++;
        introMusic.volume = Math.max(0, startVolume - (volumeStep * currentStep));

        if (currentStep >= steps) {
            clearInterval(fadeInterval);
            introMusic.pause();
            introMusic.currentTime = 0;
            introMusic.volume = 0.75;
            introMusicFading = false;
            currentSceneAudio = null;
            if (callback) callback();
        }
    }, stepDuration);
}

function playForemanMusic() {
    if (!foremanMusic) return;
    ensureOnlyAudioPlaying('foreman');
    foremanMusic.volume = 0.56; // 25% quieter than standard 0.75
    foremanMusic.currentTime = 0;
    foremanMusic.play().catch(e => console.log('Foreman music autoplay blocked:', e));
}

function fadeOutForemanMusic(duration = 800, callback = null) {
    if (!foremanMusic || foremanMusicFading) {
        if (callback) callback();
        return;
    }

    foremanMusicFading = true;
    const startVolume = foremanMusic.volume;
    const steps = 20;
    const stepDuration = duration / steps;
    const volumeStep = startVolume / steps;

    let currentStep = 0;
    const fadeInterval = setInterval(() => {
        currentStep++;
        foremanMusic.volume = Math.max(0, startVolume - (volumeStep * currentStep));

        if (currentStep >= steps) {
            clearInterval(fadeInterval);
            foremanMusic.pause();
            foremanMusic.currentTime = 0;
            foremanMusic.volume = 0.75;
            foremanMusicFading = false;
            currentSceneAudio = null;
            if (callback) callback();
        }
    }, stepDuration);
}

function startBackgroundMusic() {
    if (!bgMusic || dialogueActive) return;

    // Ensure no other scene music is playing
    ensureOnlyAudioPlaying('background');

    // Use saved volume or default to 30%
    const volume = currentVolume || 30;
    bgMusic.volume = volume / 100;

    bgMusic.play().then(() => {
        audioInitialized = true;
    }).catch(e => console.log('Background music autoplay blocked:', e));
}

// Restart all auto mining and elevator loops (called when returning to game)
function restartAutoLoops() {
    // Restart auto mining for all shafts with managers
    mineshafts.forEach((shaft, index) => {
        if (shaft && shaft.hasManager) {
            autoMine(index);
        }
    });

    // Restart auto elevator if it has a manager
    if (hasElevatorManager) {
        autoElevator();
    }
}

// ============================================
// FOREMAN SCENE
// ============================================
const FOREMAN_DIALOGUE = [
    {
        speaker: "Foreman Harris",
        text: "Well, well... so you're the new supervisor. Name's Harris. Been foreman here at Mine 22 for going on thirty-two years now."
    },
    {
        speaker: "You",
        text: "Thirty-two years? That's... quite the tenure. I'm looking forward to learning from your experience."
    },
    {
        speaker: "Foreman Harris",
        text: "Heh. <span class='emphasis'>Flattery.</span> That's new. The company sent you to <span class='emphasis'>'revitalize operations,'</span> I take it? That's what they told the last three supervisors too."
    },
    {
        speaker: "You",
        text: "The last three...? What happened to them?"
    },
    {
        speaker: "Foreman Harris",
        text: "Don't get me wrong — this mine's got plenty of coal left in her. More than plenty. It's just... well, some of the deeper shafts have their <span class='whisper'>quirks</span>."
    },
    {
        speaker: "You",
        text: "Quirks? What do you mean by that?"
    },
    {
        speaker: "Foreman Harris",
        text: "Listen, I'm going to give you the same advice I gave the others. Whether you take it is up to you."
    },
    {
        speaker: "Foreman Harris",
        text: "<span class='highlight'>Stay away from Shaft 21.</span> Don't dig there. Don't send workers there. Don't even think about reopening it."
    },
    {
        speaker: "You",
        text: "Shaft 21? Why? What's down there?"
    },
    {
        speaker: "Foreman Harris",
        text: "Back in '87, we broke through into something... <span class='emphasis'>different</span>. A cavern system that wasn't on any geological survey. The company got excited — thought we'd hit a new vein."
    },
    {
        speaker: "Foreman Harris",
        text: "We sent a crew of eight down to investigate. <span class='highlight'>Only three came back up.</span> And they... they weren't right after that. Wouldn't talk about what they saw."
    },
    {
        speaker: "You",
        text: "Five workers... lost? That's terrible. Was there a rescue operation?"
    },
    {
        speaker: "Foreman Harris",
        text: "Corporate sealed it off, buried the reports. Officially, it was a <span class='emphasis'>'structural collapse.'</span> But I was there. There was no collapse."
    },
    {
        speaker: "Foreman Harris",
        text: "The ones who came back — they'd wake up screaming about <span class='whisper'>lights in the dark. Lights that moved. Lights that watched.</span>"
    },
    {
        speaker: "You",
        text: "Lights that... watched? That doesn't make any sense."
    },
    {
        speaker: "Foreman Harris",
        text: "Two of them quit within the month. The third... well, that was your predecessor. <span class='emphasis'>Martinez</span>. Good man. Kept asking questions he shouldn't have."
    },
    {
        speaker: "You",
        text: "Wait — Martinez was one of the survivors? And he became supervisor?"
    },
    {
        speaker: "Foreman Harris",
        text: "One day he just... didn't show up. Company said he <span class='emphasis'>'moved on.'</span> His car was still in the parking lot for a week before someone came to tow it."
    },
    {
        speaker: "You",
        text: "..."
    },
    {
        speaker: "Foreman Harris",
        text: "So here's the deal, boss. You focus on Shafts 1 through 20, you'll do fine. Good coal, good workers, good production. Corporate stays happy, <span class='highlight'>you stay healthy</span>."
    },
    {
        speaker: "Foreman Harris",
        text: "But if you start getting curious about Shaft 21... well, I've said my piece. Just remember — <span class='whisper'>some things in this mine are older than the coal itself.</span>"
    },
    {
        speaker: "You",
        text: "I... I understand. Thank you for the warning, Harris."
    },
    {
        speaker: "Foreman Harris",
        text: "Now then — let's get you set up. Your first shaft's waiting. <span class='emphasis'>Welcome to Mine 22, Supervisor.</span>"
    }
];

let foremanDialogueIndex = 0;
let foremanSceneActive = false;
let foremanTextRevealing = false;
let foremanTextInterval = null;
let foremanFullText = '';

function beginForemanScene() {
    const foremanScreen = document.getElementById('foremanSceneScreen');
    const fadeOverlay = document.getElementById('fadeOverlay');

    foremanDialogueIndex = 0;
    foremanSceneActive = true;
    foremanTextRevealing = false;

    // Stop any other music before starting scene
    stopAllSceneMusic();

    // Fade to black
    fadeOverlay.classList.add('active');

    setTimeout(() => {
        // Show foreman scene
        foremanScreen.classList.add('active');

        // Play Foreman/Shaft21 music
        playForemanMusic();

        // Display first dialogue
        displayForemanDialogue();

        // Add click handler
        foremanScreen.addEventListener('click', advanceForemanDialogue);
        document.addEventListener('keydown', handleForemanKey);

        // Fade in
        setTimeout(() => {
            fadeOverlay.classList.remove('active');
        }, 300);
    }, 500);
}

function displayForemanDialogue() {
    const textEl = document.getElementById('foremanText');
    const speakerEl = document.getElementById('foremanSpeaker');
    const dialogue = FOREMAN_DIALOGUE[foremanDialogueIndex];

    if (dialogue) {
        // Set speaker and styling
        speakerEl.textContent = dialogue.speaker;

        // Add player class if it's the player speaking
        if (dialogue.speaker === "You") {
            speakerEl.classList.add('player');
        } else {
            speakerEl.classList.remove('player');
        }

        // Use typewriter effect
        revealForemanText(textEl, dialogue.text);
    }
}

function revealForemanText(element, htmlText) {
    // Clear any existing interval
    if (foremanTextInterval) {
        clearInterval(foremanTextInterval);
    }

    foremanFullText = htmlText;
    foremanTextRevealing = true;
    element.innerHTML = '';

    // Parse HTML and reveal character by character while preserving tags
    let plainText = '';
    let tagMap = []; // Maps plain text index to HTML structure
    let inTag = false;
    let currentTag = '';
    let htmlIndex = 0;

    // Build plain text and track where tags are
    for (let i = 0; i < htmlText.length; i++) {
        if (htmlText[i] === '<') {
            inTag = true;
            currentTag = '<';
        } else if (htmlText[i] === '>') {
            currentTag += '>';
            inTag = false;
            // Store tag at current plain text position
            if (!tagMap[plainText.length]) tagMap[plainText.length] = [];
            tagMap[plainText.length].push(currentTag);
            currentTag = '';
        } else if (inTag) {
            currentTag += htmlText[i];
        } else {
            plainText += htmlText[i];
        }
    }

    let charIndex = 0;
    const revealSpeed = 25; // ms per character

    foremanTextInterval = setInterval(() => {
        if (charIndex <= plainText.length) {
            // Rebuild HTML up to current character
            let result = '';
            let plainIndex = 0;
            let openTags = [];

            for (let i = 0; i <= charIndex; i++) {
                // Add any tags at this position
                if (tagMap[i]) {
                    for (let tag of tagMap[i]) {
                        result += tag;
                        // Track open/close tags
                        if (tag.startsWith('</')) {
                            openTags.pop();
                        } else if (!tag.endsWith('/>')) {
                            openTags.push(tag);
                        }
                    }
                }
                // Add character if not at end
                if (i < charIndex && i < plainText.length) {
                    result += plainText[i];
                }
            }

            // Close any open tags for valid HTML
            for (let i = openTags.length - 1; i >= 0; i--) {
                const tagName = openTags[i].match(/<(\w+)/)?.[1];
                if (tagName) result += `</${tagName}>`;
            }

            element.innerHTML = result;
            charIndex++;
        } else {
            clearInterval(foremanTextInterval);
            foremanTextInterval = null;
            foremanTextRevealing = false;
            element.innerHTML = htmlText; // Ensure final HTML is complete
        }
    }, revealSpeed);
}

function advanceForemanDialogue() {
    if (!foremanSceneActive) return;

    // If text is still revealing, show it all immediately
    if (foremanTextRevealing) {
        if (foremanTextInterval) {
            clearInterval(foremanTextInterval);
            foremanTextInterval = null;
        }
        document.getElementById('foremanText').innerHTML = foremanFullText;
        foremanTextRevealing = false;
        return;
    }

    foremanDialogueIndex++;

    if (foremanDialogueIndex >= FOREMAN_DIALOGUE.length) {
        endForemanScene();
    } else {
        displayForemanDialogue();
    }
}

function handleForemanKey(e) {
    if (!foremanSceneActive) return;
    if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        advanceForemanDialogue();
    }
}

function endForemanScene() {
    const foremanScreen = document.getElementById('foremanSceneScreen');
    const fadeOverlay = document.getElementById('fadeOverlay');

    foremanSceneActive = false;

    // Remove event listeners
    foremanScreen.removeEventListener('click', advanceForemanDialogue);
    document.removeEventListener('keydown', handleForemanKey);

    // Mark foreman scene as seen
    storyProgress.hasSeenForemanIntro = true;
    saveStoryProgress();

    // Fade out Foreman music
    fadeOutForemanMusic(800);

    // Fade to black
    fadeOverlay.classList.add('active');

    setTimeout(() => {
        // Hide foreman scene
        foremanScreen.classList.remove('active');

        // Ensure foreman music is stopped (failsafe)
        if (foremanMusic) {
            foremanMusic.pause();
            foremanMusic.currentTime = 0;
        }

        // Start the game
        setTimeout(() => {
            fadeOverlay.classList.remove('active');
            startBackgroundMusic();
        }, 300);
    }, 500);
}

// ============================================
// TITLE SCREEN CONTROLS
// ============================================
function startGame() {
    const fadeOverlay = document.getElementById('fadeOverlay');
    const titleScreen = document.getElementById('titleScreen');
    const introLetterScreen = document.getElementById('introLetterScreen');

    // Fade to black
    fadeOverlay.classList.add('active');

    // After fade completes, hide title screen and show intro letter
    setTimeout(() => {
        titleScreen.classList.add('hidden');

        // Check if player has seen intro before
        if (!storyProgress.hasSeenIntro) {
            // Show the intro letter screen and play intro music
            introLetterScreen.classList.add('active');
            playIntroMusic();
            setTimeout(() => {
                fadeOverlay.classList.remove('active');
            }, 300);
        } else {
            // Skip to game if already seen - start background music and restart loops
            setTimeout(() => {
                fadeOverlay.classList.remove('active');
                startBackgroundMusic();
                restartAutoLoops();
            }, 300);
        }
    }, 500);
}

function beginGameFromLetter() {
    const fadeOverlay = document.getElementById('fadeOverlay');
    const introLetterScreen = document.getElementById('introLetterScreen');

    // Mark intro as seen
    storyProgress.hasSeenIntro = true;
    saveStoryProgress();

    // Fade out intro music over 0.5s
    fadeOutIntroMusic(500);

    // Fade to black
    fadeOverlay.classList.add('active');

    setTimeout(() => {
        // Hide the intro letter
        introLetterScreen.classList.remove('active');

        // Check if player has seen the foreman intro
        if (!storyProgress.hasSeenForemanIntro) {
            // Show foreman scene
            fadeOverlay.classList.remove('active');
            setTimeout(() => {
                beginForemanScene();
            }, 100);
        } else {
            // Skip to game if already seen
            setTimeout(() => {
                fadeOverlay.classList.remove('active');
                startBackgroundMusic();
            }, 300);
        }
    }, 500);
}

function openAboutPanel() {
    document.getElementById('aboutPanelOverlay').classList.add('show');
}

function closeAboutPanel() {
    document.getElementById('aboutPanelOverlay').classList.remove('show');
}

function openCreditsPanel() {
    document.getElementById('creditsPanelOverlay').classList.add('show');
}

function closeCreditsPanel() {
    document.getElementById('creditsPanelOverlay').classList.remove('show');
}

function goToTitleScreen() {
    const fadeOverlay = document.getElementById('fadeOverlay');
    const titleScreen = document.getElementById('titleScreen');

    // Save current game state before leaving
    saveToLocalStorage();

    // Stop any running loops
    elevatorLoopId++;
    miningLoopId++;

    // Stop ALL music (failsafe)
    stopAllSceneMusic();

    // Close any open panels
    closeAllPanels();

    // Fade to black
    fadeOverlay.classList.add('active');

    setTimeout(() => {
        // Show title screen
        titleScreen.classList.remove('hidden');

        // Fade back in
        setTimeout(() => {
            fadeOverlay.classList.remove('active');
        }, 300);
    }, 500);
}

// ============================================
// MINE SWITCHING SYSTEM
// ============================================
function getCurrentMine() {
    return MINES[currentMineId];
}

function renderMapPanel() {
    const mapMines = document.getElementById('mapMines');
    const mapPaths = document.getElementById('mapPaths');
    const minesList = Object.values(MINES).sort((a, b) => a.order - b.order);

    // Define mine positions on the visual map (percentage-based)
    // Linear layout: upper-left to lower-right, room for 4 mines
    const minePositions = {
        mine22: { left: 15, top: 20 },  // Coal mine - upper left (starting mine)
        mine37: { left: 40, top: 35 },  // Copper mine - second position
        future: { left: 65, top: 50 }   // Future mine placeholder - third position
    };

    let minesHtml = '';
    let pathsHtml = '';
    const positions = [];

    minesList.forEach((mine, index) => {
        const isUnlocked = minesUnlocked[mine.id];
        const isCurrent = currentMineId === mine.id;
        let statusClass = 'locked';
        let statusText = 'Locked';
        let clickHandler = '';

        if (isCurrent) {
            statusClass = 'current';
            statusText = 'Current Location';
        } else if (isUnlocked) {
            statusClass = 'unlocked';
            statusText = 'Click to Travel';
            clickHandler = `onclick="switchToMine('${mine.id}')"`;
        }

        const pos = minePositions[mine.id] || { left: 50 + index * 15, top: 50 };
        positions.push({ ...pos, id: mine.id });

        const fallbackIcon = isUnlocked ? (mine.ore === 'coal' ? '⛏️' : '🔶') : '🔒';
        // Use logo if available and mine is unlocked
        const iconHtml = (mine.logo && isUnlocked)
            ? `<img src="${mine.logo}" alt="${mine.name}" onerror="this.style.display='none';this.nextElementSibling.style.display='block'"><span style="display:none">${fallbackIcon}</span>`
            : fallbackIcon;

        minesHtml += `
            <div class="map-mine-marker ${statusClass}" id="mapMine-${mine.id}"
                 style="left: ${pos.left}%; top: ${pos.top}%; transform: translate(-50%, -50%);"
                 ${clickHandler}>
                <div class="mine-marker-icon">${iconHtml}</div>
                <div class="mine-marker-label">
                    <div class="mine-marker-name">${mine.name}</div>
                    <div class="mine-marker-status">${statusText}</div>
                </div>
            </div>
        `;
    });

    // Add future mine placeholder
    const futurePos = minePositions.future;
    minesHtml += `
        <div class="map-mine-marker locked"
             style="left: ${futurePos.left}%; top: ${futurePos.top}%; transform: translate(-50%, -50%);">
            <div class="mine-marker-icon">❓</div>
            <div class="mine-marker-label">
                <div class="mine-marker-name">???</div>
                <div class="mine-marker-status">Locked</div>
            </div>
        </div>
    `;

    // Draw paths between mines (SVG lines) - use viewBox coordinates (0-100)
    // Add viewBox attribute to SVG for percentage-like positioning
    mapPaths.setAttribute('viewBox', '0 0 100 100');
    mapPaths.setAttribute('preserveAspectRatio', 'none');

    for (let i = 0; i < positions.length - 1; i++) {
        const from = positions[i];
        const to = positions[i + 1];
        pathsHtml += `<path d="M ${from.left} ${from.top} L ${to.left} ${to.top}" />`;
    }
    // Path to future mine
    if (positions.length > 0) {
        const lastMine = positions[positions.length - 1];
        pathsHtml += `<path d="M ${lastMine.left} ${lastMine.top} L ${futurePos.left} ${futurePos.top}" style="opacity: 0.4;" />`;
    }

    mapMines.innerHTML = minesHtml;
    mapPaths.innerHTML = pathsHtml;
}

function checkMineUnlocks() {
    Object.keys(MINES).forEach(mineId => {
        if (!minesUnlocked[mineId]) {
            const mine = MINES[mineId];
            if (mine.unlockRequirement) {
                const req = mine.unlockRequirement;
                if (req.type === 'coal' && totalCoalMined >= req.amount) {
                    minesUnlocked[mineId] = true;
                    renderMapPanel();
                }
            }
        }
    });
}

function saveCurrentMineState() {
    // Save current mine's state
    mineStates[currentMineId] = {
        mineshafts: JSON.parse(JSON.stringify(mineshafts)),
        elevatorLevel: elevatorLevel,
        hasElevatorManager: hasElevatorManager,
        elevatorManagerAbility: elevatorManagerAbility,
        totalOreMined: currentMineId === 'mine22' ? totalCoalMined : totalCopperMined,
        lastActiveTime: Date.now()
    };
}

function calculateIdleRewards(mineId) {
    const state = mineStates[mineId];
    if (!state || !state.lastActiveTime || !state.mineshafts || state.mineshafts.length === 0) {
        return null;
    }

    const now = Date.now();
    const elapsedMs = now - state.lastActiveTime;
    const elapsedSeconds = elapsedMs / 1000;

    // Cap idle time at 8 hours
    const maxIdleSeconds = 8 * 60 * 60;
    const cappedSeconds = Math.min(elapsedSeconds, maxIdleSeconds);

    // Calculate production based on mine state
    let totalOrePerSecond = 0;
    const mine = MINES[mineId];

    // Only calculate if there's a manager to automate
    state.mineshafts.forEach((shaft, idx) => {
        if (shaft.hasManager) {
            // Approximate ore per second (assuming ~3 second mining cycle)
            const baseCoal = Math.pow(SHAFT_BASE_COAL_MULTIPLIER, idx);
            const coal = baseCoal * Math.pow(COAL_PER_LEVEL_MULTIPLIER, shaft.level - 1);
            totalOrePerSecond += coal / 3;
        }
    });

    // If elevator has manager, we can actually sell
    if (state.hasElevatorManager && totalOrePerSecond > 0) {
        const totalOre = Math.floor(totalOrePerSecond * cappedSeconds);
        const moneyEarned = Math.floor(totalOre * mine.valueMultiplier);

        return {
            mineId: mineId,
            mineName: mine.name,
            ore: mine.ore,
            oreIcon: mine.oreIcon,
            oreMined: totalOre,
            moneyEarned: moneyEarned
        };
    }

    return null;
}

function switchToMine(targetMineId) {
    if (targetMineId === currentMineId) return;
    if (!minesUnlocked[targetMineId]) return;

    // Save current mine state
    saveCurrentMineState();

    // Calculate idle rewards for target mine
    pendingIdleRewards = calculateIdleRewards(targetMineId);

    // Get target mine name
    const targetMine = MINES[targetMineId];
    const loadingScreen = document.getElementById('loadingScreen');
    const loadingText = document.getElementById('loadingText');
    const loadingProgress = document.getElementById('loadingProgressFill');

    // Show loading screen
    loadingText.textContent = `Traveling to ${targetMine.name}...`;
    loadingProgress.style.width = '0%';
    loadingScreen.classList.add('active');

    // Close map panel
    closeAllPanels();

    // Progress animation
    let progress = 0;
    const progressInterval = setInterval(() => {
        progress += 5;
        loadingProgress.style.width = Math.min(progress, 90) + '%';
        if (progress >= 90) {
            clearInterval(progressInterval);
        }
    }, 50);

    // Allow time for state to properly reset
    setTimeout(() => {
        // Stop all loops and reset elevator state
        elevatorLoopId++;
        miningLoopId++;

        // Reset elevator to default position before switching
        const elevator = document.getElementById('elevator');
        const elevatorOperator = document.getElementById('elevatorOperator');
        if (elevator) {
            elevator.style.transition = 'none';
            elevator.style.top = '35px';
        }
        if (elevatorOperator) {
            elevatorOperator.style.transition = 'none';
            elevatorOperator.style.top = '55px';
            elevatorOperator.style.left = '175px';
        }

        // Reset elevator carrying
        elevatorCarrying = 0;
        operatorState = 'idle';

        // Switch mine
        currentMineId = targetMineId;
        loadMineState(targetMineId);

        // Update UI theme
        updateMineTheme();

        // Rebuild the game view (this will properly initialize new mine state)
        rebuildGameView();

        // Update map to show new current mine
        renderMapPanel();

        // Complete progress
        clearInterval(progressInterval);
        loadingProgress.style.width = '100%';

        setTimeout(() => {
            // Hide loading screen
            loadingScreen.classList.remove('active');

            // Re-enable elevator transitions
            if (elevator) {
                elevator.style.transition = '';
            }
            if (elevatorOperator) {
                elevatorOperator.style.transition = '';
            }

            // Show idle rewards if any
            if (pendingIdleRewards) {
                setTimeout(() => {
                    showIdleRewardsModal(pendingIdleRewards);
                }, 200);
            }
        }, 400);
    }, 800);
}

function loadMineState(mineId) {
    // Stop any running elevator and mining loops before switching
    elevatorLoopId++;
    miningLoopId++;

    const state = mineStates[mineId];
    if (state && state.mineshafts && state.mineshafts.length > 0) {
        mineshafts = JSON.parse(JSON.stringify(state.mineshafts));
        elevatorLevel = state.elevatorLevel || 1;
        hasElevatorManager = state.hasElevatorManager || false;
        elevatorManagerAbility = state.elevatorManagerAbility || null;
    } else {
        // Initialize new mine with one shaft
        mineshafts = [];
        elevatorLevel = 1;
        hasElevatorManager = false;
        elevatorManagerAbility = null;
    }

    // Reset elevator state for the new mine
    operatorState = 'idle';
    elevatorCarrying = 0;

    // Update last active time
    mineStates[mineId].lastActiveTime = Date.now();
}

function rebuildGameView() {
    // Clear existing mineshafts
    mineshaftsContainer.innerHTML = '';

    // Store the saved shaft data before clearing
    const savedShaftData = JSON.parse(JSON.stringify(mineshafts));
    mineshafts = [];

    // If no saved shafts, create initial one
    if (savedShaftData.length === 0) {
        createMineshaft(0);
    } else {
        // Recreate shafts with saved data
        for (let i = 0; i < savedShaftData.length; i++) {
            const shaft = createMineshaft(i);
            const saved = savedShaftData[i];

            // Restore saved state
            shaft.level = saved.level || 1;
            shaft.bucketCoal = saved.bucketCoal || 0;
            shaft.elements.levelBtn.textContent = shaft.level;
            updateShaftBucket(i);

            // Restore manager if had one
            if (saved.hasManager) {
                shaft.hasManager = true;
                shaft.managerAbility = saved.managerAbility;
                shaft.elements.managerSlot.classList.add('hired');
                shaft.elements.managerSlot.innerHTML = `
                    <div class="worker manager" style="position: relative;">
                        <div class="worker-body">
                            <div class="worker-helmet"><div class="worker-helmet-light"></div></div>
                            <div class="worker-head"></div>
                            <div class="worker-torso"></div>
                            <div class="worker-legs"></div>
                        </div>
                    </div>
                `;
                shaft.elements.minerStatus.textContent = 'Auto';
                autoMine(i);
            }
        }
    }

    // Update mine indicator
    updateMineIndicator();

    // Update elevator
    updateElevatorCapacityDisplay();
    document.getElementById('elevatorLevelDisplay').textContent = elevatorLevel;

    // Reset elevator manager slot first
    elevatorManagerSlot.classList.remove('hired');
    elevatorManagerSlot.innerHTML = '<span class="plus-icon">+</span>';
    operatorStatus.textContent = 'Click elevator!';

    // Restore elevator manager if had one
    if (hasElevatorManager) {
        elevatorManagerSlot.classList.add('hired');
        elevatorManagerSlot.innerHTML = `
            <div class="worker manager" style="position: relative;">
                <div class="worker-body">
                    <div class="worker-helmet"><div class="worker-helmet-light"></div></div>
                    <div class="worker-head"></div>
                    <div class="worker-torso"></div>
                    <div class="worker-legs"></div>
                </div>
            </div>
        `;
        operatorStatus.textContent = 'Auto';
        autoElevator();
    }

    // Update buy shaft button
    updateBuyShaftButton();
}

function updateMineIndicator() {
    const mine = getCurrentMine();
    const indicator = document.getElementById('mineIndicator');
    const nameEl = document.getElementById('mineIndicatorName');

    nameEl.textContent = mine.shortName;

    // Update theme class
    indicator.classList.remove('copper');
    if (mine.ore === 'copper') {
        indicator.classList.add('copper');
    }
}

function updateMineTheme() {
    const mine = getCurrentMine();
    const gameContainer = document.getElementById('gameContainer');

    gameContainer.classList.remove('copper-theme');
    if (mine.ore === 'copper') {
        gameContainer.classList.add('copper-theme');
    }
}

function showIdleRewardsModal(rewards) {
    document.getElementById('idleRewardsMine').textContent = rewards.mineName;
    document.getElementById('idleRewardIcon').textContent = rewards.oreIcon;
    document.getElementById('idleRewardOre').textContent = formatNumber(rewards.oreMined);
    document.getElementById('idleRewardMoney').textContent = '$' + formatNumber(rewards.moneyEarned);

    document.getElementById('idleRewardsModal').classList.add('show');
}

function collectIdleRewards() {
    if (pendingIdleRewards) {
        // Apply rewards
        money += pendingIdleRewards.moneyEarned;
        totalMoneyEarned += pendingIdleRewards.moneyEarned;

        if (pendingIdleRewards.ore === 'coal') {
            totalCoalMined += pendingIdleRewards.oreMined;
        } else if (pendingIdleRewards.ore === 'copper') {
            totalCopperMined += pendingIdleRewards.oreMined;
        }

        // Award XP for idle mining
        addXP(pendingIdleRewards.oreMined * XP_PER_RESOURCE);

        updateStats();
        checkAchievements();

        pendingIdleRewards = null;
    }

    document.getElementById('idleRewardsModal').classList.remove('show');
}

// ============================================
// GAME STATE CLASS
// Consolidates all game state for cleaner architecture
// ============================================
class GameState {
    constructor() {
        // Player resources
        this.money = 0;
        this.notes = 0;
        this.playerXP = 0;

        // Statistics
        this.stats = {
            totalCoalSold: 0,
            totalCoalMined: 0,
            totalCopperMined: 0,
            totalMoneyEarned: 0
        };

        // Elevator state
        this.elevator = {
            level: 1,
            carrying: 0,
            hasManager: false,
            managerAbility: null,
            loopId: 0
        };

        // Operator state
        this.operatorState = 'idle';

        // Mine state
        this.currentMineId = 'mine22';
        this.minesUnlocked = { mine22: true, mine37: false };
        this.mineshafts = [];
        this.miningLoopId = 0;

        // Mine-specific state storage (for idle rewards when switching mines)
        this.mineStates = {
            mine22: {
                mineshafts: [],
                elevatorLevel: 1,
                hasElevatorManager: false,
                elevatorManagerAbility: null,
                totalOreMined: 0,
                lastActiveTime: Date.now()
            },
            mine37: {
                mineshafts: [],
                elevatorLevel: 1,
                hasElevatorManager: false,
                elevatorManagerAbility: null,
                totalOreMined: 0,
                lastActiveTime: null
            }
        };

        // Pending idle rewards
        this.pendingIdleRewards = null;

        // Shop state
        this.shop = {
            totalNotesSpent: 0,
            activeBoosts: {},
            dailyExchangeCount: 0,
            lastExchangeDate: null
        };

        // Achievements
        this.achievementsState = {};

        // UI state
        this.selectedShaftIndex = -1;
        this.upgradeMode = 'shaft';

        // Timing
        this.lastNoteTime = Date.now();
        this.lastSaveTime = null;

        // Audio state
        this.currentVolume = 30;
        this.audioInitialized = false;
    }

    // Get current mine config
    getCurrentMine() {
        return MINES[this.currentMineId];
    }

    // Get ore type for current mine
    getCurrentOreType() {
        return this.getCurrentMine()?.ore || 'coal';
    }

    // Calculate player level from XP
    getPlayerLevel() {
        for (let i = LEVEL_XP_THRESHOLDS.length - 1; i >= 0; i--) {
            if (this.playerXP >= LEVEL_XP_THRESHOLDS[i]) {
                return i + 1;
            }
        }
        return 1;
    }

    // Get elevator capacity with all bonuses
    getElevatorCapacity() {
        let capacity = BASE_ELEVATOR_CAPACITY * Math.pow(ELEVATOR_CAPACITY_MULTIPLIER, this.elevator.level - 1);

        // Apply shop rank bonus
        const rankBonus = 1 + (typeof getShopRankBonus === 'function' ? getShopRankBonus('capacity') : 0);
        capacity *= rankBonus;

        // Apply active boosts
        if (typeof getActiveBoostMultiplier === 'function') {
            capacity *= getActiveBoostMultiplier('elevatorCapacityBoost');
        }

        // Apply manager capacity ability
        if (this.elevator.managerAbility?.type === 'capacity' &&
            this.elevator.managerAbility.activeUntil > Date.now()) {
            capacity *= (1 + ABILITY_EFFECTS.CAPACITY_BOOST_PERCENT);
        }

        return Math.floor(capacity);
    }

    // Export state for saving
    toSaveData() {
        return {
            version: SAVE_VERSION,
            money: this.money,
            notes: this.notes,
            playerXP: this.playerXP,
            stats: { ...this.stats },
            elevator: { ...this.elevator },
            currentMineId: this.currentMineId,
            minesUnlocked: { ...this.minesUnlocked },
            mineStates: JSON.parse(JSON.stringify(this.mineStates)),
            shop: { ...this.shop },
            achievementsState: { ...this.achievementsState },
            lastSaveTime: Date.now()
        };
    }

    // Import state from save data
    fromSaveData(data) {
        if (!data) return;

        this.money = data.money ?? 0;
        this.notes = data.notes ?? 0;
        this.playerXP = data.playerXP ?? 0;

        if (data.stats) {
            Object.assign(this.stats, data.stats);
        }

        if (data.elevator) {
            Object.assign(this.elevator, data.elevator);
        }

        this.currentMineId = data.currentMineId ?? 'mine22';

        if (data.minesUnlocked) {
            Object.assign(this.minesUnlocked, data.minesUnlocked);
        }

        if (data.mineStates) {
            this.mineStates = JSON.parse(JSON.stringify(data.mineStates));
        }

        if (data.shop) {
            Object.assign(this.shop, data.shop);
        }

        if (data.achievementsState) {
            this.achievementsState = { ...data.achievementsState };
        }

        this.lastSaveTime = data.lastSaveTime ?? null;
    }
}

// Create global game state instance
const gameState = new GameState();

// ============================================
// BACKWARD COMPATIBILITY LAYER
// Legacy global variables for existing code
// New code should use gameState.* properties
// Run syncGlobalsToGameState() after loading saves
// ============================================
let totalCoalSold = 0;
let totalCoalMined = 0;
let totalCopperMined = 0;
let totalMoneyEarned = 0;
let money = 0;
let notes = 0;
let playerXP = 0;
let operatorState = 'idle';
let hasElevatorManager = false;
let isElevatorMegaManager = false;
let elevatorLevel = 1;
let elevatorCarrying = 0;

// Notes earning system (1 note per minute of active play)
let lastNoteTime = Date.now();

// Sync legacy globals to GameState (call after loading saves)
function syncGlobalsToGameState() {
    gameState.money = money;
    gameState.notes = notes;
    gameState.playerXP = playerXP;
    gameState.stats.totalCoalSold = totalCoalSold;
    gameState.stats.totalCoalMined = totalCoalMined;
    gameState.stats.totalCopperMined = totalCopperMined;
    gameState.stats.totalMoneyEarned = totalMoneyEarned;
    gameState.elevator.level = elevatorLevel;
    gameState.elevator.carrying = elevatorCarrying;
    gameState.elevator.hasManager = hasElevatorManager;
    gameState.operatorState = operatorState;
    gameState.lastNoteTime = lastNoteTime;
}

// Sync GameState back to legacy globals (for future use)
function syncGameStateToGlobals() {
    money = gameState.money;
    notes = gameState.notes;
    playerXP = gameState.playerXP;
    totalCoalSold = gameState.stats.totalCoalSold;
    totalCoalMined = gameState.stats.totalCoalMined;
    totalCopperMined = gameState.stats.totalCopperMined;
    totalMoneyEarned = gameState.stats.totalMoneyEarned;
    elevatorLevel = gameState.elevator.level;
    elevatorCarrying = gameState.elevator.carrying;
    hasElevatorManager = gameState.elevator.hasManager;
    operatorState = gameState.operatorState;
    lastNoteTime = gameState.lastNoteTime;
}

// ============================================
// SAVE MANAGER
// Centralized save/load with error handling and recovery
// ============================================
class SaveManager {
    constructor() {
        this.STORAGE_KEY = 'dunhillMinerSave';
        this.BACKUP_KEY = 'dunhillMinerBackup';
        this.lastSaveTime = null;
        this.autosaveIntervalId = null;
        this.saveInProgress = false;
        this.failedSaveAttempts = 0;
        this.MAX_SAVE_RETRIES = 3;
    }

    // Create emergency backup before risky operations
    createBackup() {
        try {
            const currentSave = localStorage.getItem(this.STORAGE_KEY);
            if (currentSave) {
                localStorage.setItem(this.BACKUP_KEY, currentSave);
                return true;
            }
        } catch (e) {
            console.warn('Backup creation failed:', e);
        }
        return false;
    }

    // Restore from backup if main save is corrupted
    restoreFromBackup() {
        try {
            const backup = localStorage.getItem(this.BACKUP_KEY);
            if (backup) {
                localStorage.setItem(this.STORAGE_KEY, backup);
                console.log('Save restored from backup');
                return true;
            }
        } catch (e) {
            console.error('Backup restoration failed:', e);
        }
        return false;
    }

    // Validate save data structure
    validateSaveData(data) {
        if (!data || typeof data !== 'object') return false;

        // Check required fields exist
        const requiredFields = ['money', 'shafts'];
        for (const field of requiredFields) {
            if (!(field in data)) {
                console.warn(`Save validation failed: missing ${field}`);
                return false;
            }
        }

        // Check for obviously corrupt values
        if (typeof data.money !== 'number' || data.money < 0 || !isFinite(data.money)) {
            console.warn('Save validation failed: invalid money value');
            return false;
        }

        if (!Array.isArray(data.shafts)) {
            console.warn('Save validation failed: shafts is not an array');
            return false;
        }

        return true;
    }

    // Build save data object from current game state
    buildSaveData() {
        // Save current mine state first
        if (typeof saveCurrentMineState === 'function') {
            saveCurrentMineState();
        }

        const shaftsData = mineshafts.map(s => ({
            level: s.level,
            bucketCoal: s.bucketCoal,
            hasManager: s.hasManager,
            isMegaManager: s.isMegaManager || false,
            managerAbility: s.managerAbility ? {
                type: s.managerAbility.type,
                name: s.managerAbility.name,
                desc: s.managerAbility.desc,
                icon: s.managerAbility.icon,
                effect: s.managerAbility.effect,
                isMega: s.managerAbility.isMega || false,
                special: s.managerAbility.special || null,
                activeUntil: s.managerAbility.activeUntil,
                cooldownUntil: s.managerAbility.cooldownUntil,
                experience: s.managerAbility.experience || 0,
                rerollCount: s.managerAbility.rerollCount || 0
            } : null
        }));

        return {
            version: SAVE_VERSION,
            totalCoalSold,
            totalCoalMined,
            totalCopperMined,
            totalMoneyEarned,
            money,
            notes,
            elevatorLevel,
            hasElevatorManager,
            isElevatorMegaManager: typeof isElevatorMegaManager !== 'undefined' ? isElevatorMegaManager : false,
            elevatorManagerAbility: elevatorManagerAbility ? {
                type: elevatorManagerAbility.type,
                name: elevatorManagerAbility.name,
                desc: elevatorManagerAbility.desc,
                icon: elevatorManagerAbility.icon,
                effect: elevatorManagerAbility.effect,
                isMega: elevatorManagerAbility.isMega || false,
                special: elevatorManagerAbility.special || null,
                activeUntil: elevatorManagerAbility.activeUntil,
                cooldownUntil: elevatorManagerAbility.cooldownUntil,
                experience: elevatorManagerAbility.experience || 0,
                rerollCount: elevatorManagerAbility.rerollCount || 0
            } : null,
            achievementsState,
            shafts: shaftsData,
            currentMineId,
            minesUnlocked,
            mineStates,
            playerXP,
            activeBoosts,
            totalNotesSpent,
            dailyExchangeCount,
            lastExchangeDate,
            currentVolume: typeof currentVolume !== 'undefined' ? currentVolume : 30,
            // Prestige data
            bonds: typeof bonds !== 'undefined' ? bonds : 0,
            totalBondsEarned: typeof totalBondsEarned !== 'undefined' ? totalBondsEarned : 0,
            prestigeCount: typeof prestigeCount !== 'undefined' ? prestigeCount : 0,
            prestigeUpgradesPurchased: typeof prestigeUpgradesPurchased !== 'undefined' ? prestigeUpgradesPurchased : {},
            lastPlayTime: typeof lastPlayTime !== 'undefined' ? lastPlayTime : Date.now(),
            // Research data
            researchPoints: typeof researchPoints !== 'undefined' ? researchPoints : 0,
            totalResearchPointsEarned: typeof totalResearchPointsEarned !== 'undefined' ? totalResearchPointsEarned : 0,
            researchCompleted: typeof researchCompleted !== 'undefined' ? researchCompleted : {},
            savedAt: Date.now()
        };
    }

    // Save to localStorage with error handling
    saveToLocal() {
        if (this.saveInProgress) {
            console.log('Save already in progress, skipping');
            return false;
        }

        this.saveInProgress = true;

        try {
            const gameData = this.buildSaveData();

            if (!this.validateSaveData(gameData)) {
                throw new Error('Save data validation failed');
            }

            // Create backup before saving
            this.createBackup();

            const jsonData = JSON.stringify(gameData);

            // Check storage quota
            if (jsonData.length > 4.5 * 1024 * 1024) {
                console.warn('Save data approaching localStorage limit');
            }

            localStorage.setItem(this.STORAGE_KEY, jsonData);
            this.lastSaveTime = new Date();
            this.failedSaveAttempts = 0;

            if (typeof updateAutoSaveStatusDisplay === 'function') {
                updateAutoSaveStatusDisplay();
            }

            this.saveInProgress = false;
            return true;
        } catch (error) {
            this.saveInProgress = false;
            this.failedSaveAttempts++;

            console.error('Save failed:', error);

            if (error.name === 'QuotaExceededError') {
                this.handleStorageQuotaExceeded();
            }

            // Show error to user if multiple failures
            if (this.failedSaveAttempts >= this.MAX_SAVE_RETRIES) {
                this.showSaveError('Save failed multiple times. Your progress may not be saved.');
            }

            return false;
        }
    }

    // Handle localStorage quota exceeded
    handleStorageQuotaExceeded() {
        console.warn('Storage quota exceeded, attempting cleanup');

        // Remove backup to free space
        try {
            localStorage.removeItem(this.BACKUP_KEY);
        } catch (e) {}

        // Try to save again with minimal data
        try {
            const minimalData = this.buildSaveData();
            // Remove non-essential data
            delete minimalData.mineStates;
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(minimalData));
            console.log('Saved with reduced data due to quota');
        } catch (e) {
            console.error('Even minimal save failed:', e);
        }
    }

    // Load from localStorage with error handling and recovery
    loadFromLocal() {
        try {
            const saved = localStorage.getItem(this.STORAGE_KEY);
            if (!saved) return false;

            let data;
            try {
                data = JSON.parse(saved);
            } catch (parseError) {
                console.error('Save data corrupted, attempting backup restore');
                if (this.restoreFromBackup()) {
                    const backup = localStorage.getItem(this.STORAGE_KEY);
                    data = JSON.parse(backup);
                } else {
                    throw new Error('Could not recover save data');
                }
            }

            if (!this.validateSaveData(data)) {
                console.error('Save validation failed, attempting backup restore');
                if (this.restoreFromBackup()) {
                    const backup = localStorage.getItem(this.STORAGE_KEY);
                    data = JSON.parse(backup);
                } else {
                    throw new Error('Backup also invalid');
                }
            }

            // Run migrations if needed
            if (!data.version || data.version < SAVE_VERSION) {
                data = migrateSaveData(data);
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
            }

            // Apply save data to game state
            this.applySaveData(data);

            return true;
        } catch (error) {
            console.error('Load failed:', error);
            this.showLoadError('Could not load your save. Starting fresh game.');
            return false;
        }
    }

    // Apply loaded save data to game
    applySaveData(data) {
        // Restore basic stats
        totalCoalSold = data.totalCoalSold || 0;
        totalCoalMined = data.totalCoalMined || 0;
        totalCopperMined = data.totalCopperMined || 0;
        totalMoneyEarned = data.totalMoneyEarned || 0;
        money = data.money || 0;
        notes = data.notes || 0;
        elevatorLevel = data.elevatorLevel || 1;

        // Restore mine system state
        if (data.currentMineId) currentMineId = data.currentMineId;
        if (data.minesUnlocked) minesUnlocked = data.minesUnlocked;
        if (data.mineStates) mineStates = data.mineStates;

        // Restore player progression
        if (data.playerXP !== undefined) playerXP = data.playerXP;
        if (data.achievementsState) achievementsState = data.achievementsState;

        if (typeof initAchievements === 'function') {
            initAchievements();
        }

        // Restore audio settings
        if (data.currentVolume !== undefined && typeof setVolume === 'function') {
            setVolume(data.currentVolume);
        }

        // Clear and rebuild mineshafts
        if (mineshaftsContainer) {
            mineshaftsContainer.innerHTML = '';
        }
        mineshafts = [];

        // Rebuild mineshafts
        if (data.shafts && data.shafts.length > 0) {
            for (let i = 0; i < data.shafts.length; i++) {
                if (typeof createMineshaft === 'function') {
                    createMineshaft(i);
                    const shaftData = data.shafts[i];
                    mineshafts[i].level = shaftData.level || 1;
                    mineshafts[i].bucketCoal = shaftData.bucketCoal || 0;
                    mineshafts[i].elements.levelBtn.textContent = mineshafts[i].level;

                    if (typeof updateShaftBucket === 'function') {
                        updateShaftBucket(i);
                    }

                    // Restore manager
                    if (shaftData.hasManager && !mineshafts[i].hasManager) {
                        this.restoreShaftManager(i, shaftData);
                    }
                }
            }
        } else {
            if (typeof createMineshaft === 'function') {
                createMineshaft(0);
            }
        }

        // Restore elevator manager
        if (data.hasElevatorManager && !hasElevatorManager) {
            this.restoreElevatorManager(data);
        }

        // Restore active boosts (filter expired)
        if (data.activeBoosts) {
            const now = Date.now();
            activeBoosts = {};
            for (const [boostId, expiresAt] of Object.entries(data.activeBoosts)) {
                if (expiresAt > now && BOOSTS[boostId]) {
                    activeBoosts[boostId] = expiresAt;
                }
            }
        }

        // Restore shop state
        if (data.totalNotesSpent !== undefined) totalNotesSpent = data.totalNotesSpent;
        if (data.dailyExchangeCount !== undefined) dailyExchangeCount = data.dailyExchangeCount;
        if (data.lastExchangeDate) lastExchangeDate = data.lastExchangeDate;

        // Restore prestige state
        if (data.bonds !== undefined) bonds = data.bonds;
        if (data.totalBondsEarned !== undefined) totalBondsEarned = data.totalBondsEarned;
        if (data.prestigeCount !== undefined) prestigeCount = data.prestigeCount;
        if (data.prestigeUpgradesPurchased) prestigeUpgradesPurchased = data.prestigeUpgradesPurchased;
        if (data.lastPlayTime) lastPlayTime = data.lastPlayTime;

        // Restore research state
        if (data.researchPoints !== undefined) researchPoints = data.researchPoints;
        if (data.totalResearchPointsEarned !== undefined) totalResearchPointsEarned = data.totalResearchPointsEarned;
        if (data.researchCompleted) researchCompleted = data.researchCompleted;

        // Update displays
        this.refreshAllDisplays();

        // Sync to GameState
        if (typeof syncGlobalsToGameState === 'function') {
            syncGlobalsToGameState();
        }

        // Check for offline progress after load
        if (typeof checkOfflineProgress === 'function') {
            setTimeout(checkOfflineProgress, 500);
        }
    }

    // Restore a shaft manager from save data
    restoreShaftManager(index, shaftData) {
        const isMega = shaftData.isMegaManager || (shaftData.managerAbility && shaftData.managerAbility.isMega);
        mineshafts[index].hasManager = true;
        mineshafts[index].isMegaManager = isMega;
        mineshafts[index].elements.managerSlot.classList.add('hired');
        if (isMega) {
            mineshafts[index].elements.managerSlot.classList.add('mega-manager');
        }
        mineshafts[index].elements.managerSlot.innerHTML = `
            <div class="worker manager ${isMega ? 'mega' : ''}" style="position: relative;">
                <div class="worker-body">
                    <div class="worker-helmet"><div class="worker-helmet-light"></div></div>
                    <div class="worker-head"></div>
                    <div class="worker-torso"></div>
                    <div class="worker-legs"></div>
                </div>
                ${isMega ? '<div class="mega-star">*</div>' : ''}
            </div>
        `;
        mineshafts[index].elements.minerStatus.textContent = 'Auto';

        if (shaftData.managerAbility) {
            mineshafts[index].managerAbility = shaftData.managerAbility;
        }

        if (typeof autoMine === 'function') {
            autoMine(index);
        }
    }

    // Restore elevator manager from save data
    restoreElevatorManager(data) {
        const isMega = data.isElevatorMegaManager || (data.elevatorManagerAbility && data.elevatorManagerAbility.isMega);
        hasElevatorManager = true;
        isElevatorMegaManager = isMega;
        if (elevatorManagerSlot) {
            elevatorManagerSlot.classList.add('hired');
            if (isMega) {
                elevatorManagerSlot.classList.add('mega-manager');
            }
            elevatorManagerSlot.innerHTML = `
                <div class="worker manager ${isMega ? 'mega' : ''}" style="position: relative;">
                    <div class="worker-body">
                        <div class="worker-helmet"><div class="worker-helmet-light"></div></div>
                        <div class="worker-head"></div>
                        <div class="worker-torso"></div>
                        <div class="worker-legs"></div>
                    </div>
                    ${isMega ? '<div class="mega-star">*</div>' : ''}
                </div>
            `;
        }
        if (operatorStatus) {
            operatorStatus.textContent = 'Auto';
        }

        if (data.elevatorManagerAbility) {
            elevatorManagerAbility = data.elevatorManagerAbility;
        }

        if (typeof autoElevator === 'function') {
            autoElevator();
        }
    }

    // Refresh all game displays after load
    refreshAllDisplays() {
        const displayFuncs = [
            'updateStats', 'updatePlayerStats', 'checkAchievements',
            'updateAchievementBadge', 'renderMapPanel', 'updateMineIndicator',
            'updateMineTheme', 'updateLevelDisplay', 'updateNotesDisplay',
            'updateShopRankDisplay', 'updateActiveBoostsDisplay'
        ];

        for (const funcName of displayFuncs) {
            if (typeof window[funcName] === 'function') {
                try {
                    window[funcName]();
                } catch (e) {
                    console.warn(`Display update ${funcName} failed:`, e);
                }
            }
        }
    }

    // Start autosave interval
    startAutosave(isCloudUser = false) {
        this.stopAutosave();

        this.autosaveIntervalId = setInterval(() => {
            if (isCloudUser && typeof currentUser !== 'undefined' && currentUser) {
                this.saveToCloud();
            } else if (!isCloudUser) {
                this.saveToLocal();
            }
        }, TIMING.AUTOSAVE_INTERVAL);
    }

    // Stop autosave
    stopAutosave() {
        if (this.autosaveIntervalId) {
            clearInterval(this.autosaveIntervalId);
            this.autosaveIntervalId = null;
        }
    }

    // Cloud save wrapper
    async saveToCloud() {
        if (typeof saveGameToCloud === 'function') {
            try {
                await saveGameToCloud();
                this.lastSaveTime = new Date();
                if (typeof updateAutoSaveStatusDisplay === 'function') {
                    updateAutoSaveStatusDisplay();
                }
            } catch (error) {
                console.error('Cloud save failed:', error);
            }
        }
    }

    // Show save error notification
    showSaveError(message) {
        console.error('SAVE ERROR:', message);
        // Could show a toast/notification here
    }

    // Show load error notification
    showLoadError(message) {
        console.error('LOAD ERROR:', message);
        // Could show a toast/notification here
    }

    // Check if we're online
    isOnline() {
        return navigator.onLine !== false;
    }

    // Export save for manual backup
    exportSave() {
        try {
            const data = this.buildSaveData();
            return btoa(JSON.stringify(data));
        } catch (e) {
            console.error('Export failed:', e);
            return null;
        }
    }

    // Import save from manual backup
    importSave(encodedData) {
        try {
            const data = JSON.parse(atob(encodedData));
            if (!this.validateSaveData(data)) {
                throw new Error('Invalid save data');
            }
            this.createBackup();
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('Import failed:', e);
            return false;
        }
    }
}

// Create global save manager instance
const saveManager = new SaveManager();

// ============================================
// AUDIO MANAGER
// Centralized audio handling with error recovery
// ============================================
class AudioManager {
    constructor() {
        this.tracks = {
            intro: null,
            foreman: null,
            background: null
        };
        this.currentScene = null;
        this.isFading = {};
        this.volume = 30;
        this.initialized = false;
        this.muted = false;
        this.previousVolume = 30;
    }

    // Initialize audio elements
    init() {
        this.tracks.intro = document.getElementById('introMusic');
        this.tracks.foreman = document.getElementById('foremanMusic');
        this.tracks.background = document.getElementById('bgMusic');

        // Add error handlers
        for (const [name, track] of Object.entries(this.tracks)) {
            if (track) {
                track.addEventListener('error', (e) => this.handleError(name, e));
            }
        }

        return this;
    }

    // Handle audio errors gracefully
    handleError(trackName, error) {
        console.warn(`Audio error on ${trackName}:`, error);
        // Continue game without audio
    }

    // Set master volume (0-100)
    setVolume(value) {
        this.volume = Math.max(0, Math.min(100, value));
        const normalized = this.volume / 100;

        if (this.tracks.background) {
            this.tracks.background.volume = normalized;
        }

        // Update slider UI if exists
        const slider = document.getElementById('volumeSlider');
        if (slider) {
            slider.value = this.volume;
            slider.style.background = `linear-gradient(to right, #ffd700 0%, #ffd700 ${this.volume}%, #333 ${this.volume}%, #333 100%)`;
        }

        const valueEl = document.getElementById('volumeValue');
        if (valueEl) {
            valueEl.textContent = this.volume + '%';
        }

        const iconEl = document.getElementById('volumeIcon');
        if (iconEl) {
            if (this.volume === 0) {
                iconEl.textContent = '🔇';
            } else if (this.volume < 50) {
                iconEl.textContent = '🔉';
            } else {
                iconEl.textContent = '🔊';
            }
        }

        // Expose to legacy global
        if (typeof window !== 'undefined') {
            window.currentVolume = this.volume;
            window.audioInitialized = this.initialized;
        }
    }

    // Toggle mute
    toggleMute() {
        if (this.volume > 0) {
            this.previousVolume = this.volume;
            this.setVolume(0);
            this.muted = true;
            if (this.tracks.background) {
                this.tracks.background.pause();
            }
        } else {
            this.setVolume(this.previousVolume || 30);
            this.muted = false;
            if (this.tracks.background && this.initialized) {
                this.tracks.background.play().catch(() => {});
            }
        }
    }

    // Play a scene track
    playScene(sceneName) {
        const track = this.tracks[sceneName];
        if (!track) return;

        // Stop other scene tracks
        this.stopAllExcept(sceneName);

        this.currentScene = sceneName;

        const volumes = {
            intro: 0.75,
            foreman: 0.56,
            background: this.volume / 100
        };

        track.volume = volumes[sceneName] || 0.5;
        track.currentTime = 0;

        track.play().then(() => {
            if (sceneName === 'background') {
                this.initialized = true;
            }
        }).catch(e => {
            console.log(`${sceneName} autoplay blocked:`, e);
        });
    }

    // Stop all tracks except specified
    stopAllExcept(exceptName) {
        for (const [name, track] of Object.entries(this.tracks)) {
            if (track && name !== exceptName && !track.paused) {
                track.pause();
                track.currentTime = 0;
            }
        }
    }

    // Stop all scene music
    stopAll() {
        for (const track of Object.values(this.tracks)) {
            if (track) {
                track.pause();
                track.currentTime = 0;
            }
        }
        this.currentScene = null;
        this.isFading = {};
    }

    // Fade out a track
    fadeOut(sceneName, duration = 500, callback = null) {
        const track = this.tracks[sceneName];
        if (!track || this.isFading[sceneName]) {
            if (callback) callback();
            return;
        }

        this.isFading[sceneName] = true;
        const startVolume = track.volume;
        const steps = 20;
        const stepDuration = duration / steps;
        const volumeStep = startVolume / steps;
        let currentStep = 0;

        const fadeInterval = setInterval(() => {
            currentStep++;
            track.volume = Math.max(0, startVolume - (volumeStep * currentStep));

            if (currentStep >= steps) {
                clearInterval(fadeInterval);
                track.pause();
                track.currentTime = 0;
                track.volume = 0.75;
                this.isFading[sceneName] = false;
                if (this.currentScene === sceneName) {
                    this.currentScene = null;
                }
                if (callback) callback();
            }
        }, stepDuration);
    }

    // Start background music
    startBackground() {
        if (this.volume === 0) return;
        this.playScene('background');
    }

    // Get current volume
    getVolume() {
        return this.volume;
    }

    // Check if audio is initialized
    isInitialized() {
        return this.initialized;
    }
}

// Create global audio manager instance
const audioManager = new AudioManager().init();

// ============================================
// OFFLINE DETECTION
// Handle network status changes gracefully
// ============================================
class OfflineHandler {
    constructor() {
        this.isOnline = navigator.onLine !== false;
        this.offlineQueue = [];
        this.init();
    }

    init() {
        window.addEventListener('online', () => this.handleOnline());
        window.addEventListener('offline', () => this.handleOffline());
    }

    handleOnline() {
        this.isOnline = true;
        console.log('Connection restored');

        // Show notification
        this.showStatus('Connection restored', 'success');

        // Process any queued saves
        if (typeof currentUser !== 'undefined' && currentUser) {
            saveManager.saveToCloud();
        }
    }

    handleOffline() {
        this.isOnline = false;
        console.log('Connection lost - switching to local save');

        // Show notification
        this.showStatus('Offline - saving locally', 'warning');

        // Force local save
        saveManager.saveToLocal();
    }

    showStatus(message, type = 'info') {
        // Could integrate with game's notification system
        console.log(`[${type.toUpperCase()}] ${message}`);

        // Update autosave status display
        const statusEl = document.getElementById('autoSaveStatus');
        if (statusEl) {
            if (type === 'warning') {
                statusEl.textContent = 'Offline mode';
                statusEl.style.color = '#ff8c42';
            } else if (type === 'success') {
                statusEl.style.color = '#32CD32';
            }
        }
    }

    checkConnection() {
        return this.isOnline;
    }
}

// Create global offline handler
const offlineHandler = new OfflineHandler();

// ============================================
// ERROR RECOVERY SYSTEM
// Catch and handle critical errors
// ============================================
class ErrorRecovery {
    constructor() {
        this.init();
    }

    init() {
        // Global error handler
        window.addEventListener('error', (event) => this.handleError(event));

        // Unhandled promise rejection handler
        window.addEventListener('unhandledrejection', (event) => {
            this.handlePromiseRejection(event);
        });
    }

    handleError(event) {
        console.error('Game error caught:', event.error);

        // Try to save game state before potential crash
        this.emergencySave();

        // Log for debugging
        this.logError({
            type: 'runtime',
            message: event.message,
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            stack: event.error?.stack
        });
    }

    handlePromiseRejection(event) {
        console.error('Unhandled promise rejection:', event.reason);

        // Don't save for network errors - they're expected when offline
        if (!this.isNetworkError(event.reason)) {
            this.emergencySave();
        }
    }

    isNetworkError(error) {
        if (!error) return false;
        const message = error.message || String(error);
        return message.includes('network') ||
               message.includes('fetch') ||
               message.includes('offline') ||
               message.includes('NetworkError');
    }

    emergencySave() {
        try {
            if (typeof saveManager !== 'undefined') {
                saveManager.saveToLocal();
                console.log('Emergency save completed');
            }
        } catch (e) {
            console.error('Emergency save failed:', e);
        }
    }

    logError(errorInfo) {
        // Could send to analytics/error tracking service
        // For now, just store in sessionStorage for debugging
        try {
            const errors = JSON.parse(sessionStorage.getItem('gameErrors') || '[]');
            errors.push({
                ...errorInfo,
                timestamp: Date.now()
            });
            // Keep last 10 errors
            if (errors.length > 10) errors.shift();
            sessionStorage.setItem('gameErrors', JSON.stringify(errors));
        } catch (e) {
            // Ignore storage errors
        }
    }

    getRecentErrors() {
        try {
            return JSON.parse(sessionStorage.getItem('gameErrors') || '[]');
        } catch {
            return [];
        }
    }
}

// Create global error recovery handler
const errorRecovery = new ErrorRecovery();

function startNoteEarning() {
    lastNoteTime = Date.now();
    setInterval(() => {
        const now = Date.now();
        const elapsed = now - lastNoteTime;
        if (elapsed >= TIMING.NOTE_EARN_INTERVAL) {
            const notesEarned = Math.floor(elapsed / TIMING.NOTE_EARN_INTERVAL);
            notes += notesEarned;
            lastNoteTime = now - (elapsed % TIMING.NOTE_EARN_INTERVAL);
            updateNotesDisplay();
            saveToLocalStorage();
        }
    }, TIMING.NOTE_CHECK_INTERVAL);
}

function updateNotesDisplay() {
    const notesEl = document.getElementById('notesCount');
    if (notesEl) {
        notesEl.textContent = formatNumber(notes);
    }
    // Also update shop display if open
    const shopNotesEl = document.getElementById('shopNotesCount');
    if (shopNotesEl) {
        shopNotesEl.textContent = formatNumber(notes);
    }
}

// ============================================
// SHOP SYSTEM - Ranks, Boosts, and Exchange
// Note: SHOP_RANKS, BOOSTS, BOOST_COST_PER_NOTE, DAILY_EXCHANGE_LIMIT
// are defined in config.js for centralized configuration
// ============================================

// Shop state
let totalNotesSpent = 0;
let activeBoosts = {};
let dailyExchangeCount = 0;
let lastExchangeDate = null; // Stored as 'YYYY-MM-DD' in EST

function getESTDateString() {
    // Get current date in EST timezone
    const now = new Date();
    const estOffset = SHOP_CONFIG.EST_OFFSET_HOURS * 60; // EST offset in minutes
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const est = new Date(utc + (estOffset * 60000));
    return est.toISOString().split('T')[0];
}

function checkDailyReset() {
    const today = getESTDateString();
    if (lastExchangeDate !== today) {
        dailyExchangeCount = 0;
        lastExchangeDate = today;
        // Don't save here - save will happen naturally when exchanges occur
    }
}

function getRemainingExchanges() {
    checkDailyReset();
    return DAILY_EXCHANGE_LIMIT - dailyExchangeCount;
}

function getCurrentShopRank() {
    let currentRank = SHOP_RANKS[0];
    for (const rank of SHOP_RANKS) {
        if (totalNotesSpent >= rank.notesRequired) {
            currentRank = rank;
        }
    }
    return currentRank;
}

function getNextShopRank() {
    const currentRank = getCurrentShopRank();
    const currentIndex = SHOP_RANKS.findIndex(r => r.id === currentRank.id);
    if (currentIndex < SHOP_RANKS.length - 1) {
        return SHOP_RANKS[currentIndex + 1];
    }
    return null; // Max rank reached
}

function getShopRankBonus(type) {
    const rank = getCurrentShopRank();
    return rank.bonuses[type] || 0;
}

function purchaseBoost(boostId) {
    const boost = BOOSTS[boostId];
    if (!boost) return;

    // Check if boost is already active (can't stack or extend)
    if (isBoostActive(boostId)) {
        showBoostMessage(`${boost.name} is already active!`, 'error');
        return;
    }

    // Check if a conflicting boost is active (same stat type)
    for (const [activeId, expiresAt] of Object.entries(activeBoosts)) {
        if (expiresAt > Date.now() && activeId !== boostId) {
            const activeBoost = BOOSTS[activeId];
            // Check for overlapping stats
            const boostStats = Object.keys(boost).filter(k => k.includes('Boost'));
            const activeStats = Object.keys(activeBoost).filter(k => k.includes('Boost'));
            const overlap = boostStats.some(s => activeStats.includes(s));
            if (overlap) {
                showBoostMessage(`Wait for ${activeBoost.name} to expire first!`, 'error');
                return;
            }
        }
    }

    if (notes < boost.cost) {
        showBoostMessage(`Not enough Notes! Need ${boost.cost} 📜`, 'error');
        return;
    }

    // Deduct notes and track spending
    notes -= boost.cost;
    totalNotesSpent += boost.cost;
    updateNotesDisplay();
    updateShopRankDisplay();
    saveToLocalStorage();

    // Activate boost (no extension - fresh duration)
    activeBoosts[boostId] = Date.now() + boost.duration;
    updateActiveBoostsDisplay();
    saveToLocalStorage();

    showBoostMessage(`${boost.name} activated!`, 'success');
}

function isBoostActive(boostId) {
    return activeBoosts[boostId] && activeBoosts[boostId] > Date.now();
}

function getBoostMultiplier(type) {
    let multiplier = 1;
    const now = Date.now();

    for (const [boostId, expiresAt] of Object.entries(activeBoosts)) {
        if (expiresAt > now) {
            const boost = BOOSTS[boostId];
            if (boost && boost[type]) {
                // Take the highest boost, don't stack
                multiplier = Math.max(multiplier, boost[type]);
            }
        }
    }

    // Add permanent rank bonus
    const rankBonusType = type.replace('Boost', '').replace('miner', '').replace('elevator', '');
    let rankBonus = 0;
    if (type === 'minerGatherBoost') rankBonus = getShopRankBonus('production');
    else if (type === 'minerSpeedBoost') rankBonus = getShopRankBonus('walkSpeed');
    else if (type === 'elevatorSpeedBoost') rankBonus = getShopRankBonus('walkSpeed');
    else if (type === 'elevatorCapacityBoost') rankBonus = getShopRankBonus('capacity');

    // Apply rank bonus additively on top of boost
    multiplier += rankBonus;

    return multiplier;
}

function updateActiveBoostsDisplay() {
    const section = document.getElementById('activeBoostsSection');
    const list = document.getElementById('activeBoostsList');
    if (!section || !list) return;

    const now = Date.now();
    const activeList = [];

    for (const [boostId, expiresAt] of Object.entries(activeBoosts)) {
        if (expiresAt > now) {
            const boost = BOOSTS[boostId];
            if (!boost) continue;
            const remaining = expiresAt - now;
            const minutes = Math.floor(remaining / 60000);
            const seconds = Math.floor((remaining % 60000) / 1000);
            activeList.push({
                name: boost.name,
                timer: `${minutes}:${seconds.toString().padStart(2, '0')}`
            });
        }
    }

    if (activeList.length === 0) {
        section.style.display = 'none';
        return;
    }

    section.style.display = 'block';
    list.innerHTML = activeList.map(b => `
        <div class="active-boost-tag">
            <span>⚡ ${b.name}</span>
            <span class="boost-timer">${b.timer}</span>
        </div>
    `).join('');
}

function updateShopRankDisplay() {
    const rankDisplay = document.getElementById('shopRankDisplay');
    const progressBar = document.getElementById('shopRankProgress');
    const progressText = document.getElementById('shopRankProgressText');
    const bonusList = document.getElementById('shopRankBonuses');

    if (!rankDisplay) return;

    const currentRank = getCurrentShopRank();
    const nextRank = getNextShopRank();

    rankDisplay.innerHTML = `${currentRank.icon} ${currentRank.name}`;
    rankDisplay.style.color = currentRank.color;

    if (progressBar && nextRank) {
        const currentIndex = SHOP_RANKS.findIndex(r => r.id === currentRank.id);
        const prevRequired = currentRank.notesRequired;
        const nextRequired = nextRank.notesRequired;
        const progress = ((totalNotesSpent - prevRequired) / (nextRequired - prevRequired)) * 100;
        progressBar.style.width = Math.min(progress, 100) + '%';
        progressBar.style.background = `linear-gradient(90deg, ${currentRank.color}, ${nextRank.color})`;

        if (progressText) {
            progressText.textContent = `${totalNotesSpent}/${nextRequired} to ${nextRank.name}`;
        }
    } else if (progressBar) {
        progressBar.style.width = '100%';
        progressBar.style.background = currentRank.color;
        if (progressText) {
            progressText.textContent = 'Max Rank Achieved!';
        }
    }

    if (bonusList) {
        const bonuses = currentRank.bonuses;
        let bonusText = [];
        if (bonuses.production > 0) bonusText.push(`+${Math.round(bonuses.production * 100)}% Production`);
        if (bonuses.walkSpeed > 0) bonusText.push(`+${Math.round(bonuses.walkSpeed * 100)}% Speed`);
        if (bonuses.capacity > 0) bonusText.push(`+${Math.round(bonuses.capacity * 100)}% Capacity`);
        bonusList.innerHTML = bonusText.length > 0 ? bonusText.join(' • ') : 'No bonuses yet';
    }
}

function updateExchangeDisplay() {
    const remaining = getRemainingExchanges();
    const exchangeInfo = document.getElementById('exchangeRemaining');
    if (exchangeInfo) {
        exchangeInfo.textContent = `${remaining}/${DAILY_EXCHANGE_LIMIT} remaining today`;
        exchangeInfo.style.color = remaining > 0 ? '#7aff7a' : '#ff7a7a';
    }
}

function showBoostMessage(message, type) {
    const toast = document.createElement('div');
    toast.className = `boost-toast ${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 100px;
        left: 50%;
        transform: translateX(-50%);
        padding: 15px 30px;
        background: ${type === 'success' ? 'rgba(50, 200, 100, 0.9)' : 'rgba(200, 50, 50, 0.9)'};
        color: white;
        border-radius: 10px;
        font-family: 'Chakra Petch', sans-serif;
        font-weight: 600;
        z-index: 10001;
        animation: toastFade 2s forwards;
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
}

function startBoostTimerLoop() {
    setInterval(() => {
        updateActiveBoostsDisplay();
        // Clean up expired boosts
        const now = Date.now();
        for (const boostId of Object.keys(activeBoosts)) {
            if (activeBoosts[boostId] <= now) {
                delete activeBoosts[boostId];
            }
        }
    }, 1000);
}

// Cash to Notes exchange with daily limit
function exchangeCashForNotes(amount) {
    checkDailyReset();

    const remaining = getRemainingExchanges();
    if (remaining <= 0) {
        showBoostMessage('Daily exchange limit reached! Resets at midnight EST.', 'error');
        return;
    }

    // Limit to remaining exchanges
    const actualAmount = Math.min(amount, remaining);
    const totalCost = BOOST_COST_PER_NOTE * actualAmount;

    if (money < totalCost) {
        showBoostMessage(`Not enough cash! Need $${formatNumber(totalCost)}`, 'error');
        return;
    }

    money -= totalCost;
    notes += actualAmount;
    dailyExchangeCount += actualAmount;

    updateStats();
    updateNotesDisplay();
    updateExchangeDisplay();
    saveToLocalStorage();

    showBoostMessage(`Exchanged $${formatNumber(totalCost)} for ${actualAmount} 📜 Notes!`, 'success');
}

function exchangeCashForNotesMax() {
    checkDailyReset();
    const remaining = getRemainingExchanges();
    if (remaining <= 0) {
        showBoostMessage('Daily exchange limit reached! Resets at midnight EST.', 'error');
        return;
    }

    const maxAffordable = Math.floor(money / BOOST_COST_PER_NOTE);
    const maxNotes = Math.min(maxAffordable, remaining);

    if (maxNotes <= 0) {
        showBoostMessage(`Not enough cash! Need at least $${formatNumber(BOOST_COST_PER_NOTE)}`, 'error');
        return;
    }
    exchangeCashForNotes(maxNotes);
}

// Current mine state
let currentMineId = 'mine22';
let minesUnlocked = { mine22: true, mine37: false };

// Mine-specific state storage (for idle rewards)
let mineStates = {
    mine22: {
        mineshafts: [],
        elevatorLevel: 1,
        hasElevatorManager: false,
        elevatorManagerAbility: null,
        totalOreMined: 0,
        lastActiveTime: Date.now()
    },
    mine37: {
        mineshafts: [],
        elevatorLevel: 1,
        hasElevatorManager: false,
        elevatorManagerAbility: null,
        totalOreMined: 0,
        lastActiveTime: null
    }
};

// Pending idle rewards when switching mines
let pendingIdleRewards = null;

// Elevator manager ability state
let elevatorManagerAbility = null; // { type, activeUntil, cooldownUntil }

// Achievements state: { achievementId: 'locked' | 'unlocked' | 'claimed' }
let achievementsState = {};

// Elevator loop tracking - prevents multiple autoElevator loops
let elevatorLoopId = 0;

// Mining loop tracking - prevents multiple autoMine loops when switching mines
let miningLoopId = 0;

// Array of mineshafts
let mineshafts = [];

// Currently selected shaft for upgrade modal
let selectedShaftIndex = -1;
let upgradeMode = 'shaft'; // 'shaft' or 'elevator'

// ============================================
// DOM ELEMENTS
// ============================================
const gameContainer = document.getElementById('gameContainer');
const mineshaftsContainer = document.getElementById('mineshaftsContainer');
const elevatorShaft = document.getElementById('elevatorShaft');
const elevator = document.getElementById('elevator');
const elevatorOperator = document.getElementById('elevatorOperator');
const operatorStatus = document.getElementById('operatorStatus');
const operatorProgressFill = document.getElementById('operatorProgressFill');
const elevatorCapacityDisplay = document.getElementById('elevatorCapacityDisplay');
const moneyCountEl = document.getElementById('moneyCount');
const buyShaftBtn = document.getElementById('buyShaftBtn');
const buyShaftArea = document.getElementById('buyShaftArea');
const upgradeModal = document.getElementById('upgradeModal');
const hirePopup = document.getElementById('hirePopup');
const elevatorManagerSlot = document.getElementById('elevatorManagerSlot');
const elevatorLevelDisplay = document.getElementById('elevatorLevelDisplay');

// ============================================
// HELPER FUNCTIONS
// ============================================
function formatNumber(num) {
    const floored = Math.floor(num);
    if (floored >= 1000000000000) {
        return (floored / 1000000000000).toFixed(2) + 'T';
    } else if (floored >= 1000000000) {
        return (floored / 1000000000).toFixed(2) + 'B';
    } else if (floored >= 1000000) {
        return (floored / 1000000).toFixed(2) + 'M';
    } else if (floored >= 1000) {
        return (floored / 1000).toFixed(1) + 'K';
    }
    return floored.toString();
}

// Parse number with K/M/B/T suffix (e.g., "10K" -> 10000, "1.5M" -> 1500000)
function parseNumberWithSuffix(str) {
    if (!str || typeof str !== 'string') return NaN;
    str = str.trim().toUpperCase();

    const multipliers = {
        'K': 1000,
        'M': 1000000,
        'B': 1000000000,
        'T': 1000000000000
    };

    // Check if string ends with a suffix
    const lastChar = str.charAt(str.length - 1);
    if (multipliers[lastChar]) {
        const numPart = parseFloat(str.slice(0, -1));
        if (isNaN(numPart)) return NaN;
        return numPart * multipliers[lastChar];
    }

    // No suffix, parse as regular number
    return parseFloat(str);
}

function formatTime(ms) {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function getWalkDuration(distance) {
    return Math.max(200, distance / WALKING_SPEED);
}

// Check if an ability is currently active
function isAbilityActive(abilityState) {
    if (!abilityState) return false;
    return Date.now() < abilityState.activeUntil;
}

// Check if ability is on cooldown
function isAbilityOnCooldown(abilityState) {
    if (!abilityState) return false;
    return Date.now() < abilityState.cooldownUntil && !isAbilityActive(abilityState);
}

// Check if ability can be activated
function canActivateAbility(abilityState) {
    if (!abilityState) return false;
    return !isAbilityActive(abilityState) && !isAbilityOnCooldown(abilityState);
}

function getElevatorCapacity() {
    let capacity = Math.floor(BASE_ELEVATOR_CAPACITY * Math.pow(ELEVATOR_CAPACITY_MULTIPLIER, elevatorLevel - 1));
    // Apply capacity ability if active (with manager effectiveness and experience bonuses)
    if (elevatorManagerAbility && (elevatorManagerAbility.type === 'capacity' || elevatorManagerAbility.type === 'mega_capacity') && isAbilityActive(elevatorManagerAbility)) {
        let capacityBonus = elevatorManagerAbility.effect || 0.4;
        // Apply manager effectiveness from research (Motivation Program)
        const effectivenessBonus = getManagerEffectivenessBonus();
        capacityBonus *= (1 + effectivenessBonus);
        // Apply experience bonus
        const expBonus = getExperienceBonus(elevatorManagerAbility.experience || 0);
        capacityBonus *= (1 + expBonus);
        capacity = Math.floor(capacity * (1 + capacityBonus));
    }
    // Apply shop boost
    const boostMult = getBoostMultiplier('elevatorCapacityBoost');
    if (boostMult > 1) {
        capacity = Math.floor(capacity * boostMult);
    }
    return capacity;
}

function getElevatorUpgradeCost() {
    let cost = Math.floor(BASE_UPGRADE_COST * Math.pow(UPGRADE_COST_MULTIPLIER, elevatorLevel - 1));
    // Apply discount ability if active (with manager effectiveness and experience bonuses)
    if (elevatorManagerAbility && (elevatorManagerAbility.type === 'discount' || elevatorManagerAbility.type === 'mega_discount') && isAbilityActive(elevatorManagerAbility)) {
        let discountBonus = elevatorManagerAbility.effect || 0.3;
        // Apply manager effectiveness from research (Motivation Program)
        const effectivenessBonus = getManagerEffectivenessBonus();
        discountBonus *= (1 + effectivenessBonus);
        // Apply experience bonus
        const expBonus = getExperienceBonus(elevatorManagerAbility.experience || 0);
        discountBonus *= (1 + expBonus);
        // Cap discount at 80% to avoid free upgrades
        discountBonus = Math.min(discountBonus, 0.8);
        cost = Math.floor(cost * (1 - discountBonus));
    }
    return cost;
}

function getElevatorSpeedMultiplier() {
    let mult = 1;
    // Check for express mode (instant trips)
    if (elevatorManagerAbility && elevatorManagerAbility.type === 'express' && isAbilityActive(elevatorManagerAbility)) {
        return 0.1; // Nearly instant
    }
    if (elevatorManagerAbility && (elevatorManagerAbility.type === 'speed' || elevatorManagerAbility.type === 'mega_speed') && isAbilityActive(elevatorManagerAbility)) {
        let speedBonus = elevatorManagerAbility.effect || 0.4;
        // Apply manager effectiveness from research (Motivation Program)
        const effectivenessBonus = getManagerEffectivenessBonus();
        speedBonus *= (1 + effectivenessBonus);
        // Apply experience bonus
        const expBonus = getExperienceBonus(elevatorManagerAbility.experience || 0);
        speedBonus *= (1 + expBonus);
        // Cap speed bonus at 90% to prevent instant trips
        speedBonus = Math.min(speedBonus, 0.9);
        mult = 1 - speedBonus;
    }
    // Apply shop boost (lower is faster)
    const boostMult = getBoostMultiplier('elevatorSpeedBoost');
    if (boostMult > 1) {
        mult = mult / boostMult; // e.g., 1.5x boost = 0.67 mult (50% faster)
    }
    return mult;
}

function getShaftBaseCoal(shaftIndex) {
    // Each shaft produces 2x the base coal of the previous shaft
    return Math.pow(SHAFT_BASE_COAL_MULTIPLIER, shaftIndex);
}

function getShaftCoalPerTrip(shaftIndex) {
    const shaft = mineshafts[shaftIndex];
    const baseCoal = getShaftBaseCoal(shaftIndex);
    let coal = baseCoal * Math.pow(COAL_PER_LEVEL_MULTIPLIER, shaft.level - 1);
    // Apply coal ability if active (with manager effectiveness and experience bonuses)
    if (shaft.managerAbility && (shaft.managerAbility.type === 'coal' || shaft.managerAbility.type === 'mega_coal') && isAbilityActive(shaft.managerAbility)) {
        let coalBonus = shaft.managerAbility.effect || 0.2;
        // Apply manager effectiveness from research (Motivation Program)
        const effectivenessBonus = getManagerEffectivenessBonus();
        coalBonus *= (1 + effectivenessBonus);
        // Apply experience bonus
        const expBonus = getExperienceBonus(shaft.managerAbility.experience || 0);
        coalBonus *= (1 + expBonus);
        coal = coal * (1 + coalBonus);
    }
    // Apply shop boost
    const boostMult = getBoostMultiplier('minerGatherBoost');
    if (boostMult > 1) {
        coal = coal * boostMult;
    }
    return coal;
}

function getShaftUpgradeCost(shaftIndex) {
    const shaft = mineshafts[shaftIndex];
    const baseCost = BASE_UPGRADE_COST * Math.pow(SHAFT_BASE_COAL_MULTIPLIER, shaftIndex);
    let cost = Math.floor(baseCost * Math.pow(UPGRADE_COST_MULTIPLIER, shaft.level - 1));
    // Apply discount ability if active (with manager effectiveness and experience bonuses)
    if (shaft.managerAbility && (shaft.managerAbility.type === 'discount' || shaft.managerAbility.type === 'mega_discount') && isAbilityActive(shaft.managerAbility)) {
        let discountBonus = shaft.managerAbility.effect || 0.3;
        // Apply manager effectiveness from research (Motivation Program)
        const effectivenessBonus = getManagerEffectivenessBonus();
        discountBonus *= (1 + effectivenessBonus);
        // Apply experience bonus
        const expBonus = getExperienceBonus(shaft.managerAbility.experience || 0);
        discountBonus *= (1 + expBonus);
        // Cap discount at 80% to avoid free upgrades
        discountBonus = Math.min(discountBonus, 0.8);
        cost = Math.floor(cost * (1 - discountBonus));
    }
    return cost;
}

function getShaftSpeedMultiplier(shaftIndex) {
    const shaft = mineshafts[shaftIndex];
    let mult = 1;
    if (shaft.managerAbility && (shaft.managerAbility.type === 'speed' || shaft.managerAbility.type === 'mega_speed') && isAbilityActive(shaft.managerAbility)) {
        let speedBonus = shaft.managerAbility.effect || 0.4;
        // Apply manager effectiveness from research (Motivation Program)
        const effectivenessBonus = getManagerEffectivenessBonus();
        speedBonus *= (1 + effectivenessBonus);
        // Apply experience bonus
        const expBonus = getExperienceBonus(shaft.managerAbility.experience || 0);
        speedBonus *= (1 + expBonus);
        // Cap speed bonus at 90% to prevent instant mining
        speedBonus = Math.min(speedBonus, 0.9);
        mult = 1 - speedBonus;
    }
    // Apply shop boost (lower is faster)
    const boostMult = getBoostMultiplier('minerSpeedBoost');
    if (boostMult > 1) {
        mult = mult / boostMult; // e.g., 2x boost = 0.5 mult (100% faster)
    }
    return mult;
}

function getNewShaftCost() {
    return NEW_SHAFT_COST * Math.pow(4, mineshafts.length - 1);
}

function updateStats() {
    moneyCountEl.textContent = formatNumber(money);
    updateNotesDisplay();
    updateBuyShaftButton();
    updateElevatorCapacityDisplay();
    elevatorLevelDisplay.textContent = elevatorLevel;
}

function updateElevatorCapacityDisplay() {
    const capacity = getElevatorCapacity();
    elevatorCapacityDisplay.textContent = `${formatNumber(elevatorCarrying)}/${formatNumber(capacity)}`;
}

function updateBuyShaftButton() {
    // Check if max shafts reached for Mine 22
    if (!canBuyNewShaft()) {
        buyShaftBtn.textContent = `Shaft 21 is SEALED`;
        buyShaftBtn.disabled = true;
        buyShaftBtn.style.background = 'linear-gradient(to bottom, #8b0000, #4a0000)';
        buyShaftBtn.style.borderColor = '#ff0000';
        return;
    }

    // Reset button style if not at max
    buyShaftBtn.style.background = '';
    buyShaftBtn.style.borderColor = '';

    const cost = getNewShaftCost();
    const nextShaftNum = mineshafts.length + 1;
    buyShaftBtn.textContent = `Buy Shaft ${nextShaftNum} - $${formatNumber(cost)}`;
    buyShaftBtn.disabled = money < cost;
}

function updateShaftBucket(shaftIndex) {
    const shaft = mineshafts[shaftIndex];
    if (!shaft || !shaft.elements) return; // Guard against undefined shaft
    const bucketCountEl = shaft.elements.bucketCount;
    const bucketFill = shaft.elements.bucketFill;
    if (!bucketCountEl || !bucketFill) return; // Guard against missing elements
    bucketCountEl.textContent = formatNumber(shaft.bucketCoal);
    const fillPercent = Math.min((shaft.bucketCoal / 20) * 100, 100);
    bucketFill.style.height = fillPercent + '%';
}

function createSparkle(x, y, text, container = gameContainer) {
    const sparkle = document.createElement('div');
    sparkle.className = 'coal-sparkle';
    sparkle.textContent = text;
    sparkle.style.left = x + 'px';
    sparkle.style.top = y + 'px';
    container.appendChild(sparkle);
    setTimeout(() => sparkle.remove(), 1000);
}

function animateProgress(progressFill, duration) {
    return new Promise(resolve => {
        const progressBar = progressFill.parentElement;
        progressBar.classList.add('active');
        const startTime = Date.now();
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min((elapsed / duration) * 100, 100);
            progressFill.style.width = progress + '%';
            if (progress < 100) {
                requestAnimationFrame(animate);
            } else {
                progressFill.style.width = '0%';
                progressBar.classList.remove('active');
                resolve();
            }
        };
        animate();
    });
}

function setPosition(element, left, top, duration = 1000) {
    return new Promise(resolve => {
        element.style.transition = `left ${duration}ms linear, top ${duration}ms linear`;
        element.style.left = left + 'px';
        element.style.top = top + 'px';
        setTimeout(resolve, duration);
    });
}

// ============================================
// MINESHAFT CREATION
// ============================================
function createMineshaft(index) {
    const shaftTop = 80 + (index * SHAFT_HEIGHT);

    const shaftDiv = document.createElement('div');
    shaftDiv.className = 'mineshaft';
    shaftDiv.id = `mineshaft-${index}`;
    shaftDiv.innerHTML = `
        <div class="mineshaft-floor"></div>
        <div class="shaft-label">Shaft ${index + 1}</div>
        <div class="mining-tunnel">
            <div class="coal-deposit">
                <div class="coal-piece"></div>
                <div class="coal-piece"></div>
                <div class="coal-piece"></div>
                <div class="coal-piece"></div>
            </div>
        </div>
        <button class="level-btn" id="levelBtn-${index}">1</button>
        <div class="bucket" id="bucket-${index}">
            <div class="bucket-counter"><span id="bucketCount-${index}">0</span></div>
            <div class="bucket-fill" id="bucketFill-${index}"></div>
        </div>
        <div class="manager-slot" id="managerSlot-${index}" style="left: 15px; top: 55px;">
            <span class="plus-icon">+</span>
        </div>
        <div class="worker" id="miner-${index}" style="left: 50px; top: 55px;">
            <div class="worker-status" id="minerStatus-${index}">Click me!</div>
            <div class="progress-bar">
                <div class="progress-bar-fill" id="minerProgress-${index}"></div>
            </div>
            <div class="worker-body">
                <div class="worker-helmet"><div class="worker-helmet-light"></div></div>
                <div class="worker-head"></div>
                <div class="worker-torso"></div>
                <div class="worker-legs"></div>
            </div>
            <div class="carried-coal"></div>
        </div>
    `;

    mineshaftsContainer.appendChild(shaftDiv);

    // Get element references
    const elements = {
        shaft: shaftDiv,
        miner: document.getElementById(`miner-${index}`),
        minerStatus: document.getElementById(`minerStatus-${index}`),
        minerProgress: document.getElementById(`minerProgress-${index}`),
        bucket: document.getElementById(`bucket-${index}`),
        bucketCount: document.getElementById(`bucketCount-${index}`),
        bucketFill: document.getElementById(`bucketFill-${index}`),
        levelBtn: document.getElementById(`levelBtn-${index}`),
        managerSlot: document.getElementById(`managerSlot-${index}`)
    };

    // Create shaft data
    const shaft = {
        level: 1,
        bucketCoal: 0,
        minerState: 'idle',
        hasManager: false,
        managerAbility: null, // { type, activeUntil, cooldownUntil }
        elements: elements
    };

    mineshafts.push(shaft);

    // Set up event listeners
    elements.miner.onclick = () => handleMinerClick(index);
    elements.levelBtn.onclick = () => openShaftUpgradeModal(index);
    elements.managerSlot.onclick = (e) => showMinerManagerPopup(e, index);

    // Update elevator shaft height
    updateElevatorShaftHeight();

    return shaft;
}

function updateElevatorShaftHeight() {
    const totalHeight = mineshafts.length * SHAFT_HEIGHT;
    elevatorShaft.style.height = totalHeight + 'px';
}

// ============================================
// MINING LOGIC
// ============================================
async function doMining(shaftIndex) {
    const shaft = mineshafts[shaftIndex];
    if (!shaft || !shaft.elements) return; // Guard against undefined shaft
    if (shaft.minerState !== 'idle') return;

    shaft.minerState = 'busy';
    const coalToMine = getShaftCoalPerTrip(shaftIndex);
    const miner = shaft.elements.miner;
    const status = shaft.elements.minerStatus;
    const progressFill = shaft.elements.minerProgress;
    const speedMult = getShaftSpeedMultiplier(shaftIndex);

    // Positions relative to shaft
    const idlePos = { left: 50, top: 55 };
    const mineEntrance = { left: 230, top: 55 };
    const miningPos = { left: 320, top: 55 };
    const bucketPos = { left: 75, top: 55 };

    // Calculate uniform walking durations based on distance
    const idleToEntrance = getWalkDuration(180) * speedMult;      // 50 to 230
    const entranceToMine = getWalkDuration(90) * speedMult;       // 230 to 320
    const mineToEntrance = getWalkDuration(90) * speedMult;       // 320 to 230
    const entranceToBucket = getWalkDuration(155) * speedMult;    // 230 to 75
    const bucketToIdle = getWalkDuration(25) * speedMult;         // 75 to 50
    const miningTime = 2000 * speedMult;

    // 1. Walk to mine
    status.textContent = 'Walking...';
    miner.classList.add('walking');
    await setPosition(miner, mineEntrance.left, mineEntrance.top, idleToEntrance);
    await setPosition(miner, miningPos.left, miningPos.top, entranceToMine);
    miner.classList.remove('walking');

    // 2. Mine coal
    miner.classList.add('mining');
    await animateProgress(progressFill, miningTime);
    miner.classList.remove('mining');
    miner.classList.add('has-coal');

    // 3. Walk back to bucket
    const currentMine = getCurrentMine();
    const oreName = currentMine.ore === 'copper' ? 'copper' : 'coal';
    status.textContent = `Got ${oreName}!`;
    miner.classList.add('walking');
    await setPosition(miner, mineEntrance.left, mineEntrance.top, mineToEntrance);
    await setPosition(miner, bucketPos.left, bucketPos.top, entranceToBucket);
    miner.classList.remove('walking');

    // 4. Deposit
    status.textContent = 'Depositing...';
    await new Promise(r => setTimeout(r, 300));
    miner.classList.remove('has-coal');
    shaft.bucketCoal += coalToMine;

    // Track ore mined by type and award XP
    const mine = getCurrentMine();
    if (mine.ore === 'coal') {
        totalCoalMined += coalToMine;
    } else if (mine.ore === 'copper') {
        totalCopperMined += coalToMine;
    }

    // Award XP for mining (0.5 XP per resource)
    addXP(coalToMine * XP_PER_RESOURCE);

    updateShaftBucket(shaftIndex);
    updatePlayerStats();
    checkAchievements();
    checkMineUnlocks();

    // 5. Return to idle
    miner.classList.add('walking');
    await setPosition(miner, idlePos.left, idlePos.top, bucketToIdle);
    miner.classList.remove('walking');

    status.textContent = shaft.hasManager ? 'Auto' : 'Click me!';
    shaft.minerState = 'idle';
}

function handleMinerClick(shaftIndex) {
    const shaft = mineshafts[shaftIndex];
    if (!shaft) return; // Guard against undefined shaft
    if (shaft.hasManager) return;
    if (shaft.minerState !== 'idle') return;
    doMining(shaftIndex);
}

async function autoMine(shaftIndex) {
    // Capture current loop ID to detect mine switches
    const myLoopId = miningLoopId;

    while (myLoopId === miningLoopId) {
        const shaft = mineshafts[shaftIndex];
        // Check if shaft still exists and still has manager
        if (!shaft || !shaft.hasManager) break;

        if (shaft.minerState === 'idle') {
            await doMining(shaftIndex);
        }
        await new Promise(r => setTimeout(r, 100));
    }
}

// ============================================
// ELEVATOR LOGIC
// ============================================

// Helper to animate elevator movement between two positions
function animateElevatorMovement(fromShaftIndex, toShaftIndex, duration) {
    return new Promise(resolve => {
        const surfaceTop = 55;
        const fromTop = fromShaftIndex === -1 ? surfaceTop : 80 + (fromShaftIndex * SHAFT_HEIGHT) + 55;
        const toTop = toShaftIndex === -1 ? surfaceTop : 80 + (toShaftIndex * SHAFT_HEIGHT) + 55;
        const fromElevPos = fromShaftIndex === -1 ? 0 : (fromShaftIndex + 1) * SHAFT_HEIGHT - 40;
        const toElevPos = toShaftIndex === -1 ? 0 : (toShaftIndex + 1) * SHAFT_HEIGHT - 40;

        const startTime = Date.now();
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Animate elevator
            const elevTop = fromElevPos + (toElevPos - fromElevPos) * progress;
            elevator.style.top = elevTop + 'px';

            // Animate operator
            const opTop = fromTop + (toTop - fromTop) * progress;
            elevatorOperator.style.transition = 'none';
            elevatorOperator.style.top = opTop + 'px';

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                resolve();
            }
        };
        animate();
    });
}

// Helper to collect coal at a shaft
async function collectAtShaft(shaftIndex) {
    const shaft = mineshafts[shaftIndex];
    const capacity = getElevatorCapacity();
    const shaftTop = 80 + (shaftIndex * SHAFT_HEIGHT) + 55;
    const speedMult = getElevatorSpeedMultiplier();

    // Walk to bucket
    operatorStatus.textContent = `Collecting at Shaft ${shaftIndex + 1}...`;
    elevatorOperator.classList.add('walking');
    await setPosition(elevatorOperator, 100, shaftTop, 400 * speedMult);
    elevatorOperator.classList.remove('walking');

    // Collect coal
    elevatorOperator.classList.add('mining');
    await animateProgress(operatorProgressFill, 800 * speedMult);
    elevatorOperator.classList.remove('mining');

    const spaceAvailable = capacity - elevatorCarrying;
    const coalToCollect = Math.min(shaft.bucketCoal, spaceAvailable);

    if (coalToCollect > 0) {
        shaft.bucketCoal -= coalToCollect;
        elevatorCarrying += coalToCollect;
        updateShaftBucket(shaftIndex);
        updateElevatorCapacityDisplay();
        elevatorOperator.classList.add('has-coal');
    }

    // Walk back to elevator
    elevatorOperator.classList.add('walking');
    await setPosition(elevatorOperator, 175, shaftTop, 400 * speedMult);
    elevatorOperator.classList.remove('walking');

    return coalToCollect;
}

async function doElevatorRun() {
    if (operatorState !== 'idle') return;

    // Check if any shaft has coal
    const hasCoalAnywhere = mineshafts.some(s => s.bucketCoal > 0);
    if (!hasCoalAnywhere) return;

    operatorState = 'busy';
    const capacity = getElevatorCapacity();
    const speedMult = getElevatorSpeedMultiplier();
    let currentShaftIndex = -1; // -1 = surface
    let deepestVisited = -1;

    // Go through each shaft from top to bottom
    for (let i = 0; i < mineshafts.length; i++) {
        // Check if elevator is full
        if (elevatorCarrying >= capacity) {
            operatorStatus.textContent = 'Elevator full!';
            await new Promise(r => setTimeout(r, 300));
            break;
        }

        // Move down to this shaft
        operatorStatus.textContent = `Going to Shaft ${i + 1}...`;
        const travelTime = 600 * speedMult;
        await animateElevatorMovement(currentShaftIndex, i, travelTime);
        currentShaftIndex = i;
        deepestVisited = i;

        // Collect coal if this shaft has any
        if (mineshafts[i].bucketCoal > 0) {
            await collectAtShaft(i);
        }
    }

    // Return to surface
    if (deepestVisited >= 0) {
        operatorStatus.textContent = 'Returning to surface...';
        const returnTime = (600 + (deepestVisited * 400)) * speedMult;
        await animateElevatorMovement(currentShaftIndex, -1, returnTime);
    }

    // Sell coal at surface
    operatorStatus.textContent = 'Selling...';
    await new Promise(r => setTimeout(r, 500));
    elevatorOperator.classList.remove('has-coal');

    if (elevatorCarrying > 0) {
        const mine = getCurrentMine();
        totalCoalSold += elevatorCarrying;

        // Calculate money based on mine's value multiplier
        const baseValue = 10;
        const moneyEarned = elevatorCarrying * baseValue * mine.valueMultiplier;
        money += moneyEarned;
        totalMoneyEarned += moneyEarned;

        // Award research points for ore sold
        if (typeof awardResearchPoints === 'function') {
            awardResearchPoints(moneyEarned);
        }

        createSparkle(175, 80, '+$' + Math.floor(moneyEarned));
        elevatorCarrying = 0;
        updateStats();
    }

    operatorStatus.textContent = hasElevatorManager ? 'Auto' : 'Click elevator!';
    operatorState = 'idle';
}

function handleElevatorClick() {
    if (hasElevatorManager) return;
    if (operatorState !== 'idle') return;

    // Check if any shaft has coal
    const hasCoal = mineshafts.some(s => s.bucketCoal > 0);
    if (!hasCoal) {
        operatorStatus.textContent = 'No coal!';
        setTimeout(() => { operatorStatus.textContent = 'Click elevator!'; }, 1000);
        return;
    }

    doElevatorRun();
}

async function autoElevator() {
    // Increment loop ID to invalidate any previous loops
    elevatorLoopId++;
    const myLoopId = elevatorLoopId;

    while (hasElevatorManager && myLoopId === elevatorLoopId) {
        const hasCoal = mineshafts.some(s => s.bucketCoal > 0);
        if (operatorState === 'idle' && hasCoal) {
            await doElevatorRun();
        }
        await new Promise(r => setTimeout(r, 100));
    }
}

// ============================================
// BUY NEW SHAFT
// Note: MAX_SHAFTS_MINE22 is defined in config.js
// ============================================

function canBuyNewShaft() {
    // Mine 22 is limited to 20 shafts (Shaft 21 is sealed)
    if (currentMineId === 'mine22' && mineshafts.length >= MAX_SHAFTS_MINE22) {
        return false;
    }
    return true;
}

function buyNewShaft() {
    // Check shaft limit for Mine 22
    if (!canBuyNewShaft()) return;

    const cost = getNewShaftCost();
    if (money < cost) return;

    money -= cost;
    updateStats();

    const newIndex = mineshafts.length;
    createMineshaft(newIndex);

    updateBuyShaftButton();
    updatePlayerStats();
    checkAchievements();
}

// ============================================
// MANAGER IMPROVEMENT SYSTEM
// ============================================

// Calculate effective manager cost with all discounts
function getEffectiveManagerCost() {
    let cost = MANAGER_COST;

    // Apply research discount (HR Efficiency: 15% off)
    const researchDiscount = getResearchManagerDiscount();
    cost *= (1 - researchDiscount);

    // Apply prestige upgrade discount (HR Connections: 25% off)
    if (prestigeUpgradesPurchased && prestigeUpgradesPurchased.manager_discount) {
        cost *= (1 - PRESTIGE_UPGRADES.manager_discount.effect.value);
    }

    return Math.floor(cost);
}

// Get manager effectiveness multiplier (from research: Motivation Program)
function getManagerEffectivenessBonus() {
    return getResearchBonus('manager_effectiveness');
}

// Check if a newly hired manager should be a mega manager
function rollForMegaManager() {
    return Math.random() < MEGA_MANAGER_CONFIG.BASE_CHANCE;
}

// Get a random ability for a manager
function getRandomManagerAbility(type, isMega = false) {
    let abilityPool;

    if (isMega) {
        abilityPool = type === 'shaft' ? MEGA_SHAFT_ABILITIES : MEGA_ELEVATOR_ABILITIES;
    } else {
        abilityPool = type === 'shaft' ? SHAFT_ABILITIES : ELEVATOR_ABILITIES;
    }

    const selected = abilityPool[Math.floor(Math.random() * abilityPool.length)];

    return {
        type: selected.id,
        name: selected.name,
        desc: selected.desc,
        icon: selected.icon,
        effect: selected.effect,
        isMega: isMega || selected.isMega || false,
        special: selected.special || null,
        activeUntil: 0,
        cooldownUntil: 0,
        experience: 0,
        rerollCount: 0
    };
}

// Get manager experience level
function getManagerLevel(experience) {
    const levels = MANAGER_EXPERIENCE_CONFIG.LEVELS;
    for (let i = levels.length - 1; i >= 0; i--) {
        if (experience >= levels[i].xpRequired) {
            return levels[i];
        }
    }
    return levels[0];
}

// Get experience bonus for ability effectiveness
function getExperienceBonus(experience) {
    const level = getManagerLevel(experience);
    return level.bonus;
}

// Calculate reroll cost for a manager
function getRerollCost(rerollCount) {
    const baseCost = MANAGER_REROLL_CONFIG.BASE_COST;
    const multiplier = Math.pow(MANAGER_REROLL_CONFIG.COST_MULTIPLIER, rerollCount);
    return Math.min(Math.ceil(baseCost * multiplier), MANAGER_REROLL_CONFIG.MAX_COST);
}

// Reroll manager ability
function rerollManagerAbility(type, shaftIndex = null) {
    let ability;
    let rerollCount;

    if (type === 'shaft') {
        ability = mineshafts[shaftIndex].managerAbility;
        rerollCount = ability.rerollCount || 0;
    } else {
        ability = elevatorManagerAbility;
        rerollCount = ability.rerollCount || 0;
    }

    const cost = getRerollCost(rerollCount);

    if (notes < cost) {
        showStatusMessage('Not enough Notes!');
        return false;
    }

    notes -= cost;
    updateStats();

    // Determine if we get a mega ability on reroll
    const isMega = ability.isMega && Math.random() < MANAGER_REROLL_CONFIG.MEGA_REROLL_CHANCE;

    // Get new ability (preserving experience)
    const newAbility = getRandomManagerAbility(type, isMega);
    newAbility.experience = ability.experience;
    newAbility.rerollCount = rerollCount + 1;

    if (type === 'shaft') {
        mineshafts[shaftIndex].managerAbility = newAbility;
    } else {
        elevatorManagerAbility = newAbility;
    }

    showStatusMessage(`Ability rerolled: ${newAbility.name}`);
    updateManagerInfoDisplay();
    saveGame();

    return true;
}

// Add experience to a manager
function addManagerExperience(type, shaftIndex, amount) {
    if (type === 'shaft') {
        if (!mineshafts[shaftIndex].managerAbility) return;
        const oldLevel = getManagerLevel(mineshafts[shaftIndex].managerAbility.experience || 0);
        mineshafts[shaftIndex].managerAbility.experience = (mineshafts[shaftIndex].managerAbility.experience || 0) + amount;
        const newLevel = getManagerLevel(mineshafts[shaftIndex].managerAbility.experience);
        if (newLevel.level > oldLevel.level) {
            showStatusMessage(`Shaft ${shaftIndex + 1} Manager is now ${newLevel.title}!`);
        }
    } else {
        if (!elevatorManagerAbility) return;
        const oldLevel = getManagerLevel(elevatorManagerAbility.experience || 0);
        elevatorManagerAbility.experience = (elevatorManagerAbility.experience || 0) + amount;
        const newLevel = getManagerLevel(elevatorManagerAbility.experience);
        if (newLevel.level > oldLevel.level) {
            showStatusMessage(`Elevator Manager is now ${newLevel.title}!`);
        }
    }
}

// Update manager info display in popup
function updateManagerInfoDisplay() {
    if (!currentInfoTarget) return;

    let ability;
    if (currentInfoTarget.type === 'shaft') {
        ability = mineshafts[currentInfoTarget.shaftIndex].managerAbility;
    } else {
        ability = elevatorManagerAbility;
    }

    if (!ability) return;

    // Update basic info
    const managerAbilityName = document.getElementById('managerAbilityName');
    const managerAbilityDesc = document.getElementById('managerAbilityDesc');

    if (managerAbilityName) managerAbilityName.textContent = ability.name;
    if (managerAbilityDesc) managerAbilityDesc.textContent = ability.desc;

    // Update experience display
    const expDisplay = document.getElementById('managerExpDisplay');
    if (expDisplay) {
        const level = getManagerLevel(ability.experience || 0);
        const nextLevel = MANAGER_EXPERIENCE_CONFIG.LEVELS[level.level] || level;
        const currentXP = ability.experience || 0;
        const xpForNext = nextLevel.xpRequired - currentXP;

        expDisplay.innerHTML = `
            <div class="manager-level">${level.title} (Lv.${level.level})</div>
            <div class="manager-exp-bar">
                <div class="manager-exp-fill" style="width: ${level.level >= MANAGER_EXPERIENCE_CONFIG.MAX_LEVEL ? 100 : ((currentXP - (MANAGER_EXPERIENCE_CONFIG.LEVELS[level.level - 1]?.xpRequired || 0)) / (nextLevel.xpRequired - (MANAGER_EXPERIENCE_CONFIG.LEVELS[level.level - 1]?.xpRequired || 0)) * 100)}%"></div>
            </div>
            <div class="manager-exp-text">${level.level >= MANAGER_EXPERIENCE_CONFIG.MAX_LEVEL ? 'MAX LEVEL' : `${currentXP}/${nextLevel.xpRequired} XP`}</div>
            ${level.bonus > 0 ? `<div class="manager-bonus">+${Math.round(level.bonus * 100)}% ability power</div>` : ''}
        `;
    }

    // Update reroll button
    const rerollBtn = document.getElementById('managerRerollBtn');
    if (rerollBtn) {
        const cost = getRerollCost(ability.rerollCount || 0);
        rerollBtn.textContent = `Reroll (${cost} Notes)`;
        rerollBtn.disabled = notes < cost;
    }

    // Update mega indicator
    const megaIndicator = document.getElementById('managerMegaIndicator');
    if (megaIndicator) {
        megaIndicator.style.display = ability.isMega ? 'block' : 'none';
    }
}

// ============================================
// MANAGER HIRING
// ============================================
let currentHireTarget = null;

function showMinerManagerPopup(event, shaftIndex) {
    event.stopPropagation();
    const shaft = mineshafts[shaftIndex];

    // If manager is hired, show info popup instead
    if (shaft.hasManager) {
        showManagerInfoPopup(event, 'shaft', shaftIndex);
        return;
    }

    currentHireTarget = { type: 'miner', shaftIndex };

    const effectiveCost = getEffectiveManagerCost();
    const canAfford = money >= effectiveCost;
    const hasDiscount = effectiveCost < MANAGER_COST;

    document.getElementById('hirePopupTitle').textContent = `Shaft ${shaftIndex + 1} Manager`;

    if (hasDiscount) {
        document.getElementById('hirePopupCost').innerHTML = `Cost: <span class="discounted-price">$${effectiveCost}</span> <span class="original-price">$${MANAGER_COST}</span>`;
    } else {
        document.getElementById('hirePopupCost').textContent = `Cost: $${effectiveCost}`;
    }

    document.getElementById('hirePopupCost').className = 'cost ' + (canAfford ? 'affordable' : 'too-expensive');
    document.getElementById('hirePopupBtn').disabled = !canAfford;
    document.getElementById('hirePopupBtn').onclick = () => hireMinerManager(shaftIndex);

    // Position popup
    const rect = shaft.elements.managerSlot.getBoundingClientRect();
    hirePopup.style.left = (rect.left + 40) + 'px';
    hirePopup.style.top = (rect.top - 20) + 'px';
    hirePopup.classList.add('show');
}

function showElevatorManagerPopup(event) {
    event.stopPropagation();

    // If manager is hired, show info popup instead
    if (hasElevatorManager) {
        showManagerInfoPopup(event, 'elevator', null);
        return;
    }

    currentHireTarget = { type: 'elevator' };

    const effectiveCost = getEffectiveManagerCost();
    const canAfford = money >= effectiveCost;
    const hasDiscount = effectiveCost < MANAGER_COST;

    document.getElementById('hirePopupTitle').textContent = 'Elevator Manager';

    if (hasDiscount) {
        document.getElementById('hirePopupCost').innerHTML = `Cost: <span class="discounted-price">$${effectiveCost}</span> <span class="original-price">$${MANAGER_COST}</span>`;
    } else {
        document.getElementById('hirePopupCost').textContent = `Cost: $${effectiveCost}`;
    }

    document.getElementById('hirePopupCost').className = 'cost ' + (canAfford ? 'affordable' : 'too-expensive');
    document.getElementById('hirePopupBtn').disabled = !canAfford;
    document.getElementById('hirePopupBtn').onclick = hireElevatorManager;

    const rect = elevatorManagerSlot.getBoundingClientRect();
    hirePopup.style.left = (rect.left + 40) + 'px';
    hirePopup.style.top = (rect.top) + 'px';
    hirePopup.classList.add('show');
}

function hireMinerManager(shaftIndex) {
    const effectiveCost = getEffectiveManagerCost();
    if (money < effectiveCost) return;
    const shaft = mineshafts[shaftIndex];
    if (shaft.hasManager) return;

    money -= effectiveCost;
    updateStats();

    // Roll for mega manager
    const isMega = rollForMegaManager();

    shaft.hasManager = true;
    shaft.isMegaManager = isMega;
    hirePopup.classList.remove('show');
    shaft.elements.managerSlot.classList.add('hired');
    if (isMega) {
        shaft.elements.managerSlot.classList.add('mega-manager');
    }
    shaft.elements.managerSlot.innerHTML = `
        <div class="worker manager ${isMega ? 'mega' : ''}" style="position: relative;">
            <div class="worker-body">
                <div class="worker-helmet"><div class="worker-helmet-light"></div></div>
                <div class="worker-head"></div>
                <div class="worker-torso"></div>
                <div class="worker-legs"></div>
            </div>
            ${isMega ? '<div class="mega-star">*</div>' : ''}
        </div>
    `;
    shaft.elements.minerStatus.textContent = 'Auto';

    // Assign ability using new system
    shaft.managerAbility = getRandomManagerAbility('shaft', isMega);

    if (isMega) {
        showStatusMessage(`MEGA MANAGER hired! ${shaft.managerAbility.name}`);
    }

    autoMine(shaftIndex);
    updatePlayerStats();
}

function hireElevatorManager() {
    const effectiveCost = getEffectiveManagerCost();
    if (money < effectiveCost) return;
    if (hasElevatorManager) return;

    money -= effectiveCost;
    updateStats();

    // Roll for mega manager
    const isMega = rollForMegaManager();

    hasElevatorManager = true;
    isElevatorMegaManager = isMega;
    hirePopup.classList.remove('show');
    elevatorManagerSlot.classList.add('hired');
    if (isMega) {
        elevatorManagerSlot.classList.add('mega-manager');
    }
    elevatorManagerSlot.innerHTML = `
        <div class="worker manager ${isMega ? 'mega' : ''}" style="position: relative;">
            <div class="worker-body">
                <div class="worker-helmet"><div class="worker-helmet-light"></div></div>
                <div class="worker-head"></div>
                <div class="worker-torso"></div>
                <div class="worker-legs"></div>
            </div>
            ${isMega ? '<div class="mega-star">*</div>' : ''}
        </div>
    `;
    operatorStatus.textContent = 'Auto';

    // Assign ability using new system
    elevatorManagerAbility = getRandomManagerAbility('elevator', isMega);

    if (isMega) {
        showStatusMessage(`MEGA MANAGER hired! ${elevatorManagerAbility.name}`);
    }

    autoElevator();
    updatePlayerStats();
}

// Close popup when clicking elsewhere
document.addEventListener('click', (e) => {
    if (!e.target.closest('.manager-slot') && !e.target.closest('.hire-popup') && !e.target.closest('.manager-info-popup')) {
        hirePopup.classList.remove('show');
        document.getElementById('managerInfoPopup').classList.remove('show');
    }
});

elevatorManagerSlot.onclick = showElevatorManagerPopup;

// ============================================
// MANAGER INFO POPUP
// ============================================
let currentInfoTarget = null; // { type: 'shaft'|'elevator', shaftIndex: number|null }
const managerInfoPopup = document.getElementById('managerInfoPopup');
const managerInfoTitle = document.getElementById('managerInfoTitle');
const managerAbilityName = document.getElementById('managerAbilityName');
const managerAbilityDesc = document.getElementById('managerAbilityDesc');
const managerAbilityStatus = document.getElementById('managerAbilityStatus');
const managerActivateBtn = document.getElementById('managerActivateBtn');
const managerFireBtn = document.getElementById('managerFireBtn');
const managerCloseBtn = document.getElementById('managerCloseBtn');
const managerRerollBtn = document.getElementById('managerRerollBtn');

function showManagerInfoPopup(event, type, shaftIndex) {
    let ability;
    let managerName;
    let slotElement;

    if (type === 'shaft') {
        const shaft = mineshafts[shaftIndex];
        ability = shaft.managerAbility;
        managerName = `Manager ${shaftIndex + 1}`;
        slotElement = shaft.elements.managerSlot;

        // Handle legacy managers without abilities
        if (!ability) {
            const randomAbility = SHAFT_ABILITIES[Math.floor(Math.random() * SHAFT_ABILITIES.length)];
            shaft.managerAbility = {
                type: randomAbility.id,
                name: randomAbility.name,
                desc: randomAbility.desc,
                icon: randomAbility.icon,
                effect: randomAbility.effect,
                isMega: false,
                special: null,
                activeUntil: 0,
                cooldownUntil: 0,
                experience: 0,
                rerollCount: 0
            };
            ability = shaft.managerAbility;
        }
        // Ensure legacy abilities have new properties
        if (ability.experience === undefined) ability.experience = 0;
        if (ability.rerollCount === undefined) ability.rerollCount = 0;
        if (ability.effect === undefined) ability.effect = ABILITY_EFFECTS.DISCOUNT_PERCENT;
    } else {
        ability = elevatorManagerAbility;
        managerName = 'Elevator Manager';
        slotElement = elevatorManagerSlot;

        // Handle legacy managers without abilities
        if (!ability) {
            const randomAbility = ELEVATOR_ABILITIES[Math.floor(Math.random() * ELEVATOR_ABILITIES.length)];
            elevatorManagerAbility = {
                type: randomAbility.id,
                name: randomAbility.name,
                desc: randomAbility.desc,
                icon: randomAbility.icon,
                effect: randomAbility.effect,
                isMega: false,
                special: null,
                activeUntil: 0,
                cooldownUntil: 0,
                experience: 0,
                rerollCount: 0
            };
            ability = elevatorManagerAbility;
        }
        // Ensure legacy abilities have new properties
        if (ability.experience === undefined) ability.experience = 0;
        if (ability.rerollCount === undefined) ability.rerollCount = 0;
        if (ability.effect === undefined) ability.effect = ABILITY_EFFECTS.DISCOUNT_PERCENT;
    }

    currentInfoTarget = { type, shaftIndex };

    // Update popup content
    managerInfoTitle.textContent = managerName;
    managerAbilityName.textContent = ability.name;
    managerAbilityDesc.textContent = ability.desc;

    // Update ability status
    updateManagerInfoPopupStatus();

    // Update experience and reroll display
    updateManagerInfoDisplay();

    // Position popup
    const rect = slotElement.getBoundingClientRect();
    managerInfoPopup.style.left = (rect.left + 40) + 'px';
    managerInfoPopup.style.top = (rect.top - 50) + 'px';
    managerInfoPopup.classList.add('show');
}

function updateManagerInfoPopupStatus() {
    if (!currentInfoTarget) return;

    let ability;
    if (currentInfoTarget.type === 'shaft') {
        ability = mineshafts[currentInfoTarget.shaftIndex].managerAbility;
    } else {
        ability = elevatorManagerAbility;
    }

    if (!ability) return;

    const now = Date.now();
    if (ability.activeUntil > now) {
        const remaining = Math.ceil((ability.activeUntil - now) / 1000);
        const mins = Math.floor(remaining / 60);
        const secs = remaining % 60;
        managerAbilityStatus.textContent = `Active: ${mins}:${secs.toString().padStart(2, '0')}`;
        managerAbilityStatus.className = 'ability-status active';
        managerActivateBtn.disabled = true;
        managerActivateBtn.textContent = 'Active';
    } else if (ability.cooldownUntil > now) {
        const remaining = Math.ceil((ability.cooldownUntil - now) / 1000);
        const mins = Math.floor(remaining / 60);
        const secs = remaining % 60;
        managerAbilityStatus.textContent = `Cooldown: ${mins}:${secs.toString().padStart(2, '0')}`;
        managerAbilityStatus.className = 'ability-status cooldown';
        managerActivateBtn.disabled = true;
        managerActivateBtn.textContent = 'On Cooldown';
    } else {
        managerAbilityStatus.textContent = 'Ready to activate';
        managerAbilityStatus.className = 'ability-status';
        managerActivateBtn.disabled = false;
        managerActivateBtn.textContent = 'Activate';
    }
}

// Update popup status periodically
setInterval(() => {
    if (managerInfoPopup.classList.contains('show')) {
        updateManagerInfoPopupStatus();
    }
}, 1000);

// Activate button click
managerActivateBtn.onclick = () => {
    if (!currentInfoTarget) return;

    if (currentInfoTarget.type === 'shaft') {
        activateShaftAbility(currentInfoTarget.shaftIndex);
    } else {
        activateElevatorAbility();
    }
    updateManagerInfoPopupStatus();
};

// Fire button click
managerFireBtn.onclick = () => {
    if (!currentInfoTarget) return;

    if (currentInfoTarget.type === 'shaft') {
        fireShaftManager(currentInfoTarget.shaftIndex);
    } else {
        fireElevatorManager();
    }
    managerInfoPopup.classList.remove('show');
};

// Close button click
managerCloseBtn.onclick = () => {
    managerInfoPopup.classList.remove('show');
};

// Reroll button click
managerRerollBtn.onclick = () => {
    if (!currentInfoTarget) return;

    if (currentInfoTarget.type === 'shaft') {
        rerollManagerAbility('shaft', currentInfoTarget.shaftIndex);
    } else {
        rerollManagerAbility('elevator');
    }
};

function fireShaftManager(shaftIndex) {
    const shaft = mineshafts[shaftIndex];
    if (!shaft.hasManager) return;

    shaft.hasManager = false;
    shaft.managerAbility = null;
    shaft.elements.managerSlot.classList.remove('hired');
    shaft.elements.managerSlot.innerHTML = '<span class="plus-icon">+</span>';
    shaft.elements.minerStatus.textContent = 'Click me!';
    updatePlayerStats();
}

function fireElevatorManager() {
    if (!hasElevatorManager) return;

    hasElevatorManager = false;
    elevatorManagerAbility = null;
    elevatorManagerSlot.classList.remove('hired');
    elevatorManagerSlot.innerHTML = '<span class="plus-icon">+</span>';
    operatorStatus.textContent = 'Click me!';
    updatePlayerStats();
}

// ============================================
// ABILITY SYSTEM
// ============================================
function activateShaftAbility(shaftIndex) {
    const shaft = mineshafts[shaftIndex];
    if (!shaft.managerAbility) return;
    if (!canActivateAbility(shaft.managerAbility)) return;

    const now = Date.now();

    // Calculate duration (Double Shift ability makes it 2x longer)
    let duration = ABILITY_DURATION;
    if (shaft.managerAbility.special === 'duration') {
        duration *= shaft.managerAbility.effect || 2.0;
    }

    shaft.managerAbility.activeUntil = now + duration;
    shaft.managerAbility.cooldownUntil = now + duration + ABILITY_COOLDOWN;

    // Grant experience for activation
    addManagerExperience('shaft', shaftIndex, MANAGER_EXPERIENCE_CONFIG.XP_PER_ACTIVATION);

    updateAbilityButtonState(shaftIndex);
    updateManagerInfoDisplay();
}

function activateElevatorAbility() {
    if (!elevatorManagerAbility) return;
    if (!canActivateAbility(elevatorManagerAbility)) return;

    const now = Date.now();

    // Calculate duration (Double Shift ability makes it 2x longer)
    let duration = ABILITY_DURATION;
    if (elevatorManagerAbility.special === 'duration') {
        duration *= elevatorManagerAbility.effect || 2.0;
    }

    elevatorManagerAbility.activeUntil = now + duration;
    elevatorManagerAbility.cooldownUntil = now + duration + ABILITY_COOLDOWN;

    // Grant experience for activation
    addManagerExperience('elevator', null, MANAGER_EXPERIENCE_CONFIG.XP_PER_ACTIVATION);

    updateElevatorAbilityButtonState();
    updateElevatorCapacityDisplay(); // In case it's the capacity ability
    updateManagerInfoDisplay();
}

// Legacy functions - buttons removed, now using info popup
function updateAbilityButtonState(shaftIndex) {
    // No-op - standalone ability buttons have been removed
    // Status is now shown in the manager info popup
}

function updateElevatorAbilityButtonState() {
    // No-op - standalone ability buttons have been removed
    // Status is now shown in the manager info popup
}

// Update elevator capacity display periodically
setInterval(() => {
    if (hasElevatorManager) {
        updateElevatorCapacityDisplay();
    }
}, 1000);

// ============================================
// ACHIEVEMENTS SYSTEM
// ============================================
function initAchievements() {
    // Initialize all achievements as locked if not already set
    ACHIEVEMENTS.forEach(achievement => {
        if (!achievementsState[achievement.id]) {
            achievementsState[achievement.id] = 'locked';
        }
    });
}

function getAchievementProgress(achievement) {
    if (achievement.type === 'coal') {
        return Math.min(totalCoalMined, achievement.target);
    } else if (achievement.type === 'copper') {
        return Math.min(totalCopperMined, achievement.target);
    } else if (achievement.type === 'shafts') {
        // Count total shafts across all mines
        let totalShafts = mineshafts.length;
        Object.keys(mineStates).forEach(mineId => {
            if (mineId !== currentMineId && mineStates[mineId].mineshafts) {
                totalShafts += mineStates[mineId].mineshafts.length;
            }
        });
        return Math.min(totalShafts, achievement.target);
    }
    return 0;
}

function checkAchievements() {
    ACHIEVEMENTS.forEach(achievement => {
        if (achievementsState[achievement.id] === 'locked') {
            const progress = getAchievementProgress(achievement);
            if (progress >= achievement.target) {
                achievementsState[achievement.id] = 'unlocked';
            }
        }
    });
    updateAchievementBadge();
}

function getUnclaimedCount() {
    return ACHIEVEMENTS.filter(a => achievementsState[a.id] === 'unlocked').length;
}

function updateAchievementBadge() {
    const badge = document.getElementById('achievementBadge');
    const count = getUnclaimedCount();
    if (count > 0) {
        badge.textContent = count;
        badge.style.display = 'flex';
    } else {
        badge.style.display = 'none';
    }
}

function updatePlayerStats() {
    document.getElementById('statTotalCoal').textContent = formatNumber(totalCoalMined);
    document.getElementById('statMineshafts').textContent = mineshafts.length;
    document.getElementById('statElevatorLevel').textContent = elevatorLevel;
    document.getElementById('statTotalMoney').textContent = '$' + formatNumber(totalMoneyEarned);
}

function closeAllPanels() {
    const panels = [
        'statsPanel', 'achievementsPanel', 'updatesPanel', 'mapPanel',
        'shopPanel', 'prestigePanel', 'researchPanel', 'settingsPanel', 'devPanel',
        'prestigeConfirmModal', 'welcomeBackModal'
    ];
    panels.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.remove('show');
    });
}

function toggleStatsPanel() {
    const panel = document.getElementById('statsPanel');
    const wasOpen = panel.classList.contains('show');
    closeAllPanels();
    if (!wasOpen) {
        panel.classList.add('show');
        updatePlayerStats();
    }
}

function toggleAchievementsPanel() {
    const panel = document.getElementById('achievementsPanel');
    const wasOpen = panel.classList.contains('show');
    closeAllPanels();
    if (!wasOpen) {
        panel.classList.add('show');
        renderAchievementsList();
    }
}

function toggleUpdatesPanel() {
    const panel = document.getElementById('updatesPanel');
    const wasOpen = panel.classList.contains('show');
    closeAllPanels();
    if (!wasOpen) {
        panel.classList.add('show');
        renderUpdatesList();
    }
}

function toggleMapPanel() {
    const panel = document.getElementById('mapPanel');
    const wasOpen = panel.classList.contains('show');
    closeAllPanels();
    if (!wasOpen) {
        panel.classList.add('show');
        renderMapPanel();
    }
}

function toggleShopPanel() {
    const panel = document.getElementById('shopPanel');
    const wasOpen = panel.classList.contains('show');
    closeAllPanels();
    if (!wasOpen) {
        panel.classList.add('show');
        // Update all shop displays
        updateNotesDisplay();
        updateShopRankDisplay();
        updateExchangeDisplay();
        updateActiveBoostsDisplay();
    }
}

// ============================================
// PRESTIGE SYSTEM (Bonds)
// ============================================

// Prestige state
let bonds = 0;
let totalBondsEarned = 0;
let prestigeCount = 0;
let prestigeUpgradesPurchased = {};
let lastPlayTime = Date.now();
let pendingOfflineRewards = null;

function togglePrestigePanel() {
    const panel = document.getElementById('prestigePanel');
    const wasOpen = panel.classList.contains('show');
    closeAllPanels();
    if (!wasOpen) {
        panel.classList.add('show');
        updatePrestigeDisplay();
        renderPrestigeUpgrades();
    }
}

// Calculate bonds earned from current progress
function calculateBondsFromProgress() {
    const earned = totalMoneyEarned;
    if (earned < PRESTIGE_CONFIG.MIN_PRESTIGE_THRESHOLD) {
        return 0;
    }
    return Math.floor(Math.sqrt(earned / PRESTIGE_CONFIG.BONDS_DIVISOR));
}

// Check if player can prestige
function canPrestige() {
    return totalMoneyEarned >= PRESTIGE_CONFIG.MIN_PRESTIGE_THRESHOLD;
}

// Get total production bonus from bonds and upgrades
function getPrestigeProductionBonus() {
    let bonus = bonds * PRESTIGE_CONFIG.PRODUCTION_BONUS_PER_BOND;

    // Add upgrade bonuses
    for (const [upgradeId, purchased] of Object.entries(prestigeUpgradesPurchased)) {
        if (purchased && PRESTIGE_UPGRADES[upgradeId]) {
            const effect = PRESTIGE_UPGRADES[upgradeId].effect;
            if (effect.type === 'production') {
                bonus += effect.value;
            }
        }
    }

    return bonus;
}

// Get speed bonus from prestige upgrades
function getPrestigeSpeedBonus() {
    let bonus = 0;
    for (const [upgradeId, purchased] of Object.entries(prestigeUpgradesPurchased)) {
        if (purchased && PRESTIGE_UPGRADES[upgradeId]) {
            const effect = PRESTIGE_UPGRADES[upgradeId].effect;
            if (effect.type === 'speed') {
                bonus += effect.value;
            }
        }
    }
    return bonus;
}

// Get capacity bonus from prestige upgrades
function getPrestigeCapacityBonus() {
    let bonus = 0;
    for (const [upgradeId, purchased] of Object.entries(prestigeUpgradesPurchased)) {
        if (purchased && PRESTIGE_UPGRADES[upgradeId]) {
            const effect = PRESTIGE_UPGRADES[upgradeId].effect;
            if (effect.type === 'capacity') {
                bonus += effect.value;
            }
        }
    }
    return bonus;
}

// Get offline bonus from prestige upgrades
function getPrestigeOfflineBonus() {
    let bonus = 0;
    for (const [upgradeId, purchased] of Object.entries(prestigeUpgradesPurchased)) {
        if (purchased && PRESTIGE_UPGRADES[upgradeId]) {
            const effect = PRESTIGE_UPGRADES[upgradeId].effect;
            if (effect.type === 'offline') {
                bonus += effect.value;
            }
        }
    }
    return bonus;
}

// Get manager discount from prestige upgrades
function getPrestigeManagerDiscount() {
    let discount = 0;
    for (const [upgradeId, purchased] of Object.entries(prestigeUpgradesPurchased)) {
        if (purchased && PRESTIGE_UPGRADES[upgradeId]) {
            const effect = PRESTIGE_UPGRADES[upgradeId].effect;
            if (effect.type === 'manager_discount') {
                discount += effect.value;
            }
        }
    }
    return discount;
}

// Get shaft discount from prestige upgrades
function getPrestigeShaftDiscount() {
    let discount = 0;
    for (const [upgradeId, purchased] of Object.entries(prestigeUpgradesPurchased)) {
        if (purchased && PRESTIGE_UPGRADES[upgradeId]) {
            const effect = PRESTIGE_UPGRADES[upgradeId].effect;
            if (effect.type === 'shaft_discount') {
                discount += effect.value;
            }
        }
    }
    return discount;
}

// Get starting cash from prestige upgrades
function getPrestigeStartingCash() {
    let startingCash = bonds * PRESTIGE_CONFIG.STARTING_CASH_PER_BOND;

    for (const [upgradeId, purchased] of Object.entries(prestigeUpgradesPurchased)) {
        if (purchased && PRESTIGE_UPGRADES[upgradeId]) {
            const effect = PRESTIGE_UPGRADES[upgradeId].effect;
            if (effect.type === 'starting_cash') {
                startingCash = Math.max(startingCash, effect.value);
            }
        }
    }

    return startingCash;
}

// Update prestige panel display
function updatePrestigeDisplay() {
    const bondsEl = document.getElementById('prestigeBondsCount');
    const countEl = document.getElementById('prestigeCount');
    const totalEl = document.getElementById('totalBondsEarned');
    const bonusEl = document.getElementById('currentPrestigeBonus');
    const previewEl = document.getElementById('prestigeRewardPreview');
    const btnBondsEl = document.getElementById('prestigeBtnBonds');
    const reqEl = document.getElementById('prestigeRequirement');
    const btnEl = document.getElementById('prestigeActionBtn');

    if (bondsEl) bondsEl.textContent = formatNumber(bonds);
    if (countEl) countEl.textContent = prestigeCount;
    if (totalEl) totalEl.textContent = formatNumber(totalBondsEarned);

    const totalBonus = getPrestigeProductionBonus();
    if (bonusEl) bonusEl.textContent = `+${Math.round(totalBonus * 100)}%`;

    const potentialBonds = calculateBondsFromProgress();
    if (previewEl) previewEl.textContent = potentialBonds;
    if (btnBondsEl) btnBondsEl.textContent = potentialBonds;

    const canDoPrestige = canPrestige();
    if (reqEl) {
        if (canDoPrestige) {
            reqEl.textContent = `Ready to prestige! Earn ${formatNumber(potentialBonds)} Bonds.`;
            reqEl.classList.add('met');
        } else {
            const needed = PRESTIGE_CONFIG.MIN_PRESTIGE_THRESHOLD - totalMoneyEarned;
            reqEl.textContent = `Earn $${formatNumber(needed)} more to unlock prestige`;
            reqEl.classList.remove('met');
        }
    }

    if (btnEl) {
        btnEl.disabled = !canDoPrestige || potentialBonds === 0;
    }
}

// Render prestige upgrades
function renderPrestigeUpgrades() {
    const categories = {
        production: ['production_i', 'production_ii', 'production_iii'],
        speed: ['speed_i', 'speed_ii', 'speed_iii'],
        capacity: ['capacity_i', 'capacity_ii'],
        economy: ['starting_cash', 'starting_cash_ii', 'offline_i', 'offline_ii', 'manager_discount', 'unlock_speed']
    };

    const grids = {
        production: document.getElementById('productionUpgrades'),
        speed: document.getElementById('speedUpgrades'),
        capacity: document.getElementById('capacityUpgrades'),
        economy: document.getElementById('economyUpgrades')
    };

    for (const [category, upgradeIds] of Object.entries(categories)) {
        const grid = grids[category];
        if (!grid) continue;

        grid.innerHTML = upgradeIds.map(id => {
            const upgrade = PRESTIGE_UPGRADES[id];
            if (!upgrade) return '';

            const owned = prestigeUpgradesPurchased[id];
            const affordable = bonds >= upgrade.cost;
            const locked = upgrade.requires && !prestigeUpgradesPurchased[upgrade.requires];

            let classes = 'prestige-upgrade-item';
            if (owned) classes += ' owned';
            else if (locked) classes += ' locked';
            else if (affordable) classes += ' affordable';

            return `
                <div class="${classes}" onclick="purchasePrestigeUpgrade('${id}')">
                    <div class="upgrade-name">${upgrade.name}</div>
                    <div class="upgrade-desc">${upgrade.desc}</div>
                    ${owned
                        ? '<div class="upgrade-owned">✓ Owned</div>'
                        : `<div class="upgrade-cost">📜 ${upgrade.cost} Bonds</div>`
                    }
                </div>
            `;
        }).join('');
    }
}

// Purchase a prestige upgrade
function purchasePrestigeUpgrade(upgradeId) {
    const upgrade = PRESTIGE_UPGRADES[upgradeId];
    if (!upgrade) return;

    // Check if already owned
    if (prestigeUpgradesPurchased[upgradeId]) return;

    // Check if locked
    if (upgrade.requires && !prestigeUpgradesPurchased[upgrade.requires]) {
        showBoostMessage(`Requires: ${PRESTIGE_UPGRADES[upgrade.requires].name}`, 'error');
        return;
    }

    // Check if can afford
    if (bonds < upgrade.cost) {
        showBoostMessage(`Need ${upgrade.cost} Bonds`, 'error');
        return;
    }

    // Purchase
    bonds -= upgrade.cost;
    prestigeUpgradesPurchased[upgradeId] = true;

    showBoostMessage(`Purchased: ${upgrade.name}`, 'success');

    updatePrestigeDisplay();
    renderPrestigeUpgrades();
    saveToLocalStorage();
}

// Show prestige confirmation modal
function confirmPrestige() {
    if (!canPrestige()) return;

    const potentialBonds = calculateBondsFromProgress();
    document.getElementById('confirmBondsAmount').textContent = potentialBonds;
    document.getElementById('prestigeConfirmModal').classList.add('show');
}

// Close prestige confirmation
function closePrestigeConfirm() {
    document.getElementById('prestigeConfirmModal').classList.remove('show');
}

// Execute the prestige reset
function executePrestige() {
    if (!canPrestige()) return;

    const earnedBonds = calculateBondsFromProgress();

    // Add bonds
    bonds += earnedBonds;
    totalBondsEarned += earnedBonds;
    prestigeCount++;

    // Close modal
    closePrestigeConfirm();
    closeAllPanels();

    // Calculate starting cash
    const startingCash = getPrestigeStartingCash();

    // Reset game state (keep: bonds, prestigeUpgradesPurchased, achievementsState)
    money = startingCash;
    notes = 0;
    playerXP = 0;
    totalCoalSold = 0;
    totalCoalMined = 0;
    totalCopperMined = 0;
    totalMoneyEarned = 0;
    elevatorLevel = 1;
    elevatorCarrying = 0;
    hasElevatorManager = false;
    elevatorManagerAbility = null;
    operatorState = 'idle';

    // Reset mines
    currentMineId = 'mine22';
    minesUnlocked = { mine22: true, mine37: false };
    mineStates = {
        mine22: {
            mineshafts: [],
            elevatorLevel: 1,
            hasElevatorManager: false,
            elevatorManagerAbility: null,
            totalOreMined: 0,
            lastActiveTime: Date.now()
        },
        mine37: {
            mineshafts: [],
            elevatorLevel: 1,
            hasElevatorManager: false,
            elevatorManagerAbility: null,
            totalOreMined: 0,
            lastActiveTime: null
        }
    };

    // Reset shop state (keep rank progress though)
    activeBoosts = {};
    dailyExchangeCount = 0;

    // Clear and recreate shafts
    mineshaftsContainer.innerHTML = '';
    mineshafts = [];
    createMineshaft(0);

    // Reset elevator UI
    if (elevatorManagerSlot) {
        elevatorManagerSlot.classList.remove('hired');
        elevatorManagerSlot.innerHTML = '<span class="hire-text">Hire<br>Manager</span>';
    }
    if (operatorStatus) {
        operatorStatus.textContent = 'Idle';
    }

    // Update all displays
    updateStats();
    updatePlayerStats();
    updateLevelDisplay();
    updateNotesDisplay();
    renderMapPanel();
    updateMineIndicator();
    updateMineTheme();
    updateShopRankDisplay();
    updateActiveBoostsDisplay();

    // Sync GameState
    syncGlobalsToGameState();

    // Save
    saveToLocalStorage();

    // Show success message
    showBoostMessage(`Prestiged! Earned ${earnedBonds} Bonds`, 'success');
}

// ============================================
// OFFLINE PROGRESS SYSTEM
// ============================================

// Calculate offline earnings
function calculateOfflineEarnings(offlineMs) {
    // Cap at max offline hours
    const maxMs = PRESTIGE_CONFIG.MAX_OFFLINE_HOURS * 60 * 60 * 1000;
    const cappedMs = Math.min(offlineMs, maxMs);

    // Need at least managers to earn offline
    let totalProductionPerSecond = 0;

    // Calculate production from all managed shafts across all mines
    for (const [mineId, mineState] of Object.entries(mineStates)) {
        if (!mineState.mineshafts) continue;

        const mineConfig = MINES[mineId];
        if (!mineConfig) continue;

        for (const shaft of mineState.mineshafts) {
            if (shaft.hasManager) {
                // Base production per second (rough estimate)
                const shaftLevel = shaft.level || 1;
                const baseProduction = shaftLevel * 2 * mineConfig.valueMultiplier;
                totalProductionPerSecond += baseProduction;
            }
        }
    }

    // Also check if elevator has manager (otherwise production is stuck)
    let elevatorEfficiency = 0;
    const currentMineState = mineStates[currentMineId];
    if (currentMineState && currentMineState.hasElevatorManager) {
        elevatorEfficiency = 1;
    } else if (hasElevatorManager) {
        elevatorEfficiency = 1;
    }

    if (elevatorEfficiency === 0) {
        // No elevator manager = no offline earnings
        return 0;
    }

    // Apply offline efficiency
    let efficiency = PRESTIGE_CONFIG.OFFLINE_EFFICIENCY;

    // Apply prestige offline bonus
    efficiency += getPrestigeOfflineBonus();

    // Apply prestige production bonus
    const productionBonus = 1 + getPrestigeProductionBonus();

    const seconds = cappedMs / 1000;
    const earnings = Math.floor(totalProductionPerSecond * seconds * efficiency * productionBonus);

    return earnings;
}

// Check for offline progress on load
function checkOfflineProgress() {
    const now = Date.now();
    const offlineMs = now - lastPlayTime;

    // Minimum 1 minute offline to count
    if (offlineMs < 60000) {
        lastPlayTime = now;
        return;
    }

    const earnings = calculateOfflineEarnings(offlineMs);

    if (earnings > 0) {
        pendingOfflineRewards = {
            earnings: earnings,
            timeOffline: offlineMs
        };
        showWelcomeBackModal();
    }

    lastPlayTime = now;
}

// Show welcome back modal
function showWelcomeBackModal() {
    if (!pendingOfflineRewards) return;

    const modal = document.getElementById('welcomeBackModal');
    const timeText = document.getElementById('offlineTimeText');
    const earningsText = document.getElementById('offlineEarningsAmount');

    // Format time
    const hours = Math.floor(pendingOfflineRewards.timeOffline / (1000 * 60 * 60));
    const minutes = Math.floor((pendingOfflineRewards.timeOffline % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
        timeText.textContent = `You were away for ${hours}h ${minutes}m`;
    } else {
        timeText.textContent = `You were away for ${minutes} minutes`;
    }

    earningsText.textContent = `$${formatNumber(pendingOfflineRewards.earnings)}`;

    modal.classList.add('show');
}

// Claim offline rewards
function claimOfflineRewards() {
    if (!pendingOfflineRewards) return;

    money += pendingOfflineRewards.earnings;
    totalMoneyEarned += pendingOfflineRewards.earnings;

    updateStats();
    saveToLocalStorage();

    showBoostMessage(`Collected $${formatNumber(pendingOfflineRewards.earnings)}!`, 'success');

    pendingOfflineRewards = null;
    document.getElementById('welcomeBackModal').classList.remove('show');
}

// Update last play time periodically
function updateLastPlayTime() {
    lastPlayTime = Date.now();
}

// Start tracking play time
setInterval(updateLastPlayTime, 30000); // Update every 30 seconds

// ============================================
// RESEARCH SYSTEM
// ============================================

// Research state
let researchPoints = 0;
let totalResearchPointsEarned = 0;
let researchCompleted = {};
let expandedResearchCategories = { mining: true, transport: true, management: true, automation: true };

function toggleResearchPanel() {
    const panel = document.getElementById('researchPanel');
    const wasOpen = panel.classList.contains('show');
    closeAllPanels();
    if (!wasOpen) {
        panel.classList.add('show');
        updateResearchDisplay();
        renderResearchTree();
    }
}

// Toggle research category expansion
function toggleResearchCategory(categoryId) {
    expandedResearchCategories[categoryId] = !expandedResearchCategories[categoryId];
    const categoryEl = document.getElementById(`researchCategory${categoryId.charAt(0).toUpperCase() + categoryId.slice(1)}`);
    if (categoryEl) {
        categoryEl.classList.toggle('collapsed', !expandedResearchCategories[categoryId]);
    }
}

// Award research points when selling ore
function awardResearchPoints(moneyEarned) {
    const pointsEarned = Math.floor(moneyEarned / 1000) * RESEARCH_CONFIG.POINTS_PER_1000_SOLD;
    if (pointsEarned > 0) {
        researchPoints += pointsEarned;
        totalResearchPointsEarned += pointsEarned;
    }
}

// Update research display
function updateResearchDisplay() {
    const pointsEl = document.getElementById('researchPointsCount');
    if (pointsEl) {
        pointsEl.textContent = formatNumber(researchPoints);
    }
}

// Render research tree
function renderResearchTree() {
    for (const [categoryId, category] of Object.entries(RESEARCH_TREE)) {
        const gridId = `research${categoryId.charAt(0).toUpperCase() + categoryId.slice(1)}Grid`;
        const grid = document.getElementById(gridId);
        if (!grid) continue;

        grid.innerHTML = Object.values(category.upgrades).map(upgrade => {
            const owned = researchCompleted[upgrade.id];
            const affordable = researchPoints >= upgrade.cost;
            const locked = upgrade.requires && !researchCompleted[upgrade.requires];

            let classes = 'research-upgrade-item';
            if (owned) classes += ' owned';
            else if (locked) classes += ' locked';
            else if (affordable) classes += ' affordable';

            return `
                <div class="${classes}" onclick="purchaseResearch('${categoryId}', '${upgrade.id}')">
                    <div class="research-upgrade-name">${upgrade.name}</div>
                    <div class="research-upgrade-desc">${upgrade.desc}</div>
                    ${owned
                        ? '<div class="research-upgrade-owned">✓ Researched</div>'
                        : `<div class="research-upgrade-cost">🧪 ${upgrade.cost}</div>`
                    }
                </div>
            `;
        }).join('');
    }
}

// Purchase a research upgrade
function purchaseResearch(categoryId, upgradeId) {
    const category = RESEARCH_TREE[categoryId];
    if (!category) return;

    const upgrade = category.upgrades[upgradeId];
    if (!upgrade) return;

    // Check if already owned
    if (researchCompleted[upgradeId]) return;

    // Check if locked
    if (upgrade.requires && !researchCompleted[upgrade.requires]) {
        showBoostMessage(`Requires: ${category.upgrades[upgrade.requires]?.name || upgrade.requires}`, 'error');
        return;
    }

    // Check if can afford
    if (researchPoints < upgrade.cost) {
        showBoostMessage(`Need ${upgrade.cost} Research Points`, 'error');
        return;
    }

    // Purchase
    researchPoints -= upgrade.cost;
    researchCompleted[upgradeId] = true;

    showBoostMessage(`Researched: ${upgrade.name}`, 'success');

    updateResearchDisplay();
    renderResearchTree();
    saveToLocalStorage();
}

// Get research bonus by effect type
function getResearchBonus(effectType) {
    let bonus = 0;
    for (const category of Object.values(RESEARCH_TREE)) {
        for (const upgrade of Object.values(category.upgrades)) {
            if (researchCompleted[upgrade.id] && upgrade.effect.type === effectType) {
                bonus += upgrade.effect.value;
            }
        }
    }
    return bonus;
}

// Get total mining output bonus from research
function getResearchMiningBonus() {
    return getResearchBonus('mining_output') + getResearchBonus('depth_bonus');
}

// Get total elevator speed bonus from research
function getResearchElevatorSpeedBonus() {
    return getResearchBonus('elevator_speed');
}

// Get total elevator capacity bonus from research
function getResearchElevatorCapacityBonus() {
    return getResearchBonus('elevator_capacity');
}

// Get total worker speed bonus from research
function getResearchWorkerSpeedBonus() {
    return getResearchBonus('worker_speed');
}

// Get auto efficiency bonus from research
function getResearchAutoEfficiencyBonus() {
    return getResearchBonus('auto_efficiency');
}

// Get global efficiency bonus from research
function getResearchGlobalBonus() {
    return getResearchBonus('global_efficiency');
}

// Get offline bonus from research
function getResearchOfflineBonus() {
    return getResearchBonus('offline_bonus');
}

// Get manager cost discount from research
function getResearchManagerDiscount() {
    return getResearchBonus('manager_cost');
}

function toggleSettingsPanel() {
    const panel = document.getElementById('settingsPanel');
    const wasOpen = panel.classList.contains('show');
    closeAllPanels();
    if (!wasOpen) {
        panel.classList.add('show');
    }
}

function renderUpdatesList() {
    const list = document.getElementById('updatesList');

    // Render legend first
    const legendHtml = `
        <div class="update-legend">
            <div class="update-legend-title">Legend</div>
            <div class="update-legend-items">
                ${UPDATE_LOG_LEGEND.map(item => `
                    <span class="update-legend-item">
                        <span class="update-legend-icon">${item.icon}</span>
                        <span class="update-legend-label">${item.label}</span>
                    </span>
                `).join('')}
            </div>
        </div>
    `;

    // Render versions with sorted changes
    const versionsHtml = UPDATE_LOG.map(version => {
        const sortedChanges = sortChangesByType(version.changes);
        return `
            <div class="update-version">
                <div class="update-version-header">
                    <span class="update-version-number">v${version.version}</span>
                    <span class="update-version-date">${version.date}</span>
                </div>
                ${sortedChanges.map(change => `
                    <div class="update-change">
                        <span class="update-change-icon">${getChangeTypeIcon(change.type)}</span>
                        <span class="update-change-text">${change.text}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }).join('');

    list.innerHTML = legendHtml + versionsHtml;
}

function renderAchievementsList() {
    const list = document.getElementById('achievementsList');

    // Update summary
    updateAchievementsSummary();

    // Render achievements
    list.innerHTML = ACHIEVEMENTS.map(achievement => {
        const state = achievementsState[achievement.id] || 'locked';
        const progress = getAchievementProgress(achievement);
        const progressPercent = Math.min((progress / achievement.target) * 100, 100);
        const progressText = formatNumber(progress) + ' / ' + formatNumber(achievement.target);

        // Use image if available, otherwise use emoji icon
        const iconHtml = achievement.image
            ? `<img src="${achievement.image}" alt="${achievement.name}" class="achievement-icon-img" onerror="this.style.display='none';this.nextElementSibling.style.display='block'"><span class="achievement-icon-fallback" style="display:none">${achievement.icon}</span>`
            : `<span>${achievement.icon}</span>`;

        return `
            <div class="achievement-item ${state}" id="achievement-${achievement.id}">
                <div class="achievement-icon">${iconHtml}</div>
                <div class="achievement-info">
                    <div class="achievement-name">${achievement.name}</div>
                    <div class="achievement-desc">${achievement.desc}</div>
                    <div class="achievement-progress">
                        <div class="achievement-progress-fill" style="width: ${progressPercent}%"></div>
                    </div>
                    <div class="achievement-progress-text">${progressText}</div>
                </div>
                ${state === 'unlocked' ? `<button class="claim-btn" onclick="claimAchievement('${achievement.id}')">Claim</button>` : ''}
            </div>
        `;
    }).join('');
}

function updateAchievementsSummary() {
    const total = ACHIEVEMENTS.length;
    const claimed = ACHIEVEMENTS.filter(a => achievementsState[a.id] === 'claimed').length;
    const unlocked = ACHIEVEMENTS.filter(a => achievementsState[a.id] === 'unlocked').length;
    const completed = claimed + unlocked;
    const percent = total > 0 ? Math.floor((completed / total) * 100) : 0;

    document.getElementById('achievementsUnlocked').textContent = completed;
    document.getElementById('achievementsTotal').textContent = total;
    document.getElementById('achievementsPercent').textContent = percent;
}

// Legacy function for compatibility
function openAchievementsModal() {
    toggleAchievementsPanel();
}

function closeAchievementsModal() {
    document.getElementById('achievementsPanel').classList.remove('show');
}

function claimAchievement(achievementId) {
    if (achievementsState[achievementId] !== 'unlocked') return;

    const element = document.getElementById(`achievement-${achievementId}`);
    element.classList.add('claiming');

    setTimeout(() => {
        achievementsState[achievementId] = 'claimed';
        element.classList.remove('claiming', 'unlocked');
        element.classList.add('claimed');

        // Remove claim button
        const claimBtn = element.querySelector('.claim-btn');
        if (claimBtn) claimBtn.remove();

        // Award XP based on achievement class
        const achievementClass = getAchievementClass(achievementId);
        const xpReward = ACHIEVEMENT_XP_REWARDS[achievementClass] || 100;
        addXP(xpReward);

        updateAchievementBadge();
        updateAchievementsSummary();
    }, 500);
}


// Initialize achievements on load
initAchievements();

// ============================================
// PLAYER LEVELING SYSTEM
// ============================================
function getPlayerLevel() {
    for (let i = LEVEL_XP_THRESHOLDS.length - 1; i >= 0; i--) {
        if (playerXP >= LEVEL_XP_THRESHOLDS[i]) {
            return i + 1;
        }
    }
    return 1;
}

function getXPForNextLevel() {
    const level = getPlayerLevel();
    if (level >= MAX_PLAYER_LEVEL) {
        return LEVEL_XP_THRESHOLDS[MAX_PLAYER_LEVEL - 1];
    }
    return LEVEL_XP_THRESHOLDS[level];
}

function getXPForCurrentLevel() {
    const level = getPlayerLevel();
    return LEVEL_XP_THRESHOLDS[level - 1];
}

function getLevelProgress() {
    const level = getPlayerLevel();
    if (level >= MAX_PLAYER_LEVEL) {
        return 100;
    }
    const currentLevelXP = LEVEL_XP_THRESHOLDS[level - 1];
    const nextLevelXP = LEVEL_XP_THRESHOLDS[level];
    const xpIntoLevel = playerXP - currentLevelXP;
    const xpNeeded = nextLevelXP - currentLevelXP;
    return Math.floor((xpIntoLevel / xpNeeded) * 100);
}

function addXP(amount) {
    const oldLevel = getPlayerLevel();
    playerXP += amount;
    const newLevel = getPlayerLevel();

    updateLevelDisplay();

    // Check for level up
    if (newLevel > oldLevel) {
        showLevelUpNotification(newLevel);
    }
}

function getAchievementClass(achievementId) {
    // Extract class from achievement ID (e.g., 'coal_3' -> 3)
    const match = achievementId.match(/_(\d+)$/);
    return match ? parseInt(match[1]) : 1;
}

function showLevelUpNotification(level) {
    const notification = document.createElement('div');
    notification.className = 'level-up-notification';
    notification.innerHTML = `<span>LEVEL UP!</span><span class="new-level">Level ${level}</span>`;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('show');
    }, 100);

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 500);
    }, 2500);
}

function updateLevelDisplay() {
    const level = getPlayerLevel();
    const progress = getLevelProgress();

    document.getElementById('playerLevel').textContent = level;
    document.getElementById('levelProgressFill').style.width = progress + '%';

    if (level >= MAX_PLAYER_LEVEL) {
        document.getElementById('levelXPText').textContent = 'MAX';
    } else {
        // Show exact XP progress within current level (no rounding)
        const currentLevelXP = LEVEL_XP_THRESHOLDS[level - 1];
        const nextLevelXP = LEVEL_XP_THRESHOLDS[level];
        const xpIntoLevel = Math.floor(playerXP - currentLevelXP);
        const xpNeeded = nextLevelXP - currentLevelXP;
        document.getElementById('levelXPText').textContent =
            `${xpIntoLevel}/${xpNeeded}`;
    }
}

// ============================================
// UPGRADE MODALS
// ============================================
function openShaftUpgradeModal(shaftIndex) {
    selectedShaftIndex = shaftIndex;
    upgradeMode = 'shaft';

    const shaft = mineshafts[shaftIndex];
    const currentCoal = getShaftCoalPerTrip(shaftIndex);
    const nextCoal = currentCoal * COAL_PER_LEVEL_MULTIPLIER;
    const cost = getShaftUpgradeCost(shaftIndex);
    const canAfford = money >= cost;

    document.getElementById('upgradeModalTitle').textContent = `Shaft ${shaftIndex + 1} Upgrade`;
    document.getElementById('modalLevel').textContent = shaft.level;
    document.getElementById('currentCoal').textContent = formatNumber(currentCoal);
    document.getElementById('nextCoal').textContent = formatNumber(nextCoal);
    document.getElementById('upgradeCost').textContent = '$' + cost;
    document.getElementById('upgradeBtn').disabled = !canAfford;

    upgradeModal.classList.add('show');
}

function openElevatorUpgradeModal() {
    upgradeMode = 'elevator';

    const currentCapacity = getElevatorCapacity();
    const nextCapacity = Math.floor(currentCapacity * COAL_PER_LEVEL_MULTIPLIER);
    const cost = getElevatorUpgradeCost();
    const canAfford = money >= cost;

    document.getElementById('upgradeModalTitle').textContent = 'Elevator Upgrade';
    document.getElementById('modalLevel').textContent = elevatorLevel;
    document.getElementById('currentCoal').textContent = currentCapacity + ' capacity';
    document.getElementById('nextCoal').textContent = nextCapacity + ' capacity';
    document.getElementById('upgradeCost').textContent = '$' + cost;
    document.getElementById('upgradeBtn').disabled = !canAfford;

    upgradeModal.classList.add('show');
}

function closeUpgradeModal() {
    upgradeModal.classList.remove('show');
}

function performUpgrade() {
    if (upgradeMode === 'shaft') {
        const cost = getShaftUpgradeCost(selectedShaftIndex);
        if (money >= cost) {
            money -= cost;
            mineshafts[selectedShaftIndex].level++;
            mineshafts[selectedShaftIndex].elements.levelBtn.textContent = mineshafts[selectedShaftIndex].level;
            updateStats();
            openShaftUpgradeModal(selectedShaftIndex); // Refresh modal
        }
    } else if (upgradeMode === 'elevator') {
        const cost = getElevatorUpgradeCost();
        if (money >= cost) {
            money -= cost;
            elevatorLevel++;
            updateStats();
            openElevatorUpgradeModal(); // Refresh modal
        }
    }
}

upgradeModal.addEventListener('click', (e) => {
    if (e.target === upgradeModal) {
        closeUpgradeModal();
    }
});

// ============================================
// INITIALIZATION
// ============================================
function initGame() {
    // Create first mineshaft
    createMineshaft(0);
    updateStats();

    // Initialize map panel
    renderMapPanel();

    // Update mine indicator
    updateMineIndicator();

    // Initialize level display
    updateLevelDisplay();

    // Start note earning system
    startNoteEarning();
    updateNotesDisplay();

    // Start boost timer loop
    startBoostTimerLoop();
    updateActiveBoostsDisplay();

    // Initialize shop displays
    updateShopRankDisplay();
    updateExchangeDisplay();
}

initGame();

// ============================================
// AUDIO CONTROLS (Settings Panel)
// ============================================
// bgMusic is defined at top with other audio elements
const volumeSlider = document.getElementById('volumeSlider');
const volumeIcon = document.getElementById('volumeIcon');
const volumeValue = document.getElementById('volumeValue');
let currentVolume = 30;
let audioInitialized = false;

// Initialize volume slider
function initVolumeControls() {
    volumeSlider.addEventListener('input', handleVolumeChange);
    volumeIcon.addEventListener('click', toggleMute);
    // Set default volume to 30%
    volumeSlider.value = 30;
    setVolume(30);
}

function handleVolumeChange(e) {
    const value = parseInt(e.target.value);
    setVolume(value);
}

function setVolume(value) {
    currentVolume = value;
    const normalizedVolume = value / 100;

    // Update slider background
    volumeSlider.style.background = `linear-gradient(to right, #ffd700 0%, #ffd700 ${value}%, #333 ${value}%, #333 100%)`;

    if (value > 0) {
        bgMusic.volume = normalizedVolume;
        if (bgMusic.paused && audioInitialized) {
            bgMusic.play().catch(() => {});
        } else if (!audioInitialized) {
            // First time playing - requires user interaction
            bgMusic.volume = normalizedVolume;
            bgMusic.play().then(() => {
                audioInitialized = true;
            }).catch(() => {});
        }
    } else {
        bgMusic.pause();
    }

    updateVolumeDisplay(value);
}

function updateVolumeDisplay(value) {
    volumeValue.textContent = value + '%';
    if (value === 0) {
        volumeIcon.textContent = '🔇';
    } else if (value < 50) {
        volumeIcon.textContent = '🔉';
    } else {
        volumeIcon.textContent = '🔊';
    }
}

function toggleMute() {
    if (currentVolume > 0) {
        // Store current volume and mute
        volumeSlider.dataset.previousVolume = currentVolume;
        volumeSlider.value = 0;
        setVolume(0);
    } else {
        // Restore previous volume
        const prevVolume = parseInt(volumeSlider.dataset.previousVolume) || 50;
        volumeSlider.value = prevVolume;
        setVolume(prevVolume);
    }
}

// Legacy toggleAudio function for compatibility
function toggleAudio() {
    if (currentVolume === 0) {
        volumeSlider.value = 50;
        setVolume(50);
    } else {
        volumeSlider.value = 0;
        setVolume(0);
    }
}

// Audio error handling
bgMusic.addEventListener('error', function(e) {
    console.error('Audio file failed to load:', e);
    volumeIcon.textContent = '❌';
});

// Initialize volume controls when DOM is ready
initVolumeControls();

// ============================================
// FIREBASE AUTHENTICATION & CLOUD SAVE
// ============================================
const firebaseConfig = {
    apiKey: "AIzaSyALpmEs_llRQUlaRZxkqWmZ9057kNfShYw",
    authDomain: "dunhill-miner.firebaseapp.com",
    projectId: "dunhill-miner",
    storageBucket: "dunhill-miner.firebasestorage.app",
    messagingSenderId: "327920415162",
    appId: "1:327920415162:web:8f5f610ab703f28cd3ad83",
    measurementId: "G-JEZB8XJW8J"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

let currentUser = null;

const authModal = document.getElementById('authModal');
const authFormView = document.getElementById('authFormView');
const loggedInView = document.getElementById('loggedInView');
const userEmailEl = document.getElementById('userEmail');
const saveStatusEl = document.getElementById('saveStatus');

// Settings panel elements
const settingsNotLoggedIn = document.getElementById('settingsNotLoggedIn');
const settingsLoggedIn = document.getElementById('settingsLoggedIn');
const settingsUserEmail = document.getElementById('settingsUserEmail');
const settingsSaveStatus = document.getElementById('settingsSaveStatus');
const autoSaveStatus = document.getElementById('autoSaveStatus');

// Autosave configuration
// Note: AUTOSAVE_INTERVAL defined as TIMING.AUTOSAVE_INTERVAL in config.js
let autosaveIntervalId = null;
let lastSaveTime = null;

// Start autosave interval for cloud saves
function startCloudAutosave() {
    if (autosaveIntervalId) {
        clearInterval(autosaveIntervalId);
    }

    autosaveIntervalId = setInterval(async () => {
        if (currentUser) {
            try {
                await saveGameToCloud();
                lastSaveTime = new Date();
                updateAutoSaveStatusDisplay();
            } catch (error) {
                console.error('Autosave failed:', error);
            }
        }
    }, TIMING.AUTOSAVE_INTERVAL);
}

// Stop autosave interval
function stopCloudAutosave() {
    if (autosaveIntervalId) {
        clearInterval(autosaveIntervalId);
        autosaveIntervalId = null;
    }
}

// Save to localStorage (for non-logged in users)
function saveToLocalStorage() {
    saveCurrentMineState();

    const shaftsData = mineshafts.map(s => ({
        level: s.level,
        bucketCoal: s.bucketCoal,
        hasManager: s.hasManager,
        managerAbility: s.managerAbility ? {
            type: s.managerAbility.type,
            name: s.managerAbility.name,
            desc: s.managerAbility.desc,
            icon: s.managerAbility.icon,
            activeUntil: s.managerAbility.activeUntil,
            cooldownUntil: s.managerAbility.cooldownUntil
        } : null
    }));

    const gameData = {
        version: SAVE_VERSION,
        totalCoalSold,
        totalCoalMined,
        totalCopperMined,
        totalMoneyEarned,
        money,
        notes,
        elevatorLevel,
        hasElevatorManager,
        elevatorManagerAbility: elevatorManagerAbility ? {
            type: elevatorManagerAbility.type,
            name: elevatorManagerAbility.name,
            desc: elevatorManagerAbility.desc,
            icon: elevatorManagerAbility.icon,
            activeUntil: elevatorManagerAbility.activeUntil,
            cooldownUntil: elevatorManagerAbility.cooldownUntil
        } : null,
        achievementsState,
        shafts: shaftsData,
        currentMineId,
        minesUnlocked,
        mineStates,
        playerXP,
        activeBoosts,
        totalNotesSpent,
        dailyExchangeCount,
        lastExchangeDate,
        // Prestige data
        bonds,
        totalBondsEarned,
        prestigeCount,
        prestigeUpgradesPurchased,
        lastPlayTime,
        // Research data
        researchPoints,
        totalResearchPointsEarned,
        researchCompleted,
        savedAt: Date.now()
    };

    try {
        localStorage.setItem('dunhillMinerSave', JSON.stringify(gameData));
        lastSaveTime = new Date();
        updateAutoSaveStatusDisplay();
        return true;
    } catch (error) {
        console.error('localStorage save failed:', error);
        return false;
    }
}

// Migrate save data from older versions
function migrateSaveData(data) {
    const version = data.version || 1;

    // Version 1 -> 2: Added save versioning and config consolidation
    if (version < 2) {
        // No structural changes needed, just add version
        data.version = 2;
        console.log('Migrated save data from v1 to v2');
    }

    // Future migrations go here:
    // if (version < 3) { ... }

    return data;
}

// Load from localStorage
function loadFromLocalStorage() {
    try {
        const saved = localStorage.getItem('dunhillMinerSave');
        if (!saved) return false;

        let data = JSON.parse(saved);

        // Run migrations if needed
        if (!data.version || data.version < SAVE_VERSION) {
            data = migrateSaveData(data);
            // Re-save with updated version
            localStorage.setItem('dunhillMinerSave', JSON.stringify(data));
        }

        // Restore basic stats
        totalCoalSold = data.totalCoalSold || 0;
        totalCoalMined = data.totalCoalMined || 0;
        totalCopperMined = data.totalCopperMined || 0;
        totalMoneyEarned = data.totalMoneyEarned || 0;
        money = data.money || 0;
        notes = data.notes || 0;
        elevatorLevel = data.elevatorLevel || 1;

        // Restore mine system state
        if (data.currentMineId) currentMineId = data.currentMineId;
        if (data.minesUnlocked) minesUnlocked = data.minesUnlocked;
        if (data.mineStates) mineStates = data.mineStates;

        // Restore player progression
        if (data.playerXP !== undefined) playerXP = data.playerXP;
        if (data.achievementsState) achievementsState = data.achievementsState;
        initAchievements(); // Ensure all achievements are initialized

        // Clear existing shafts and recreate
        mineshaftsContainer.innerHTML = '';
        mineshafts = [];

        // Rebuild mineshafts using createMineshaft (the correct function)
        if (data.shafts && data.shafts.length > 0) {
            for (let i = 0; i < data.shafts.length; i++) {
                createMineshaft(i);
                const shaftData = data.shafts[i];
                mineshafts[i].level = shaftData.level || 1;
                mineshafts[i].bucketCoal = shaftData.bucketCoal || 0;
                mineshafts[i].elements.levelBtn.textContent = mineshafts[i].level;
                updateShaftBucket(i);

                // Restore manager if had one
                if (shaftData.hasManager && !mineshafts[i].hasManager) {
                    mineshafts[i].hasManager = true;
                    mineshafts[i].elements.managerSlot.classList.add('hired');
                    mineshafts[i].elements.managerSlot.innerHTML = `
                        <div class="worker manager" style="position: relative;">
                            <div class="worker-body">
                                <div class="worker-helmet"><div class="worker-helmet-light"></div></div>
                                <div class="worker-head"></div>
                                <div class="worker-torso"></div>
                                <div class="worker-legs"></div>
                            </div>
                        </div>
                    `;
                    mineshafts[i].elements.minerStatus.textContent = 'Auto';

                    // Restore ability data
                    if (shaftData.managerAbility) {
                        mineshafts[i].managerAbility = shaftData.managerAbility;
                    }

                    autoMine(i);
                }
            }
        } else {
            createMineshaft(0);
        }

        // Restore elevator manager
        if (data.hasElevatorManager && !hasElevatorManager) {
            hasElevatorManager = true;
            elevatorManagerSlot.classList.add('hired');
            elevatorManagerSlot.innerHTML = `
                <div class="worker manager" style="position: relative;">
                    <div class="worker-body">
                        <div class="worker-helmet"><div class="worker-helmet-light"></div></div>
                        <div class="worker-head"></div>
                        <div class="worker-torso"></div>
                        <div class="worker-legs"></div>
                    </div>
                </div>
            `;
            operatorStatus.textContent = 'Auto';

            // Restore elevator ability data
            if (data.elevatorManagerAbility) {
                elevatorManagerAbility = data.elevatorManagerAbility;
            }

            autoElevator();
        }

        // Restore active boosts (filter out expired ones)
        if (data.activeBoosts) {
            const now = Date.now();
            activeBoosts = {};
            for (const [boostId, expiresAt] of Object.entries(data.activeBoosts)) {
                if (expiresAt > now && BOOSTS[boostId]) {
                    activeBoosts[boostId] = expiresAt;
                }
            }
        }

        // Restore shop rank progress
        if (data.totalNotesSpent !== undefined) totalNotesSpent = data.totalNotesSpent;
        if (data.dailyExchangeCount !== undefined) dailyExchangeCount = data.dailyExchangeCount;
        if (data.lastExchangeDate) lastExchangeDate = data.lastExchangeDate;

        // Restore prestige data
        if (data.bonds !== undefined) bonds = data.bonds;
        if (data.totalBondsEarned !== undefined) totalBondsEarned = data.totalBondsEarned;
        if (data.prestigeCount !== undefined) prestigeCount = data.prestigeCount;
        if (data.prestigeUpgradesPurchased) prestigeUpgradesPurchased = data.prestigeUpgradesPurchased;
        if (data.lastPlayTime) lastPlayTime = data.lastPlayTime;

        // Restore research data
        if (data.researchPoints !== undefined) researchPoints = data.researchPoints;
        if (data.totalResearchPointsEarned !== undefined) totalResearchPointsEarned = data.totalResearchPointsEarned;
        if (data.researchCompleted) researchCompleted = data.researchCompleted;

        // Update all displays
        updateStats();
        updatePlayerStats();
        checkAchievements();
        updateAchievementBadge();
        renderMapPanel();
        updateMineIndicator();
        updateMineTheme();
        updateLevelDisplay();
        updateNotesDisplay();
        updateShopRankDisplay();
        updateActiveBoostsDisplay();

        // Check for offline progress
        setTimeout(checkOfflineProgress, 500);

        return true;
    } catch (error) {
        console.error('localStorage load failed:', error);
        return false;
    }
}

// Update autosave status display
function updateAutoSaveStatusDisplay() {
    if (currentUser) {
        if (lastSaveTime) {
            const timeAgo = Math.floor((Date.now() - lastSaveTime.getTime()) / 1000);
            if (timeAgo < 60) {
                autoSaveStatus.textContent = `Saved ${timeAgo}s ago`;
            } else {
                autoSaveStatus.textContent = `Saved ${Math.floor(timeAgo / 60)}m ago`;
            }
        } else {
            autoSaveStatus.textContent = 'Active (60s)';
        }
        autoSaveStatus.style.color = '#32CD32';
    } else {
        if (lastSaveTime) {
            autoSaveStatus.textContent = 'Local save active';
            autoSaveStatus.style.color = '#ffd700';
        } else {
            autoSaveStatus.textContent = 'Local save';
            autoSaveStatus.style.color = '#aaa';
        }
    }
}

// Start local autosave for non-logged in users
function startLocalAutosave() {
    if (autosaveIntervalId) {
        clearInterval(autosaveIntervalId);
    }

    autosaveIntervalId = setInterval(() => {
        if (!currentUser) {
            saveToLocalStorage();
        }
    }, TIMING.AUTOSAVE_INTERVAL);
}

auth.onAuthStateChanged(async (user) => {
    currentUser = user;
    if (user) {
        // Update auth modal view
        authFormView.style.display = 'none';
        loggedInView.style.display = 'block';
        userEmailEl.textContent = user.email;

        // Update settings panel view
        settingsNotLoggedIn.style.display = 'none';
        settingsLoggedIn.style.display = 'block';
        settingsUserEmail.textContent = user.email;

        // Start cloud autosave
        startCloudAutosave();
        updateAutoSaveStatusDisplay();

        // Auto-load saved game on login
        await autoLoadGame();
    } else {
        // Update auth modal view
        authFormView.style.display = 'block';
        loggedInView.style.display = 'none';

        // Update settings panel view
        settingsNotLoggedIn.style.display = 'block';
        settingsLoggedIn.style.display = 'none';

        // Stop cloud autosave and start local autosave
        stopCloudAutosave();
        startLocalAutosave();

        // Try to load from localStorage
        if (loadFromLocalStorage()) {
            updateAutoSaveStatusDisplay();
        } else {
            autoSaveStatus.textContent = 'Local save';
            autoSaveStatus.style.color = '#aaa';
        }
    }
});

// Auto-load game when user logs in
async function autoLoadGame() {
    if (!currentUser) return;

    try {
        const doc = await db.collection('saves').doc(currentUser.uid).get();
        if (doc.exists) {
            // Only auto-load if there's saved data
            await loadGameFromCloud();
            updateSettingsStatus('Progress loaded!', '#32CD32');
        }
    } catch (error) {
        console.error('Auto-load failed:', error);
    }
}

function updateSettingsStatus(message, color = '#32CD32') {
    settingsSaveStatus.textContent = message;
    settingsSaveStatus.style.color = color;
    setTimeout(() => { settingsSaveStatus.textContent = ''; }, 3000);
}

function openAuthModal() {
    authModal.classList.add('show');
}

function closeAuthModal() {
    authModal.classList.remove('show');
    document.getElementById('loginError').textContent = '';
    document.getElementById('signupError').textContent = '';
    saveStatusEl.textContent = '';
}

function switchAuthTab(tab) {
    const tabs = document.querySelectorAll('.auth-tab');
    const forms = document.querySelectorAll('.auth-form');
    tabs.forEach(t => t.classList.remove('active'));
    forms.forEach(f => f.classList.remove('active'));
    if (tab === 'login') {
        tabs[0].classList.add('active');
        document.getElementById('loginForm').classList.add('active');
    } else {
        tabs[1].classList.add('active');
        document.getElementById('signupForm').classList.add('active');
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const errorEl = document.getElementById('loginError');
    try {
        errorEl.textContent = 'Logging in...';
        await auth.signInWithEmailAndPassword(email, password);
        errorEl.textContent = '';
        document.getElementById('loginForm').reset();
    } catch (error) {
        errorEl.textContent = getAuthErrorMessage(error.code);
    }
}

async function handleSignup(e) {
    e.preventDefault();
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirm = document.getElementById('signupConfirm').value;
    const errorEl = document.getElementById('signupError');
    if (password !== confirm) {
        errorEl.textContent = 'Passwords do not match';
        return;
    }
    try {
        errorEl.textContent = 'Creating account...';
        await auth.createUserWithEmailAndPassword(email, password);
        errorEl.textContent = '';
        document.getElementById('signupForm').reset();
    } catch (error) {
        errorEl.textContent = getAuthErrorMessage(error.code);
    }
}

async function handleLogout() {
    try {
        await auth.signOut();
        closeAuthModal();
    } catch (error) {
        console.error('Logout error:', error);
    }
}

function getAuthErrorMessage(code) {
    switch (code) {
        case 'auth/email-already-in-use': return 'Email already in use';
        case 'auth/invalid-email': return 'Invalid email address';
        case 'auth/weak-password': return 'Password too weak (min 6 characters)';
        case 'auth/user-not-found': return 'No account with this email';
        case 'auth/wrong-password': return 'Incorrect password';
        case 'auth/invalid-credential': return 'Invalid email or password';
        case 'auth/operation-not-allowed': return 'Email/Password sign-in not enabled';
        case 'auth/network-request-failed': return 'Network error. Check connection.';
        case 'auth/too-many-requests': return 'Too many attempts. Try later.';
        default:
            console.error('Firebase auth error:', code);
            return 'Error: ' + (code || 'Unknown');
    }
}

async function saveGameToCloud() {
    if (!currentUser) return;
    saveStatusEl.textContent = 'Saving...';

    const shaftsData = mineshafts.map(s => ({
        level: s.level,
        bucketCoal: s.bucketCoal,
        hasManager: s.hasManager,
        managerAbility: s.managerAbility ? {
            type: s.managerAbility.type,
            name: s.managerAbility.name,
            desc: s.managerAbility.desc,
            icon: s.managerAbility.icon,
            activeUntil: s.managerAbility.activeUntil,
            cooldownUntil: s.managerAbility.cooldownUntil
        } : null
    }));

    // Save current mine state before saving
    saveCurrentMineState();

    const gameData = {
        version: SAVE_VERSION,
        totalCoalSold,
        totalCoalMined,
        totalCopperMined,
        totalMoneyEarned,
        money,
        notes,
        elevatorLevel,
        hasElevatorManager,
        elevatorManagerAbility: elevatorManagerAbility ? {
            type: elevatorManagerAbility.type,
            name: elevatorManagerAbility.name,
            desc: elevatorManagerAbility.desc,
            icon: elevatorManagerAbility.icon,
            activeUntil: elevatorManagerAbility.activeUntil,
            cooldownUntil: elevatorManagerAbility.cooldownUntil
        } : null,
        achievementsState,
        shafts: shaftsData,
        // Mine system state
        currentMineId,
        minesUnlocked,
        mineStates,
        // Player progression
        playerXP,
        activeBoosts,
        totalNotesSpent,
        dailyExchangeCount,
        lastExchangeDate,
        savedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
        await db.collection('saves').doc(currentUser.uid).set(gameData);
        saveStatusEl.textContent = 'Saved successfully!';
        updateSettingsStatus('Saved successfully!', '#32CD32');
        setTimeout(() => { saveStatusEl.textContent = ''; }, 3000);
    } catch (error) {
        saveStatusEl.textContent = 'Save failed: ' + error.message;
        updateSettingsStatus('Save failed!', '#dc3545');
    }
}

async function loadGameFromCloud() {
    if (!currentUser) return;
    saveStatusEl.textContent = 'Loading...';

    try {
        const doc = await db.collection('saves').doc(currentUser.uid).get();
        if (doc.exists) {
            const data = doc.data();

            totalCoalSold = data.totalCoalSold || 0;
            totalCoalMined = data.totalCoalMined || 0;
            totalCopperMined = data.totalCopperMined || 0;
            totalMoneyEarned = data.totalMoneyEarned || 0;
            money = data.money || 0;
            notes = data.notes || 0;
            elevatorLevel = data.elevatorLevel || 1;

            // Restore mine system state
            if (data.currentMineId) {
                currentMineId = data.currentMineId;
            }
            if (data.minesUnlocked) {
                minesUnlocked = data.minesUnlocked;
            }
            if (data.mineStates) {
                mineStates = data.mineStates;
            }

            // Restore player progression
            if (data.playerXP !== undefined) {
                playerXP = data.playerXP;
            }

            // Restore achievements state
            if (data.achievementsState) {
                achievementsState = data.achievementsState;
            }
            initAchievements(); // Ensure all achievements are initialized

            // Clear existing shafts and recreate
            mineshaftsContainer.innerHTML = '';
            mineshafts = [];

            if (data.shafts && data.shafts.length > 0) {
                for (let i = 0; i < data.shafts.length; i++) {
                    createMineshaft(i);
                    const shaftData = data.shafts[i];
                    mineshafts[i].level = shaftData.level || 1;
                    mineshafts[i].bucketCoal = shaftData.bucketCoal || 0;
                    mineshafts[i].elements.levelBtn.textContent = mineshafts[i].level;
                    updateShaftBucket(i);

                    if (shaftData.hasManager && !mineshafts[i].hasManager) {
                        mineshafts[i].hasManager = true;
                        mineshafts[i].elements.managerSlot.classList.add('hired');
                        mineshafts[i].elements.managerSlot.innerHTML = `
                            <div class="worker manager" style="position: relative;">
                                <div class="worker-body">
                                    <div class="worker-helmet"><div class="worker-helmet-light"></div></div>
                                    <div class="worker-head"></div>
                                    <div class="worker-torso"></div>
                                    <div class="worker-legs"></div>
                                </div>
                            </div>
                        `;
                        mineshafts[i].elements.minerStatus.textContent = 'Auto';

                        // Restore ability data
                        if (shaftData.managerAbility) {
                            mineshafts[i].managerAbility = shaftData.managerAbility;
                        }

                        autoMine(i);
                    }
                }
            } else {
                createMineshaft(0);
            }

            if (data.hasElevatorManager && !hasElevatorManager) {
                hasElevatorManager = true;
                elevatorManagerSlot.classList.add('hired');
                elevatorManagerSlot.innerHTML = `
                    <div class="worker manager" style="position: relative;">
                        <div class="worker-body">
                            <div class="worker-helmet"><div class="worker-helmet-light"></div></div>
                            <div class="worker-head"></div>
                            <div class="worker-torso"></div>
                            <div class="worker-legs"></div>
                        </div>
                    </div>
                `;
                operatorStatus.textContent = 'Auto';

                // Restore elevator ability data
                if (data.elevatorManagerAbility) {
                    elevatorManagerAbility = data.elevatorManagerAbility;
                }

                autoElevator();
            }

            updateStats();
            updatePlayerStats();
            checkAchievements();
            updateAchievementBadge();
            renderMapPanel();
            updateMineIndicator();
            updateMineTheme();
            updateLevelDisplay();
            saveStatusEl.textContent = 'Loaded successfully!';
            updateSettingsStatus('Loaded successfully!', '#32CD32');
        } else {
            saveStatusEl.textContent = 'No saved game found';
            updateSettingsStatus('No saved game found', '#ffd700');
        }
        setTimeout(() => { saveStatusEl.textContent = ''; }, 3000);
    } catch (error) {
        saveStatusEl.textContent = 'Load failed: ' + error.message;
        updateSettingsStatus('Load failed!', '#dc3545');
    }
}

authModal.addEventListener('click', (e) => {
    if (e.target === authModal) {
        closeAuthModal();
    }
});

// ============================================
// ADMIN MODE & DEVELOPER TOOLS
// ============================================

const ADMIN_PASSWORD_HASH = 'e651362559979ce46010b6e24428831a5c979fcc8e0d6b1f95d8f8a94bc8abc9';
let adminModeActive = false;
let adminAttempts = 0;
const MAX_ADMIN_ATTEMPTS = 5;

async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function activateAdminMode() {
    const passwordInput = document.getElementById('adminPasswordInput');
    const errorEl = document.getElementById('adminError');
    const password = passwordInput.value;

    // Rate limiting
    if (adminAttempts >= MAX_ADMIN_ATTEMPTS) {
        errorEl.textContent = 'Too many attempts. Reload page to try again.';
        return;
    }

    const passwordHash = await hashPassword(password);
    if (passwordHash === ADMIN_PASSWORD_HASH) {
        adminModeActive = true;
        errorEl.textContent = '';
        passwordInput.value = '';

        // Show admin active state
        document.getElementById('adminModeInactive').style.display = 'none';
        document.getElementById('adminModeActive').style.display = 'block';

        // Show dev tools button
        document.getElementById('devBtn').style.display = 'flex';

        devLog('Admin mode activated', 'success');
    } else {
        adminAttempts++;
        const remaining = MAX_ADMIN_ATTEMPTS - adminAttempts;
        if (remaining > 0) {
            errorEl.textContent = `Incorrect password (${remaining} attempts left)`;
        } else {
            errorEl.textContent = 'Too many attempts. Reload page to try again.';
        }
        setTimeout(() => {
            if (adminAttempts < MAX_ADMIN_ATTEMPTS) {
                errorEl.textContent = '';
            }
        }, 3000);
    }
}

function deactivateAdminMode() {
    adminModeActive = false;

    // Hide admin active state
    document.getElementById('adminModeInactive').style.display = 'block';
    document.getElementById('adminModeActive').style.display = 'none';

    // Hide dev tools button and close panel
    document.getElementById('devBtn').style.display = 'none';
    document.getElementById('devPanel').classList.remove('show');

    devLog('Admin mode deactivated');
}

function toggleDevPanel() {
    if (!adminModeActive) return;

    const panel = document.getElementById('devPanel');
    const wasOpen = panel.classList.contains('show');
    closeAllPanels();
    if (!wasOpen) {
        panel.classList.add('show');
    }
}

function devLog(message, type = 'info') {
    const console = document.getElementById('devConsole');
    if (!console) return;

    const timestamp = new Date().toLocaleTimeString();
    const line = document.createElement('div');
    line.className = 'dev-console-line';
    if (type === 'error') line.classList.add('error');
    if (type === 'warning') line.classList.add('warning');
    if (type === 'success') line.classList.add('success');
    line.textContent = `[${timestamp}] ${message}`;

    console.appendChild(line);
    console.scrollTop = console.scrollHeight;
}

// ============================================
// DEV TOOL FUNCTIONS
// ============================================

function devTriggerScene(sceneId) {
    // Close dev panel first
    document.getElementById('devPanel').classList.remove('show');

    // Special handling for intro_letter - show the image version
    if (sceneId === 'intro_letter') {
        devTriggerIntroLetter();
        return;
    }

    // Special handling for foreman_intro - show the scene version
    if (sceneId === 'foreman_intro') {
        devTriggerForemanScene();
        return;
    }

    if (!STORY_SCENES[sceneId]) {
        devLog(`Scene "${sceneId}" not found`, 'error');
        return;
    }

    showDialogue(sceneId, () => {
        devLog(`Scene "${sceneId}" completed`, 'success');
    });

    devLog(`Triggering scene: ${sceneId}`);
}

function devTriggerForemanScene() {
    // Stop all music (beginForemanScene will handle it, but this is a failsafe)
    stopAllSceneMusic();

    beginForemanScene();
    devLog('Foreman scene triggered', 'success');
}

function devTriggerIntroLetter() {
    const introLetterScreen = document.getElementById('introLetterScreen');
    const fadeOverlay = document.getElementById('fadeOverlay');

    // Stop all music before showing intro (failsafe)
    stopAllSceneMusic();

    // Fade to black
    fadeOverlay.classList.add('active');

    setTimeout(() => {
        // Show the intro letter screen and play intro music
        introLetterScreen.classList.add('active');
        playIntroMusic();

        // Fade back in
        setTimeout(() => {
            fadeOverlay.classList.remove('active');
        }, 300);

        devLog('Intro letter triggered (image version)', 'success');
    }, 500);
}

function devAddMoney(amount) {
    money += amount;
    updateStats();
    devLog(`Added $${formatNumber(amount)} (Total: $${formatNumber(money)})`, 'success');
}

function devSetMoney() {
    const input = document.getElementById('devCashInput');
    const value = input.value.trim();

    if (!value) {
        devLog('Please enter a value', 'error');
        return;
    }

    const amount = parseNumberWithSuffix(value);

    if (isNaN(amount) || amount < 0) {
        devLog(`Invalid value: "${value}"`, 'error');
        return;
    }

    money = Math.floor(amount);
    updateStats();
    input.value = '';
    devLog(`Cash set to $${formatNumber(money)}`, 'success');
}

function devAddXP(amount) {
    playerXP += amount;
    checkLevelUp();
    updateLevelDisplay();
    devLog(`Added ${formatNumber(amount)} XP (Total: ${formatNumber(playerXP)})`, 'success');
}

function devMaxLevel() {
    playerLevel = MAX_PLAYER_LEVEL;
    playerXP = LEVEL_XP_THRESHOLDS[MAX_PLAYER_LEVEL - 1];
    updateLevelDisplay();
    devLog(`Set to max level ${MAX_PLAYER_LEVEL}`, 'success');
}

function devUnlockAllMines() {
    Object.keys(MINES).forEach(mineId => {
        minesUnlocked[mineId] = true;
    });
    renderMapPanel();
    devLog('All mines unlocked', 'success');
}

function devUnlockAllAchievements() {
    ACHIEVEMENTS.forEach(achievement => {
        if (achievementsState[achievement.id] !== 'claimed') {
            achievementsState[achievement.id] = 'unlocked';
        }
    });
    updateAchievementBadge();
    renderAchievementsList();
    devLog('All achievements unlocked (ready to claim)', 'success');
}

function devAddShafts(count) {
    for (let i = 0; i < count; i++) {
        if (mineshafts.length < 100) {
            createMineshaft(mineshafts.length);
        }
    }
    updateBuyShaftButton();
    devLog(`Added ${count} shafts (Total: ${mineshafts.length})`, 'success');
}

function devResetStoryProgress() {
    if (confirm('Reset all story progress? This will reset the intro letter, foreman scene, and all scene flags.')) {
        storyProgress = {
            hasSeenIntro: false,
            hasSeenForemanIntro: false,
            hasSeenMine22Intro: false,
            hasSeenMine37Intro: false,
            completedScenes: []
        };
        saveStoryProgress();
        devLog('Story progress reset', 'warning');
    }
}

function devResetGame() {
    if (confirm('RESET ALL GAME DATA? This cannot be undone!')) {
        if (confirm('Are you REALLY sure? All progress will be lost!')) {
            devLog('Resetting game data...', 'error');

            // Clear ALL dunhill-related localStorage items
            localStorage.removeItem('dunhillMinerSave');
            localStorage.removeItem('dunhillMinerStory');

            // Reset all in-memory game state
            money = 0;
            notes = 0;
            totalCoalMined = 0;
            totalCopperMined = 0;
            totalCoalSold = 0;
            totalMoneyEarned = 0;
            playerXP = 0;
            playerLevel = 1;
            elevatorLevel = 1;
            elevatorCarrying = 0;
            hasElevatorManager = false;
            elevatorManagerAbility = null;
            currentMineId = 'mine22';

            // Reset mines unlocked
            minesUnlocked = { mine22: true, mine37: false };

            // Reset mine states
            mineStates = {
                mine22: { lastActiveTime: Date.now() },
                mine37: { lastActiveTime: Date.now() }
            };

            // Reset achievements
            achievementsState = {};

            // Reset story progress
            storyProgress = {
                hasSeenIntro: false,
                hasSeenForemanIntro: false,
                hasSeenMine22Intro: false,
                hasSeenMine37Intro: false,
                completedScenes: []
            };

            // Stop any running loops
            elevatorLoopId++;
            miningLoopId++;

            devLog('Game reset complete - reloading...', 'error');

            // Reload the page
            setTimeout(() => {
                location.reload();
            }, 500);
        }
    }
}
