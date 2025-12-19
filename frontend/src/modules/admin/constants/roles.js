// Admin roles and permissions
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  EDITOR: 'editor',
  MODERATOR: 'moderator'
};

export const PERMISSIONS = {
  // News Management
  CREATE_NEWS: 'create_news',
  EDIT_NEWS: 'edit_news',
  DELETE_NEWS: 'delete_news',
  PUBLISH_NEWS: 'publish_news',
  
  // Category Management
  MANAGE_CATEGORIES: 'manage_categories',
  
  // User Management
  MANAGE_USERS: 'manage_users',
  
  // Settings
  MANAGE_SETTINGS: 'manage_settings',
  
  // Analytics
  VIEW_ANALYTICS: 'view_analytics'
};

export const ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS),
  [ROLES.ADMIN]: [
    PERMISSIONS.CREATE_NEWS,
    PERMISSIONS.EDIT_NEWS,
    PERMISSIONS.DELETE_NEWS,
    PERMISSIONS.PUBLISH_NEWS,
    PERMISSIONS.MANAGE_CATEGORIES,
    PERMISSIONS.VIEW_ANALYTICS
  ],
  [ROLES.EDITOR]: [
    PERMISSIONS.CREATE_NEWS,
    PERMISSIONS.EDIT_NEWS,
    PERMISSIONS.PUBLISH_NEWS
  ],
  [ROLES.MODERATOR]: [
    PERMISSIONS.EDIT_NEWS
  ]
};

