// ============================================
// GAME CONSTANTS
// ============================================
const MANAGER_COST = 50;
const BASE_UPGRADE_COST = 50;
const UPGRADE_COST_MULTIPLIER = 1.5;
const COAL_PER_LEVEL_MULTIPLIER = 1.25;
const ELEVATOR_CAPACITY_MULTIPLIER = 1.3; // Elevator capacity scales by 30% per level
const NEW_SHAFT_COST = 500;
const SHAFT_BASE_COAL_MULTIPLIER = 2; // Each shaft produces 2x base of previous
const BASE_ELEVATOR_CAPACITY = 10;
const SHAFT_HEIGHT = 120;
const WALKING_SPEED = 0.15; // pixels per millisecond (uniform speed)

// Ability constants
const ABILITY_DURATION = 10 * 60 * 1000; // 10 minutes in ms
const ABILITY_COOLDOWN = 30 * 60 * 1000; // 30 minutes in ms

// Player leveling system
const MAX_PLAYER_LEVEL = 20;
const XP_PER_RESOURCE = 0.5;
const LEVEL_XP_THRESHOLDS = [
    0,      // Level 1
    50,     // Level 2
    150,    // Level 3
    350,    // Level 4
    750,    // Level 5
    1500,   // Level 6
    2500,   // Level 7
    4000,   // Level 8
    5000,   // Level 9
    6000,   // Level 10
    7500,   // Level 11
    8500,   // Level 12
    10000,  // Level 13
    12000,  // Level 14
    14000,  // Level 15
    16000,  // Level 16
    18000,  // Level 17
    21000,  // Level 18
    25000,  // Level 19
    30000   // Level 20
];

// Achievement XP rewards by class (I-V)
const ACHIEVEMENT_XP_REWARDS = {
    1: 100,    // Class I
    2: 500,    // Class II
    3: 2000,   // Class III
    4: 5000,   // Class IV
    5: 10000   // Class V
};

// ============================================
// TITLE SCREEN CONTROLS
// ============================================
function startGame() {
    const fadeOverlay = document.getElementById('fadeOverlay');
    const titleScreen = document.getElementById('titleScreen');

    // Fade to black
    fadeOverlay.classList.add('active');

    // After fade completes, hide title screen and fade back in
    setTimeout(() => {
        titleScreen.classList.add('hidden');
        // Small delay then fade out the overlay
        setTimeout(() => {
            fadeOverlay.classList.remove('active');
        }, 300);
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

// ============================================
// MINE SWITCHING SYSTEM
// ============================================
function getCurrentMine() {
    return MINES[currentMineId];
}

function renderMapPanel() {
    const mapJourney = document.getElementById('mapJourney');
    const minesList = Object.values(MINES).sort((a, b) => a.order - b.order);

    let html = '';
    minesList.forEach((mine, index) => {
        const isUnlocked = minesUnlocked[mine.id];
        const isCurrent = currentMineId === mine.id;
        let statusClass = 'locked';
        let statusText = 'Locked';
        let clickHandler = '';

        if (isCurrent) {
            statusClass = 'current';
            statusText = 'Current';
        } else if (isUnlocked) {
            statusClass = 'unlocked';
            statusText = 'Travel';
            clickHandler = `onclick="switchToMine('${mine.id}')"`;
        }

        const icon = isUnlocked ? (mine.ore === 'coal' ? '⛏️' : '🔶') : '?';

        html += `
            <div class="map-location ${statusClass}" id="mapLocation-${mine.id}" ${clickHandler}>
                <div class="map-location-icon">${icon}</div>
                <div class="map-location-name">${mine.name}</div>
                <div class="map-location-status">${statusText}</div>
            </div>
        `;

        // Add path between mines (except after last)
        if (index < minesList.length - 1) {
            html += `
                <div class="map-path">
                    <span class="path-dot"></span>
                    <span class="path-dot"></span>
                    <span class="path-dot"></span>
                    <span class="path-dot"></span>
                    <span class="path-dot"></span>
                </div>
            `;
        }
    });

    // Add future mine placeholder
    html += `
        <div class="map-path">
            <span class="path-dot"></span>
            <span class="path-dot"></span>
            <span class="path-dot"></span>
            <span class="path-dot"></span>
            <span class="path-dot"></span>
        </div>
        <div class="map-location locked">
            <div class="map-location-icon">?</div>
            <div class="map-location-name">???</div>
            <div class="map-location-status">Locked</div>
        </div>
    `;

    mapJourney.innerHTML = html;
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

    // Fade transition
    const fadeOverlay = document.getElementById('fadeOverlay');
    fadeOverlay.classList.add('active');

    setTimeout(() => {
        // Switch mine
        currentMineId = targetMineId;
        loadMineState(targetMineId);

        // Update UI theme
        updateMineTheme();

        // Rebuild the game view
        rebuildGameView();

        // Update map to show new current mine
        renderMapPanel();

        // Close map panel
        closeAllPanels();

        setTimeout(() => {
            fadeOverlay.classList.remove('active');

            // Show idle rewards if any
            if (pendingIdleRewards) {
                showIdleRewardsModal(pendingIdleRewards);
            }
        }, 300);
    }, 500);
}

function loadMineState(mineId) {
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

// Mineshaft manager ability types
const SHAFT_ABILITIES = [
    { id: 'discount', name: '30% Discount', desc: '30% off upgrades', icon: '$' },
    { id: 'speed', name: '40% Speed', desc: '40% faster mining', icon: 'S' },
    { id: 'coal', name: '+20% Coal', desc: '20% more coal', icon: 'C' }
];

// Elevator manager ability types
const ELEVATOR_ABILITIES = [
    { id: 'discount', name: '30% Discount', desc: '30% off upgrades', icon: '$' },
    { id: 'speed', name: '40% Speed', desc: '40% faster elevator', icon: 'S' },
    { id: 'capacity', name: '+40% Capacity', desc: '40% more storage', icon: 'C' }
];

// Achievement definitions
const ACHIEVEMENTS = [
    { id: 'coal_1', name: 'Coal Mined I', desc: 'Mine 100 coal', icon: '⛏️', type: 'coal', target: 100 },
    { id: 'coal_2', name: 'Coal Mined II', desc: 'Mine 1,000 coal', icon: '⛏️', type: 'coal', target: 1000 },
    { id: 'coal_3', name: 'Coal Mined III', desc: 'Mine 10,000 coal', icon: '⛏️', type: 'coal', target: 10000 },
    { id: 'coal_4', name: 'Coal Mined IV', desc: 'Mine 100,000 coal', icon: '⛏️', type: 'coal', target: 100000 },
    { id: 'coal_5', name: 'Coal Mined V', desc: 'Mine 1,000,000 coal', icon: '⛏️', type: 'coal', target: 1000000 },
    { id: 'copper_1', name: 'Copper Mined I', desc: 'Mine 100 copper', icon: '🥉', type: 'copper', target: 100 },
    { id: 'copper_2', name: 'Copper Mined II', desc: 'Mine 1,000 copper', icon: '🥉', type: 'copper', target: 1000 },
    { id: 'copper_3', name: 'Copper Mined III', desc: 'Mine 10,000 copper', icon: '🥉', type: 'copper', target: 10000 },
    { id: 'copper_4', name: 'Copper Mined IV', desc: 'Mine 100,000 copper', icon: '🥉', type: 'copper', target: 100000 },
    { id: 'copper_5', name: 'Copper Mined V', desc: 'Mine 1,000,000 copper', icon: '🥉', type: 'copper', target: 1000000 },
    { id: 'shaft_1', name: 'Mineshaft I', desc: 'Own 2 mineshafts', icon: '🏭', type: 'shafts', target: 2 },
    { id: 'shaft_2', name: 'Mineshaft II', desc: 'Own 5 mineshafts', icon: '🏭', type: 'shafts', target: 5 },
    { id: 'shaft_3', name: 'Mineshaft III', desc: 'Own 20 mineshafts', icon: '🏭', type: 'shafts', target: 20 },
    { id: 'shaft_4', name: 'Mineshaft IV', desc: 'Own 50 mineshafts', icon: '🏭', type: 'shafts', target: 50 },
    { id: 'shaft_5', name: 'Mineshaft V', desc: 'Own 100 mineshafts', icon: '🏭', type: 'shafts', target: 100 }
];

// Mine definitions
const MINES = {
    mine22: {
        id: 'mine22',
        name: 'Mine 22',
        shortName: '22',
        ore: 'coal',
        oreIcon: '⚫',
        valueMultiplier: 1,
        unlocked: true,
        order: 1
    },
    mine37: {
        id: 'mine37',
        name: 'Mine 37',
        shortName: '37',
        ore: 'copper',
        oreIcon: '🟤',
        valueMultiplier: 3, // Copper worth 3x coal
        unlocked: false,
        unlockRequirement: { type: 'coal', amount: 10000 }, // Unlock after 10k coal mined
        order: 2
    }
};

// ============================================
// GAME STATE
// ============================================
let totalCoalSold = 0;
let totalCoalMined = 0;
let totalCopperMined = 0;
let totalMoneyEarned = 0;
let money = 0;
let playerXP = 0;
let operatorState = 'idle';
let hasElevatorManager = false;
let elevatorLevel = 1;
let elevatorCarrying = 0;

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
    if (floored >= 1000000) {
        return (floored / 1000000).toFixed(2) + 'M';
    } else if (floored >= 1000) {
        return (floored / 1000).toFixed(1) + 'K';
    }
    return floored.toString();
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
    // Apply capacity ability if active
    if (elevatorManagerAbility && elevatorManagerAbility.type === 'capacity' && isAbilityActive(elevatorManagerAbility)) {
        capacity = Math.floor(capacity * 1.4);
    }
    return capacity;
}

function getElevatorUpgradeCost() {
    let cost = Math.floor(BASE_UPGRADE_COST * Math.pow(UPGRADE_COST_MULTIPLIER, elevatorLevel - 1));
    // Apply discount ability if active
    if (elevatorManagerAbility && elevatorManagerAbility.type === 'discount' && isAbilityActive(elevatorManagerAbility)) {
        cost = Math.floor(cost * 0.7);
    }
    return cost;
}

function getElevatorSpeedMultiplier() {
    if (elevatorManagerAbility && elevatorManagerAbility.type === 'speed' && isAbilityActive(elevatorManagerAbility)) {
        return 0.6; // 40% faster = 60% of normal time
    }
    return 1;
}

function getShaftBaseCoal(shaftIndex) {
    // Each shaft produces 2x the base coal of the previous shaft
    return Math.pow(SHAFT_BASE_COAL_MULTIPLIER, shaftIndex);
}

function getShaftCoalPerTrip(shaftIndex) {
    const shaft = mineshafts[shaftIndex];
    const baseCoal = getShaftBaseCoal(shaftIndex);
    let coal = baseCoal * Math.pow(COAL_PER_LEVEL_MULTIPLIER, shaft.level - 1);
    // Apply coal ability if active
    if (shaft.managerAbility && shaft.managerAbility.type === 'coal' && isAbilityActive(shaft.managerAbility)) {
        coal = coal * 1.2;
    }
    return coal;
}

function getShaftUpgradeCost(shaftIndex) {
    const shaft = mineshafts[shaftIndex];
    const baseCost = BASE_UPGRADE_COST * Math.pow(SHAFT_BASE_COAL_MULTIPLIER, shaftIndex);
    let cost = Math.floor(baseCost * Math.pow(UPGRADE_COST_MULTIPLIER, shaft.level - 1));
    // Apply discount ability if active
    if (shaft.managerAbility && shaft.managerAbility.type === 'discount' && isAbilityActive(shaft.managerAbility)) {
        cost = Math.floor(cost * 0.7);
    }
    return cost;
}

function getShaftSpeedMultiplier(shaftIndex) {
    const shaft = mineshafts[shaftIndex];
    if (shaft.managerAbility && shaft.managerAbility.type === 'speed' && isAbilityActive(shaft.managerAbility)) {
        return 0.6; // 40% faster = 60% of normal time
    }
    return 1;
}

function getNewShaftCost() {
    return NEW_SHAFT_COST * Math.pow(4, mineshafts.length - 1);
}

function updateStats() {
    moneyCountEl.textContent = formatNumber(money);
    updateBuyShaftButton();
    updateElevatorCapacityDisplay();
    elevatorLevelDisplay.textContent = elevatorLevel;
}

function updateElevatorCapacityDisplay() {
    const capacity = getElevatorCapacity();
    elevatorCapacityDisplay.textContent = `${formatNumber(elevatorCarrying)}/${formatNumber(capacity)}`;
}

function updateBuyShaftButton() {
    const cost = getNewShaftCost();
    const nextShaftNum = mineshafts.length + 1;
    buyShaftBtn.textContent = `Buy Shaft ${nextShaftNum} - $${cost}`;
    buyShaftBtn.disabled = money < cost;
}

function updateShaftBucket(shaftIndex) {
    const shaft = mineshafts[shaftIndex];
    const bucketCountEl = shaft.elements.bucketCount;
    const bucketFill = shaft.elements.bucketFill;
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
    if (shaft.hasManager) return;
    if (shaft.minerState !== 'idle') return;
    doMining(shaftIndex);
}

async function autoMine(shaftIndex) {
    const shaft = mineshafts[shaftIndex];
    while (shaft.hasManager) {
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
    while (hasElevatorManager) {
        const hasCoal = mineshafts.some(s => s.bucketCoal > 0);
        if (operatorState === 'idle' && hasCoal) {
            await doElevatorRun();
        }
        await new Promise(r => setTimeout(r, 100));
    }
}

// ============================================
// BUY NEW SHAFT
// ============================================
function buyNewShaft() {
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

    const canAfford = money >= MANAGER_COST;
    document.getElementById('hirePopupTitle').textContent = `Shaft ${shaftIndex + 1} Manager`;
    document.getElementById('hirePopupCost').textContent = `Cost: $${MANAGER_COST}`;
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

    const canAfford = money >= MANAGER_COST;
    document.getElementById('hirePopupTitle').textContent = 'Elevator Manager';
    document.getElementById('hirePopupCost').textContent = `Cost: $${MANAGER_COST}`;
    document.getElementById('hirePopupCost').className = 'cost ' + (canAfford ? 'affordable' : 'too-expensive');
    document.getElementById('hirePopupBtn').disabled = !canAfford;
    document.getElementById('hirePopupBtn').onclick = hireElevatorManager;

    const rect = elevatorManagerSlot.getBoundingClientRect();
    hirePopup.style.left = (rect.left + 40) + 'px';
    hirePopup.style.top = (rect.top) + 'px';
    hirePopup.classList.add('show');
}

function hireMinerManager(shaftIndex) {
    if (money < MANAGER_COST) return;
    const shaft = mineshafts[shaftIndex];
    if (shaft.hasManager) return;

    money -= MANAGER_COST;
    updateStats();

    shaft.hasManager = true;
    hirePopup.classList.remove('show');
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

    // Assign random ability
    const randomAbility = SHAFT_ABILITIES[Math.floor(Math.random() * SHAFT_ABILITIES.length)];
    shaft.managerAbility = {
        type: randomAbility.id,
        name: randomAbility.name,
        desc: randomAbility.desc,
        icon: randomAbility.icon,
        activeUntil: 0,
        cooldownUntil: 0
    };

    autoMine(shaftIndex);
    updatePlayerStats();
}

function hireElevatorManager() {
    if (money < MANAGER_COST) return;
    if (hasElevatorManager) return;

    money -= MANAGER_COST;
    updateStats();

    hasElevatorManager = true;
    hirePopup.classList.remove('show');
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

    // Assign random ability
    const randomAbility = ELEVATOR_ABILITIES[Math.floor(Math.random() * ELEVATOR_ABILITIES.length)];
    elevatorManagerAbility = {
        type: randomAbility.id,
        name: randomAbility.name,
        desc: randomAbility.desc,
        icon: randomAbility.icon,
        activeUntil: 0,
        cooldownUntil: 0
    };

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
                activeUntil: 0,
                cooldownUntil: 0
            };
            ability = shaft.managerAbility;
        }
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
                activeUntil: 0,
                cooldownUntil: 0
            };
            ability = elevatorManagerAbility;
        }
    }

    currentInfoTarget = { type, shaftIndex };

    // Update popup content
    managerInfoTitle.textContent = managerName;
    managerAbilityName.textContent = ability.name;
    managerAbilityDesc.textContent = ability.desc;

    // Update ability status
    updateManagerInfoPopupStatus();

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
    shaft.managerAbility.activeUntil = now + ABILITY_DURATION;
    shaft.managerAbility.cooldownUntil = now + ABILITY_DURATION + ABILITY_COOLDOWN;

    updateAbilityButtonState(shaftIndex);
}

function activateElevatorAbility() {
    if (!elevatorManagerAbility) return;
    if (!canActivateAbility(elevatorManagerAbility)) return;

    const now = Date.now();
    elevatorManagerAbility.activeUntil = now + ABILITY_DURATION;
    elevatorManagerAbility.cooldownUntil = now + ABILITY_DURATION + ABILITY_COOLDOWN;

    updateElevatorAbilityButtonState();
    updateElevatorCapacityDisplay(); // In case it's the capacity ability
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
    document.getElementById('statsPanel').classList.remove('show');
    document.getElementById('achievementsPanel').classList.remove('show');
    document.getElementById('updatesPanel').classList.remove('show');
    document.getElementById('mapPanel').classList.remove('show');
    document.getElementById('settingsPanel').classList.remove('show');
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
    }
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

        return `
            <div class="achievement-item ${state}" id="achievement-${achievement.id}">
                <div class="achievement-icon">${achievement.icon}</div>
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
    const currentXP = playerXP;
    const nextLevelXP = getXPForNextLevel();

    document.getElementById('playerLevel').textContent = level;
    document.getElementById('levelProgressFill').style.width = progress + '%';

    if (level >= MAX_PLAYER_LEVEL) {
        document.getElementById('levelXPText').textContent = 'MAX';
    } else {
        document.getElementById('levelXPText').textContent =
            `${formatNumber(currentXP)}/${formatNumber(nextLevelXP)}`;
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
}

initGame();

// ============================================
// AUDIO CONTROLS (Settings Panel)
// ============================================
const bgMusic = document.getElementById('bgMusic');
const volumeSlider = document.getElementById('volumeSlider');
const volumeIcon = document.getElementById('volumeIcon');
const volumeValue = document.getElementById('volumeValue');
let currentVolume = 0;
let audioInitialized = false;

// Initialize volume slider
function initVolumeControls() {
    volumeSlider.addEventListener('input', handleVolumeChange);
    volumeIcon.addEventListener('click', toggleMute);
    updateVolumeDisplay(0);
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
        autoSaveStatus.textContent = 'Enabled';
        autoSaveStatus.style.color = '#32CD32';

        // Auto-load saved game on login
        await autoLoadGame();
    } else {
        // Update auth modal view
        authFormView.style.display = 'block';
        loggedInView.style.display = 'none';

        // Update settings panel view
        settingsNotLoggedIn.style.display = 'block';
        settingsLoggedIn.style.display = 'none';
        autoSaveStatus.textContent = 'Not logged in';
        autoSaveStatus.style.color = '#aaa';
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
        totalCoalSold,
        totalCoalMined,
        totalCopperMined,
        totalMoneyEarned,
        money,
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
