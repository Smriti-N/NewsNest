export const CATEGORY_ICONS = {
  all: 'grid',
  technology: 'cpu',
  business: 'briefcase',
  sports: 'award',
  politics: 'users',
  health: 'heart',
  science: 'zap',
  entertainment: 'film',
  world: 'globe',
  india: 'flag',
};

export function categoryName(slug = '') {
  return slug.charAt(0).toUpperCase() + slug.slice(1);
}
