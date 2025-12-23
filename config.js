// ============================================
// GAME CONFIGURATION
// All game constants, mine definitions, and achievement data
// ============================================

// Core gameplay constants
const MANAGER_COST = 50;
const BASE_UPGRADE_COST = 50;
const UPGRADE_COST_MULTIPLIER = 1.5;
const COAL_PER_LEVEL_MULTIPLIER = 1.25;
const ELEVATOR_CAPACITY_MULTIPLIER = 1.3;
const NEW_SHAFT_COST = 500;
const SHAFT_BASE_COAL_MULTIPLIER = 2;
const BASE_ELEVATOR_CAPACITY = 10;
const SHAFT_HEIGHT = 120;
const WALKING_SPEED = 0.15;

// Ability constants
const ABILITY_DURATION = 10 * 60 * 1000; // 10 minutes
const ABILITY_COOLDOWN = 30 * 60 * 1000; // 30 minutes

// Player leveling system
const MAX_PLAYER_LEVEL = 20;
const XP_PER_RESOURCE = 0.1;
const LEVEL_XP_THRESHOLDS = [
    0, 50, 150, 350, 750, 1500, 2500, 4000, 5000, 6000,
    7500, 8500, 10000, 12000, 14000, 16000, 18000, 21000, 25000, 30000
];

// Achievement XP rewards by class (I-V)
const ACHIEVEMENT_XP_REWARDS = {
    1: 100,
    2: 500,
    3: 2000,
    4: 5000,
    5: 10000
};

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

// Mine definitions
const MINES = {
    mine22: {
        id: 'mine22',
        name: 'Mine 22',
        shortName: '22',
        ore: 'coal',
        oreIcon: '⚫',
        logo: 'assets/Mine 22.png',
        valueMultiplier: 1,
        unlocked: true,
        order: 1
    },
    mine37: {
        id: 'mine37',
        name: 'Mine 37',
        shortName: '37',
        ore: 'copper',
        logo: 'assets/Mine 37.png',
        oreIcon: '🟤',
        valueMultiplier: 3,
        unlocked: false,
        unlockRequirement: { type: 'coal', amount: 10000 },
        order: 2
    }
};

// Achievement definitions
const ACHIEVEMENTS = [
    { id: 'coal_1', name: 'Coal Mined I', desc: 'Mine 100 coal', icon: '⛏️', image: 'assets/Coal Mined I.png', type: 'coal', target: 100 },
    { id: 'coal_2', name: 'Coal Mined II', desc: 'Mine 1,000 coal', icon: '⛏️', image: 'assets/Coal Mined II.png', type: 'coal', target: 1000 },
    { id: 'coal_3', name: 'Coal Mined III', desc: 'Mine 10,000 coal', icon: '⛏️', image: 'assets/Coal Mined III.png', type: 'coal', target: 10000 },
    { id: 'coal_4', name: 'Coal Mined IV', desc: 'Mine 100,000 coal', icon: '⛏️', image: 'assets/Coal Mined IV.png', type: 'coal', target: 100000 },
    { id: 'coal_5', name: 'Coal Mined V', desc: 'Mine 1,000,000 coal', icon: '⛏️', image: 'assets/Coal Mined V.png', type: 'coal', target: 1000000 },
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
