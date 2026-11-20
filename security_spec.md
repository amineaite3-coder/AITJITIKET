# AITJITIKET Security Specification (Phase 0)

## 1. Data Invariants
1. **No Public Seller/Supplier Accounts**: Only verified AITJITIKET administrators (`isAdmin()`) can create, update, publish, unpublish, feature, or delete documents in `/events/{eventId}`.
2. **Published-Only Public Event Visibility**: Public visitors can only `get` or `list` `/events/{eventId}` documents where `resource.data.published == true`. Unpublished drafts are strictly admin-only.
3. **Strict Customer PII Isolation**: `/requests/{requestId}` documents contain customer PII (`fullName`, `email`, `whatsapp`) and private supplier/research notes (`privateNotes`). Therefore, `get`, `list`, `update`, and `delete` on `/requests/{requestId}` are strictly restricted to `isAdmin()`.
4. **Controlled Public Lead Submission**: Public visitors may `create` a document in `/requests/{requestId}` ONLY if:
   - `status == 'New Request'`
   - No admin-only fields (`privateNotes`, `offerTicketPrice`, `offerServiceFee`, `offerCurrency`, `offerCategory`, `offerMessage`, `offerSentAt`, `communications`) are included on create.
   - `createdAt == request.time && updatedAt == request.time`
   - All string lengths, numeric ranges (`ticketQuantity` 1..50, `maxBudgetPerTicket` >= 0), enums, and reference format (`^ATJ-[0-9]{4}-[A-Z0-9]{4,8}$`) are strictly valid.
   - If `requestType == 'catalog'` and `eventId` is provided, the referenced event exists in `/events/{eventId}`.
5. **Email Verification Enforcement**: Bootstrapped admin access checks `request.auth.token.email == 'newlifestore057@gmail.com' && request.auth.token.email_verified == true`.
6. **Immutable Creation Fields**: `createdAt`, `reference`, and `requestType` cannot be altered on update.

## 2. The "Dirty Dozen" Adversarial Payloads (Must Return PERMISSION_DENIED)
1. **Unauthenticated Event Creation**: Public user attempts `create` on `/events/ev1`.
2. **Unpublished Event Leak**: Public user attempts `get` on `/events/draft1` where `published: false`.
3. **Public Request Scraping (PII Blanket Attack)**: Unauthenticated or non-admin signed-in user attempts `list` or `get` on `/requests`.
4. **Shadow Field Injection on Request Create**: Public user submits a request with `isAdmin: true` or `privateNotes: "hacked"`.
5. **Status Skipping on Request Create**: Public user submits a request with `status: "Confirmed"` instead of `"New Request"`.
6. **Timestamp Spoofing on Request Create**: Public user submits `createdAt: "2020-01-01T00:00:00Z"` instead of `request.time`.
7. **ID Poisoning**: Public user attempts to create `/requests/` with an invalid 200-char or symbol-injected ID.
8. **Value Poisoning / Resource Exhaustion**: Public user submits `additionalInfo` of 5,000 characters (exceeds 2,000 max) or `ticketQuantity: 9999`.
9. **Non-Admin Request Update**: Non-admin authenticated user attempts to update `status` or `offerTicketPrice` on `/requests/req1`.
10. **Email Spoofing**: Authenticated user with `email: "newlifestore057@gmail.com"` and `email_verified: false` attempts admin read on `/requests`.
11. **Self-Assigned Admin Escalation**: Non-admin authenticated user attempts `create` on `/admins/{uid}` with `role: "admin"`.
12. **Orphaned Catalog Request**: Public user submits `requestType: "catalog"` with non-existent `eventId: "non_existent_event_123"`.
