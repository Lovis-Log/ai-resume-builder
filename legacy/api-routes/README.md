# Parked server routes

These route handlers belong to the earlier backend implementation and require
database, authentication, AI, and billing environment variables.

They were moved out of `app/api/` so the current local-first UI demo can build
and run with no secrets or external services. Move the relevant route folders
back under `app/api/` when reconnecting the real backend.
