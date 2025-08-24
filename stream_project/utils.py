import json
import numpy as np
import matplotlib
import matplotlib.pyplot as plt
from typing import Any

def headless_setup():
    matplotlib.use("Agg")

def save_figure(fig, path: str, dpi: int = 300 , tight: bool = True):
    if tight:
        fig.tight_layout()
    fig.savefig(path, dpi=dpi, bbox_inches="tight")
    plt.close(fig)

def _to_native(obj: Any):
    """Recursively convert numpy types to JSON-safe Python types."""  
    if isinstance(obj, np.generic):
        return obj.item() 
    if isinstance(obj, np.ndarray):
        return obj.tolist()
    if isinstance(obj, (list, tuple)):
        return [_to_native(x) for x in obj]
    if isinstance(obj, dict):
        return {k: _to_native(v) for k, v in obj.items()}
    return obj

def safe_json_dump(obj: Any, path: str, *, indent: int = 2) -> None:
    with open(path, "w") as f:
        json.dump(_to_native(obj), f, indent=indent, ensure_ascii=False)