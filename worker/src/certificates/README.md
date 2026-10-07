# Certificates

The completion certificate (a future paid-tier feature): this Worker issues and verifies it and serves a plain PDF;
the site renders the designed, printable version (see "Non-Latin names").

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
"IMBEGNAL Learner". There is no transliteration table, so an Arabic display name prints as the username in this PDF.
The recipient stored in `certificates` and returned by the JSON and verify endpoints is always the real display name.

**The Arabic-capable path is the printable certificate** on the site: `/certificate/?code=IMB-XXXX-XXXX-XXXX&print=1`
(`components/certificates/PrintableCertificate.tsx`). It takes the real name from `GET /api/certificates/verify/:code`
and lets the browser lay out a designed A4 landscape certificate (Geist and Tajawal, correct Arabic shaping and RTL,
English or Arabic wording), which the learner prints or saves as a PDF from the print dialog. Every valid verification
result links to it, and the course page's certificate card opens it after asking this endpoint for `?format=json`
(for the code). This PDF stays as is for Latin names and as a fallback; embedding an Arabic-capable font here
(with shaping and RTL layout) is no longer needed for Arabic names to print correctly.
