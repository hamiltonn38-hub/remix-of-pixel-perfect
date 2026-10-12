import zipfile
import os

ZIP_2024 = os.path.join(os.path.dirname(__file__), "..", "data", "raw", "inmet_dadoshistoricos_2024.zip")
with zipfile.ZipFile(ZIP_2024, "r") as z:
    for name in z.namelist():
        if "_A369_" in name:
            print("Found station file:", name)
            with z.open(name) as f:
                lines = f.read().decode("latin1").splitlines()
                for i, l in enumerate(lines[:20]):
                    print(f"L{i}: {l}")
            break
