how to run?  

# Frontned  

install dependencies:  
```
cd frontend
npm install
```


run:  
```
npm run dev
```

# Backend  

install dependencies:  
```
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```


run:
```
python app.py
```

Supabase setup:
- Create a `.env` file inside `backend/` with:
```
SUPABASE_URL=your_project_url
SUPABASE_KEY=your_anon_key
```

# Daily portfolio price snapshots (automation)

The backend exposes `POST /api/long-term/prices/snapshot/`. You can schedule
this once per day via cron or any scheduler.

Example (cron, runs daily at 6pm):
```
0 18 * * * cd "/Users/kekdidi/Developer/Me/SWE/money manager/backend" && /usr/bin/env SNAPSHOT_URL="http://localhost:8000/api/long-term/prices/snapshot/" python3 scripts/run_daily_snapshot.py >> snapshot.log 2>&1
```

If calling a hosted backend, set `SNAPSHOT_URL` to your public API URL.