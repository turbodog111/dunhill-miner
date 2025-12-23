// Update Log Data
// Change types are ordered: feature -> balance -> ui -> fix

const UPDATE_LOG_LEGEND = [
    { type: 'feature', icon: '✨', label: 'New Feature' },
    { type: 'balance', icon: '⚖️', label: 'Balance Change' },
    { type: 'ui', icon: '🎨', label: 'Visual/UI' },
    { type: 'fix', icon: '🔧', label: 'Bug Fix' }
];

// Order for sorting changes within a version
const TYPE_ORDER = ['feature', 'balance', 'ui', 'fix'];

const UPDATE_LOG = [
    {
        version: "1.8.0",
        date: "2025-12-23",
        changes: [
            { type: "feature", text: "Full-screen achievements panel with large icons and grid layout" },
            { type: "feature", text: "Interactive world map with visual terrain and compass" },
            { type: "ui", text: "Achievement cards now display at 100px with centered layout" },
            { type: "ui", text: "Map shows mine locations on visual terrain background" },
            { type: "fix", text: "Fixed UI visibility - lowered vignette overlay z-index" }
        ]
    },
    {
        version: "1.7.0",
        date: "2025-12-23",
        changes: [
            { type: "feature", text: "New blue ribbon level display with badge design" },
            { type: "feature", text: "Custom achievement icons for Coal Mined I-V" },
            { type: "feature", text: "Mine logo support for map locations" },
            { type: "ui", text: "Darker mining aesthetic with vignette edge fade" },
            { type: "ui", text: "XP shows exact numbers without rounding" }
        ]
    },
    {
        version: "1.6.2",
        date: "2025-12-23",
        changes: [
            { type: "balance", text: "XP per resource reduced from 0.5 to 0.1" },
            { type: "ui", text: "XP bar now shows progress within current level" },
            { type: "fix", text: "Fixed elevator operator teleporting when switching mines" }
        ]
    },
    {
        version: "1.6.1",
        date: "2025-12-23",
        changes: [
            { type: "feature", text: "New Settings panel with organized controls" },
            { type: "feature", text: "Music volume slider with mute toggle" },
            { type: "feature", text: "Auto-load saved progress when logging in" },
            { type: "ui", text: "Cleaner UI - removed floating buttons" },
            { type: "ui", text: "Account management moved to Settings menu" }
        ]
    },
    {
        version: "1.6.0",
        date: "2025-12-23",
        changes: [
            { type: "feature", text: "Player leveling system with max level 20" },
            { type: "feature", text: "Earn XP from mining resources and claiming achievements" },
            { type: "feature", text: "Level display with progress bar in top-left corner" },
            { type: "balance", text: "Shaft prices now quadruple (4x) instead of doubling" },
            { type: "ui", text: "Level-up celebration animation" },
            { type: "fix", text: "Elevator capacity now uses consistent number formatting" }
        ]
    },
    {
        version: "1.5.0",
        date: "2025-12-22",
        changes: [
            { type: "feature", text: "Added Mine 37 - Copper Mine (copper worth 3x coal!)" },
            { type: "feature", text: "Multi-mine system with idle rewards when switching mines" },
            { type: "feature", text: "Added Copper Mined I-V achievements" },
            { type: "feature", text: "Mine unlocks after reaching milestones" },
            { type: "ui", text: "Achievement progress now shows numbers (X / Y)" },
            { type: "ui", text: "Achievement panel shows total unlocked with percentage" },
            { type: "ui", text: "Copper mine features bronze-colored ore and buckets" },
            { type: "ui", text: "Interactive World Map for mine switching" },
            { type: "fix", text: "Fixed mine indicator format (Mine 22, not M22)" }
        ]
    },
    {
        version: "1.4.0",
        date: "2025-12-22",
        changes: [
            { type: "feature", text: "Added title screen with game logo" },
            { type: "feature", text: "Added About section with detailed game guide" },
            { type: "feature", text: "Added Credits section" },
            { type: "ui", text: "Smooth fade-to-black transition when starting game" }
        ]
    },
    {
        version: "1.3.1",
        date: "2025-12-22",
        changes: [
            { type: "balance", text: "Miner upgrades now scale by 25% per level (was 20%)" },
            { type: "fix", text: "Fixed update log dates" },
            { type: "fix", text: "Improved audio error handling" }
        ]
    },
    {
        version: "1.3.0",
        date: "2025-12-22",
        changes: [
            { type: "feature", text: "Added World Map with mine locations" },
            { type: "feature", text: "Added mine indicator showing current location (M22)" },
            { type: "feature", text: "Preparing for multiple mineral types (Copper coming soon!)" },
            { type: "ui", text: "Improved mining tunnel with realistic dirt and coal textures" },
            { type: "ui", text: "Enhanced coal deposit visuals" },
            { type: "fix", text: "Fixed elevator operator appearing behind building" },
            { type: "fix", text: "Fixed audio file path for background music" }
        ]
    },
    {
        version: "1.2.0",
        date: "2025-12-22",
        changes: [
            { type: "feature", text: "Added Update Log to track changes" },
            { type: "balance", text: "Elevator capacity now scales by 30% per level (was 20%)" },
            { type: "ui", text: "Stats and Achievements now open as consistent side panels" },
            { type: "ui", text: "Menu buttons remain visible when panels are open" }
        ]
    },
    {
        version: "1.1.0",
        date: "2025-12-22",
        changes: [
            { type: "ui", text: "Added Chakra Petch tech font" },
            { type: "ui", text: "Enhanced surface with animated clouds and smoke" },
            { type: "ui", text: "Added rock wall textures on mine sides" },
            { type: "ui", text: "Improved mineshaft interior visuals" },
            { type: "ui", text: "Progress bars now only show during actions" },
            { type: "fix", text: "Fixed floating point display in counters" },
            { type: "fix", text: "Fixed bucket positioning" }
        ]
    },
    {
        version: "1.0.0",
        date: "2025-12-21",
        changes: [
            { type: "feature", text: "Manager ability system with activate/cooldown" },
            { type: "feature", text: "Click managers to view abilities and fire them" },
            { type: "feature", text: "Achievements system with progress tracking" },
            { type: "feature", text: "Firebase cloud save/load" },
            { type: "feature", text: "Multiple mineshafts with scaling production" }
        ]
    }
];

function getChangeTypeIcon(type) {
    switch(type) {
        case 'feature': return '✨';
        case 'balance': return '⚖️';
        case 'fix': return '🔧';
        case 'ui': return '🎨';
        default: return '📝';
    }
}

function getChangeTypeColor(type) {
    switch(type) {
        case 'feature': return '#32CD32';
        case 'balance': return '#ffd700';
        case 'fix': return '#ff6b6b';
        case 'ui': return '#87CEEB';
        default: return '#aaa';
    }
}

// Sort changes by type order
function sortChangesByType(changes) {
    return [...changes].sort((a, b) => {
        return TYPE_ORDER.indexOf(a.type) - TYPE_ORDER.indexOf(b.type);
    });
}
