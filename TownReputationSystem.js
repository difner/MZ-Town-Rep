/*:
 * @target MZ
 * @plugindesc v1.0.0 Complete modular Town Reputation System (town/faction rep, theft, actions, choices, toasts, menu). 
 * @author Codex
 * @url 
 *
 * @help
 * TownReputationSystem.js
 * ============================================
 * 5-minute setup
 * ============================================
 * 1) Define towns in "TownList". Each town can bind by mapIds and/or regionIds.
 * 2) Choose detection rules in General: map-based and/or region-based.
 * 3) Use plugin commands in events (Set/Add Reputation, Apply Action, Attempt Theft, etc).
 * 4) Enable toast notifications for immediate feedback.
 * 5) Enable Reputation Menu and (optionally) add it to the main menu.
 *
 * ============================================
 * Event examples
 * ============================================
 * - NPC quest reward:
 *   Command: Add Reputation -> townId CURRENT, delta +10
 *
 * - NPC insult choice:
 *   Command: Choice: Add Rep -> townId CURRENT, delta -5
 *
 * - Donation action:
 *   Command: Apply Action -> actionId DONATE_FOOD
 *
 * - Theft attempt:
 *   Command: Attempt Theft -> difficulty Normal, item Item #3 x1
 *
 * ============================================
 * Pending Choice Reputation workflow
 * ============================================
 * Option A (simple): use "Choice: Add Rep" inside each choice branch.
 * Option B (batch):
 *  - Before Show Choices, call "Define Pending Choice Rep" for each choice index.
 *  - Use "Commit Pending Choice Rep" after selection (or enable auto-commit).
 *  - Use "Clear Pending Choice Rep" to reset stale definitions.
 *
 * ============================================
 * Script calls for advanced users
 * ============================================
 * TownRep.getTownIdForMap(mapId)
 * TownRep.currentTownId()
 * TownRep.rep(townId)
 * TownRep.setRep(townId, value, options)
 * TownRep.addRep(townId, delta, options)
 * TownRep.rank(townId)
 * TownRep.canUseShopDiscount(townId)
 * TownRep.shopPriceMultiplier(townId)
 * TownRep.isGuardHostile(townId)
 *
 * Safe save/load notes:
 * - Data is persisted in Game_System.
 * - Save schema is versioned and migrated.
 * - Unknown/removed towns are handled safely.
 *
 * @param EnableSystem
 * @text Enable System
 * @type boolean
 * @default true
 *
 * @param ClampReputation
 * @type boolean
 * @default true
 *
 * @param DefaultMinRep
 * @type number
 * @default -100
 *
 * @param DefaultMaxRep
 * @type number
 * @default 100
 *
 * @param DefaultTownIdFallback
 * @type string
 * @default GLOBAL
 *
 * @param UseRegionBasedTownDetection
 * @type boolean
 * @default true
 *
 * @param UseMapBasedTownDetection
 * @type boolean
 * @default true
 *
 * @param UnknownTownBehavior
 * @type select
 * @option FallbackToGlobal
 * @option DisableChanges
 * @option CreateDynamicTown
 * @default FallbackToGlobal
 *
 * @param EnableDebugLogs
 * @type boolean
 * @default false
 *
 * @param DebugOverlay
 * @type boolean
 * @default false
 *
 * @param TownList
 * @type struct<Town>[]
 * @default []
 *
 * @param EnableToasts
 * @type boolean
 * @default true
 *
 * @param ToastPosition
 * @type select
 * @option TopLeft
 * @option TopRight
 * @option BottomLeft
 * @option BottomRight
 * @default TopRight
 *
 * @param ToastDurationFrames
 * @type number
 * @default 180
 *
 * @param ToastQueueMax
 * @type number
 * @default 8
 *
 * @param ToastFontSize
 * @type number
 * @default 20
 *
 * @param ToastUseSound
 * @type struct<SeConfig>
 * @default {"enabled":"false","name":"","volume":"90","pitch":"100","pan":"0"}
 *
 * @param ToastShowTownName
 * @type boolean
 * @default true
 *
 * @param ToastFormatPositive
 * @type string
 * @default +{delta} Rep ({town})
 *
 * @param ToastFormatNegative
 * @type string
 * @default {delta} Rep ({town})
 *
 * @param ToastFormatSet
 * @type string
 * @default Rep set to {value} ({town})
 *
 * @param EnableRepMenu
 * @type boolean
 * @default true
 *
 * @param AddToMainMenu
 * @type boolean
 * @default true
 *
 * @param MenuCommandName
 * @type string
 * @default Reputation
 *
 * @param MenuShowGlobalFirst
 * @type boolean
 * @default true
 *
 * @param MenuShowOnlyKnownTowns
 * @type boolean
 * @default false
 *
 * @param MenuRevealRule
 * @type select
 * @option AnyChange
 * @option Visited
 * @option ManualReveal
 * @default AnyChange
 *
 * @param MenuUseHelpWindow
 * @type boolean
 * @default true
 *
 * @param EnableTheftModule
 * @type boolean
 * @default true
 *
 * @param TheftRepPenaltyBase
 * @type number
 * @default -10
 *
 * @param TheftCaughtExtraPenalty
 * @type number
 * @default -15
 *
 * @param TheftSuccessRepPenalty
 * @type number
 * @default -2
 *
 * @param TheftWitnessChanceBase
 * @type number
 * @default 30
 *
 * @param TheftWitnessChancePerBadRep
 * @type number
 * @default 0.2
 *
 * @param TheftEscapeChanceBase
 * @type number
 * @default 35
 *
 * @param TheftEscapeChanceAgilityParam
 * @type number
 * @default 0
 *
 * @param TheftCommonEventOnCaught
 * @type common_event
 * @default 0
 *
 * @param TheftCommonEventOnEscape
 * @type common_event
 * @default 0
 *
 * @param TheftCommonEventOnSuccess
 * @type common_event
 * @default 0
 *
 * @param TheftEnableHeatSystem
 * @type boolean
 * @default true
 *
 * @param TheftHeatGainOnAttempt
 * @type number
 * @default 5
 *
 * @param TheftHeatDecayPerMapTransfer
 * @type number
 * @default 1
 *
 * @param LastTheftResultVarId
 * @type variable
 * @default 0
 *
 * @param LastTheftCaughtSwitchId
 * @type switch
 * @default 0
 *
 * @param LastTheftTownIndexVarId
 * @type variable
 * @default 0
 *
 * @param EnableGoodBadModule
 * @type boolean
 * @default true
 *
 * @param ActionDefinitions
 * @type struct<ActionDef>[]
 * @default []
 *
 * @param DiminishingReturnsEnabled
 * @type boolean
 * @default false
 *
 * @param RepeatWindowSteps
 * @type number
 * @default 120
 *
 * @param MaxRepeatsBeforeZero
 * @type number
 * @default 4
 *
 * @param EnableNpcChoiceModule
 * @type boolean
 * @default true
 *
 * @param EnableChoiceAutoCommit
 * @type boolean
 * @default false
 *
 * @param CommitTiming
 * @type select
 * @option OnSelect
 * @option AfterBranchStart
 * @default OnSelect
 *
 * @command SetReputation
 * @text Set Reputation
 * @arg townId
 * @type string
 * @default CURRENT
 * @arg value
 * @type number
 * @default 0
 * @arg showToast
 * @type boolean
 * @default true
 * @arg reason
 * @type string
 * @default
 *
 * @command AddReputation
 * @text Add Reputation
 * @arg townId
 * @type string
 * @default CURRENT
 * @arg delta
 * @type number
 * @default 0
 * @arg showToast
 * @type boolean
 * @default true
 * @arg reason
 * @type string
 * @default
 *
 * @command MultiplyReputationChange
 * @text Multiply Reputation Change
 * @arg scope
 * @type select
 * @option CURRENT
 * @option GLOBAL
 * @option ALL
 * @default CURRENT
 * @arg multiplier
 * @type number
 * @decimals 2
 * @default 1
 * @arg duration
 * @type number
 * @default 0
 * @arg stackRule
 * @type select
 * @option Replace
 * @option Multiply
 * @option Add
 * @default Replace
 *
 * @command GetReputationToVariable
 * @text Get Reputation To Variable
 * @arg townId
 * @type string
 * @default CURRENT
 * @arg variableId
 * @type variable
 * @default 1
 *
 * @command GetRankToVariables
 * @text Get Rank To Variable(s)
 * @arg townId
 * @type string
 * @default CURRENT
 * @arg varTierNameId
 * @type variable
 * @default 0
 * @arg varTierIndexId
 * @type variable
 * @default 0
 *
 * @command RevealTownInMenu
 * @text Reveal Town In Menu
 * @arg townId
 * @type string
 * @default GLOBAL
 * @arg reveal
 * @type boolean
 * @default true
 *
 * @command SetCurrentTownOverride
 * @text Set Current Town Override
 * @arg townId
 * @type string
 * @default NONE
 *
 * @command RegisterDynamicTown
 * @text Register Dynamic Town
 * @arg id
 * @type string
 * @default DYNAMIC_1
 * @arg name
 * @type string
 * @default Dynamic Town
 * @arg defaultRep
 * @type number
 * @default 0
 * @arg minRep
 * @type number
 * @default -100
 * @arg maxRep
 * @type number
 * @default 100
 *
 * @command ShowRepToast
 * @text Show Rep Toast
 * @arg townId
 * @type string
 * @default CURRENT
 * @arg deltaOrValue
 * @type number
 * @default 0
 * @arg mode
 * @type select
 * @option ADD
 * @option SET
 * @default ADD
 * @arg customText
 * @type string
 * @default
 *
 * @command OpenReputationMenu
 * @text Open Reputation Menu
 * @arg startTownId
 * @type string
 * @default
 *
 * @command AttemptTheft
 * @text Attempt Theft
 * @arg townId
 * @type string
 * @default CURRENT
 * @arg difficulty
 * @type string
 * @default Normal
 * @arg itemType
 * @type select
 * @option Item
 * @option Weapon
 * @option Armor
 * @option Gold
 * @default Item
 * @arg itemId
 * @type number
 * @default 1
 * @arg amount
 * @type number
 * @default 1
 * @arg onSuccessCommonEventId
 * @type common_event
 * @default 0
 * @arg onCaughtCommonEventId
 * @type common_event
 * @default 0
 * @arg showToast
 * @type boolean
 * @default true
 *
 * @command ClearHeat
 * @text Clear Heat
 * @arg townId
 * @type string
 * @default CURRENT
 *
 * @command SetHeat
 * @text Set Heat
 * @arg townId
 * @type string
 * @default CURRENT
 * @arg value
 * @type number
 * @default 0
 *
 * @command ApplyAction
 * @text Apply Action
 * @arg actionId
 * @type string
 * @default
 * @arg townId
 * @type string
 * @default CURRENT
 * @arg deltaOverride
 * @type number
 * @default 999999
 * @arg showToast
 * @type boolean
 * @default true
 * @arg reason
 * @type string
 * @default
 *
 * @command ApplyActionFromVariable
 * @text Apply Action From Variable
 * @arg actionIdVarId
 * @type variable
 * @default 1
 * @arg townId
 * @type string
 * @default CURRENT
 * @arg deltaVarId
 * @type variable
 * @default 0
 * @arg showToast
 * @type boolean
 * @default true
 *
 * @command ChoiceAddRep
 * @text Choice: Add Rep
 * @arg townId
 * @type string
 * @default CURRENT
 * @arg delta
 * @type number
 * @default 0
 * @arg showToast
 * @type boolean
 * @default true
 * @arg reason
 * @type string
 * @default
 *
 * @command ChoiceAddRepMultiTown
 * @text Choice: Add Rep MultiTown
 * @arg townIdsCsv
 * @type string
 * @default
 * @arg deltaEach
 * @type number
 * @default 0
 * @arg showToast
 * @type boolean
 * @default true
 *
 * @command DefinePendingChoiceRep
 * @text Define Pending Choice Rep
 * @arg choiceIndex
 * @type number
 * @default 0
 * @arg townId
 * @type string
 * @default CURRENT
 * @arg delta
 * @type number
 * @default 0
 * @arg showToast
 * @type boolean
 * @default true
 * @arg reason
 * @type string
 * @default
 *
 * @command ClearPendingChoiceRep
 * @text Clear Pending Choice Rep
 *
 * @command CommitPendingChoiceRep
 * @text Commit Pending Choice Rep
 */

/*~struct~SeConfig:
 * @param enabled
 * @type boolean
 * @default false
 * @param name
 * @type file
 * @dir audio/se/
 * @default
 * @param volume
 * @type number
 * @default 90
 * @param pitch
 * @type number
 * @default 100
 * @param pan
 * @type number
 * @default 0
 */

/*~struct~Tier:
 * @param thresholdMin
 * @type number
 * @default -100
 * @param thresholdMax
 * @type number
 * @default 100
 * @param tierName
 * @type string
 * @default Unknown
 * @param color
 * @type string
 * @default #ffffff
 * @param iconIndex
 * @type number
 * @default -1
 * @param notes
 * @type note
 * @default
 */

/*~struct~Town:
 * @param id
 * @type string
 * @default GLOBAL
 * @param name
 * @type string
 * @default Global
 * @param description
 * @type note
 * @default
 * @param iconIndex
 * @type number
 * @default -1
 * @param defaultRep
 * @type number
 * @default 0
 * @param minRep
 * @type number
 * @default 0
 * @param maxRep
 * @type number
 * @default 0
 * @param mapIds
 * @type number[]
 * @default []
 * @param regionIds
 * @type number[]
 * @default []
 * @param tiers
 * @type struct<Tier>[]
 * @default []
 */

/*~struct~ActionDef:
 * @param id
 * @type string
 * @default ACTION_1
 * @param name
 * @type string
 * @default Action 1
 * @param defaultDelta
 * @type number
 * @default 0
 * @param townScope
 * @type select
 * @option CURRENT
 * @option SPECIFIC
 * @option GLOBAL
 * @default CURRENT
 * @param specificTownId
 * @type string
 * @default GLOBAL
 * @param toastOverride
 * @type string
 * @default
 * @param requiredSwitchId
 * @type switch
 * @default 0
 * @param requiredVariableId
 * @type variable
 * @default 0
 * @param requiredVariableMin
 * @type number
 * @default 0
 */

(() => {
  'use strict';

  const PLUGIN_NAME = 'TownReputationSystem';
  const SAVE_VERSION = 1;

  const P = PluginManager.parameters(PLUGIN_NAME);

  const U = {
    bool(v, d = false) { return String(v ?? d) === 'true'; },
    num(v, d = 0) { const n = Number(v); return Number.isFinite(n) ? n : d; },
    str(v, d = '') { return v == null ? d : String(v); },
    arr(v) { try { return JSON.parse(v || '[]'); } catch (_) { return []; } },
    obj(v) { try { return JSON.parse(v || '{}'); } catch (_) { return {}; } },
    parseStructArray(raw) { return U.arr(raw).map(e => U.obj(e)); },
    clamp(n, min, max) { return Math.min(max, Math.max(min, n)); },
    deepClone(obj) { return JSON.parse(JSON.stringify(obj)); },
    toIntArray(rawArr) { return (rawArr || []).map(Number).filter(Number.isFinite); },
    asTownId(value, fallback = 'GLOBAL') {
      const s = U.str(value, fallback).trim();
      return s || fallback;
    }
  };

  const Config = {
    enableSystem: U.bool(P.EnableSystem, true),
    clampReputation: U.bool(P.ClampReputation, true),
    defaultMinRep: U.num(P.DefaultMinRep, -100),
    defaultMaxRep: U.num(P.DefaultMaxRep, 100),
    defaultTownIdFallback: U.str(P.DefaultTownIdFallback, 'GLOBAL'),
    useRegionDetection: U.bool(P.UseRegionBasedTownDetection, true),
    useMapDetection: U.bool(P.UseMapBasedTownDetection, true),
    unknownTownBehavior: U.str(P.UnknownTownBehavior, 'FallbackToGlobal'),
    enableDebugLogs: U.bool(P.EnableDebugLogs, false),
    debugOverlay: U.bool(P.DebugOverlay, false),

    enableToasts: U.bool(P.EnableToasts, true),
    toastPosition: U.str(P.ToastPosition, 'TopRight'),
    toastDuration: U.num(P.ToastDurationFrames, 180),
    toastQueueMax: U.num(P.ToastQueueMax, 8),
    toastFontSize: U.num(P.ToastFontSize, 20),
    toastShowTownName: U.bool(P.ToastShowTownName, true),
    toastFormatPositive: U.str(P.ToastFormatPositive, '+{delta} Rep ({town})'),
    toastFormatNegative: U.str(P.ToastFormatNegative, '{delta} Rep ({town})'),
    toastFormatSet: U.str(P.ToastFormatSet, 'Rep set to {value} ({town})'),
    toastSe: (() => {
      const se = U.obj(P.ToastUseSound);
      return {
        enabled: U.bool(se.enabled, false),
        name: U.str(se.name),
        volume: U.num(se.volume, 90),
        pitch: U.num(se.pitch, 100),
        pan: U.num(se.pan, 0)
      };
    })(),

    enableRepMenu: U.bool(P.EnableRepMenu, true),
    addToMainMenu: U.bool(P.AddToMainMenu, true),
    menuCommandName: U.str(P.MenuCommandName, 'Reputation'),
    menuShowGlobalFirst: U.bool(P.MenuShowGlobalFirst, true),
    menuShowOnlyKnownTowns: U.bool(P.MenuShowOnlyKnownTowns, false),
    menuRevealRule: U.str(P.MenuRevealRule, 'AnyChange'),
    menuUseHelpWindow: U.bool(P.MenuUseHelpWindow, true),

    enableTheftModule: U.bool(P.EnableTheftModule, true),
    theftRepPenaltyBase: U.num(P.TheftRepPenaltyBase, -10),
    theftCaughtExtraPenalty: U.num(P.TheftCaughtExtraPenalty, -15),
    theftSuccessRepPenalty: U.num(P.TheftSuccessRepPenalty, -2),
    theftWitnessChanceBase: U.num(P.TheftWitnessChanceBase, 30),
    theftWitnessChancePerBadRep: U.num(P.TheftWitnessChancePerBadRep, 0.2),
    theftEscapeChanceBase: U.num(P.TheftEscapeChanceBase, 35),
    theftEscapeChanceAgiParam: U.num(P.TheftEscapeChanceAgilityParam, 0),
    theftCeCaught: U.num(P.TheftCommonEventOnCaught, 0),
    theftCeEscape: U.num(P.TheftCommonEventOnEscape, 0),
    theftCeSuccess: U.num(P.TheftCommonEventOnSuccess, 0),
    theftHeatEnabled: U.bool(P.TheftEnableHeatSystem, true),
    theftHeatGainOnAttempt: U.num(P.TheftHeatGainOnAttempt, 5),
    theftHeatDecayPerMapTransfer: U.num(P.TheftHeatDecayPerMapTransfer, 1),
    lastTheftResultVarId: U.num(P.LastTheftResultVarId, 0),
    lastTheftCaughtSwitchId: U.num(P.LastTheftCaughtSwitchId, 0),
    lastTheftTownIndexVarId: U.num(P.LastTheftTownIndexVarId, 0),

    enableGoodBadModule: U.bool(P.EnableGoodBadModule, true),
    actionDefsRaw: U.parseStructArray(P.ActionDefinitions),
    dimEnabled: U.bool(P.DiminishingReturnsEnabled, false),
    dimRepeatWindowSteps: U.num(P.RepeatWindowSteps, 120),
    dimMaxRepeatsBeforeZero: U.num(P.MaxRepeatsBeforeZero, 4),

    enableNpcChoiceModule: U.bool(P.EnableNpcChoiceModule, true),
    enableChoiceAutoCommit: U.bool(P.EnableChoiceAutoCommit, false),
    commitTiming: U.str(P.CommitTiming, 'OnSelect')
  };

  function parseTiers(raw) {
    const tiers = U.parseStructArray(raw).map((t, idx) => ({
      thresholdMin: U.num(t.thresholdMin, -100),
      thresholdMax: U.num(t.thresholdMax, 100),
      tierName: U.str(t.tierName, `Tier ${idx + 1}`),
      color: U.str(t.color, '#ffffff'),
      iconIndex: U.num(t.iconIndex, -1),
      notes: U.str(t.notes, '')
    }));
    return tiers.sort((a, b) => a.thresholdMin - b.thresholdMin);
  }

  function defaultTiers(min, max) {
    const span = max - min;
    return [
      { thresholdMin: min, thresholdMax: min + Math.floor(span * 0.25), tierName: 'Wanted', color: '#ff4444', iconIndex: -1, notes: '' },
      { thresholdMin: min + Math.floor(span * 0.25) + 1, thresholdMax: -1, tierName: 'Shady', color: '#ff8844', iconIndex: -1, notes: '' },
      { thresholdMin: 0, thresholdMax: Math.floor(span * 0.25), tierName: 'Unknown', color: '#cccccc', iconIndex: -1, notes: '' },
      { thresholdMin: Math.floor(span * 0.25) + 1, thresholdMax: Math.floor(span * 0.75), tierName: 'Known', color: '#88ff88', iconIndex: -1, notes: '' },
      { thresholdMin: Math.floor(span * 0.75) + 1, thresholdMax: max, tierName: 'Hero', color: '#44aaff', iconIndex: -1, notes: '' }
    ];
  }

  const TownDefs = (() => {
    const raw = U.parseStructArray(P.TownList);
    const towns = {};
    raw.forEach(t => {
      const id = U.asTownId(t.id, Config.defaultTownIdFallback);
      const minRep = U.num(t.minRep, Config.defaultMinRep);
      const maxRep = U.num(t.maxRep, Config.defaultMaxRep);
      const tiers = parseTiers(t.tiers);
      towns[id] = {
        id,
        name: U.str(t.name, id),
        description: U.str(t.description, ''),
        iconIndex: U.num(t.iconIndex, -1),
        defaultRep: U.num(t.defaultRep, 0),
        minRep,
        maxRep,
        mapIds: U.toIntArray(U.arr(t.mapIds)),
        regionIds: U.toIntArray(U.arr(t.regionIds)),
        tiers: tiers.length ? tiers : defaultTiers(minRep, maxRep),
        dynamic: false
      };
    });
    if (!towns[Config.defaultTownIdFallback]) {
      towns[Config.defaultTownIdFallback] = {
        id: Config.defaultTownIdFallback,
        name: Config.defaultTownIdFallback,
        description: 'Fallback town/faction reputation.',
        iconIndex: -1,
        defaultRep: 0,
        minRep: Config.defaultMinRep,
        maxRep: Config.defaultMaxRep,
        mapIds: [],
        regionIds: [],
        tiers: defaultTiers(Config.defaultMinRep, Config.defaultMaxRep),
        dynamic: true
      };
    }
    return towns;
  })();

  const ActionDefs = (() => {
    const map = {};
    Config.actionDefsRaw.forEach(a => {
      const id = U.asTownId(a.id, '');
      if (!id) return;
      map[id] = {
        id,
        name: U.str(a.name, id),
        defaultDelta: U.num(a.defaultDelta, 0),
        townScope: U.str(a.townScope, 'CURRENT'),
        specificTownId: U.asTownId(a.specificTownId, Config.defaultTownIdFallback),
        toastOverride: U.str(a.toastOverride, ''),
        requiredSwitchId: U.num(a.requiredSwitchId, 0),
        requiredVariableId: U.num(a.requiredVariableId, 0),
        requiredVariableMin: U.num(a.requiredVariableMin, 0)
      };
    });
    return map;
  })();

  const TownRepSystem = {
    _log(...args) { if (Config.enableDebugLogs) console.log('[TownRep]', ...args); },

    _state() {
      if (!$gameSystem) return null;
      return $gameSystem._townRepData;
    },

    ensureState() {
      if (!$gameSystem._townRepData || !$gameSystem._townRepData.version) {
        $gameSystem._townRepData = {
          version: SAVE_VERSION,
          repByTown: {},
          knownTowns: {},
          currentTownOverride: '',
          heatByTown: {},
          multipliers: [],
          pendingChoice: {},
          actionHistory: {},
          townIndexMap: {}
        };
      }
      this.migrateState($gameSystem._townRepData);
      this.ensureTownIndices();
      Object.keys(TownDefs).forEach(id => this.ensureTownRep(id));
      return $gameSystem._townRepData;
    },

    migrateState(state) {
      if (!state.version) state.version = 0;
      if (state.version < 1) {
        state.repByTown = state.repByTown || {};
        state.knownTowns = state.knownTowns || {};
        state.currentTownOverride = state.currentTownOverride || '';
        state.heatByTown = state.heatByTown || {};
        state.multipliers = state.multipliers || [];
        state.pendingChoice = state.pendingChoice || {};
        state.actionHistory = state.actionHistory || {};
        state.townIndexMap = state.townIndexMap || {};
        state.version = 1;
      }
    },

    ensureTownIndices() {
      const st = this._state();
      if (!st) return;
      let nextIndex = 1;
      Object.keys(st.townIndexMap).forEach(id => { nextIndex = Math.max(nextIndex, st.townIndexMap[id] + 1); });
      Object.keys(TownDefs).forEach(id => {
        if (!st.townIndexMap[id]) st.townIndexMap[id] = nextIndex++;
      });
    },

    townDef(townId) {
      const id = this.normalizeTownId(townId);
      return TownDefs[id];
    },

    normalizeTownId(townId) {
      const id = U.asTownId(townId, Config.defaultTownIdFallback);
      if (id === 'CURRENT') return this.currentTownId();
      if (TownDefs[id]) return id;
      if (Config.unknownTownBehavior === 'CreateDynamicTown') {
        this.registerDynamicTown(id, id, 0, Config.defaultMinRep, Config.defaultMaxRep);
        return id;
      }
      if (Config.unknownTownBehavior === 'DisableChanges') return '';
      return Config.defaultTownIdFallback;
    },

    ensureTownRep(townId) {
      const st = this.ensureState();
      const def = this.townDef(townId);
      if (!def) return;
      if (st.repByTown[def.id] == null) st.repByTown[def.id] = def.defaultRep;
      if (st.heatByTown[def.id] == null) st.heatByTown[def.id] = 0;
    },

    rep(townId) {
      const id = this.normalizeTownId(townId);
      if (!id) return 0;
      this.ensureTownRep(id);
      return this._state().repByTown[id] ?? 0;
    },

    clampValue(townId, value) {
      if (!Config.clampReputation) return Math.round(value);
      const def = this.townDef(townId);
      const min = def ? def.minRep : Config.defaultMinRep;
      const max = def ? def.maxRep : Config.defaultMaxRep;
      return U.clamp(Math.round(value), min, max);
    },

    resolveMultipliers(townId) {
      const st = this.ensureState();
      const current = this.currentTownId();
      let m = 1;
      const kept = [];
      st.multipliers.forEach(entry => {
        if (entry.duration > 0) entry.duration -= 1;
        if (entry.duration === 0) return;
        const ok = entry.scope === 'ALL' || (entry.scope === 'CURRENT' && townId === current) || (entry.scope === 'GLOBAL' && townId === Config.defaultTownIdFallback);
        if (ok) m *= entry.multiplier;
        kept.push(entry);
      });
      st.multipliers = kept;
      return m;
    },

    setRep(townId, value, options = {}) {
      if (!Config.enableSystem) return 0;
      const id = this.normalizeTownId(townId);
      if (!id) return 0;
      this.ensureTownRep(id);
      const st = this._state();
      const finalValue = this.clampValue(id, value);
      st.repByTown[id] = finalValue;
      this.onRepChanged(id, 0, finalValue, { ...options, mode: 'SET' });
      return finalValue;
    },

    addRep(townId, delta, options = {}) {
      if (!Config.enableSystem) return 0;
      const id = this.normalizeTownId(townId);
      if (!id) return 0;
      this.ensureTownRep(id);
      const mult = this.resolveMultipliers(id);
      const scaled = Math.round(Number(delta || 0) * mult);
      if (scaled === 0 && !options.forceZero) return this.rep(id);
      const before = this.rep(id);
      const after = this.clampValue(id, before + scaled);
      this._state().repByTown[id] = after;
      this.onRepChanged(id, after - before, after, { ...options, mode: 'ADD' });
      return after;
    },

    onRepChanged(townId, actualDelta, value, options) {
      const st = this.ensureState();
      if (Config.menuRevealRule === 'AnyChange') st.knownTowns[townId] = true;
      if (U.bool(options.showToast, false) && Config.enableToasts) this.enqueueRepToast(townId, actualDelta, value, options);
      this.applyGating(townId);
      this._log('Rep change', townId, actualDelta, value, options.reason || '');
    },

    applyGating(townId) {
      const def = this.townDef(townId);
      if (!def) return;
    },

    rank(townId) {
      const id = this.normalizeTownId(townId);
      const def = this.townDef(id);
      const value = this.rep(id);
      const tier = (def?.tiers || []).find(t => value >= t.thresholdMin && value <= t.thresholdMax) || {
        thresholdMin: Config.defaultMinRep,
        thresholdMax: Config.defaultMaxRep,
        tierName: 'Unknown',
        color: '#ffffff',
        iconIndex: -1,
        notes: ''
      };
      return tier;
    },

    canUseShopDiscount(townId) {
      return this.rep(townId) >= 25;
    },

    shopPriceMultiplier(townId) {
      const r = this.rep(townId);
      if (r >= 75) return 0.8;
      if (r >= 25) return 0.9;
      if (r <= -50) return 1.3;
      if (r <= -1) return 1.1;
      return 1.0;
    },

    isGuardHostile(townId) {
      return this.rep(townId) <= -60;
    },

    enqueueRepToast(townId, delta, value, options = {}) {
      const def = this.townDef(townId);
      const town = def ? def.name : townId;
      const mode = options.mode || 'ADD';
      let text = '';
      if (options.customText) {
        text = options.customText;
      } else if (mode === 'SET') {
        text = Config.toastFormatSet.replace('{value}', String(value));
      } else if (delta >= 0) {
        text = Config.toastFormatPositive.replace('{delta}', String(delta));
      } else {
        text = Config.toastFormatNegative.replace('{delta}', String(delta));
      }
      text = text.replace('{town}', Config.toastShowTownName ? town : '');
      const tier = this.rank(townId);
      ToastManager.push({
        text,
        color: tier.color || '#ffffff',
        iconIndex: tier.iconIndex,
        duration: Config.toastDuration
      });
    },

    townIdsForMenu() {
      this.ensureState();
      let ids = Object.keys(TownDefs);
      if (Config.menuShowOnlyKnownTowns) {
        ids = ids.filter(id => this._state().knownTowns[id]);
      }
      if (Config.menuShowGlobalFirst) {
        ids.sort((a, b) => (a === Config.defaultTownIdFallback ? -1 : b === Config.defaultTownIdFallback ? 1 : a.localeCompare(b)));
      } else {
        ids.sort();
      }
      return ids;
    },

    getTownIdForMap(mapId) {
      const mid = Number(mapId || $gameMap?.mapId() || 0);
      if (Config.useMapDetection) {
        const byMap = Object.values(TownDefs).find(t => t.mapIds.includes(mid));
        if (byMap) return byMap.id;
      }
      if (Config.useRegionDetection && $gameMap) {
        const px = $gamePlayer ? $gamePlayer.x : 0;
        const py = $gamePlayer ? $gamePlayer.y : 0;
        const regionId = $gameMap.regionId(px, py);
        const byRegion = Object.values(TownDefs).find(t => t.regionIds.includes(regionId));
        if (byRegion) return byRegion.id;
      }
      return Config.defaultTownIdFallback;
    },

    currentTownId() {
      this.ensureState();
      const override = this._state().currentTownOverride;
      if (override) return this.normalizeTownId(override);
      return this.getTownIdForMap($gameMap?.mapId?.());
    },

    setTownOverride(townId) {
      this.ensureState();
      if (!townId || townId === 'NONE') {
        this._state().currentTownOverride = '';
      } else {
        this._state().currentTownOverride = this.normalizeTownId(townId);
      }
    },

    revealTown(townId, reveal = true) {
      const id = this.normalizeTownId(townId);
      if (!id) return;
      this.ensureState().knownTowns[id] = !!reveal;
    },

    registerDynamicTown(id, name, defaultRep, minRep, maxRep) {
      const tid = U.asTownId(id, `DYN_${Date.now()}`);
      if (!TownDefs[tid]) {
        TownDefs[tid] = {
          id: tid,
          name: U.str(name, tid),
          description: '',
          iconIndex: -1,
          defaultRep: U.num(defaultRep, 0),
          minRep: U.num(minRep, Config.defaultMinRep),
          maxRep: U.num(maxRep, Config.defaultMaxRep),
          mapIds: [],
          regionIds: [],
          tiers: defaultTiers(U.num(minRep, Config.defaultMinRep), U.num(maxRep, Config.defaultMaxRep)),
          dynamic: true
        };
      }
      this.ensureTownRep(tid);
      this.ensureTownIndices();
      return tid;
    },

    addMultiplier(scope, multiplier, duration, stackRule) {
      const st = this.ensureState();
      const mult = Number(multiplier || 1);
      const dur = Number(duration || 0);
      if (stackRule === 'Replace') {
        st.multipliers = st.multipliers.filter(m => m.scope !== scope);
        st.multipliers.push({ scope, multiplier: mult, duration: dur });
      } else if (stackRule === 'Add') {
        st.multipliers.push({ scope, multiplier: 1 + (mult - 1), duration: dur });
      } else {
        st.multipliers.push({ scope, multiplier: mult, duration: dur });
      }
    },

    heat(townId) {
      const id = this.normalizeTownId(townId);
      return this.ensureState().heatByTown[id] || 0;
    },

    setHeat(townId, v) {
      const id = this.normalizeTownId(townId);
      this.ensureState().heatByTown[id] = Math.max(0, Math.round(v));
    },

    clearHeat(townId) { this.setHeat(townId, 0); },

    applyAction(actionId, townIdOverride, deltaOverride, options = {}) {
      if (!Config.enableGoodBadModule) return;
      const action = ActionDefs[actionId];
      if (!action) return;
      if (action.requiredSwitchId > 0 && !$gameSwitches.value(action.requiredSwitchId)) return;
      if (action.requiredVariableId > 0 && $gameVariables.value(action.requiredVariableId) < action.requiredVariableMin) return;
      let townId = townIdOverride;
      if (!townId || townId === 'CURRENT') {
        if (action.townScope === 'GLOBAL') townId = Config.defaultTownIdFallback;
        else if (action.townScope === 'SPECIFIC') townId = action.specificTownId;
        else townId = this.currentTownId();
      }
      let delta = deltaOverride;
      if (delta == null) delta = action.defaultDelta;
      if (Config.dimEnabled) delta = this.applyDiminishing(action.id, townId, delta);
      this.addRep(townId, delta, {
        showToast: options.showToast,
        reason: options.reason || action.name,
        customText: action.toastOverride || options.customText
      });
    },

    applyDiminishing(actionId, townId, delta) {
      const st = this.ensureState();
      const key = `${actionId}:${townId}`;
      const now = $gameParty ? $gameParty.steps() : 0;
      const h = st.actionHistory[key] || { lastStep: -999999, repeats: 0 };
      if (now - h.lastStep <= Config.dimRepeatWindowSteps) h.repeats += 1;
      else h.repeats = 1;
      h.lastStep = now;
      st.actionHistory[key] = h;
      if (h.repeats > Config.dimMaxRepeatsBeforeZero) return 0;
      return Math.round(delta / h.repeats);
    },

    pendingKey(interpreter) {
      return `${$gameMap.mapId()}:${interpreter.eventId?.() || 0}:${interpreter._depth || 0}`;
    },

    definePendingChoice(interpreter, choiceIndex, payload) {
      const st = this.ensureState();
      const key = this.pendingKey(interpreter);
      st.pendingChoice[key] = st.pendingChoice[key] || {};
      st.pendingChoice[key][choiceIndex] = payload;
    },

    clearPendingChoice(interpreter) {
      const st = this.ensureState();
      delete st.pendingChoice[this.pendingKey(interpreter)];
    },

    commitPendingChoice(interpreter, idx) {
      const st = this.ensureState();
      const key = this.pendingKey(interpreter);
      const pack = st.pendingChoice[key] || {};
      const p = pack[idx];
      if (p) this.addRep(p.townId, p.delta, { showToast: p.showToast, reason: p.reason });
      delete st.pendingChoice[key];
    },

    processTheft(args) {
      if (!Config.enableTheftModule) return;
      const townId = this.normalizeTownId(args.townId);
      const difficulty = this.theftDifficultyValue(args.difficulty);
      const heat = Config.theftHeatEnabled ? this.heat(townId) : 0;
      const rep = this.rep(townId);
      const successChance = U.clamp(75 - difficulty + Math.floor(rep * 0.15), 5, 95);
      const success = this.roll(successChance);

      let result = 0; // 0 fail uncaught,1 success,2 caught,3 escaped
      let caught = false;

      if (success) {
        this.rewardTheftItem(args.itemType, Number(args.itemId || 0), Number(args.amount || 1));
        this.addRep(townId, Config.theftSuccessRepPenalty, { showToast: U.bool(args.showToast, true), reason: 'Theft Success' });
        result = 1;
        this.reserveCommonEvent(Number(args.onSuccessCommonEventId || Config.theftCeSuccess));
      } else {
        const witnessChance = U.clamp(Config.theftWitnessChanceBase + heat + (rep < 0 ? Math.abs(rep) * Config.theftWitnessChancePerBadRep : 0), 0, 100);
        const witnessed = this.roll(witnessChance);
        if (witnessed) {
          const escapeChance = U.clamp(Config.theftEscapeChanceBase + this.partyAgiBonus(), 0, 100);
          const escaped = this.roll(escapeChance);
          if (escaped) {
            this.addRep(townId, Config.theftRepPenaltyBase, { showToast: U.bool(args.showToast, true), reason: 'Theft Escape' });
            result = 3;
            this.reserveCommonEvent(Config.theftCeEscape);
          } else {
            this.addRep(townId, Config.theftRepPenaltyBase + Config.theftCaughtExtraPenalty, { showToast: U.bool(args.showToast, true), reason: 'Theft Caught' });
            caught = true;
            result = 2;
            this.reserveCommonEvent(Number(args.onCaughtCommonEventId || Config.theftCeCaught));
          }
        } else {
          this.addRep(townId, Math.floor(Config.theftRepPenaltyBase / 2), { showToast: U.bool(args.showToast, true), reason: 'Theft Failed' });
          result = 0;
        }
      }

      if (Config.theftHeatEnabled) this.setHeat(townId, heat + Config.theftHeatGainOnAttempt);
      this.storeTheftOutcome(result, caught, townId);
    },

    partyAgiBonus() {
      if (!Config.theftEscapeChanceAgiParam || !$gameParty) return 0;
      const members = $gameParty.members();
      if (!members.length) return 0;
      const avg = members.reduce((sum, a) => sum + a.param(Config.theftEscapeChanceAgiParam), 0) / members.length;
      return Math.floor(avg / 20);
    },

    theftDifficultyValue(d) {
      const s = String(d || 'Normal').toLowerCase();
      if (s === 'easy') return 20;
      if (s === 'hard') return 60;
      const n = Number(s);
      if (Number.isFinite(n)) return U.clamp(n, 0, 100);
      return 40;
    },

    rewardTheftItem(type, itemId, amount) {
      const qty = Math.max(1, Math.floor(amount || 1));
      if (type === 'Gold') {
        $gameParty.gainGold(qty);
      } else if (type === 'Weapon') {
        const item = $dataWeapons[itemId];
        if (item) $gameParty.gainItem(item, qty);
      } else if (type === 'Armor') {
        const item = $dataArmors[itemId];
        if (item) $gameParty.gainItem(item, qty);
      } else {
        const item = $dataItems[itemId];
        if (item) $gameParty.gainItem(item, qty);
      }
    },

    storeTheftOutcome(result, caught, townId) {
      if (Config.lastTheftResultVarId > 0) $gameVariables.setValue(Config.lastTheftResultVarId, result);
      if (Config.lastTheftCaughtSwitchId > 0) $gameSwitches.setValue(Config.lastTheftCaughtSwitchId, !!caught);
      if (Config.lastTheftTownIndexVarId > 0) {
        this.ensureTownIndices();
        const idx = this._state().townIndexMap[townId] || 0;
        $gameVariables.setValue(Config.lastTheftTownIndexVarId, idx);
      }
    },

    reserveCommonEvent(id) {
      if (id > 0) $gameTemp.reserveCommonEvent(id);
    },

    roll(chancePercent) {
      return Math.random() * 100 < chancePercent;
    }
  };

  window.TownRepSystem = TownRepSystem;
  window.TownRep = {
    getTownIdForMap: mapId => TownRepSystem.getTownIdForMap(mapId),
    currentTownId: () => TownRepSystem.currentTownId(),
    rep: townId => TownRepSystem.rep(townId),
    setRep: (townId, value, options) => TownRepSystem.setRep(townId, value, options),
    addRep: (townId, delta, options) => TownRepSystem.addRep(townId, delta, options),
    rank: townId => TownRepSystem.rank(townId),
    canUseShopDiscount: townId => TownRepSystem.canUseShopDiscount(townId),
    shopPriceMultiplier: townId => TownRepSystem.shopPriceMultiplier(townId),
    isGuardHostile: townId => TownRepSystem.isGuardHostile(townId)
  };

  const _Game_System_initialize = Game_System.prototype.initialize;
  Game_System.prototype.initialize = function() {
    _Game_System_initialize.call(this);
    TownRepSystem.ensureState();
  };

  const _DataManager_extractSaveContents = DataManager.extractSaveContents;
  DataManager.extractSaveContents = function(contents) {
    _DataManager_extractSaveContents.call(this, contents);
    TownRepSystem.ensureState();
  };

  const _Game_Player_performTransfer = Game_Player.prototype.performTransfer;
  Game_Player.prototype.performTransfer = function() {
    const wasTransferring = this.isTransferring();
    _Game_Player_performTransfer.call(this);
    if (wasTransferring && Config.theftHeatEnabled) {
      const st = TownRepSystem.ensureState();
      Object.keys(st.heatByTown).forEach(id => {
        st.heatByTown[id] = Math.max(0, st.heatByTown[id] - Config.theftHeatDecayPerMapTransfer);
      });
    }
    if (Config.menuRevealRule === 'Visited') {
      TownRepSystem.revealTown(TownRepSystem.currentTownId(), true);
    }
  };

  class Window_RepToast extends Window_Base {
    initialize(rect) {
      super.initialize(rect);
      this.opacity = 0;
      this.contentsOpacity = 0;
      this._toast = null;
      this._life = 0;
    }

    setToast(toast) {
      this._toast = toast;
      this._life = 0;
      this.refresh();
    }

    isFinished() {
      return !!this._toast && this._life >= (this._toast.duration || Config.toastDuration);
    }

    update() {
      super.update();
      if (!this._toast) return;
      this._life += 1;
      const fadeIn = 15;
      const fadeOut = 20;
      const total = this._toast.duration || Config.toastDuration;
      if (this._life < fadeIn) this.contentsOpacity = (this._life / fadeIn) * 255;
      else if (this._life > total - fadeOut) this.contentsOpacity = ((total - this._life) / fadeOut) * 255;
      else this.contentsOpacity = 255;
      if (this.isFinished()) this._toast = null;
    }

    refresh() {
      this.contents.clear();
      if (!this._toast) return;
      this.contents.fontSize = Config.toastFontSize;
      this.changeTextColor(this._toast.color || ColorManager.normalColor());
      let x = 0;
      if (this._toast.iconIndex != null && this._toast.iconIndex >= 0) {
        this.drawIcon(this._toast.iconIndex, x, 0);
        x += 40;
      }
      this.drawTextEx(this._toast.text, x, 0, this.contentsWidth() - x);
      this.resetTextColor();
    }
  }

  const ToastManager = {
    _queue: [],
    _activeWindows: [],
    push(toast) {
      if (!Config.enableToasts) return;
      if (this._queue.length >= Config.toastQueueMax) this._queue.shift();
      this._queue.push(toast);
      if (Config.toastSe.enabled && Config.toastSe.name) {
        AudioManager.playSe({
          name: Config.toastSe.name,
          volume: Config.toastSe.volume,
          pitch: Config.toastSe.pitch,
          pan: Config.toastSe.pan
        });
      }
    },

    attachToScene(scene) {
      if (!Config.enableToasts) return;
      if (!scene._repToastLayer) {
        scene._repToastLayer = new Sprite();
        scene.addChild(scene._repToastLayer);
      }
      scene._repToastUpdater = scene._repToastUpdater || this.createUpdater(scene);
      scene.addChild(scene._repToastUpdater);
    },

    createUpdater(scene) {
      const spr = new Sprite();
      spr.update = () => {
        this._activeWindows = this._activeWindows.filter(w => w._toast);
        if (this._queue.length > 0 && this._activeWindows.length < 3) {
          const idx = this._activeWindows.length;
          const rect = this.toastRect(idx);
          const win = new Window_RepToast(rect);
          win.setToast(this._queue.shift());
          scene._repToastLayer.addChild(win);
          this._activeWindows.push(win);
        }
      };
      return spr;
    },

    toastRect(index) {
      const w = 360;
      const h = 64;
      const margin = 8;
      let x = margin;
      let y = margin;
      const bottom = Config.toastPosition.includes('Bottom');
      const right = Config.toastPosition.includes('Right');
      if (right) x = Graphics.boxWidth - w - margin;
      if (bottom) y = Graphics.boxHeight - h - margin - (index * (h + 4));
      else y += index * (h + 4);
      return new Rectangle(x, y, w, h);
    }
  };

  class Window_TownList extends Window_Selectable {
    initialize(rect) {
      super.initialize(rect);
      this._data = [];
      this.refresh();
      this.select(0);
    }

    maxItems() { return this._data.length; }
    townId() { return this._data[this.index()] || ''; }

    refresh() {
      this._data = TownRepSystem.townIdsForMenu();
      this.createContents();
      this.drawAllItems();
    }

    drawItem(index) {
      const townId = this._data[index];
      const def = TownRepSystem.townDef(townId);
      if (!def) return;
      const rect = this.itemRect(index);
      if (def.iconIndex >= 0) this.drawIcon(def.iconIndex, rect.x, rect.y + 2);
      const x = rect.x + (def.iconIndex >= 0 ? 38 : 0);
      this.drawText(def.name, x, rect.y, rect.width - x);
    }
  }

  class Window_TownDetails extends Window_Base {
    initialize(rect) {
      super.initialize(rect);
      this._townId = '';
    }

    setTownId(id) {
      if (this._townId === id) return;
      this._townId = id;
      this.refresh();
    }

    refresh() {
      this.contents.clear();
      if (!this._townId) return;
      const def = TownRepSystem.townDef(this._townId);
      if (!def) return;
      const rep = TownRepSystem.rep(this._townId);
      const tier = TownRepSystem.rank(this._townId);
      let y = 0;
      this.drawText(def.name, 0, y, this.contentsWidth()); y += this.lineHeight();
      this.changeTextColor(tier.color || ColorManager.normalColor());
      this.drawText(`Rank: ${tier.tierName}`, 0, y, this.contentsWidth()); y += this.lineHeight();
      this.resetTextColor();
      this.drawText(`Reputation: ${rep}`, 0, y, this.contentsWidth()); y += this.lineHeight();
      this.drawText(`Shop Multiplier: x${TownRepSystem.shopPriceMultiplier(this._townId).toFixed(2)}`, 0, y, this.contentsWidth()); y += this.lineHeight();
      this.drawText(`Guard Hostility: ${TownRepSystem.isGuardHostile(this._townId) ? 'Hostile' : 'Neutral'}`, 0, y, this.contentsWidth()); y += this.lineHeight();
      if (Config.theftHeatEnabled) {
        this.drawText(`Heat: ${TownRepSystem.heat(this._townId)}`, 0, y, this.contentsWidth()); y += this.lineHeight();
      }
      y += 6;
      this.drawTextEx(def.description || '', 0, y, this.contentsWidth());
      if (tier.notes) {
        const ny = Math.min(this.contentsHeight() - this.lineHeight() * 2, y + this.lineHeight() * 3);
        this.changeTextColor(ColorManager.systemColor());
        this.drawText('Notes:', 0, ny, 120);
        this.resetTextColor();
        this.drawTextEx(String(tier.notes), 0, ny + this.lineHeight(), this.contentsWidth());
      }
    }
  }

  class Scene_Reputation extends Scene_MenuBase {
    create() {
      super.create();
      TownRepSystem.ensureState();
      this.createHelpWindowMaybe();
      this.createTownListWindow();
      this.createTownDetailsWindow();
    }

    createHelpWindowMaybe() {
      if (!Config.menuUseHelpWindow) return;
      this._helpWindow = new Window_Help(this.helpAreaHeight() / this.calcWindowHeight(1, false));
      this._helpWindow.setText('Town and faction reputation overview.');
      this.addWindow(this._helpWindow);
    }

    helpAreaHeight() {
      return Config.menuUseHelpWindow ? this.calcWindowHeight(2, false) : 0;
    }

    createTownListWindow() {
      const y = this.helpAreaHeight();
      const w = Math.floor(Graphics.boxWidth * 0.35);
      const h = Graphics.boxHeight - y;
      this._townListWindow = new Window_TownList(new Rectangle(0, y, w, h));
      this._townListWindow.setHandler('cancel', this.popScene.bind(this));
      this._townListWindow.setHandler('ok', this.onTownOk.bind(this));
      this._townListWindow.activate();
      this._townListWindow.setHelpWindow?.(this._helpWindow);
      this._townListWindow.setHandler('pagedown', () => {});
      this._townListWindow.select(0);
      this._townListWindow.setHandler('change', this.onTownChange?.bind(this));
      this.addWindow(this._townListWindow);
    }

    createTownDetailsWindow() {
      const y = this.helpAreaHeight();
      const x = this._townListWindow.width;
      const w = Graphics.boxWidth - x;
      const h = Graphics.boxHeight - y;
      this._townDetailsWindow = new Window_TownDetails(new Rectangle(x, y, w, h));
      this.addWindow(this._townDetailsWindow);
      this._townDetailsWindow.setTownId(this._townListWindow.townId());
    }

    update() {
      super.update();
      if (this._townDetailsWindow) this._townDetailsWindow.setTownId(this._townListWindow.townId());
    }

    onTownOk() {
      this._townListWindow.activate();
    }
  }

  window.Scene_Reputation = Scene_Reputation;

  const _Scene_Map_createAllWindows = Scene_Map.prototype.createAllWindows;
  Scene_Map.prototype.createAllWindows = function() {
    _Scene_Map_createAllWindows.call(this);
    ToastManager.attachToScene(this);
  };

  const _Scene_Menu_createCommandWindow = Scene_Menu.prototype.createCommandWindow;
  Scene_Menu.prototype.createCommandWindow = function() {
    _Scene_Menu_createCommandWindow.call(this);
    this._commandWindow.setHandler('reputation', this.commandReputation.bind(this));
  };

  Scene_Menu.prototype.commandReputation = function() {
    SceneManager.push(Scene_Reputation);
  };

  const _Window_MenuCommand_addOriginalCommands = Window_MenuCommand.prototype.addOriginalCommands;
  Window_MenuCommand.prototype.addOriginalCommands = function() {
    _Window_MenuCommand_addOriginalCommands.call(this);
    if (Config.enableRepMenu && Config.addToMainMenu) {
      this.addCommand(Config.menuCommandName, 'reputation', true);
    }
  };

  const _Game_Interpreter_command102 = Game_Interpreter.prototype.command102;
  Game_Interpreter.prototype.command102 = function(params) {
    const result = _Game_Interpreter_command102.call(this, params);
    if (Config.enableNpcChoiceModule && Config.enableChoiceAutoCommit && Config.commitTiming === 'OnSelect') {
      const originalCallback = $gameMessage._choiceCallback;
      $gameMessage.setChoiceCallback(n => {
        if (originalCallback) originalCallback(n);
        TownRepSystem.commitPendingChoice(this, n);
      });
    }
    return result;
  };

  function argTown(args) { return U.str(args.townId || args.townIdOverride || 'CURRENT', 'CURRENT'); }

  PluginManager.registerCommand(PLUGIN_NAME, 'SetReputation', args => {
    TownRepSystem.setRep(argTown(args), Number(args.value || 0), { showToast: U.bool(args.showToast, true), reason: U.str(args.reason, '') });
  });

  PluginManager.registerCommand(PLUGIN_NAME, 'AddReputation', args => {
    TownRepSystem.addRep(argTown(args), Number(args.delta || 0), { showToast: U.bool(args.showToast, true), reason: U.str(args.reason, '') });
  });

  PluginManager.registerCommand(PLUGIN_NAME, 'MultiplyReputationChange', args => {
    TownRepSystem.addMultiplier(U.str(args.scope, 'CURRENT'), Number(args.multiplier || 1), Number(args.duration || 0), U.str(args.stackRule, 'Replace'));
  });

  PluginManager.registerCommand(PLUGIN_NAME, 'GetReputationToVariable', args => {
    const varId = Number(args.variableId || 0);
    if (varId > 0) $gameVariables.setValue(varId, TownRepSystem.rep(argTown(args)));
  });

  PluginManager.registerCommand(PLUGIN_NAME, 'GetRankToVariables', args => {
    const tier = TownRepSystem.rank(argTown(args));
    const nameVarId = Number(args.varTierNameId || 0);
    const indexVarId = Number(args.varTierIndexId || 0);
    if (nameVarId > 0) $gameVariables.setValue(nameVarId, tier.tierName);
    if (indexVarId > 0) {
      const def = TownRepSystem.townDef(argTown(args));
      const idx = (def?.tiers || []).findIndex(t => t.tierName === tier.tierName);
      $gameVariables.setValue(indexVarId, idx >= 0 ? idx : 0);
    }
  });

  PluginManager.registerCommand(PLUGIN_NAME, 'RevealTownInMenu', args => {
    TownRepSystem.revealTown(U.str(args.townId, Config.defaultTownIdFallback), U.bool(args.reveal, true));
  });

  PluginManager.registerCommand(PLUGIN_NAME, 'SetCurrentTownOverride', args => {
    TownRepSystem.setTownOverride(U.str(args.townId, 'NONE'));
  });

  PluginManager.registerCommand(PLUGIN_NAME, 'RegisterDynamicTown', args => {
    TownRepSystem.registerDynamicTown(args.id, args.name, Number(args.defaultRep || 0), Number(args.minRep || Config.defaultMinRep), Number(args.maxRep || Config.defaultMaxRep));
  });

  PluginManager.registerCommand(PLUGIN_NAME, 'ShowRepToast', args => {
    const townId = argTown(args);
    const v = Number(args.deltaOrValue || 0);
    const mode = U.str(args.mode, 'ADD');
    if (mode === 'SET') {
      TownRepSystem.enqueueRepToast(townId, 0, v, { mode: 'SET', customText: U.str(args.customText, '') });
    } else {
      TownRepSystem.enqueueRepToast(townId, v, TownRepSystem.rep(townId), { mode: 'ADD', customText: U.str(args.customText, '') });
    }
  });

  PluginManager.registerCommand(PLUGIN_NAME, 'OpenReputationMenu', () => {
    if (Config.enableRepMenu) SceneManager.push(Scene_Reputation);
  });

  PluginManager.registerCommand(PLUGIN_NAME, 'AttemptTheft', args => {
    TownRepSystem.processTheft(args);
  });

  PluginManager.registerCommand(PLUGIN_NAME, 'ClearHeat', args => {
    TownRepSystem.clearHeat(argTown(args));
  });

  PluginManager.registerCommand(PLUGIN_NAME, 'SetHeat', args => {
    TownRepSystem.setHeat(argTown(args), Number(args.value || 0));
  });

  PluginManager.registerCommand(PLUGIN_NAME, 'ApplyAction', args => {
    const delta = Number(args.deltaOverride);
    TownRepSystem.applyAction(
      U.str(args.actionId, ''),
      U.str(args.townId, 'CURRENT'),
      delta === 999999 ? null : delta,
      { showToast: U.bool(args.showToast, true), reason: U.str(args.reason, '') }
    );
  });

  PluginManager.registerCommand(PLUGIN_NAME, 'ApplyActionFromVariable', args => {
    const actionId = String($gameVariables.value(Number(args.actionIdVarId || 0)) || '');
    const deltaVarId = Number(args.deltaVarId || 0);
    const delta = deltaVarId > 0 ? Number($gameVariables.value(deltaVarId) || 0) : null;
    TownRepSystem.applyAction(actionId, U.str(args.townId, 'CURRENT'), delta, { showToast: U.bool(args.showToast, true) });
  });

  PluginManager.registerCommand(PLUGIN_NAME, 'ChoiceAddRep', args => {
    TownRepSystem.addRep(argTown(args), Number(args.delta || 0), { showToast: U.bool(args.showToast, true), reason: U.str(args.reason, 'Choice') });
  });

  PluginManager.registerCommand(PLUGIN_NAME, 'ChoiceAddRepMultiTown', args => {
    const ids = String(args.townIdsCsv || '').split(',').map(s => s.trim()).filter(Boolean);
    const delta = Number(args.deltaEach || 0);
    ids.forEach(id => TownRepSystem.addRep(id, delta, { showToast: U.bool(args.showToast, true), reason: 'Choice MultiTown' }));
  });

  PluginManager.registerCommand(PLUGIN_NAME, 'DefinePendingChoiceRep', function(args) {
    const interpreter = this;
    TownRepSystem.definePendingChoice(interpreter, Number(args.choiceIndex || 0), {
      townId: argTown(args),
      delta: Number(args.delta || 0),
      showToast: U.bool(args.showToast, true),
      reason: U.str(args.reason, 'Pending Choice')
    });
  });

  PluginManager.registerCommand(PLUGIN_NAME, 'ClearPendingChoiceRep', function() {
    TownRepSystem.clearPendingChoice(this);
  });

  PluginManager.registerCommand(PLUGIN_NAME, 'CommitPendingChoiceRep', function() {
    const idx = $gameMessage.choiceResult ? $gameMessage.choiceResult() : 0;
    TownRepSystem.commitPendingChoice(this, idx);
  });
})();
