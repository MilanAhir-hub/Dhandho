import os
from datetime import datetime, timedelta, timezone
from database import SessionLocal
from models.product import Product
from models.customer import Customer
from models.supplier import Supplier
from models.sale import Sale, SaleItem
from models.purchase import Purchase, PurchaseItem
from models.udhari import UdhariPayment

def seed():
    db = SessionLocal()
    try:
        print("Clearing any partial test data...")
        # Clean existing test data to ensure clean idempotency
        db.query(SaleItem).delete()
        db.query(PurchaseItem).delete()
        db.query(UdhariPayment).delete()
        db.query(Sale).delete()
        db.query(Purchase).delete()
        db.query(Customer).delete()
        db.query(Product).delete()
        db.query(Supplier).delete()
        db.commit()

        print("1. Seeding 20 Products...")
        products_data = [
            # Grains, Flours & Staples
            {
                "name": "Aashirvaad Shudh Chakki Atta 5kg",
                "category": "Atta & Flours",
                "unit": "packet",
                "buying_price": 210.0,
                "selling_price": 245.0,
                "stock_quantity": 28.0,
                "low_stock_alert": 5.0,
            },
            {
                "name": "India Gate Basmati Rice Rozzana 1kg",
                "category": "Rice & Grains",
                "unit": "packet",
                "buying_price": 85.0,
                "selling_price": 105.0,
                "stock_quantity": 35.0,
                "low_stock_alert": 6.0,
            },
            {
                "name": "Tata Sampann Toor Dal 1kg",
                "category": "Dals & Pulses",
                "unit": "packet",
                "buying_price": 145.0,
                "selling_price": 175.0,
                "stock_quantity": 22.0,
                "low_stock_alert": 5.0,
            },
            {
                "name": "Tata Sampann Moong Dal 500g",
                "category": "Dals & Pulses",
                "unit": "packet",
                "buying_price": 68.0,
                "selling_price": 84.0,
                "stock_quantity": 18.0,
                "low_stock_alert": 5.0,
            },
            {
                "name": "Fortune Sunlite Sunflower Oil 1L",
                "category": "Edible Oils",
                "unit": "liter",
                "buying_price": 118.0,
                "selling_price": 140.0,
                "stock_quantity": 25.0,
                "low_stock_alert": 8.0,
            },
            {
                "name": "Madhur Pure & Hygienic Sugar 1kg",
                "category": "Sugar & Jaggery",
                "unit": "packet",
                "buying_price": 44.0,
                "selling_price": 52.0,
                "stock_quantity": 50.0,
                "low_stock_alert": 10.0,
            },
            {
                "name": "Tata Salt Iodized 1kg",
                "category": "Spices & Salt",
                "unit": "packet",
                "buying_price": 22.0,
                "selling_price": 28.0,
                "stock_quantity": 60.0,
                "low_stock_alert": 10.0,
            },
            {
                "name": "Everest Turmeric Powder 100g",
                "category": "Spices & Salt",
                "unit": "packet",
                "buying_price": 32.0,
                "selling_price": 42.0,
                "stock_quantity": 40.0,
                "low_stock_alert": 8.0,
            },
            {
                "name": "Everest Garam Masala 50g",
                "category": "Spices & Salt",
                "unit": "packet",
                "buying_price": 38.0,
                "selling_price": 48.0,
                "stock_quantity": 30.0,
                "low_stock_alert": 8.0,
            },
            # Dairy & Breakfast
            {
                "name": "Amul Butter Pasteurized 500g",
                "category": "Dairy",
                "unit": "packet",
                "buying_price": 240.0,
                "selling_price": 275.0,
                "stock_quantity": 14.0,
                "low_stock_alert": 5.0,
            },
            {
                "name": "Amul Taaza Homogenised Milk 1L",
                "category": "Dairy",
                "unit": "liter",
                "buying_price": 64.0,
                "selling_price": 72.0,
                "stock_quantity": 4.0,    # Low Stock!
                "low_stock_alert": 8.0,
            },
            {
                "name": "Britannia 100% Whole Wheat Bread 400g",
                "category": "Bakery",
                "unit": "packet",
                "buying_price": 40.0,
                "selling_price": 50.0,
                "stock_quantity": 10.0,
                "low_stock_alert": 5.0,
            },
            {
                "name": "Nestlé Maggi 2-Minute Noodles 70g",
                "category": "Instant Food",
                "unit": "packet",
                "buying_price": 12.0,
                "selling_price": 14.0,
                "stock_quantity": 85.0,
                "low_stock_alert": 15.0,
            },
            # Biscuits, Snacks & Beverages
            {
                "name": "Parle-G Gold Glucose Biscuits 1kg",
                "category": "Snacks & Biscuits",
                "unit": "packet",
                "buying_price": 105.0,
                "selling_price": 125.0,
                "stock_quantity": 22.0,
                "low_stock_alert": 5.0,
            },
            {
                "name": "Britannia Good Day Butter Cookies 200g",
                "category": "Snacks & Biscuits",
                "unit": "packet",
                "buying_price": 35.0,
                "selling_price": 45.0,
                "stock_quantity": 3.0,     # Low Stock!
                "low_stock_alert": 6.0,
            },
            {
                "name": "Haldiram's Nagpur Bhujia Sev 400g",
                "category": "Snacks & Biscuits",
                "unit": "packet",
                "buying_price": 95.0,
                "selling_price": 115.0,
                "stock_quantity": 18.0,
                "low_stock_alert": 5.0,
            },
            {
                "name": "Brooke Bond Red Label Tea 500g",
                "category": "Beverages",
                "unit": "packet",
                "buying_price": 230.0,
                "selling_price": 270.0,
                "stock_quantity": 16.0,
                "low_stock_alert": 5.0,
            },
            # Cleaning & Personal Care
            {
                "name": "Surf Excel Easy Wash Detergent 1kg",
                "category": "Home Cleaning",
                "unit": "packet",
                "buying_price": 125.0,
                "selling_price": 148.0,
                "stock_quantity": 2.0,     # Low Stock!
                "low_stock_alert": 5.0,
            },
            {
                "name": "Dettol Original Bathing Soap 75g",
                "category": "Personal Care",
                "unit": "piece",
                "buying_price": 36.0,
                "selling_price": 44.0,
                "stock_quantity": 32.0,
                "low_stock_alert": 8.0,
            },
            {
                "name": "Colgate Strong Teeth Toothpaste 200g",
                "category": "Personal Care",
                "unit": "piece",
                "buying_price": 110.0,
                "selling_price": 132.0,
                "stock_quantity": 15.0,
                "low_stock_alert": 5.0,
            },
        ]

        products = []
        for p in products_data:
            prod = Product(**p)
            db.add(prod)
            products.append(prod)
        db.commit()
        for prod in products:
            db.refresh(prod)
        print(f"Created {len(products)} products.")

        print("2. Seeding Suppliers...")
        suppliers_data = [
            {"name": "Sanjay Bhai Shah", "company_name": "Adani Wilmar & Fortune Depot", "phone": "9825100100"},
            {"name": "Bharat Bhai Patel", "company_name": "Shri Mahadev Grain Wholesalers", "phone": "9879200200"},
            {"name": "Dilipbhai Parmar", "company_name": "Amul Dairy & Ice Cream Agency", "phone": "9898300300"},
            {"name": "Kishore Kumar", "company_name": "Modern FMCG & Biscuits Agency", "phone": "9904400400"},
            {"name": "Manoj Joshi", "company_name": "Apex Unilever & Household Supply", "phone": "9723500500"},
        ]
        suppliers = []
        for s in suppliers_data:
            sup = Supplier(**s)
            db.add(sup)
            suppliers.append(sup)
        db.commit()
        for sup in suppliers:
            db.refresh(sup)
        print(f"Created {len(suppliers)} suppliers.")

        print("3. Seeding Customers & Khata Balances...")
        customers_data = [
            {"name": "Ramesh Patel", "phone": "9825012345", "address": "Flat 201, Shanti Heights", "udhari_balance": 1450.0},
            {"name": "Priya Sharma", "phone": "9879123456", "address": "14, Gokuldham Society", "udhari_balance": 620.0},
            {"name": "Amit Verma", "phone": "9904567890", "address": "B-402, Radhe Residency", "udhari_balance": 2100.0},
            {"name": "Sunitaben Joshi", "phone": "9723456781", "address": "7, Shivam Bunglows", "udhari_balance": 380.0},
            {"name": "Rajeshbhai Mehta", "phone": "9898112233", "address": "Shop 3, Main Bazaar", "udhari_balance": 0.0},
            {"name": "Vikram Chauhan", "phone": "9913245678", "address": "Plot 88, Vrundavan Park", "udhari_balance": 890.0},
            {"name": "Nehaben Gupta", "phone": "9824334455", "address": "A-12, Green City", "udhari_balance": 0.0},
        ]
        customers = []
        for c in customers_data:
            cust = Customer(**c)
            db.add(cust)
            customers.append(cust)
        db.commit()
        for cust in customers:
            db.refresh(cust)
        print(f"Created {len(customers)} customers.")

        print("4. Seeding Sample Sales & Items...")
        now = datetime.now(timezone.utc)
        
        # Sale 1: Cash sale
        sale1 = Sale(
            customer_id=customers[4].id, # Rajeshbhai Mehta
            total_amount=products[0].selling_price * 1 + products[4].selling_price * 1, # Atta + Oil
            payment_type="cash",
            note="Morning counter cash sale",
            sale_date=now - timedelta(hours=3),
        )
        db.add(sale1)
        db.commit()
        db.refresh(sale1)

        item1_1 = SaleItem(sale_id=sale1.id, product_id=products[0].id, quantity=1, unit_price=products[0].selling_price, subtotal=products[0].selling_price * 1)
        item1_2 = SaleItem(sale_id=sale1.id, product_id=products[4].id, quantity=1, unit_price=products[4].selling_price, subtotal=products[4].selling_price * 1)
        db.add_all([item1_1, item1_2])

        # Sale 2: Udhar sale to Ramesh Patel
        sale2 = Sale(
            customer_id=customers[0].id,
            total_amount=products[1].selling_price * 2 + products[2].selling_price * 1 + products[9].selling_price * 1,
            payment_type="udhari",
            note="Monthly ration on credit",
            sale_date=now - timedelta(hours=2),
        )
        db.add(sale2)
        db.commit()
        db.refresh(sale2)

        item2_1 = SaleItem(sale_id=sale2.id, product_id=products[1].id, quantity=2, unit_price=products[1].selling_price, subtotal=products[1].selling_price * 2)
        item2_2 = SaleItem(sale_id=sale2.id, product_id=products[2].id, quantity=1, unit_price=products[2].selling_price, subtotal=products[2].selling_price * 1)
        item2_3 = SaleItem(sale_id=sale2.id, product_id=products[9].id, quantity=1, unit_price=products[9].selling_price, subtotal=products[9].selling_price * 1)
        db.add_all([item2_1, item2_2, item2_3])

        # Sale 3: Walk-in quick cash sale
        sale3 = Sale(
            customer_id=None,
            total_amount=products[12].selling_price * 5 + products[16].selling_price * 1, # Maggi + Tea
            payment_type="cash",
            note="Walk-in student cash purchase",
            sale_date=now - timedelta(minutes=45),
        )
        db.add(sale3)
        db.commit()
        db.refresh(sale3)

        item3_1 = SaleItem(sale_id=sale3.id, product_id=products[12].id, quantity=5, unit_price=products[12].selling_price, subtotal=products[12].selling_price * 5)
        item3_2 = SaleItem(sale_id=sale3.id, product_id=products[16].id, quantity=1, unit_price=products[16].selling_price, subtotal=products[16].selling_price * 1)
        db.add_all([item3_1, item3_2])

        # Sale 4: Udhar sale to Priya Sharma
        sale4 = Sale(
            customer_id=customers[1].id,
            total_amount=products[6].selling_price * 2 + products[7].selling_price * 1 + products[8].selling_price * 1, # Salt + Spices
            payment_type="udhari",
            note="Gokuldham household weekly bill",
            sale_date=now - timedelta(minutes=15),
        )
        db.add(sale4)
        db.commit()
        db.refresh(sale4)

        item4_1 = SaleItem(sale_id=sale4.id, product_id=products[6].id, quantity=2, unit_price=products[6].selling_price, subtotal=products[6].selling_price * 2)
        item4_2 = SaleItem(sale_id=sale4.id, product_id=products[7].id, quantity=1, unit_price=products[7].selling_price, subtotal=products[7].selling_price * 1)
        item4_3 = SaleItem(sale_id=sale4.id, product_id=products[8].id, quantity=1, unit_price=products[8].selling_price, subtotal=products[8].selling_price * 1)
        db.add_all([item4_1, item4_2, item4_3])

        db.commit()
        print("Created 4 sample sales with itemized line bills.")

        print("5. Seeding Inward Purchases (Stock In)...")
        purch1 = Purchase(
            supplier_id=suppliers[0].id,
            total_amount=products[4].buying_price * 20, # 20L Fortune Oil
            note="Weekly bulk edible oil delivery",
            purchase_date=now - timedelta(days=2),
        )
        db.add(purch1)
        db.commit()
        db.refresh(purch1)

        pitem1 = PurchaseItem(
            purchase_id=purch1.id,
            product_id=products[4].id,
            quantity=20,
            unit_price=products[4].buying_price,
            subtotal=products[4].buying_price * 20,
        )
        db.add(pitem1)

        purch2 = Purchase(
            supplier_id=suppliers[1].id,
            total_amount=products[0].buying_price * 30 + products[1].buying_price * 25, # Atta + Rice
            note="Grain sacks delivery via tempo",
            purchase_date=now - timedelta(days=1),
        )
        db.add(purch2)
        db.commit()
        db.refresh(purch2)

        pitem2_1 = PurchaseItem(
            purchase_id=purch2.id,
            product_id=products[0].id,
            quantity=30,
            unit_price=products[0].buying_price,
            subtotal=products[0].buying_price * 30,
        )
        pitem2_2 = PurchaseItem(
            purchase_id=purch2.id,
            product_id=products[1].id,
            quantity=25,
            unit_price=products[1].buying_price,
            subtotal=products[1].buying_price * 25,
        )
        db.add_all([pitem2_1, pitem2_2])
        db.commit()
        print("Created inward stock purchase invoices.")

        print("6. Seeding Udhari Repayment Records...")
        upay1 = UdhariPayment(
            customer_id=customers[0].id,
            amount_paid=500.0,
            note="GPay UPI transfer received",
            payment_date=now - timedelta(days=1),
        )
        upay2 = UdhariPayment(
            customer_id=customers[2].id,
            amount_paid=1000.0,
            note="Cash partial payment at counter",
            payment_date=now - timedelta(hours=5),
        )
        db.add_all([upay1, upay2])
        db.commit()
        print("Created udhari repayment ledger history.")

        print("\nAll 20+ test data records successfully committed to PostgreSQL database!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed()
