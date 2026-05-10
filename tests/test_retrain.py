import json
from pathlib import Path

import src.retrain as retrain_module


def test_next_version():
    assert retrain_module._next_version([]) == "model_v1.pkl"
    assert retrain_module._next_version(["model_v1.pkl", "model_v2.pkl"]) == "model_v3.pkl"


def test_registry_file_exists():
    registry_path = Path("models/model_registry.json")
    assert registry_path.exists()
    data = json.loads(registry_path.read_text(encoding="utf-8"))
    assert "active_version" in data
