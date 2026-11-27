"""Helpers that turn collected product data into a validated ProductCreate.

The AI assistant collects name, price and stock from the user's messages.
These helpers clean and validate that data, then build the same schema the
regular product-creation endpoint uses, so no duplicate models are needed.
"""

from typing import Any, Dict

from schemas.product import ProductCreate

DEFAULT_UNIT = "piece"


def validate_product_data(collected: Dict[str, Any]) -> Dict[str, Any]:
    """Validate collected product fields and return clean values.

    Raises ValueError with a short message when a required field is missing
    or has an invalid value.
    """
    name = collected.get("name")
    price = collected.get("price")
    stock = collected.get("stock")

    if not name or not str(name).strip():
        raise ValueError("the product name is missing")
    clean_name = str(name).strip()
    if len(clean_name) > 100:
        raise ValueError("the product name is too long (max 100 characters)")

    try:
        clean_price = float(price)
    except (TypeError, ValueError):
        raise ValueError("the price is missing or not a number")
    if clean_price <= 0:
        raise ValueError("the price must be greater than 0")

    try:
        clean_stock = float(stock)
    except (TypeError, ValueError):
        raise ValueError("the stock quantity is missing or not a number")
    if clean_stock < 0:
        raise ValueError("the stock quantity cannot be negative")

    return {"name": clean_name, "price": clean_price, "stock": clean_stock}


def build_product_create(clean: Dict[str, Any]) -> ProductCreate:
    """Build the same schema the regular product endpoint uses.

    The simple AI flow uses the default unit and reuses the buying price as
    the selling price; the shopkeeper can edit those later in the app.
    """
    return ProductCreate(
        name=clean["name"],
        unit=DEFAULT_UNIT,
        buying_price=clean["price"],
        selling_price=clean["price"],
        stock_quantity=clean["stock"],
    )
