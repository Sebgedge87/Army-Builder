/**
 * @typedef {{ movement: number, melee: number, ranged: number, defence: number, morale: number, wounds: number }} UnitStats
 */

/**
 * @typedef {{ name: string, range: string, attacks: number, damage: number, armourPiercing: string }} Weapon
 */

/**
 * @typedef {{ id: string, accepts: string[], max: number }} AttachmentSlot
 */

/**
 * @typedef {{ target: 'host'|'self'|'combined', stat?: string, op?: '+'|'-'|'set'|'min'|'max', value?: number, rule?: string, condition?: string }} Grant
 */

/**
 * @typedef {Object} Unit
 * @property {string} id
 * @property {string} name
 * @property {'Good'|'Evil'|'Mercenary'} faction
 * @property {string} race
 * @property {string[]} types
 * @property {number} points
 * @property {UnitStats} stats
 * @property {Weapon[]} weapons
 * @property {string[]} keywords
 * @property {string[]} specialRules
 * @property {string} [flavorText]
 * @property {{ full: string, card: string, thumb: string, icon: string }} [images]
 * @property {{ role: 'host'|'attachment'|'both', asHost?: { slots: AttachmentSlot[] }, asAttachment?: { attachmentType: string, canAttachTo: { types: string[], keywords: string[], unitIds: string[] }, grants: Grant[] } }} [attachable]
 */

/**
 * @typedef {Object} ArmyUnit
 * @property {string} instanceId
 * @property {string} unitId
 * @property {number} count
 * @property {string[]} [attachments]
 * @property {string} [attachedTo]
 */

/**
 * @typedef {Object} Army
 * @property {string} id
 * @property {string} userId
 * @property {string} name
 * @property {string} systemId
 * @property {'Good'|'Evil'|'Mercenary'} faction
 * @property {ArmyUnit[]} units
 * @property {number} totalPoints
 * @property {boolean} isPublic
 * @property {string|null} shareToken
 * @property {import('firebase/firestore').Timestamp} createdAt
 * @property {import('firebase/firestore').Timestamp} updatedAt
 */

/**
 * @typedef {Object} User
 * @property {string} uid
 * @property {string} email
 * @property {string} displayName
 * @property {boolean} isAdmin
 * @property {import('firebase/firestore').Timestamp} createdAt
 * @property {{ layout?: 'compact'|'cards'|'tactical', darkMode?: boolean }} [prefs]
 */

/**
 * @typedef {Object} SystemManifest
 * @property {string} id
 * @property {string} name
 * @property {{ pointLimit: number }} rules
 * @property {string[]} factions
 */
