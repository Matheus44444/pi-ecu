# Pi-ECU MVP

Projeto inicial para dashboard web, API FastAPI e futura ponte com STM32/Raspberry Pi.

## Teste web

```bash
cd pi
python3 -m venv .venv
source .venv/bin/activate
pip install -e .
uvicorn pi_ecu.api:app --reload --port 8000
```

Em outro terminal:

```bash
cd pi/web
npm install
npm run dev
```
