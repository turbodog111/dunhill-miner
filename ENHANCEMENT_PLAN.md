# Dunhill Miner Enhancement Plan

## Overview
This document outlines the prioritized implementation plan for enhancing Dunhill Miner.
Changes are organized into phases based on impact, complexity, and dependencies.

---

## Phase 1: Foundation & Code Quality (Critical)
**Goal:** Fix critical issues and establish better architecture before adding features.

### 1.1 Security Fixes
- [ ] Move admin password to hashed comparison or remove from client
- [ ] Add rate limiting for dev tool access attempts

### 1.2 Code Architecture Refactor
- [ ] Create `GameState` class to consolidate 50+ global variables
- [ ] Create `SaveManager` module for save/load logic
- [ ] Create `AudioManager` module for all audio handling
- [ ] Add constants to `config.js` (remove magic numbers from game.js)
- [ ] Fix broken localStorage functions (`createNewShaft`, `hireManagerFor` undefined)

### 1.3 Error Handling
- [ ] Add try-catch blocks around critical operations
- [ ] Create error recovery system (auto-save before crash)
- [ ] Add offline detection with graceful fallback

---

## Phase 2: Core Gameplay Enhancements
**Goal:** Deepen gameplay loop and add missing idle game staples.

### 2.1 Prestige System ("Cave-In")
- [ ] Design prestige currency ("Ancient Crystals" or "Dunhill Bonds")
- [ ] Create prestige bonuses (production multipliers, starting cash, unlock speeds)
- [ ] Add prestige UI panel
- [ ] Implement reset logic that preserves prestige progress

### 2.2 Offline Progress
- [ ] Calculate idle earnings when game loads (beyond just mine switching)
- [ ] Show "Welcome Back" modal with offline earnings
- [ ] Cap offline time (24 hours max)

### 2.3 Research/Upgrade Tree
- [ ] Design research categories (Mining, Transport, Management, Automation)
- [ ] Create research point generation (from selling ore)
- [ ] Build research UI panel
- [ ] Implement permanent upgrade effects

### 2.4 Manager Improvements
- [ ] Allow players to reroll manager abilities (cost: Notes)
- [ ] Add "Mega Managers" - rare managers with stronger/unique abilities
- [ ] Create manager experience system (abilities strengthen with use)

---

## Phase 3: Content Expansion
**Goal:** Add more mines, achievements, and variety.

### 3.1 New Mines
- [ ] Mine 45: Gold Mine (5x value, unlocks at 100k copper)
- [ ] Mine 58: Gem Mine (10x value, unlocks at 500k gold)
- [ ] Mine 71: Uranium Mine (25x value, prestige unlock)
- [ ] Unique visual themes per mine

### 3.2 Achievement Expansion
- [ ] Add achievement images for Copper series
- [ ] Add new achievement categories:
  - Money milestones ($1M, $1B, $1T earned)
  - Manager milestones (hire 10, 50, 100 managers)
  - Speed milestones (earn $X in Y minutes)
  - Prestige milestones
- [ ] Achievement rewards beyond XP (Notes, cosmetics, titles)

### 3.3 Random Events System
- [ ] Design event types:
  - Cave Discovery (bonus ore vein)
  - Equipment Malfunction (temporary slowdown)
  - Worker Story (lore snippets)
  - Inspector Visit (bonus if passing "audit")
  - Strange Noises (Shaft 21 foreshadowing)
- [ ] Create event notification system
- [ ] Add event history log

---

## Phase 4: The Shaft 21 Mystery (Major Feature)
**Goal:** Pay off the horror narrative established in the Foreman scene.

### 4.1 Foreshadowing Events
- [ ] Random screen flickers after reaching certain milestones
- [ ] Occasional "static" in background music
- [ ] Workers occasionally report "strange sounds"
- [ ] Mysterious notes found while mining

### 4.2 Collectible Lore System
- [ ] Design lore items (newspaper clippings, worker diaries, company memos)
- [ ] Create lore collection UI
- [ ] Scatter lore discoveries across gameplay milestones

### 4.3 Shaft 21 Unlocking
- [ ] Unlock condition: Prestige 5 + find all lore pieces
- [ ] Warning dialogue from Foreman Harris
- [ ] Special "unsealing" cutscene

### 4.4 Shaft 21 Gameplay
- [ ] Unique mechanics (lights flicker, workers move slower)
- [ ] "The Deep" - endless shaft with scaling difficulty
- [ ] Boss encounter: Entity from below
- [ ] Multiple endings based on player choices

### 4.5 Visual/Audio Horror Elements
- [ ] Create ambient horror audio for Shaft 21
- [ ] Add visual glitches and distortions
- [ ] Design "the Entity" appearance
- [ ] Implement jumpscare system (subtle, not cheap)

---

## Phase 5: Polish & UX
**Goal:** Improve overall feel and accessibility.

### 5.1 Audio Enhancement
- [ ] Add sound effects: click, mining, coin, levelup, achievement
- [ ] Create audio settings for SFX separate from music
- [ ] Add more music tracks per mine

### 5.2 Visual Polish
- [ ] Add particle effects (sparkles, dust, ore flying)
- [ ] Improve animations (smoother worker movement)
- [ ] Create achievement popup animations
- [ ] Add screen shake for big events

### 5.3 UI Improvements
- [ ] Unify modal system (all panels same style)
- [ ] Add tooltips for all interactive elements
- [ ] Create tutorial/onboarding flow
- [ ] Add confirmation dialogs for purchases
- [ ] Improve mobile responsiveness

### 5.4 Accessibility
- [ ] Add ARIA labels
- [ ] Keyboard navigation support
- [ ] Color blind mode
- [ ] Reduce motion option

---

## Phase 6: Social & Engagement
**Goal:** Add features that keep players coming back.

### 6.1 Daily/Weekly Systems
- [ ] Daily login rewards
- [ ] Daily challenges with bonus rewards
- [ ] Weekly events with special themes

### 6.2 Statistics & Analytics
- [ ] Detailed stats panel with graphs
- [ ] Play time tracking
- [ ] Efficiency calculations
- [ ] Session history

### 6.3 Cosmetics System
- [ ] Worker skins (finally implement the shop promise)
- [ ] Building customization
- [ ] Bucket/elevator themes
- [ ] Background variations

---

## Implementation Priority Order

### Immediate (This Session)
1. Security fix (admin password)
2. Fix broken localStorage functions
3. Move magic numbers to config.js

### Short Term (Next Few Sessions)
4. Create GameState architecture
5. Implement prestige system foundation
6. Add offline progress

### Medium Term
7. Research tree
8. New mines (3-4 more)
9. Random events system
10. Sound effects

### Long Term
11. Shaft 21 mystery content
12. Cosmetics system
13. Daily/weekly systems
14. Mobile optimization

---

## Technical Notes

### File Structure After Refactor
```
dunhill-miner/
├── index.html
├── styles.css
├── config.js          # All constants and definitions
├── updates.js         # Changelog
├── dialogue.js        # Story content
├── js/
│   ├── game.js        # Main game loop, initialization
│   ├── state.js       # GameState class
│   ├── save.js        # SaveManager
│   ├── audio.js       # AudioManager
│   ├── ui.js          # UI helpers
│   ├── prestige.js    # Prestige system
│   ├── research.js    # Research tree
│   ├── events.js      # Random events
│   └── shaft21.js     # Horror content
└── assets/
    ├── audio/
    │   ├── music/
    │   └── sfx/
    └── images/
```

### Save Data Versioning
Add version number to saves for migration:
```javascript
const SAVE_VERSION = 2;
// Migration functions for each version bump
```

---

## Success Metrics
- Player retention (return rate)
- Session length increase
- Prestige engagement rate
- Shaft 21 completion rate
- Player feedback/reviews
