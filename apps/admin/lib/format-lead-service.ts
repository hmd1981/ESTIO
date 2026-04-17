/** Primary service line for inbox + detail: prefer human offer label from AI Studio / contact mapping. */
export function formatLeadServiceDisplay(lead: {
  serviceType: string;
  subServiceType: string | null;
  offerType?: string | null;
}): string {
  const offer = lead.offerType?.trim();
  if (offer) return offer;
  const sub = lead.subServiceType?.trim();
  if (sub) return `${lead.serviceType} · ${sub}`;
  return lead.serviceType;
}
