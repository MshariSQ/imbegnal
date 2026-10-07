# Certificates

Skeleton of the completion certificate (a future paid-tier feature).

| Endpoint | Auth | Result |
| --- | --- | --- |
| `GET /api/certificates/:track` | required | PDF (`?format=json` returns `CertificateInfo`). 403 `not_eligible` with `{ total, done, remaining }` until every lesson of the track is done. |
| `GET /api/certificates/verify/:code` | public | `{ valid, code?, track?, recipient?, issuedAt? }` |

**Eligibility.** Every lesson of the track in the generated catalog must have `done` set in the learner's synced
`user_state` (`lessons["track/lesson"].done`). Once issued, a certificate is never revoked by later state changes.

**Code.** `IMB-XXXX-XXXX-XXXX`: 60 bits of `HMAC-SHA256(JWT_SECRET, user|track)`, so it is stable per learner and track
(re-issuing returns the same code) but cannot be guessed without the secret. One row per `(user_id, track)` in `certificates`.

**PDF.** `pdf.ts` is a dependency-free writer: PDF 1.4, one landscape A4 page, the standard Helvetica fonts only
(nothing is embedded), exact xref offsets.

**Non-Latin names.** Helvetica with WinAnsiEncoding cannot draw Arabic (or any non-Latin script), and emitting such
bytes would corrupt the page. `pdfSafeName` therefore prints the recipient's name when it is fully drawable
(accented Latin letters are fine), otherwise the account's username when that is drawable, otherwise the neutral label
"IMBEGNAL Learner". There is no transliteration table, so an Arabic display name prints as the username. The
recipient stored in `certificates` and returned by the JSON and verify endpoints is always the real display name; embedding an
Arabic-capable font (with shaping and RTL layout) is the follow-up that lifts this limit.
