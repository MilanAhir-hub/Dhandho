import re

def parse_natural_command(text: str):
    data = {}
    lower = text.lower().strip()
    
    # 1. Price extraction
    p_match = re.search(r'(?:price\s*(?:of|is|:)?|its\s*price\s*(?:of|is|:)?|rate\s*(?:of|is|:)?|cost\s*(?:of|is|:)?|at|rs\.?|₹)\s*:?\s*(\d+(?:\.\d+)?)', lower)
    if p_match:
        data['price'] = float(p_match.group(1))

    # 2. Quantity extraction
    q_match = re.search(r'(?:total\s*quantity\s*(?:of|is|:)?|quantity\s*(?:of|is|:)?|its\s*quantity\s*(?:of|is|:)?|stock\s*(?:of|is|:)?|qty\s*(?:of|is|:)?)\s*:?\s*(\d+(?:\.\d+)?)', lower)
    if not q_match:
        q_match = re.search(r'(\d+(?:\.\d+)?)\s*(?:units?|packets?|pieces?|kg|liters?|stock|qty)', lower)
    if q_match:
        data['quantity'] = float(q_match.group(1))

    # 3. Name extraction
    name_patterns = [
        r'(?:with the name|named|name is|name:?)\s+([a-zA-Z0-9\s\-]+?)(?:\s+at|\s+and|\s+with|\s+its\s+price|\s+price|\s+cost|\s*$)',
        r'(?:add|create|insert|new)\s+(?:a |an )?(?:product |item )?([a-zA-Z0-9\s\-]+?)(?:\s+with|\s+at|\s+and|\s+its\s+price|\s+price|\s+having|\s+cost|\s*$)'
    ]
    for pat in name_patterns:
        m = re.search(pat, text, re.IGNORECASE)
        if m:
            val = m.group(1).strip(' ,.-')
            if val and len(val) > 1 and val.lower() not in ['a', 'an', 'the', 'product', 'item']:
                data['name'] = val
                break

    # Determine if intent is add_product
    is_add = bool(re.search(r'^(?:add|create|insert|new)\b|\b(?:add|create|new)\s+(?:a |an )?[a-z0-9]', lower))
    
    return {'is_add': is_add, 'data': data}

test_commands = [
    'add a tshirt with the price of 500 and the total quantity is 50',
    'Add a product, with the name Balaji waffer and its price is 10 and quantity 40',
    'add 50 packets of Parle-G at 10 rupees',
    'create product Colgate Toothpaste with price 130 and stock 25',
    'new item Soap with price of 45 and quantity is 30',
    'Add a product Milk having price 60 and total quantity 15',
]

for cmd in test_commands:
    res = parse_natural_command(cmd)
    print(f"CMD: '{cmd}'")
    print(f" -> Intent: {res['is_add']}, Data: {res['data']}\n")
