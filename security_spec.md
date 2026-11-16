# Security Specification — Soliman Gold (Firestore)

## 1. Data Invariants
1. **Admin-Only Mutations:** Only authenticated, email-verified store administrators (`request.auth.token.email_verified == true` and either matching the bootstrapped owner email `sandidodo80@gmail.com` or having an existing document in `/admins/{uid}`) can create, update, or delete any document in `products`, `categories`, `settings`, `adminConfig`, `media`, or `admins`.
2. **PII & Secret Isolation:** Public store settings (`/settings/store`) contain zero personal user PII or secrets. The admin PIN is strictly isolated in `/adminConfig/security`, which denies all unauthenticated or non-admin reads and writes.
3. **Path Variable & Payload Size Hardening:** All document IDs must satisfy `^[a-zA-Z0-9_\-]+$` and `<= 128` chars. All string fields and arrays (`images` <= 20) have strict upper bounds.
4. **Immutable & Server-Enforced Timestamps:** `createdAt` must equal `request.time` on creation and remain immutable on updates; `updatedAt` must equal `request.time` on every creation and update.
5. **Strict Key Allowlisting:** Every `create` verifies `hasAll(...)` and `hasOnly(...)`; every `update` begins with `isValid[Entity](incoming())` and enforces `affectedKeys().hasOnly(...)` + immutable `id`.

## 2. The "Dirty Dozen" Attack Payloads (All Expected: `PERMISSION_DENIED`)
1. **Unauthenticated Product Write:** Unauthenticated user attempts `POST /products/prod-hack` -> Denied (`isAdmin()` false).
2. **Unverified Email Spoofing:** Authenticated user with `email: "sandidodo80@gmail.com"` and `email_verified: false` attempts write -> Denied (`email_verified == true` required).
3. **Self-Assigned Admin Escalation:** Non-admin user tries to create `/admins/{theirUid}` -> Denied (`isAdmin()` required).
4. **Shadow Field Injection on Product Create:** Admin sends valid product payload plus extra `"ghostField": true` -> Denied (`keys().hasOnly(...)`).
5. **Shadow Update on Product:** Admin updates product with `"isVerifiedAdmin": true` -> Denied (`affectedKeys().hasOnly(...)`).
6. **Value Poisoning on Product Update:** Admin updates `price` to `"free"` (string instead of number) or `name` > 300 chars -> Denied (`isValidProduct(incoming())`).
7. **ID Poisoning:** Admin creates `/products/bad$id..with..junk` or 200-char ID -> Denied (`isValidId(productId)`).
8. **Array Overflow:** Admin creates product with 25 images (`images.size() > 20`) or non-string first element `[123]` -> Denied (`isValidProduct`).
9. **Client Timestamp Forgery:** Admin sets `createdAt` or `updatedAt` to a past client date instead of `request.time` -> Denied.
10. **Immutable Field Tampering:** Admin tries to change `id` or `createdAt` on product update -> Denied.
11. **Public Read of Admin PIN:** Unauthenticated or non-admin user tries `get` or `list` on `/adminConfig/security` -> Denied (`isAdmin()` required).
12. **Media Ownership Spoofing:** Admin creates `/media/m1` with `uploadedBy: "someone_else_uid"` -> Denied (`uploadedBy == request.auth.uid`).
