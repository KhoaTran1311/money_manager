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