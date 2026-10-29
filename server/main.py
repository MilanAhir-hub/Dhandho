from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers.auth import router as auth_router
from routers.products import router as products_router
from routers.customers import router as customers_router
from routers.suppliers import router as suppliers_router
from routers.sales import router as sales_router
from routers.purchases import router as purchases_router

app = FastAPI(
    title="Dhandho — Kirana Store Management API",
    description="Backend for managing a Kirana store: products, customers, sales, purchases, and udhari (credit) system.",
    version="1.0.0",
)

# Allow all origins for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all routers
app.include_router(auth_router)
app.include_router(products_router)
app.include_router(customers_router)
app.include_router(suppliers_router)
app.include_router(sales_router)
app.include_router(purchases_router)


@app.get("/", tags=["Health"])
def health_check():
    return {"status": "ok", "message": "Dhandho API is running."}
