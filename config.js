// ============================================
// GAME CONFIGURATION
// All game constants, mine definitions, and achievement data
// ============================================

// ============================================
// SAVE DATA VERSIONING
// Increment when save format changes to trigger migrations
// ============================================
const SAVE_VERSION = 2;

// ============================================
// TIMING CONSTANTS (milliseconds)
// ============================================
const TIMING = {
    AUTOSAVE_INTERVAL: 60000,           // Save every 60 seconds
    NOTE_EARN_INTERVAL: 60000,          // Earn 1 note per minute
    NOTE_CHECK_INTERVAL: 10000,         // Check for notes every 10 seconds
    BOOST_UPDATE_INTERVAL: 1000,        // Update boost timers every second
    ABILITY_DURATION: 10 * 60 * 1000,   // Manager abilities last 10 minutes
    ABILITY_COOLDOWN: 30 * 60 * 1000,   // Manager abilities cooldown 30 minutes
    BOOST_SHORT: 120000,                // 2 minute boost duration
    BOOST_MEDIUM: 180000,               // 3 minute boost duration
    ELEVATOR_BASE_TRAVEL: 600,          // Base elevator travel time
    ELEVATOR_RETURN_BASE: 600,          // Base elevator return time
    SHAFT_EXTRA_TRAVEL: 400,            // Extra time per shaft depth
    MINING_ANIMATION: 400,              // Mining animation duration
    STATUS_MESSAGE_TIMEOUT: 1000,       // Status message display time
    STATUS_MESSAGE_TIMEOUT_LONG: 3000,  // Longer status messages
    LEVEL_UP_DISPLAY: 2500,             // Level up notification duration
};

// Legacy aliases for backwards compatibility
const ABILITY_DURATION = TIMING.ABILITY_DURATION;
const ABILITY_COOLDOWN = TIMING.ABILITY_COOLDOWN;

// ============================================
// CORE GAMEPLAY CONSTANTS
// ============================================
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
const BASE_ORE_VALUE = 10;              // Base value per ore unit
const MAX_SHAFTS_MINE22 = 20;           // Shaft 21 is forbidden!

// ============================================
// SHOP & ECONOMY CONSTANTS
// ============================================
const SHOP_CONFIG = {
    COST_PER_NOTE_EXCHANGE: 5000,       // $5,000 per note when exchanging
    DAILY_EXCHANGE_LIMIT: 10,           // Max exchanges per day
    EST_OFFSET_HOURS: -5,               // EST timezone offset
};

// Backwards compatibility aliases
const BOOST_COST_PER_NOTE = SHOP_CONFIG.COST_PER_NOTE_EXCHANGE;
const DAILY_EXCHANGE_LIMIT = SHOP_CONFIG.DAILY_EXCHANGE_LIMIT;

// ============================================
// ABILITY EFFECT VALUES
// ============================================
const ABILITY_EFFECTS = {
    DISCOUNT_PERCENT: 0.30,             // 30% off upgrades
    SPEED_BOOST_PERCENT: 0.40,          // 40% faster mining/elevator
    COAL_BOOST_PERCENT: 0.20,           // 20% more coal
    CAPACITY_BOOST_PERCENT: 0.40,       // 40% more elevator capacity
};

// ============================================
// PLAYER LEVELING SYSTEM
// ============================================
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

// ============================================
// MANAGER ABILITIES
// ============================================
const SHAFT_ABILITIES = [
    { id: 'discount', name: '30% Discount', desc: '30% off upgrades', icon: '$', effect: ABILITY_EFFECTS.DISCOUNT_PERCENT },
    { id: 'speed', name: '40% Speed', desc: '40% faster mining', icon: 'S', effect: ABILITY_EFFECTS.SPEED_BOOST_PERCENT },
    { id: 'coal', name: '+20% Coal', desc: '20% more coal', icon: 'C', effect: ABILITY_EFFECTS.COAL_BOOST_PERCENT }
];

const ELEVATOR_ABILITIES = [
    { id: 'discount', name: '30% Discount', desc: '30% off upgrades', icon: '$', effect: ABILITY_EFFECTS.DISCOUNT_PERCENT },
    { id: 'speed', name: '40% Speed', desc: '40% faster elevator', icon: 'S', effect: ABILITY_EFFECTS.SPEED_BOOST_PERCENT },
    { id: 'capacity', name: '+40% Capacity', desc: '40% more storage', icon: 'C', effect: ABILITY_EFFECTS.CAPACITY_BOOST_PERCENT }
];

// ============================================
// SHOP RANK TIERS
// ============================================
const SHOP_RANKS = [
    { id: 'bronze', name: 'Bronze', icon: '🥉', notesRequired: 0, color: '#cd7f32',
      bonuses: { production: 0, walkSpeed: 0, capacity: 0 } },
    { id: 'silver', name: 'Silver', icon: '🥈', notesRequired: 25, color: '#c0c0c0',
      bonuses: { production: 0.05, walkSpeed: 0, capacity: 0 } },
    { id: 'gold', name: 'Gold', icon: '🥇', notesRequired: 75, color: '#ffd700',
      bonuses: { production: 0.10, walkSpeed: 0.05, capacity: 0 } },
    { id: 'platinum', name: 'Platinum', icon: '💎', notesRequired: 150, color: '#e5e4e2',
      bonuses: { production: 0.15, walkSpeed: 0.10, capacity: 0 } },
    { id: 'diamond', name: 'Diamond', icon: '💠', notesRequired: 300, color: '#b9f2ff',
      bonuses: { production: 0.20, walkSpeed: 0.15, capacity: 0.05 } },
    { id: 'obsidian', name: 'Obsidian', icon: '🖤', notesRequired: 500, color: '#3d3d3d',
      bonuses: { production: 0.25, walkSpeed: 0.20, capacity: 0.10 } }
];

// ============================================
// SHOP BOOSTS
// ============================================
const BOOSTS = {
    // 3 Notes - Small boosts (2 min)
    steady_hands: {
        name: 'Steady Hands',
        desc: '+15% gather rate',
        cost: 3,
        duration: TIMING.BOOST_SHORT,
        minerGatherBoost: 1.15
    },
    light_steps: {
        name: 'Light Steps',
        desc: '+20% walk speed',
        cost: 3,
        duration: TIMING.BOOST_SHORT,
        minerSpeedBoost: 1.20
    },
    // 5 Notes - Medium boosts (3 min)
    efficient_mining: {
        name: 'Efficient Mining',
        desc: '+25% gather rate',
        cost: 5,
        duration: TIMING.BOOST_MEDIUM,
        minerGatherBoost: 1.25
    },
    swift_feet: {
        name: 'Swift Feet',
        desc: '+30% walk speed',
        cost: 5,
        duration: TIMING.BOOST_MEDIUM,
        minerSpeedBoost: 1.30
    },
    sturdy_cart: {
        name: 'Sturdy Cart',
        desc: '+20% elevator capacity',
        cost: 5,
        duration: TIMING.BOOST_MEDIUM,
        elevatorCapacityBoost: 1.20
    },
    // 8 Notes - Premium combo boosts (3 min)
    master_miner: {
        name: 'Master Miner',
        desc: '+20% gather & walk speed',
        cost: 8,
        duration: TIMING.BOOST_MEDIUM,
        minerGatherBoost: 1.20,
        minerSpeedBoost: 1.20
    },
    express_elevator: {
        name: 'Express Elevator',
        desc: '+25% elevator speed & +15% capacity',
        cost: 8,
        duration: TIMING.BOOST_MEDIUM,
        elevatorSpeedBoost: 1.25,
        elevatorCapacityBoost: 1.15
    }
};

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

// ============================================
// PRESTIGE SYSTEM (Bonds)
// ============================================
const PRESTIGE_CONFIG = {
    // Minimum total money earned to prestige
    MIN_PRESTIGE_THRESHOLD: 100000,

    // Formula: bonds = floor(sqrt(totalMoneyEarned / divisor))
    BONDS_DIVISOR: 10000,

    // Bonus per bond (1% per bond = 0.01)
    PRODUCTION_BONUS_PER_BOND: 0.01,

    // Starting cash after prestige (per bond)
    STARTING_CASH_PER_BOND: 100,

    // Max offline hours for calculation
    MAX_OFFLINE_HOURS: 24,

    // Offline efficiency (50% of active play rate)
    OFFLINE_EFFICIENCY: 0.5
};

// Prestige upgrades purchasable with Bonds
const PRESTIGE_UPGRADES = {
    production_i: {
        id: 'production_i',
        name: 'Efficient Operations I',
        desc: '+5% production rate',
        cost: 5,
        effect: { type: 'production', value: 0.05 },
        requires: null
    },
    production_ii: {
        id: 'production_ii',
        name: 'Efficient Operations II',
        desc: '+10% production rate',
        cost: 15,
        effect: { type: 'production', value: 0.10 },
        requires: 'production_i'
    },
    production_iii: {
        id: 'production_iii',
        name: 'Efficient Operations III',
        desc: '+15% production rate',
        cost: 40,
        effect: { type: 'production', value: 0.15 },
        requires: 'production_ii'
    },
    speed_i: {
        id: 'speed_i',
        name: 'Swift Workers I',
        desc: '+10% worker speed',
        cost: 5,
        effect: { type: 'speed', value: 0.10 },
        requires: null
    },
    speed_ii: {
        id: 'speed_ii',
        name: 'Swift Workers II',
        desc: '+15% worker speed',
        cost: 15,
        effect: { type: 'speed', value: 0.15 },
        requires: 'speed_i'
    },
    speed_iii: {
        id: 'speed_iii',
        name: 'Swift Workers III',
        desc: '+20% worker speed',
        cost: 40,
        effect: { type: 'speed', value: 0.20 },
        requires: 'speed_ii'
    },
    capacity_i: {
        id: 'capacity_i',
        name: 'Reinforced Elevator I',
        desc: '+15% elevator capacity',
        cost: 5,
        effect: { type: 'capacity', value: 0.15 },
        requires: null
    },
    capacity_ii: {
        id: 'capacity_ii',
        name: 'Reinforced Elevator II',
        desc: '+20% elevator capacity',
        cost: 15,
        effect: { type: 'capacity', value: 0.20 },
        requires: 'capacity_i'
    },
    starting_cash: {
        id: 'starting_cash',
        name: 'Investor Confidence',
        desc: 'Start with $5,000 after prestige',
        cost: 10,
        effect: { type: 'starting_cash', value: 5000 },
        requires: null
    },
    starting_cash_ii: {
        id: 'starting_cash_ii',
        name: 'Major Investment',
        desc: 'Start with $25,000 after prestige',
        cost: 30,
        effect: { type: 'starting_cash', value: 25000 },
        requires: 'starting_cash'
    },
    offline_i: {
        id: 'offline_i',
        name: 'Night Shift I',
        desc: '+25% offline earnings',
        cost: 10,
        effect: { type: 'offline', value: 0.25 },
        requires: null
    },
    offline_ii: {
        id: 'offline_ii',
        name: 'Night Shift II',
        desc: '+50% offline earnings',
        cost: 25,
        effect: { type: 'offline', value: 0.50 },
        requires: 'offline_i'
    },
    manager_discount: {
        id: 'manager_discount',
        name: 'HR Connections',
        desc: '25% cheaper managers',
        cost: 8,
        effect: { type: 'manager_discount', value: 0.25 },
        requires: null
    },
    unlock_speed: {
        id: 'unlock_speed',
        name: 'Fast Expansion',
        desc: '20% cheaper new shafts',
        cost: 12,
        effect: { type: 'shaft_discount', value: 0.20 },
        requires: null
    }
};
