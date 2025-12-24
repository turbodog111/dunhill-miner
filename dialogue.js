// ============================================
// DIALOGUE SYSTEM
// Handles story scenes, character dialogue, and narrative progression
// ============================================

// Dialogue state
let dialogueActive = false;
let currentDialogue = null;
let currentDialogueIndex = 0;
let dialogueCallback = null;
let textRevealInterval = null;
let isTextRevealing = false;
let fullCurrentText = '';

// Story progress flags
let storyProgress = {
    hasSeenIntro: false,
    hasSeenForemanIntro: false,
    hasSeenMine22Intro: false,
    hasSeenMine37Intro: false,
    completedScenes: []
};

// Character definitions
const CHARACTERS = {
    narrator: {
        name: 'Narrator',
        color: '#aaaaaa',
        portrait: null
    },
    letter: {
        name: 'Letter from Management',
        color: '#f4d03f',
        portrait: null
    },
    foreman: {
        name: 'Foreman Harris',
        color: '#ff8c42',
        portrait: null // Will be: 'assets/portraits/foreman.png'
    },
    player: {
        name: 'You',
        color: '#87CEEB',
        portrait: null
    },
    mysterious: {
        name: '???',
        color: '#9932CC',
        portrait: null
    }
};

// Story scenes
const STORY_SCENES = {
    // Opening letter when first starting the game
    intro_letter: {
        id: 'intro_letter',
        background: null,
        dialogue: [
            {
                character: 'letter',
                text: "DUNHILL MINING CORPORATION",
                style: 'header'
            },
            {
                character: 'letter',
                text: "Dear New Supervisor,"
            },
            {
                character: 'letter',
                text: "Congratulations on your appointment to Mine 22. The previous supervisor has... moved on, and we require someone with fresh perspective to revitalize operations."
            },
            {
                character: 'letter',
                text: "Mine 22 was once the crown jewel of Dunhill Mining. Coal production was unmatched. But recent years have been... difficult. Output has declined. Workers have grown restless."
            },
            {
                character: 'letter',
                text: "Your task is simple: restore Mine 22 to its former glory. Hire managers, upgrade equipment, and expand operations. The deeper you dig, the richer the veins."
            },
            {
                character: 'letter',
                text: "A word of caution: the old-timers speak of strange things in the deeper shafts. Superstition, no doubt. Focus on production, and you'll do fine."
            },
            {
                character: 'letter',
                text: "Best of luck. The board is watching.",
                style: 'italic'
            },
            {
                character: 'letter',
                text: "— R. Dunhill III, CEO",
                style: 'signature'
            }
        ],
        onComplete: 'startGameAfterIntro'
    },

    // First time arriving at Mine 22
    mine22_arrival: {
        id: 'mine22_arrival',
        dialogue: [
            {
                character: 'narrator',
                text: "The truck drops you off at the entrance to Mine 22. Weathered wooden beams frame the tunnel mouth. A faded sign reads: 'DUNHILL MINING CO. - MINE 22 - EST. 1952'"
            },
            {
                character: 'narrator',
                text: "The air smells of coal dust and old machinery. A single mineshaft awaits your first worker."
            }
        ]
    },

    // Unlocking Mine 37
    mine37_unlock: {
        id: 'mine37_unlock',
        dialogue: [
            {
                character: 'narrator',
                text: "Your success at Mine 22 has caught the attention of headquarters. A courier arrives with a new assignment."
            },
            {
                character: 'letter',
                text: "NOTICE: Mine 37 operations are now under your supervision. This copper mine has been dormant for years. Reopen it and add its output to our portfolio."
            },
            {
                character: 'narrator',
                text: "Mine 37 is now accessible from the World Map."
            }
        ]
    }
};

// ============================================
// DIALOGUE UI FUNCTIONS
// ============================================

function initDialogueSystem() {
    // Create dialogue overlay if it doesn't exist
    if (!document.getElementById('dialogueOverlay')) {
        const overlay = document.createElement('div');
        overlay.id = 'dialogueOverlay';
        overlay.className = 'dialogue-overlay';
        overlay.innerHTML = `
            <div class="dialogue-container">
                <div class="dialogue-portrait-area">
                    <div class="dialogue-portrait" id="dialoguePortrait"></div>
                </div>
                <div class="dialogue-text-area">
                    <div class="dialogue-speaker" id="dialogueSpeaker">Speaker</div>
                    <div class="dialogue-text" id="dialogueText">
                        <span class="dialogue-content" id="dialogueContent"></span>
                        <span class="dialogue-cursor">▼</span>
                    </div>
                </div>
                <div class="dialogue-continue-hint">Click or press Space to continue</div>
            </div>
        `;
        document.body.appendChild(overlay);

        // Add click handler
        overlay.addEventListener('click', advanceDialogue);
        document.addEventListener('keydown', handleDialogueKey);
    }
}

function handleDialogueKey(e) {
    if (!dialogueActive) return;
    if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        advanceDialogue();
    }
}

function showDialogue(sceneId, callback = null) {
    const scene = STORY_SCENES[sceneId];
    if (!scene) {
        console.error('Scene not found:', sceneId);
        return;
    }

    initDialogueSystem();

    dialogueActive = true;
    currentDialogue = scene;
    currentDialogueIndex = 0;
    dialogueCallback = callback;

    const overlay = document.getElementById('dialogueOverlay');
    overlay.classList.add('active');

    displayCurrentDialogueLine();
}

function displayCurrentDialogueLine() {
    if (!currentDialogue || currentDialogueIndex >= currentDialogue.dialogue.length) {
        closeDialogue();
        return;
    }

    const line = currentDialogue.dialogue[currentDialogueIndex];
    const character = CHARACTERS[line.character] || CHARACTERS.narrator;

    const speakerEl = document.getElementById('dialogueSpeaker');
    const contentEl = document.getElementById('dialogueContent');
    const portraitEl = document.getElementById('dialoguePortrait');
    const textArea = document.querySelector('.dialogue-text-area');

    // Set speaker name and color
    speakerEl.textContent = character.name;
    speakerEl.style.color = character.color;

    // Set portrait if exists
    if (character.portrait) {
        portraitEl.style.backgroundImage = `url(${character.portrait})`;
        portraitEl.classList.add('has-portrait');
    } else {
        portraitEl.style.backgroundImage = '';
        portraitEl.classList.remove('has-portrait');
    }

    // Apply text styles
    textArea.className = 'dialogue-text-area';
    if (line.style === 'header') {
        textArea.classList.add('dialogue-header');
    } else if (line.style === 'italic') {
        textArea.classList.add('dialogue-italic');
    } else if (line.style === 'signature') {
        textArea.classList.add('dialogue-signature');
    }

    // Reveal text with typewriter effect
    revealText(contentEl, line.text);
}

function revealText(element, text) {
    if (textRevealInterval) {
        clearInterval(textRevealInterval);
    }

    fullCurrentText = text;
    isTextRevealing = true;
    element.textContent = '';

    let charIndex = 0;
    const revealSpeed = 25; // ms per character

    textRevealInterval = setInterval(() => {
        if (charIndex < text.length) {
            element.textContent += text[charIndex];
            charIndex++;
        } else {
            clearInterval(textRevealInterval);
            textRevealInterval = null;
            isTextRevealing = false;
        }
    }, revealSpeed);
}

function advanceDialogue() {
    if (!dialogueActive) return;

    // If text is still revealing, show it all immediately
    if (isTextRevealing) {
        if (textRevealInterval) {
            clearInterval(textRevealInterval);
            textRevealInterval = null;
        }
        document.getElementById('dialogueContent').textContent = fullCurrentText;
        isTextRevealing = false;
        return;
    }

    // Move to next line
    currentDialogueIndex++;
    displayCurrentDialogueLine();
}

function closeDialogue() {
    dialogueActive = false;

    const overlay = document.getElementById('dialogueOverlay');
    if (overlay) {
        overlay.classList.remove('active');
    }

    if (textRevealInterval) {
        clearInterval(textRevealInterval);
        textRevealInterval = null;
    }

    // Execute callback or scene completion handler
    if (currentDialogue && currentDialogue.onComplete) {
        const handler = currentDialogue.onComplete;
        currentDialogue = null;

        if (typeof window[handler] === 'function') {
            window[handler]();
        }
    } else if (dialogueCallback) {
        const cb = dialogueCallback;
        dialogueCallback = null;
        currentDialogue = null;
        cb();
    } else {
        currentDialogue = null;
    }
}

// ============================================
// STORY TRIGGER FUNCTIONS
// ============================================

function checkStoryTriggers() {
    // Check for Mine 37 unlock scene
    if (minesUnlocked && minesUnlocked.mine37 && !storyProgress.completedScenes.includes('mine37_unlock')) {
        storyProgress.completedScenes.push('mine37_unlock');
        showDialogue('mine37_unlock');
    }
}

function playIntroSequence(callback) {
    if (storyProgress.hasSeenIntro) {
        if (callback) callback();
        return;
    }

    storyProgress.hasSeenIntro = true;
    showDialogue('intro_letter', callback);
}

function startGameAfterIntro() {
    // This is called after the intro letter is dismissed
    // The game is already loaded, we just continue
    storyProgress.hasSeenIntro = true;
    saveStoryProgress();
}

// ============================================
// STORY SAVE/LOAD
// ============================================

function saveStoryProgress() {
    try {
        localStorage.setItem('dunhillMinerStory', JSON.stringify(storyProgress));
    } catch (e) {
        console.error('Failed to save story progress:', e);
    }
}

function loadStoryProgress() {
    try {
        const saved = localStorage.getItem('dunhillMinerStory');
        if (saved) {
            storyProgress = { ...storyProgress, ...JSON.parse(saved) };
        }
    } catch (e) {
        console.error('Failed to load story progress:', e);
    }
}

// Initialize story system
loadStoryProgress();
