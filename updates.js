// Update Log Data
const UPDATE_LOG = [
    {
        version: "1.2.0",
        date: "2024-12-23",
        changes: [
            { type: "feature", text: "Added Update Log to track changes" },
            { type: "ui", text: "Stats and Achievements now open as consistent side panels" },
            { type: "ui", text: "Menu buttons remain visible when panels are open" },
            { type: "balance", text: "Elevator capacity now scales by 30% per level (was 20%)" }
        ]
    },
    {
        version: "1.1.0",
        date: "2024-12-22",
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
        date: "2024-12-21",
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
