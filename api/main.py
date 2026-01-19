from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .models import TransactionRequest, TransactionResponse
from datetime import datetime
import random

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

MENU_DATA = [
    {"name": "Es Teh", "price": 3000, "category": "drink"},
    {"name": "Kopi Hitam", "price": 4000, "category": "drink"},
    {"name": "Nasi Goreng", "price": 12000, "category": "food"},
    {"name": "Mie Rebus", "price": 10000, "category": "food"},
    {"name": "Gorengan", "price": 1000, "category": "snack"}
]

@app.get("/api/menu")
async def get_menu():
    return MENU_DATA

# Endpoint baru untuk data grafik dummy
@app.get("/api/chart-data")
async def get_chart_data():
    # Mensimulasikan data penjualan per jam
    data = [random.randint(50000, 200000) for _ in range(7)]
    labels = ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "Now"]
    return {"labels": labels, "data": data}

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
