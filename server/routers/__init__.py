from routers.auth import router as auth_router
from routers.products import router as products_router
from routers.customers import router as customers_router
from routers.suppliers import router as suppliers_router
from routers.sales import router as sales_router
from routers.purchases import router as purchases_router

__all__ = [
    "auth_router",
    "products_router",
    "customers_router",
    "suppliers_router",
    "sales_router",
    "purchases_router",
]
