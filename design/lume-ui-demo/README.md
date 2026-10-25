# Lume animated cloud demo — fixed v2

1. Open `index.html` in Chrome/Edge (or the standalone HTML file without needing any assets directory).
2. Switch between **Landing** and **Sign in** with the navigation tabs.
3. Watch the cloud banks move for a few seconds; they independently translate while the background scenery and lettering remain still.
4. Click **Show motion 3×** for very obvious drifting clouds; click **Normal speed** to restore a calm production-like rate.
5. Click **Pause clouds** to freeze the moving layers, then resume them to compare.
6. Switch to **Workspace** to review enlarged type and **Resume editor** for form legibility.

Motion preference: if Windows/browser `prefers-reduced-motion` is enabled, the clouds correctly do NOT animate. Change that preference only if you want to view the animation demo.

The file is a visual implementation reference for the existing Next.js app. It does not replace Google OAuth, actual resume editing, saving, or PDF export. Give Claude Code the whole folder and `CLAUDE_IMPLEMENTATION_PROMPT.md` and have it integrate the design into your existing components.
