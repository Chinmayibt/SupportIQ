"""Dataset ingestion utilities for Bitext customer support data."""

import csv
import io
import zipfile
from pathlib import Path
from typing import Dict, List

from src.config import DATA_DIR, DATASET_ZIP_NAME, RAW_DATA_DIR, TEST_FILE, TRAIN_FILE, VALID_FILE


def _read_csv_from_zip(zip_path: Path, file_name: str) -> List[dict]:
    with zipfile.ZipFile(zip_path) as archive:
        with archive.open(file_name) as file_obj:
            reader = csv.DictReader(io.TextIOWrapper(file_obj, encoding="utf-8"))
            return [row for row in reader]


def load_splits() -> Dict[str, List[dict]]:
    """Load train/validation/test rows from the dataset zip."""
    zip_path = DATA_DIR / DATASET_ZIP_NAME
    return {
        "train": _read_csv_from_zip(zip_path, TRAIN_FILE),
        "validation": _read_csv_from_zip(zip_path, VALID_FILE),
        "test": _read_csv_from_zip(zip_path, TEST_FILE),
    }


def materialize_raw_csvs() -> None:
    """Extract source CSVs into data/raw for easy inspection."""
    zip_path = DATA_DIR / DATASET_ZIP_NAME
    RAW_DATA_DIR.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(zip_path) as archive:
        for name in [TRAIN_FILE, VALID_FILE, TEST_FILE]:
            target = RAW_DATA_DIR / name
            target.write_bytes(archive.read(name))
