/**
 * Common administration utilities (legacy location).
 *
 * NOTE: The backend places these concepts under dz.sh.trc.hyflo.general.organization.
 * The frontend is transitioning to src/modules/general/organization.
 *
 * This file remains to avoid breaking existing imports.
 */

export type LocalizableEntity = Record<string, any>;

export const getLocalizedName = (entity: LocalizableEntity | null | undefined, lang: string): string => {
  if (!entity) return '';

  const l = (lang || 'en').toLowerCase();

  const pick = (keys: string[]): string | undefined => {
    for (const k of keys) {
      const v = entity?.[k];
      if (typeof v === 'string' && v.trim().length > 0) return v;
    }
    return undefined;
  };

  const ar = pick(['nameAr', 'designationAr']);
  const lt = pick(['nameLt', 'designationLt']);
  const en = pick(['nameEn', 'designationEn']);
  const fr = pick(['nameFr', 'designationFr', 'label']);

  if (l.startsWith('ar')) return ar || fr || en || lt || pick(['code']) || String(entity?.id ?? '');
  if (l.startsWith('fr')) return fr || en || lt || ar || pick(['code']) || String(entity?.id ?? '');
  if (l.startsWith('en')) return en || fr || lt || ar || pick(['code']) || String(entity?.id ?? '');

  return lt || en || fr || ar || pick(['code']) || String(entity?.id ?? '');
};
