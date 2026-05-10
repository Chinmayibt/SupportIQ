"""
Deprecated: training lives under `training/train.py`.

From repo root:

  python training/train.py

Or from this directory (delegates to the same script):

  python train_model.py
"""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path


def main() -> None:
    root = Path(__file__).resolve().parents[1]
    script = root / "training" / "train.py"
    raise SystemExit(subprocess.call([sys.executable, str(script)], cwd=root))


if __name__ == "__main__":
    main()
