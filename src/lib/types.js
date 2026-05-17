/**
 * JSDoc type definitions for the CFB Army Builder.
 * These are documentation-only — no runtime cost.
 */

/**
 * @typedef {Object} StatBlock
 * @property {number} movement
 * @property {number} melee
 * @property {number} ranged
 * @property {number} defence
 * @property {number} morale
 * @property {number} wounds
 */

/**
 * @typedef {Object} UnitImages
 * @property {string} [full]
 * @property {string} [card]
 * @property {string} [thumb]
 * @property {string} [icon]
 */

/**
 * @typedef {Object} AttachmentSlot
 * @property {string}   id
 * @property {string[]} accepts
 * @property {number}   max
 */

/**
 * @typedef {Object} Grant
 * @property {'host'|'self'|'combined'} target
 * @property {string}  [stat]
 * @property {string}  [rule]
 * @property {string}  op
 * @property {number}  [value]
 * @property {string}  [condition]
 */

/**
 * @typedef {Object} Unit
 * @property {string}     id
 * @property {string}     name
 * @property {string}     faction
 * @property {string}     race
 * @property {string[]}   types
 * @property {number}     points
 * @property {StatBlock}  stats
 * @property {Object[]}   weapons
 * @property {string[]}   keywords
 * @property {string[]}   specialRules
 * @property {string}     [flavorText]
 * @property {UnitImages} images
 * @property {Object}     [attachable]
 */

/**
 * @typedef {Object} ArmyUnit
 * @property {string}   instanceId
 * @property {string}   unitId
 * @property {number}   count
 * @property {string[]} [attachments]
 * @property {string}   [attachedTo]
 */

/**
 * @typedef {Object} Army
 * @property {string}     id
 * @property {string}     userId
 * @property {string}     name
 * @property {string}     systemId
 * @property {string}     faction
 * @property {ArmyUnit[]} units
 * @property {number}     totalPoints
 * @property {boolean}    isPublic
 * @property {string|null} shareToken
 * @property {Date}       createdAt
 * @property {Date}       updatedAt
 */

/**
 * @typedef {Object} User
 * @property {string}  uid
 * @property {string}  email
 * @property {string}  displayName
 * @property {boolean} isAdmin
 * @property {Object}  [prefs]
 */

/**
 * @typedef {Object} SystemManifest
 * @property {string} id
 * @property {string} name
 * @property {Object} rules
 * @property {number} rules.pointLimit
 * @property {string[]} factions
 */
