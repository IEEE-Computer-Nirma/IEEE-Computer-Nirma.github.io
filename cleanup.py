#!/usr/bin/env python3
"""
cleanup.py - NovaHack project cleanup script
Removes stale / duplicate files that are no longer needed after the SPA refactor.
Run from the project root:  python cleanup.py [--dry-run]
Add --dry-run to preview what would be deleted without actually deleting.
"""

import os
import sys
import shutil

DRY_RUN = "--dry-run" in sys.argv

ROOT = os.path.dirname(os.path.abspath(__file__))


def rel(path):
    return os.path.relpath(path, ROOT)


def delete(path):
    if not os.path.exists(path):
        print(f"  [skip - not found]  {rel(path)}")
        return
    if DRY_RUN:
        kind = "DIR " if os.path.isdir(path) else "FILE"
        print(f"  [dry-run] would delete {kind}: {rel(path)}")
        return
    if os.path.isdir(path):
        shutil.rmtree(path)
        print(f"  [deleted DIR]  {rel(path)}")
    else:
        os.remove(path)
        print(f"  [deleted FILE] {rel(path)}")


# Files/dirs to remove - stale artefacts from the old multi-page era
STALE = [
    # Old standalone HTML pages (replaced by hash-routing in index.html)
    os.path.join(ROOT, "novahack-2026.html"),
    os.path.join(ROOT, "challenges.html"),
    os.path.join(ROOT, "challenges.js"),

    # CTF challenges JSON loose in root (canonical copy should be in data/)
    os.path.join(ROOT, "ctf-challenges-complete.json"),

    # Stale SPA module files (index.html now handles everything inline)
    os.path.join(ROOT, "pages", "home.js"),
    os.path.join(ROOT, "pages", "event-detail.js"),
    os.path.join(ROOT, "app.js"),

    # IDE artefacts
    os.path.join(ROOT, ".idea"),

    # Uncomment the line below if you want to also strip node_modules (saves ~30MB)
    # os.path.join(ROOT, "node_modules"),
]

# Files/dirs that MUST still exist after cleanup
REQUIRED = [
    os.path.join(ROOT, "index.html"),
    os.path.join(ROOT, "data", "events.json"),
    os.path.join(ROOT, "data", "team.json"),
    os.path.join(ROOT, "data", "gallery.json"),
    os.path.join(ROOT, "ctf", "index.html"),
    os.path.join(ROOT, "ctf", "challenges.html"),
    os.path.join(ROOT, "ctf", "leaderboard.html"),
    os.path.join(ROOT, "assets", "IEEE_CS_Nirma_logo.svg"),
]


def main():
    mode = "DRY RUN" if DRY_RUN else "LIVE"
    print(f"\n{'='*60}")
    print(f"  NovaHack Cleanup Script  [{mode}]")
    print(f"  Root: {ROOT}")
    print(f"{'='*60}\n")

    print("Removing stale files and directories:")
    for path in STALE:
        delete(path)

    print("\nVerifying required files still exist:")
    all_ok = True
    for path in REQUIRED:
        exists = os.path.exists(path)
        status = "[OK]     " if exists else "[MISSING]"
        print(f"  {status} {rel(path)}")
        if not exists:
            all_ok = False

    print()
    if all_ok:
        print("All required files present. Project looks clean.")
    else:
        print("WARNING: Some required files are missing - review before deploying.")

    if DRY_RUN:
        print("\n[Dry-run mode] No files were modified.")
        print("Re-run without --dry-run to apply changes.")

    print()


if __name__ == "__main__":
    main()
