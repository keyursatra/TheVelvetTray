export const productsSeed = [
  // Edibles
  { sku: 'ED-KES-001', name: 'Kashmiri Saffron — 1g',       category: 'edible',     origin: 'Pampore, Kashmir',      material: 'Mogra-grade saffron', priceINR: 650,  stock: 120, lowStockThreshold: 20 },
  { sku: 'ED-HON-001', name: 'Wild Forest Honey — 250g',    category: 'edible',     origin: 'Nilgiris',              material: 'Multi-floral wild honey', priceINR: 480, stock: 90, lowStockThreshold: 15 },
  { sku: 'ED-DAT-001', name: 'Medjool Dates — 200g',        category: 'edible',     origin: 'Jordan Valley',         priceINR: 420, stock: 80, lowStockThreshold: 15 },
  { sku: 'ED-CHO-001', name: 'Single-Origin Dark Chocolate — 70%', category: 'edible', origin: 'Idukki, Kerala', priceINR: 550, stock: 100, lowStockThreshold: 20 },
  { sku: 'ED-MIT-001', name: 'Atelier Mithai Box — 12 pieces', category: 'edible',   origin: 'Varanasi',              priceINR: 1250, stock: 60, lowStockThreshold: 10 },

  // Beverages
  { sku: 'BV-TEA-001', name: 'Darjeeling First Flush — 100g', category: 'beverages', origin: 'Goomtee Estate, Darjeeling', priceINR: 780, stock: 70, lowStockThreshold: 12 },
  { sku: 'BV-COF-001', name: 'Single-Estate Coffee — 250g',   category: 'beverages', origin: 'Coorg',                 priceINR: 620, stock: 85, lowStockThreshold: 15 },
  { sku: 'BV-CHA-001', name: 'Masala Chai Blend — 150g',      category: 'beverages', origin: 'Assam & Kerala',        priceINR: 380, stock: 110, lowStockThreshold: 20 },

  // Textiles
  { sku: 'TX-PSH-001', name: 'Handwoven Pashmina Stole',      category: 'textiles',  origin: 'Srinagar, Kashmir',     material: 'Changthangi pashmina', priceINR: 8500, stock: 30, lowStockThreshold: 5 },
  { sku: 'TX-SLK-001', name: 'Tussar Silk Scarf',             category: 'textiles',  origin: 'Bhagalpur, Bihar',      material: 'Wild tussar silk', priceINR: 2800, stock: 40, lowStockThreshold: 8 },
  { sku: 'TX-AJR-001', name: 'Ajrakh Block-Print Pocket Square', category: 'textiles', origin: 'Ajrakhpur, Kutch',    material: 'Cotton, natural dyes', priceINR: 950, stock: 60, lowStockThreshold: 12 },
  { sku: 'TX-BAN-001', name: 'Banarasi Silk Runner',          category: 'textiles',  origin: 'Varanasi',              priceINR: 4200, stock: 25, lowStockThreshold: 5 },

  // Stationery
  { sku: 'ST-NTB-001', name: 'Handmade Paper Notebook — A5',  category: 'stationery', origin: 'Auroville, Pondicherry', priceINR: 680, stock: 150, lowStockThreshold: 25 },
  { sku: 'ST-LTR-001', name: 'Letterpress Greeting Set — 6',  category: 'stationery', origin: 'Pondicherry',           priceINR: 520, stock: 120, lowStockThreshold: 20 },

  // Wellness
  { sku: 'WL-ATR-001', name: 'Mitti Attar — 5ml',             category: 'wellness',  origin: 'Kannauj',               material: 'Sandalwood base', priceINR: 1450, stock: 35, lowStockThreshold: 8 },
  { sku: 'WL-ATR-002', name: 'Rose Attar — 5ml',              category: 'wellness',  origin: 'Kannauj',               priceINR: 1650, stock: 30, lowStockThreshold: 8 },
  { sku: 'WL-OIL-001', name: 'Cold-Pressed Coconut Oil — 200ml', category: 'wellness', origin: 'Kerala',             priceINR: 420, stock: 70, lowStockThreshold: 15 },

  // Executive
  { sku: 'EX-PEN-001', name: 'Brass Fountain Pen',            category: 'executive', origin: 'Jaipur',                priceINR: 2800, stock: 40, lowStockThreshold: 8 },
  { sku: 'EX-DSK-001', name: 'Channapatna Desk Organiser',    category: 'executive', origin: 'Channapatna',           material: 'Hale wood, natural lac', priceINR: 1850, stock: 50, lowStockThreshold: 10 },

  // Packaging
  { sku: 'PK-TRY-001', name: 'Velvet-Lined Wooden Tray — Medium', category: 'packaging', origin: 'Saharanpur', material: 'Sheesham wood, velvet', priceINR: 1650, stock: 200, lowStockThreshold: 30 },
  { sku: 'PK-TRY-002', name: 'Velvet-Lined Wooden Tray — Large',  category: 'packaging', origin: 'Saharanpur', priceINR: 2150, stock: 180, lowStockThreshold: 30 },
  { sku: 'PK-BOX-001', name: 'Embossed Gift Box',             category: 'packaging', priceINR: 380, stock: 400, lowStockThreshold: 50 },

  // Add-ons
  { sku: 'AD-CRD-001', name: 'Handwritten Note Card',         category: 'add-ons',   priceINR: 80, stock: 1000, lowStockThreshold: 100 },
  { sku: 'AD-RIB-001', name: 'Silk Ribbon — Crimson',         category: 'add-ons',   priceINR: 120, stock: 500, lowStockThreshold: 50 },
  { sku: 'AD-MON-001', name: 'Monogram Embossing',            category: 'add-ons',   priceINR: 350, stock: 999, lowStockThreshold: 0 },
] as const;
