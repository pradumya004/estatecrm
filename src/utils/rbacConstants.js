// estatecrm/src/utils/rbacConstants.js
// SIMPLIFIED: Database-first permission checking

// =============================================================================
// PERMISSION CONSTANTS - For reference and type safety only
// =============================================================================
export const PERMISSIONS = {
    // Basic permissions
    VIEW_OWN_PROFILE: 'VIEW_OWN_PROFILE',
    EDIT_OWN_PROFILE: 'EDIT_OWN_PROFILE',
    VIEW_ASSIGNED_LEADS: 'VIEW_ASSIGNED_LEADS',
    VIEW_ASSIGNED_PROPERTIES: 'VIEW_ASSIGNED_PROPERTIES',
    ADD_NOTES_TO_LEADS: 'ADD_NOTES_TO_LEADS',
    UPDATE_LEAD_STATUS: 'UPDATE_LEAD_STATUS',
    CALL_LEADS: 'CALL_LEADS',
    CREATE_LEADS: 'CREATE_LEADS',

    // Team management
    VIEW_TEAM_LEADS: 'VIEW_TEAM_LEADS',
    ASSIGN_LEADS_TO_TEAM: 'ASSIGN_LEADS_TO_TEAM',
    VIEW_TEAM_PERFORMANCE: 'VIEW_TEAM_PERFORMANCE',
    MANAGE_TEAM_MEMBERS: 'MANAGE_TEAM_MEMBERS',
    VIEW_TEAM_HIERARCHY: 'VIEW_TEAM_HIERARCHY',

    // Branch management
    VIEW_BRANCH_AGENTS: 'VIEW_BRANCH_AGENTS',
    CREATE_AGENTS: 'CREATE_AGENTS',
    EDIT_TEAM_AGENTS: 'EDIT_TEAM_AGENTS',
    VIEW_BRANCH_ANALYTICS: 'VIEW_BRANCH_ANALYTICS',
    MANAGE_BRANCH_PROPERTIES: 'MANAGE_BRANCH_PROPERTIES',
    DELETE_AGENTS: 'DELETE_AGENTS',
    EDIT_LEADS: 'EDIT_LEADS',
    DELETE_LEADS: 'DELETE_LEADS',

    // Regional management
    VIEW_REGIONAL_DATA: 'VIEW_REGIONAL_DATA',
    MANAGE_BRANCHES: 'MANAGE_BRANCHES',
    REGIONAL_ANALYTICS: 'REGIONAL_ANALYTICS',
    BULK_OPERATIONS: 'BULK_OPERATIONS',
    IMPORT_EXPORT_DATA: 'IMPORT_EXPORT_DATA',

    // Executive level
    COMPANY_ANALYTICS: 'COMPANY_ANALYTICS',
    MANAGE_DEPARTMENTS: 'MANAGE_DEPARTMENTS',
    STRATEGIC_DECISIONS: 'STRATEGIC_DECISIONS',

    // Admin level
    FULL_SYSTEM_ACCESS: 'FULL_SYSTEM_ACCESS',
    MANAGE_ALL_USERS: 'MANAGE_ALL_USERS',
    SYSTEM_SETTINGS: 'SYSTEM_SETTINGS'
};

export const SPECIALIZATIONS = [
    { value: "residential", label: "Residential" },
    { value: "commercial", label: "Commercial" },
    { value: "industrial", label: "Industrial" },
    { value: "land", label: "Land" },
];

// =============================================================================
// SIMPLE PERMISSION CHECKING - Uses user.permissions array from database
// =============================================================================

// Main permission checker - Uses database permissions directly
export const hasPermission = (user, permission) => {
    if (!user || !permission) return false;

    // Admin has all permissions
    if (user.role === 'admin' || user.role === 'founding_member') return true;

    // Check database permissions array
    return user.permissions?.includes(permission) || false;
};

// Check multiple permissions with AND logic
export const hasAllPermissions = (user, permissions) => {
    if (!permissions || !Array.isArray(permissions)) return false;
    return permissions.every(permission => hasPermission(user, permission));
};

// Check multiple permissions with OR logic  
export const hasAnyPermission = (user, permissions) => {
    if (!permissions || !Array.isArray(permissions)) return false;
    return permissions.some(permission => hasPermission(user, permission));
};

// =============================================================================
// ROLE HIERARCHY - For role comparison only (not permission calculation)
// =============================================================================
export const ROLE_HIERARCHY = {
    'agent': 1,
    'relationship_manager': 2,
    'sr_relationship_manager': 3,
    'team_leader': 4,
    'sr_team_leader': 5,
    'branch_manager': 6,
    'sr_branch_manager': 7,
    'regional_manager': 8,
    'sr_regional_manager': 9,
    'avp': 10,
    'vp': 11,
    'founding_member': 12,
    'admin': 13
};

export const ROLE_LABELS = {
    'agent': 'Agent',
    'relationship_manager': 'Relationship Manager',
    'sr_relationship_manager': 'Sr. Relationship Manager',
    'team_leader': 'Team Leader',
    'sr_team_leader': 'Sr. Team Leader',
    'branch_manager': 'Branch Manager',
    'sr_branch_manager': 'Sr. Branch Manager',
    'regional_manager': 'Regional Manager',
    'sr_regional_manager': 'Sr. Regional Manager',
    'avp': 'AVP',
    'vp': 'V.P',
    'founding_member': 'Founding Member & Director',
    'admin': 'Administrator'
};

export const getRoleLevel = (role) => ROLE_HIERARCHY[role] || 1;
export const getRoleLabel = (role) => ROLE_LABELS[role] || role;

// Can manage role - based on hierarchy only (not permissions)
export const canManageRole = (managerRole, targetRole) => {
    const managerLevel = getRoleLevel(managerRole);
    const targetLevel = getRoleLevel(targetRole);
    return managerLevel > targetLevel;
};

// =============================================================================
// ORGANIZATIONAL CONSTANTS
// =============================================================================
export const DEPARTMENTS = ['Sales', 'Operations', 'Marketing', 'Customer Service', 'Business Development', 'Strategic Alliances', 'IT', 'HR', 'Finance'];

export const BRANCHES = [
    { value: "Mumbai Central", label: "Mumbai Central" },
    { value: "Mumbai West", label: "Mumbai West" },
    { value: "Mumbai East", label: "Mumbai East" },
    { value: "Delhi NCR", label: "Delhi NCR" },
    { value: "Bangalore Central", label: "Bangalore Central" },
    { value: "Bangalore North", label: "Bangalore North" },
    { value: "Pune Central", label: "Pune Central" },
    { value: "Chennai Central", label: "Chennai Central" },
    { value: "Hyderabad Central", label: "Hyderabad Central" },
    { value: "Kolkata Central", label: "Kolkata Central" },
];

export const REGIONS = [
    { value: "Western Region", label: "Western Region" },
    { value: "Northern Region", label: "Northern Region" },
    { value: "Southern Region", label: "Southern Region" },
    { value: "Eastern Region", label: "Eastern Region" },
    { value: "Central Region", label: "Central Region" },
];

// =============================================================================
// DEFAULT EXPORT
// =============================================================================
export default {
    PERMISSIONS,
    ROLE_HIERARCHY,
    ROLE_LABELS,
    DEPARTMENTS,
    BRANCHES,
    REGIONS,
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
    getRoleLevel,
    getRoleLabel,
    canManageRole
};