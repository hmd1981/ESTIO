/**
 * Default response templates seeded into MessageTemplate on first run.
 * Each template uses {{interpolation}} variables:
 *   {{firstName}}, {{company}}, {{serviceType}}, {{missingFields}}, {{dealPath}}, {{reason}}
 */
export const DEFAULT_RESPONSE_TEMPLATES = [
  {
    name: 'ready-enterprise',
    channel: 'EMAIL' as const,
    subject: 'Estio — Qualified: {{serviceType}} engagement for {{company}}',
    body: `{{firstName}},

Your submission has been classified and qualified under {{serviceType}}.

Scope validation summary:
— Deal path: {{dealPath}}
— Organisation: {{company}}
— Classification: Qualified for scoping

Next step — scoping call (20–30 minutes):
1. Confirm the systems in scope (read/write inventory)
2. Validate the internal owner for access and production go-live
3. Define phase-one acceptance criteria and stop conditions
4. Agree on discovery deliverables before any commercial proposal

We will send a scheduling link within one business day. If you cannot confirm these items during the call, the engagement pauses until prerequisites are documented.

No proposal is issued before scope boundaries are mutual.

Estio — Scoped Delivery
estio.org`,
  },
  {
    name: 'ready-general',
    channel: 'EMAIL' as const,
    subject: 'Estio — Scope confirmed: {{serviceType}}',
    body: `{{firstName}},

Your submission under {{serviceType}} has been reviewed and qualified for scoping.

Next step:
We will send a scoping-call slot within one business day. The call covers:
— Confirm objectives, constraints, and success criteria
— Validate timeline and internal approval path
— Define deliverables before any proposal is issued

If your requirements change before the call, reply to this message with the update.

Estio — Scoped Delivery
estio.org`,
  },
  {
    name: 'clarify-enterprise',
    channel: 'EMAIL' as const,
    subject: 'Estio — Clarification required: {{serviceType}} qualification',
    body: `{{firstName}},

Your enterprise submission under {{serviceType}} has been received but cannot advance to qualification without the following:

{{missingFields}}

We do not schedule scoping calls or produce proposals without these inputs. Incomplete briefs produce wrong scopes — and wrong scopes produce failed engagements.

Reply to this message with the missing items. Be specific:
— Name systems, not categories
— Name the internal owner, not the department
— State the workflow, not the aspiration

If we do not receive a response within 5 business days, this submission will be archived.

Estio — Scoped Delivery
estio.org`,
  },
  {
    name: 'clarify-general',
    channel: 'EMAIL' as const,
    subject: 'Estio — Additional information needed',
    body: `{{firstName}},

Your enquiry under {{serviceType}} has been received. To proceed with a structured scope assessment, we need:

{{missingFields}}

Please reply with these details. Specific inputs reduce back-and-forth and allow us to assess fit and effort accurately.

If we do not receive a response within 5 business days, this submission will be archived.

Estio — Scoped Delivery
estio.org`,
  },
  {
    name: 'decline-enterprise',
    channel: 'EMAIL' as const,
    subject: 'Estio — Submission declined',
    body: `{{firstName}},

Your enterprise enquiry does not meet the qualification threshold for a scoped engagement.

Reason: {{reason}}

This is a fit decision, not a capacity issue. Enterprise engagements require:
— Named systems in scope with read/write boundaries
— An internal owner who can approve access and production changes
— A bounded workflow with identifiable monthly volume

If your requirements evolve to meet these prerequisites, you are welcome to resubmit with the specifics.

Estio — Scoped Delivery
estio.org`,
  },
  {
    name: 'decline-general',
    channel: 'EMAIL' as const,
    subject: 'Estio — Enquiry declined',
    body: `{{firstName}},

Your enquiry does not currently meet the threshold for a scoped engagement.

Reason: {{reason}}

If your requirements become more defined — specifically, if you can state the outcome, constraints, and timeline — you are welcome to resubmit.

Estio — Scoped Delivery
estio.org`,
  },
  {
    name: 'ready-enterprise',
    channel: 'WHATSAPP' as const,
    subject: null,
    body: `{{firstName}} — Estio here.

Your {{serviceType}} submission for {{company}} has been qualified.

Next: We will send a scoping-call slot within 1 business day.

Prepare:
• Systems in scope (read/write)
• Internal owner for access + go-live
• Phase-one success criteria

No proposal until scope is mutual.`,
  },
  {
    name: 'clarify-enterprise',
    channel: 'WHATSAPP' as const,
    subject: null,
    body: `{{firstName}} — Estio here.

Your {{serviceType}} submission was received but cannot proceed.

Missing: {{missingFields}}

Reply with specifics. No scoping call without these inputs.

5 business days to respond, then archived.`,
  },
  {
    name: 'decline-enterprise',
    channel: 'WHATSAPP' as const,
    subject: null,
    body: `{{firstName}} — Estio.

Your enterprise enquiry has been declined.

Reason: {{reason}}

Resubmit with named systems, an internal owner, and a bounded workflow if requirements change.`,
  },
];
