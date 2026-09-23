from fastapi import FastAPI
from datetime import datetime, timezone

app = FastAPI(title="Pi-ECU API")

@app.get("/api/health")
def health():
    return {"status": "ok", "service": "pi-ecu"}

@app.get("/api/telemetry")
def telemetry():
    return {
        "ts": datetime.now(timezone.utc).timestamp(),
        "rpm": 800,
        "map_kpa": 100,
        "tps": 0,
        "lambda1": 1.0,
        "inj_pw_ms": 0,
        "ign_deg": 10,
        "boost_duty": 0,
    }
