from pydantic import BaseModel
from typing import List

class MenuItem(BaseModel):
    name: str
    price: int
    qty: int = 1

class TransactionRequest(BaseModel):
    items: List[MenuItem]
    paid: int

class TransactionResponse(BaseModel):
    items: List[MenuItem]
    total: int
    paid: int
    change: int
    timestamp: str
    status: str
