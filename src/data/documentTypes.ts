import type { Key } from '../i18n';
import type { IconName } from '../components/Icon';

// Щоб додати новий тип документа: додай запис сюди й переклади в src/i18n.tsx.
export type DocumentTypeId = 'residenceCard' | 'visa' | 'lease' | 'insurance' | 'passport';

export interface DocumentType {
  id: DocumentTypeId;
  title: Key;
  subtitle: Key;
  icon: IconName;
}

export const documentTypes: Record<DocumentTypeId, DocumentType> = {
  residenceCard: { id: 'residenceCard', title: 'type.residenceCard', subtitle: 'type.residenceCard.sub', icon: 'idCard' },
  visa: { id: 'visa', title: 'type.visa', subtitle: 'type.visa.sub', icon: 'stamp' },
  lease: { id: 'lease', title: 'type.lease', subtitle: 'type.lease.sub', icon: 'home' },
  insurance: { id: 'insurance', title: 'type.insurance', subtitle: 'type.insurance.sub', icon: 'shield' },
  passport: { id: 'passport', title: 'type.passport', subtitle: 'type.passport.sub', icon: 'book' },
};
