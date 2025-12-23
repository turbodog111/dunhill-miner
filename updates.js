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
