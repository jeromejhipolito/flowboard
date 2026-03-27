# Changelog

## Unreleased
- Timezone-aware due dates (in progress)
- Email notifications via Resend

## [0.3.0] - 2026-03-20
### Added
- Sprint planning and completion with carry-over
- Sprint burndown and velocity charts
### Changed
- Analytics velocity chart now shows trailing 4 sprints (was 6 — too noisy)

## [0.2.0] - 2026-03-10
### Added
- AI task parsing via command palette
- Demo mode (frontend-only deployment)
### Fixed
- Concurrent drag-and-drop position collision
- Task card click firing during drag on touch devices

## [0.1.0] - 2026-02-24
### Added
- Kanban board with drag-and-drop (fractional indexing)
- Real-time collaboration via WebSocket + Redis adapter
- JWT auth with refresh token rotation
- Role-based access: Owner, Admin, Member, Viewer
