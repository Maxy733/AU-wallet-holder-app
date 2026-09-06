# Credential offer API contract

The issuer and holder frontends share the same NestJS API base URL. The
backend must create a holder-addressed pending offer when the issuer calls:

```http
POST /vc/academic-transcripts/create
Content-Type: application/json

{"studentNumber":"6399003"}
```

The create response must identify the durable offer:

```json
{
  "data": {
    "offerId": "offer_123",
    "studentNumber": "6399003",
    "status": "pending"
  },
  "message": "Academic transcript credential offer created.",
  "meta": {}
}
```

The backend must resolve `studentNumber` to the verified holder account. It
must not deliver this offer to another authenticated holder.

## List the authenticated holder's offers

```http
GET /vc/academic-transcripts/offers/me
Authorization: Bearer <holder-access-token>
```

The response data is an array. A pending item uses this shape:

```json
{
  "offerId": "offer_123",
  "credentialType": "academic_transcript",
  "displayName": "Education Transcript VC",
  "issuerName": "AU Registrar",
  "issuerDid": "did:web:au.edu/issuer",
  "studentNumber": "6399003",
  "holderName": "Ms Lalita Chansiri",
  "status": "pending",
  "createdAt": "2026-08-30T07:57:00.000Z",
  "preview": {
    "degree": "Bachelor of Science",
    "major": "Computer Science",
    "graduationDate": "2025-01-18",
    "gpa": 3.59
  }
}
```

## Accept an offer

```http
POST /vc/academic-transcripts/offers/offer_123/accept
Authorization: Bearer <holder-access-token>
```

The response returns the same offer with `status: "accepted"` plus a
`credentialId` and `acceptedAt`. Acceptance must be authorized against the
authenticated holder, atomic, and idempotent. A different holder must receive
`403`; a missing or no-longer-pending offer should receive `404` or `409` with
a stable error code.

The holder app never accepts a student number from the UI for offer lookup.
Identity comes from the access token and its verified holder-account mapping.
