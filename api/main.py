from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .models import TransactionRequest, TransactionResponse
from datetime import datetime

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

MENU_DATA = [
    {"id": 1, "name": "Es Teh", "price": 3000, "emoji": "🥤"},
    {"id": 2, "name": "Kopi Hitam", "price": 4000, "emoji": "☕"},
    {"id": 3, "name": "Nasi Goreng", "price": 12000, "emoji": "🍛"},
    {"id": 4, "name": "Mie Rebus", "price": 10000, "emoji": "🍜"},
    {"id": 5, "name": "Gorengan", "price": 1000, "emoji": "🥟"}
]

@app.get("/api/menu")
async def get_menu():
    return MENU_DATA

@app.post("/api/transaction", response_model=TransactionResponse)
async def create_transaction(data: TransactionRequest):
    total = sum(item.price * item.qty for item in data.items)
    
    if data.paid < total:
        raise HTTPException(status_code=400, detail="Uang tidak cukup")
    
    change = data.paid - total
    
    return {
        "items": data.items,
        "total": total,
        "paid": data.paid,
        "change": change,
        "timestamp": datetime.now().isoformat(),
        "status": "success"
    }

@app.get("/api/health")
async def health():
    return {"status": "online"}
