/**
 * Persistence-aligned entity types (Prisma models). Import here instead of scattering
 * `@prisma/client` across feature modules when you only need the record shape.
 */
export type {
  Page,
  Service,
  Lead,
  Inquiry,
  Settings,
  NavigationItem,
  SeoMetadata,
  MediaAsset,
} from '@prisma/client';

export type {
  PageStatus,
  ServiceCategory,
  ContentStatus,
  CrmLeadStatus,
  CrmPipelineStage,
  CrmPriority,
  CrmServiceType,
  CrmLeadSource,
  InquiryType,
  InquiryStatus,
  NavigationLocation,
  SiteLocale,
} from '@prisma/client';
