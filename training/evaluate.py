"""
Evaluate a saved classifier.joblib on a CSV with columns: text, label (optional inbound).

Usage:
  python training/evaluate.py --model models/sklearn_classifier/latest/classifier.joblib
  python training/evaluate.py --fixture tests/fixtures/tiny_labeled.csv
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

import joblib
import pandas as pd
from sklearn.metrics import classification_report

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "backend"))
from preprocess import clean_text, weak_label  # noqa: E402

import config  # noqa: E402


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--model",
        type=Path,
        default=config.LATEST_MODEL_PATH,
        help="Path to classifier.joblib",
    )
    parser.add_argument(
        "--fixture",
        type=Path,
        default=None,
        help="CSV with text + label columns (for CI / smoke test)",
    )
    parser.add_argument(
        "--sample",
        type=int,
        default=5000,
        help="If no fixture, sample this many inbound rows from raw TWCS (0=all)",
    )
    args = parser.parse_args()

    if not args.model.is_file():
        raise SystemExit(f"Model not found: {args.model}")

    clf = joblib.load(args.model)

    if args.fixture:
        df = pd.read_csv(args.fixture)
        if "label" not in df.columns or "text" not in df.columns:
            raise SystemExit("Fixture CSV must have columns: text, label")
        texts = df["text"].map(clean_text)
        y_true = df["label"].astype(str).str.lower()
    else:
        if not config.DATA_RAW_CSV.is_file():
            raise SystemExit(f"No fixture and no dataset: {config.DATA_RAW_CSV}")
        df = pd.read_csv(config.DATA_RAW_CSV, usecols=["inbound", "text"])
        df = df[df["inbound"] == True]  # noqa: E712
        df = df.dropna(subset=["text"])
        if args.sample and len(df) > args.sample:
            df = df.sample(n=args.sample, random_state=config.RANDOM_STATE)
        texts = df["text"].astype(str).map(clean_text)
        y_true = texts.map(weak_label)

    mask = texts.str.len() > 0
    texts = texts[mask].reset_index(drop=True)
    y_true = y_true[mask].reset_index(drop=True)

    y_pred = clf.predict(texts)
    report = classification_report(y_true, y_pred, digits=3)
    print(report)


if __name__ == "__main__":
    main()
