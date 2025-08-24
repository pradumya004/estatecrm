// estatecrm/src/utils/rbacConstants.js

// RBAC Constants - Synchronized with Backend Constants
// CRITICAL: Must maintain exact synchronization with backend/src/utils/rbac.constants.js

// =============================================================================
// HIERARCHICAL ROLE STRUCTURE - BACKEND SYNCHRONIZED
// =============================================================================

// Role hierarchy with numerical levels for comparison and authorization
// Higher number = Higher authority level
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

// Role labels for UI display
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

// Organizational departments
export const DEPARTMENTS = [
    'Sales',
    'Operations',
    'Marketing',
    'Customer Service',
    'Business Development',
    'Strategic Alliances',
    'IT',
    'HR',
    'Finance'
];

// Designations by department
export const DESIGNATIONS_BY_DEPARTMENT = {
    'Sales': [
        'Relationship Manager',
        'Sr. Relationship Manager',
        'Team Leader',
        'Sr. Team Leader',
        'Branch Manager',
        'Sr. Branch Manager',
        'Regional Manager',
        'Sr. Regional Manager',
        'AVP',
        'V.P',
        'Founding Member & Director Sales & Strategic/Alliances'
    ],
    'Operations': [
        'Operation Analyst',
        'Sr. Operation Analyst',
        'Operations Manager',
        'Sr. Operations Manager'
    ],
    'Marketing': [
        'Marketing Executive',
        'Sr. Marketing Executive',
        'Marketing Manager',
        'Sr. Marketing Manager'
    ],
    'Customer Service': [
        'Customer Service Executive',
        'Sr. Customer Service Executive',
        'Customer Service Manager'
    ],
    'Business Development': [
        'Business Development Executive',
        'Sr. Business Development Executive',
        'Business Development Manager'
    ],
    'Strategic Alliances': [
        'Alliance Executive',
        'Alliance Manager',
        'Sr. Alliance Manager'
    ],
    'IT': [
        'IT Executive',
        'IT Manager',
        'IT Head'
    ],
    'HR': [
        'HR Executive',
        'HR Manager',
        'HR Head'
    ],
    'Finance': [
        'Finance Executive',
        'Finance Manager',
        'Finance Head'
    ],
    'Admin': [
        'Administrator',
        'System Administrator',
        'Super Admin'
    ]
};

// Flattened designations for schema enum
export const ALL_DESIGNATIONS = Object.values(DESIGNATIONS_BY_DEPARTMENT).flat();


// Complete permission enumeration aligned with backend RBAC system
// Each permission represents a specific system capability
export const PERMISSIONS = {
    // Basic permissions (all authenticated users)
    VIEW_OWN_PROFILE: 'VIEW_OWN_PROFILE',
    EDIT_OWN_PROFILE: 'EDIT_OWN_PROFILE',
    VIEW_ASSIGNED_LEADS: 'VIEW_ASSIGNED_LEADS',
    VIEW_ASSIGNED_PROPERTIES: 'VIEW_ASSIGNED_PROPERTIES',
    ADD_NOTES_TO_LEADS: 'ADD_NOTES_TO_LEADS',
    UPDATE_LEAD_STATUS: 'UPDATE_LEAD_STATUS',
    CALL_LEADS: 'CALL_LEADS',

    // Team management (Team Leader+)
    VIEW_TEAM_LEADS: 'VIEW_TEAM_LEADS',
    ASSIGN_LEADS_TO_TEAM: 'ASSIGN_LEADS_TO_TEAM',
    VIEW_TEAM_PERFORMANCE: 'VIEW_TEAM_PERFORMANCE',
    MANAGE_TEAM_MEMBERS: 'MANAGE_TEAM_MEMBERS',
    VIEW_TEAM_HIERARCHY: 'VIEW_TEAM_HIERARCHY',

    // Branch management (Branch Manager+)
    VIEW_BRANCH_AGENTS: 'VIEW_BRANCH_AGENTS',
    CREATE_AGENTS: 'CREATE_AGENTS',
    EDIT_TEAM_AGENTS: 'EDIT_TEAM_AGENTS',
    VIEW_BRANCH_ANALYTICS: 'VIEW_BRANCH_ANALYTICS',
    MANAGE_BRANCH_PROPERTIES: 'MANAGE_BRANCH_PROPERTIES',
    DELETE_AGENTS: 'DELETE_AGENTS',
    CREATE_LEADS: 'CREATE_LEADS',
    EDIT_LEADS: 'EDIT_LEADS',
    DELETE_LEADS: 'DELETE_LEADS',

    // Regional management (Regional Manager+)
    VIEW_REGIONAL_DATA: 'VIEW_REGIONAL_DATA',
    MANAGE_BRANCHES: 'MANAGE_BRANCHES',
    REGIONAL_ANALYTICS: 'REGIONAL_ANALYTICS',
    BULK_OPERATIONS: 'BULK_OPERATIONS',
    IMPORT_EXPORT_DATA: 'IMPORT_EXPORT_DATA',

    // Executive level (AVP+)
    COMPANY_ANALYTICS: 'COMPANY_ANALYTICS',
    MANAGE_DEPARTMENTS: 'MANAGE_DEPARTMENTS',
    STRATEGIC_DECISIONS: 'STRATEGIC_DECISIONS',

    // Admin level
    FULL_SYSTEM_ACCESS: 'FULL_SYSTEM_ACCESS',
    MANAGE_ALL_USERS: 'MANAGE_ALL_USERS',
    SYSTEM_SETTINGS: 'SYSTEM_SETTINGS'
};

// Permission levels mapped to role hierarchy levels - SYNCHRONIZED WITH FRONTEND
export const PERMISSION_LEVELS = {
    // Basic permissions (level 1+)
    [PERMISSIONS.VIEW_OWN_PROFILE]: 1,
    [PERMISSIONS.EDIT_OWN_PROFILE]: 1,
    [PERMISSIONS.VIEW_ASSIGNED_LEADS]: 1,
    [PERMISSIONS.VIEW_ASSIGNED_PROPERTIES]: 1,
    [PERMISSIONS.ADD_NOTES_TO_LEADS]: 1,
    [PERMISSIONS.UPDATE_LEAD_STATUS]: 1,
    [PERMISSIONS.CALL_LEADS]: 1,
    [PERMISSIONS.CREATE_LEADS]: 1,
    [PERMISSIONS.VIEW_TEAM_PERFORMANCE]: 1,
    [PERMISSIONS.VIEW_TEAM_HIERARCHY]: 1,

    // Team management (level 4+)
    [PERMISSIONS.VIEW_TEAM_LEADS]: 4,
    [PERMISSIONS.ASSIGN_LEADS_TO_TEAM]: 4,
    [PERMISSIONS.VIEW_TEAM_PERFORMANCE]: 4,
    [PERMISSIONS.MANAGE_TEAM_MEMBERS]: 4,
    [PERMISSIONS.VIEW_TEAM_HIERARCHY]: 4,

    // Branch management (level 6+)
    [PERMISSIONS.VIEW_BRANCH_AGENTS]: 6,
    [PERMISSIONS.CREATE_AGENTS]: 6,
    [PERMISSIONS.EDIT_TEAM_AGENTS]: 6,
    [PERMISSIONS.VIEW_BRANCH_ANALYTICS]: 6,
    [PERMISSIONS.MANAGE_BRANCH_PROPERTIES]: 6,
    [PERMISSIONS.DELETE_AGENTS]: 6,
    [PERMISSIONS.CREATE_LEADS]: 6,
    [PERMISSIONS.EDIT_LEADS]: 6,
    [PERMISSIONS.DELETE_LEADS]: 6,

    // Regional management (level 8+)
    [PERMISSIONS.VIEW_REGIONAL_DATA]: 8,
    [PERMISSIONS.MANAGE_BRANCHES]: 8,
    [PERMISSIONS.REGIONAL_ANALYTICS]: 8,
    [PERMISSIONS.BULK_OPERATIONS]: 8,
    [PERMISSIONS.IMPORT_EXPORT_DATA]: 8,

    // Executive level (level 10+)
    [PERMISSIONS.COMPANY_ANALYTICS]: 10,
    [PERMISSIONS.MANAGE_DEPARTMENTS]: 10,
    [PERMISSIONS.STRATEGIC_DECISIONS]: 10,

    // Admin level (level 13)
    [PERMISSIONS.FULL_SYSTEM_ACCESS]: 13,
    [PERMISSIONS.MANAGE_ALL_USERS]: 13,
    [PERMISSIONS.SYSTEM_SETTINGS]: 13
};


// =========================================================================
// ORGANIZATIONAL CONSTANTS - BACKEND SYNCHRONIZED (MISSING FROM FRONTEND)
// =========================================================================

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

export const SPECIALIZATIONS = [
    { value: "residential", label: "Residential" },
    { value: "commercial", label: "Commercial" },
    { value: "industrial", label: "Industrial" },
    { value: "land", label: "Land" },
];



// ==================================================
// CORE RBAC UTILITY FUNCTIONS - BACKEND SYNCHRONIZED
// ==================================================

// Check if user has specific permission
export const hasPermission = (userRole, permission) => {
    const userLevel = getRoleLevel(userRole);
    const requiredLevel = PERMISSION_LEVELS[permission];

    if (!requiredLevel) {
        console.warn(`Unknown permission: ${permission}`);
        return false;
    }

    return userLevel >= requiredLevel;
};

// Check if user has all specified permissions (AND logic)
export const hasAllPermissions = (userRole, permissions) => {
    return permissions.every(permission => hasPermission(userRole, permission));
};

// Check if user has any of the specified permissions (OR logic)
export const hasAnyPermission = (userRole, permissions) => {
    return permissions.some(permission => hasPermission(userRole, permission));
};

// Get role level for comparison
export const getRoleLevel = (role) => {
    return ROLE_HIERARCHY[role] || 1;
};

// Check if manager can manage target role
export const canManageRole = (managerRole, targetRole) => {
    const managerLevel = getRoleLevel(managerRole);
    const targetLevel = getRoleLevel(targetRole);
    return managerLevel >= targetLevel;
};

// Get roles that can be managed by current role
export const getManagedRoles = (role) => {
    const level = getRoleLevel(role);
    return Object.keys(ROLE_HIERARCHY).filter(r => ROLE_HIERARCHY[r] < level);
};

// Get available roles for creation based on current user role
export const getAvailableRolesForCreation = (currentUserRole) => {
    const currentLevel = getRoleLevel(currentUserRole);
    return Object.entries(ROLE_HIERARCHY)
        .filter(([role, level]) => level < currentLevel)
        .map(([role]) => role);
};

// Get all permissions for a role
export const getRolePermissions = (role) => {
    const userLevel = getRoleLevel(role);
    const permissions = [];

    Object.entries(PERMISSION_LEVELS).forEach(([permission, requiredLevel]) => {
        if (userLevel >= requiredLevel) {
            permissions.push(permission);
        }
    });

    return permissions;
};

// Get user permissions (alias for getRolePermissions)
export const getUserPermissions = (userRole) => {
    return getRolePermissions(userRole);
};



// ======================================================
// HIERARCHICAL CHECKING FUNCTIONS - BACKEND SYNCHRONIZED
// ======================================================

// Check if role1 is higher than role2 in hierarchy
export const isHigherRole = (role1, role2) => {
    return getRoleLevel(role1) > getRoleLevel(role2);
};

// Check if role1 is equal or higher than role2 in hierarchy
export const isEqualOrHigherRole = (role1, role2) => {
    return getRoleLevel(role1) >= getRoleLevel(role2);
};

// Get all roles that are subordinate to the given role
export const getSubordinateRoles = (role) => {
    const level = getRoleLevel(role);
    return Object.keys(ROLE_HIERARCHY).filter(r => ROLE_HIERARCHY[r] < level);
};

// Get all roles that are superior to the given role  
export const getSuperiorRoles = (role) => {
    const level = getRoleLevel(role);
    return Object.keys(ROLE_HIERARCHY).filter(r => ROLE_HIERARCHY[r] > level);
};

// Get available roles that can be assigned by current user
export const getAssignableRoles = (currentUserRole) => {
    return getSubordinateRoles(currentUserRole);
};


// ========================================
// DATA SCOPE AND ACCESS CONTROL UTILITIES
// ========================================

// Get data scope for user based on role and geographical assignment
export const getDataScope = (userRole, userBranch, userRegion) => {
    const level = getRoleLevel(userRole);

    if (userRole === 'admin') {
        return { type: 'all', description: 'Full system access' };
    }

    if (level >= ROLE_HIERARCHY.regional_manager) {
        return {
            type: 'region',
            region: userRegion,
            description: 'Regional data access'
        };
    }

    if (level >= ROLE_HIERARCHY.branch_manager) {
        return {
            type: 'branch',
            branch: userBranch,
            description: 'Branch data access'
        };
    }

    if (level >= ROLE_HIERARCHY.team_leader) {
        return {
            type: 'team',
            leader: userRole,
            description: 'Team data access'
        };
    }

    return {
        type: 'own',
        user: userRole,
        description: 'Personal data only'
    };
};

// Check if agent can access specific resource
export const canAccessResource = (agentRole, agentBranch, agentRegion, resource, resourceType = 'lead') => {
    const agentLevel = getRoleLevel(agentRole);

    // Admin can access everything
    if (agentRole === 'admin') return true;

    // If it's the agent's own resource
    if (resource.assignedAgent && resource.assignedAgent.toString() === agentRole.toString()) {
        return true;
    }

    // Team leaders can access their team's resources
    if (agentLevel >= ROLE_HIERARCHY.team_leader && resource.assignedAgent?.reportsTo === agentRole) {
        return true;
    }

    // Branch managers can access branch resources
    if (agentLevel >= ROLE_HIERARCHY.branch_manager && agentBranch === resource.assignedAgent?.branch) {
        return true;
    }

    // Regional managers can access regional resources
    if (agentLevel >= ROLE_HIERARCHY.regional_manager && agentRegion === resource.assignedAgent?.region) {
        return true;
    }

    return false;
};

// Check if user can access specific agent data (FRONTEND SPECIFIC)
export const canAccessAgent = (currentUserRole, targetAgentId, currentUserId) => {
    // Admin and founding members can access all
    if (currentUserRole === 'admin' || currentUserRole === 'founding_member') {
        return true;
    }

    // Users can always access their own profile
    if (targetAgentId === currentUserId) {
        return true;
    }

    // For other access, check management permissions
    return hasAnyPermission(currentUserRole, [
        PERMISSIONS.VIEW_TEAM_HIERARCHY,
        PERMISSIONS.MANAGE_TEAM_MEMBERS,
        PERMISSIONS.VIEW_BRANCH_AGENTS,
        PERMISSIONS.MANAGE_BRANCHES
    ]);
};

// ===========================
// PERMISSION GROUP CONSTANTS
// ===========================

// Permission groups for efficient multi-permission checks
export const PERMISSION_GROUPS = {
    BASIC_AGENT: [
        PERMISSIONS.VIEW_OWN_PROFILE,
        PERMISSIONS.EDIT_OWN_PROFILE,
        PERMISSIONS.VIEW_ASSIGNED_LEADS,
        PERMISSIONS.VIEW_ASSIGNED_PROPERTIES,
        PERMISSIONS.ADD_NOTES_TO_LEADS,
        PERMISSIONS.UPDATE_LEAD_STATUS,
        PERMISSIONS.CALL_LEADS
    ],

    TEAM_MANAGEMENT: [
        PERMISSIONS.VIEW_TEAM_LEADS,
        PERMISSIONS.ASSIGN_LEADS_TO_TEAM,
        PERMISSIONS.VIEW_TEAM_PERFORMANCE,
        PERMISSIONS.MANAGE_TEAM_MEMBERS,
        PERMISSIONS.VIEW_TEAM_HIERARCHY
    ],

    BRANCH_MANAGEMENT: [
        PERMISSIONS.VIEW_BRANCH_AGENTS,
        PERMISSIONS.CREATE_AGENTS,
        PERMISSIONS.EDIT_TEAM_AGENTS,
        PERMISSIONS.VIEW_BRANCH_ANALYTICS,
        PERMISSIONS.MANAGE_BRANCH_PROPERTIES,
        PERMISSIONS.DELETE_AGENTS,
        PERMISSIONS.CREATE_LEADS,
        PERMISSIONS.EDIT_LEADS,
        PERMISSIONS.DELETE_LEADS
    ],

    REGIONAL_MANAGEMENT: [
        PERMISSIONS.VIEW_REGIONAL_DATA,
        PERMISSIONS.MANAGE_BRANCHES,
        PERMISSIONS.REGIONAL_ANALYTICS,
        PERMISSIONS.BULK_OPERATIONS,
        PERMISSIONS.IMPORT_EXPORT_DATA
    ],

    EXECUTIVE_MANAGEMENT: [
        PERMISSIONS.COMPANY_ANALYTICS,
        PERMISSIONS.MANAGE_DEPARTMENTS,
        PERMISSIONS.STRATEGIC_DECISIONS
    ],

    ADMINISTRATIVE: [
        PERMISSIONS.FULL_SYSTEM_ACCESS,
        PERMISSIONS.MANAGE_ALL_USERS,
        PERMISSIONS.SYSTEM_SETTINGS
    ]
};



// ==============================
// VALIDATION AND DEBUG UTILITIES
// ==============================

// Validate role assignment based on current user permissions
export const validateRoleAssignment = (currentUserRole, targetRole, assignmentContext = {}) => {
    const errors = [];

    if (!canManageRole(currentUserRole, targetRole)) {
        errors.push(`Cannot assign role '${targetRole}' - insufficient permission level`);
    }

    if (!ROLE_HIERARCHY[targetRole]) {
        errors.push(`Invalid role: '${targetRole}'`);
    }

    if (assignmentContext.department && !DEPARTMENTS.includes(assignmentContext.department)) {
        errors.push(`Invalid department: '${assignmentContext.department}'`);
    }

    return {
        isValid: errors.length === 0,
        errors,
        canAssign: errors.length === 0
    };
};

// Get role context for UI display
export const getRoleContext = (role) => {
    return {
        role,
        label: ROLE_LABELS[role] || role,
        level: getRoleLevel(role),
        permissions: getRolePermissions(role),
        managedRoles: getManagedRoles(role),
        dataScope: getDataScope(role),
        canCreateAgents: hasPermission(role, PERMISSIONS.CREATE_AGENTS),
        canManageTeam: hasPermission(role, PERMISSIONS.MANAGE_TEAM_MEMBERS),
        canViewAnalytics: hasPermission(role, PERMISSIONS.VIEW_BRANCH_ANALYTICS)
    };
};

// ====================
// UI HELPER FUNCTIONS
// ====================

export const getPermissionLabel = (permission) => {
    const labels = {
        [PERMISSIONS.VIEW_OWN_PROFILE]: 'View Own Profile',
        [PERMISSIONS.EDIT_OWN_PROFILE]: 'Edit Own Profile',
        [PERMISSIONS.VIEW_ASSIGNED_LEADS]: 'View Assigned Leads',
        [PERMISSIONS.VIEW_ASSIGNED_PROPERTIES]: 'View Assigned Properties',
        [PERMISSIONS.ADD_NOTES_TO_LEADS]: 'Add Notes to Leads',
        [PERMISSIONS.UPDATE_LEAD_STATUS]: 'Update Lead Status',
        [PERMISSIONS.CALL_LEADS]: 'Call Leads',
        [PERMISSIONS.VIEW_TEAM_LEADS]: 'View Team Leads',
        [PERMISSIONS.ASSIGN_LEADS_TO_TEAM]: 'Assign Leads to Team',
        [PERMISSIONS.VIEW_TEAM_PERFORMANCE]: 'View Team Performance',
        [PERMISSIONS.MANAGE_TEAM_MEMBERS]: 'Manage Team Members',
        [PERMISSIONS.VIEW_TEAM_HIERARCHY]: 'View Team Hierarchy',
        [PERMISSIONS.VIEW_BRANCH_AGENTS]: 'View Branch Agents',
        [PERMISSIONS.CREATE_AGENTS]: 'Create Agents',
        [PERMISSIONS.EDIT_TEAM_AGENTS]: 'Edit Team Agents',
        [PERMISSIONS.VIEW_BRANCH_ANALYTICS]: 'View Branch Analytics',
        [PERMISSIONS.MANAGE_BRANCH_PROPERTIES]: 'Manage Branch Properties',
        [PERMISSIONS.DELETE_AGENTS]: 'Delete Agents',
        [PERMISSIONS.CREATE_LEADS]: 'Create Leads',
        [PERMISSIONS.EDIT_LEADS]: 'Edit Leads',
        [PERMISSIONS.DELETE_LEADS]: 'Delete Leads',
        [PERMISSIONS.VIEW_REGIONAL_DATA]: 'View Regional Data',
        [PERMISSIONS.MANAGE_BRANCHES]: 'Manage Branches',
        [PERMISSIONS.REGIONAL_ANALYTICS]: 'Regional Analytics',
        [PERMISSIONS.BULK_OPERATIONS]: 'Bulk Operations',
        [PERMISSIONS.IMPORT_EXPORT_DATA]: 'Import/Export Data',
        [PERMISSIONS.COMPANY_ANALYTICS]: 'Company Analytics',
        [PERMISSIONS.MANAGE_DEPARTMENTS]: 'Manage Departments',
        [PERMISSIONS.STRATEGIC_DECISIONS]: 'Strategic Decisions',
        [PERMISSIONS.FULL_SYSTEM_ACCESS]: 'Full System Access',
        [PERMISSIONS.MANAGE_ALL_USERS]: 'Manage All Users',
        [PERMISSIONS.SYSTEM_SETTINGS]: 'System Settings'
    };
    return labels[permission] || permission;
};

export const getRoleLabel = (role) => {
    return ROLE_LABELS[role] || role;
};


// =============================================================================
// DEBUG UTILITIES
// =============================================================================

// Debug utility to log user permissions
export const debugUserPermissions = (userRole, detailed = false) => {
    if (!userRole) {
        console.log('No user role provided');
        return;
    }

    const permissions = getUserPermissions(userRole);
    const level = getRoleLevel(userRole);

    console.log(`RBAC Debug for Role: ${userRole}`);
    console.log(`Hierarchy Level: ${level}`);
    console.log(`Total Permissions: ${permissions.length}`);

    if (detailed) {
        console.log('Detailed Permissions:');
        permissions.forEach(permission => {
            console.log(`   ✓ ${permission}`);
        });
    }
};

// Validate RBAC configuration integrity
export const validateRBACConfiguration = () => {
    const errors = [];
    const warnings = [];

    // Check if all permissions have level definitions
    Object.values(PERMISSIONS).forEach(permission => {
        if (!PERMISSION_LEVELS[permission]) {
            errors.push(`Permission '${permission}' missing level definition`);
        }
    });

    // Check for undefined permissions in level definitions
    Object.keys(PERMISSION_LEVELS).forEach(permission => {
        if (!Object.values(PERMISSIONS).includes(permission)) {
            errors.push(`Permission level defined for undefined permission: ${permission}`);
        }
    });

    return {
        isValid: errors.length === 0,
        errors,
        warnings,
        summary: `${errors.length} errors, ${warnings.length} warnings`
    };
};

// Export validation result for immediate feedback
export const RBAC_VALIDATION = validateRBACConfiguration();


// ==================================
// DEFAULT EXPORT WITH ALL FUNCTIONS
// ==================================

export default {
    PERMISSIONS,
    ROLE_HIERARCHY,
    PERMISSION_LEVELS,
    BRANCHES,
    REGIONS,
    SPECIALIZATIONS,
    DEPARTMENTS,
    ROLE_LABELS,
    PERMISSION_GROUPS,

    // Core functions
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
    getRoleLevel,
    canManageRole,
    getManagedRoles,
    getAvailableRolesForCreation,
    getRolePermissions,
    getUserPermissions,

    // Hierarchical functions
    isHigherRole,
    isEqualOrHigherRole,
    getSubordinateRoles,
    getSuperiorRoles,
    getAssignableRoles,

    // Data scope functions
    getDataScope,
    canAccessResource,
    canAccessAgent,

    // Validation functions
    validateRoleAssignment,
    getRoleContext,

    // UI helpers
    getPermissionLabel,
    getRoleLabel,

    // Debug utilities
    debugUserPermissions,
    validateRBACConfiguration,
    RBAC_VALIDATION
};