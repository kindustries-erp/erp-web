# Task: Email inbox UI

## Date

- 2026-07-30

## Scope

- Add a web UI to list persisted ERP emails from backend.
- Allow opening a detail drawer with body, headers, metadata, and attachments.
- Reuse existing file preview flow for attachment files.

## Checklist

- [x] Add email API client
- [x] Add email inbox page
- [x] Add sidebar route entry
- [x] Add route/page key wiring
- [ ] Add localization keys if needed
- [ ] Verify email detail and attachment preview with live backend data

## Notes

- UI reads persisted emails from backend, not directly from IMAP.
- Attachment preview uses existing `/files/:id` view flow.
