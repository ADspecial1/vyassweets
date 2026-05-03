import 'dotenv/config';
import mongoose from 'mongoose';
import slugify from 'slugify';
import Category from '../models/Category.js';
import Product from '../models/Product.js';

const MONGO_URI = process.env.MONGO_URI!;

interface P {
  name: string;
  desc?: string;
  price: number;
  mrp: number;
  weight: number;
  unit: 'g' | 'kg' | 'pcs';
  tags?: string[];
  featured?: boolean;
}

function slug(text: string): string {
  return slugify(text, { lower: true, strict: true });
}

function sku(catCode: string, name: string): string {
  const n = name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 5);
  const r = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${catCode}-${n}-${r}`;
}

// Products to add to existing categories (cross-listings from Zomato)
const ADDITIONS: { category: string; products: P[] }[] = [
  {
    category: 'Snacks',
    products: [
      { name: 'Pure Ghee Jalebi', desc: 'Savor the magic of golden spirals, expertly fried in rich desi ghee and soaked in saffron-infused sugar syrup.', price: 14000, mrp: 16000, weight: 250, unit: 'g' },
      { name: 'Imarti', desc: 'Imarti is a traditional Indian sweet made from urad dal batter, deep fried into a flower shape.', price: 4500, mrp: 6000, weight: 1, unit: 'pcs' },
    ],
  },
  {
    category: 'Summer Special',
    products: [
      { name: 'Angoori Basundi', desc: 'Angoori basundi is a rich and creamy dessert made with sweetened condensed milk and tiny chena balls.', price: 6000, mrp: 8000, weight: 1, unit: 'pcs' },
      { name: 'Dahi Vada', desc: 'Dahi vada is a classic Indian snack made of soft, deep fried lentil dumplings soaked in creamy yogurt.', price: 7000, mrp: 9000, weight: 1, unit: 'pcs' },
    ],
  },
  {
    category: 'Winter Specials',
    products: [
      { name: 'Pure Ghee Gond Laddu', desc: 'Pure Ghee Goond Laddo is a traditional Indian sweet made from goond (edible gum) loaded with dry fruits.', price: 30000, mrp: 36000, weight: 250, unit: 'g' },
      { name: 'Sutarfeni', desc: 'Delicate, thread like crispy sweet made from fine flour strands roasted to perfection in desi ghee.', price: 20000, mrp: 24000, weight: 150, unit: 'g' },
      { name: 'Pure Ghee Methi Laddu', desc: 'Pure Ghee Methi Laddo is a nutritious and aromatic Indian sweet made from fenugreek in pure ghee.', price: 26000, mrp: 32000, weight: 250, unit: 'g' },
      { name: 'Pure Ghee Dink Laddu', desc: 'Pure Ghee Dink Laddo is a traditional Indian sweet made from roasted coconut and edible gum (dink) in pure ghee.', price: 28000, mrp: 34000, weight: 250, unit: 'g' },
      { name: 'Sugar Free Oats Makhana Laddu', desc: 'Sugar-Free Oats Makhana Laddo is a healthy Indian sweet made from roasted oats, makhana and stevia.', price: 28000, mrp: 34000, weight: 250, unit: 'g' },
      { name: 'Sugar Free Dry Fruits Laddu', desc: 'Sugar free dry fruits laddu is a wholesome, guilt free sweet made from assorted dry fruits without sugar.', price: 32000, mrp: 38000, weight: 250, unit: 'g' },
      { name: 'Sugar Free Khajur Pak', desc: 'Sugar free khajur pak is a wholesome, guilt-free sweet made with nutrient rich dates.', price: 28000, mrp: 34000, weight: 250, unit: 'g' },
    ],
  },
  {
    category: 'Upvas Specials',
    products: [
      { name: 'Malai Kalakand', desc: 'A creamy and rich sweet made from milk and sugar — suitable for upvas (fasting).', price: 22000, mrp: 25000, weight: 250, unit: 'g' },
      { name: 'Special Milk Cake', desc: 'Milk cake made by slowly simmering milk and sugar until it solidifies — suitable for upvas.', price: 22000, mrp: 26000, weight: 250, unit: 'g' },
      { name: 'Kaju Katli', desc: 'Luxurious blend of cashews and sugar pressed into diamond-shaped pieces — suitable for upvas.', price: 40000, mrp: 48000, weight: 250, unit: 'g' },
      { name: 'Malai Peda', desc: 'Rich and creamy Indian sweet made from reduced milk and flavored with cardamom — suitable for upvas.', price: 22000, mrp: 26000, weight: 250, unit: 'g' },
      { name: 'Mathura Peda', desc: 'Traditional Mathura peda made with full-fat milk — suitable for upvas (fasting).', price: 22000, mrp: 26000, weight: 250, unit: 'g' },
      { name: 'Diet Long Masala Banana Chips 250g', desc: 'Diet long masala banana chips are thin, elongated raw banana slices with masala — fasting snack.', price: 13000, mrp: 16000, weight: 250, unit: 'g', tags: ['upvas', 'fasting'] },
      { name: 'Diet Long Banana Chips 250g', desc: 'Diet Long Banana Chips are thin, elongated slices of raw banana — fasting snack.', price: 13000, mrp: 16000, weight: 250, unit: 'g', tags: ['upvas', 'fasting'] },
      { name: 'Mari Banana Wafer', desc: 'Mari Banana Wafer is a crispy, thinly sliced banana snack, lightly fried and seasoned with black pepper.', price: 11000, mrp: 14000, weight: 250, unit: 'g', tags: ['upvas'] },
      { name: 'Dry Sada Salli 250g', desc: 'Dry Sada Potato Salli — simple dry-style Indian snack made with thinly sliced potatoes, fasting-friendly.', price: 10000, mrp: 13000, weight: 250, unit: 'g', tags: ['upvas', 'fasting'] },
      { name: 'Dry Masala Salli 250g', desc: 'Dry Masala Potato Salli made with thinly sliced potatoes and spices — fasting-friendly.', price: 10000, mrp: 13000, weight: 250, unit: 'g', tags: ['upvas', 'fasting'] },
      { name: 'Kesar Peda', desc: 'A traditional Indian sweet made by combining khoya with sugar, pure saffron and cardamom — suitable for upvas.', price: 24000, mrp: 28000, weight: 250, unit: 'g' },
    ],
  },
  {
    category: 'Gudi Padwa Special',
    products: [
      { name: 'Pure Ghee Jalebi', desc: 'Savor the magic of golden spirals, expertly fried in rich desi ghee — Gudi Padwa special.', price: 14000, mrp: 16000, weight: 250, unit: 'g', featured: true },
      { name: 'Kothimbir Wadi', desc: 'Kothimbir Wadi combines fresh coriander leaves with besan, green chilies, ginger — Gudi Padwa special.', price: 7000, mrp: 9000, weight: 4, unit: 'pcs' },
      { name: 'Angoori Basundi', desc: 'Angoori basundi is a rich and creamy dessert made with sweetened condensed milk — Gudi Padwa special.', price: 6000, mrp: 8000, weight: 1, unit: 'pcs' },
      { name: 'Hapus Aamras', desc: 'Premium Ratnagiri Hapus Mango Pulp blended with added sugar for enhanced sweetness — Gudi Padwa special.', price: 10000, mrp: 13000, weight: 250, unit: 'g' },
      { name: 'Hapus Pyaari Aamras', desc: 'A smooth blend of hapus and pyaari mangoes prepared with added sugar — Gudi Padwa special.', price: 9000, mrp: 12000, weight: 250, unit: 'g' },
      { name: 'Dry Fruit Shrikhand', desc: 'Dry fruit shrikhand is a creamy traditional Indian dessert made from thickened yogurt with dry fruits.', price: 15000, mrp: 18000, weight: 400, unit: 'g' },
      { name: 'Kesar Shrikhand', desc: 'Kesar shrikhand is thick, soft, creamy and infused with pure saffron — a Gudi Padwa tradition.', price: 15000, mrp: 18000, weight: 400, unit: 'g' },
      { name: 'Dry Fruit Rose Petal Shrikhand', desc: 'Dry Fruit Rose Petal Shrikhand is a luxurious creamy dessert made from thickened yogurt with rose petals.', price: 17000, mrp: 20000, weight: 400, unit: 'g' },
      { name: 'Mango Shrikhand', desc: 'Mouth watery mango shrikhand — thick flavorful shrikhand made from ripe alphonso mangoes.', price: 15000, mrp: 18000, weight: 400, unit: 'g' },
    ],
  },
];

// New category missing from our catalog
const NEW_CATEGORIES: { name: string; order: number; products: P[] }[] = [
  {
    name: 'Mahashiv Ratri Special',
    order: 34,
    products: [
      { name: 'Malai Kalakand', desc: 'A creamy and rich sweet made from milk and sugar — offered during Mahashiv Ratri.', price: 22000, mrp: 25000, weight: 250, unit: 'g', featured: true },
      { name: 'Kaju Katli', desc: 'Luxurious blend of cashews and sugar pressed into diamond-shaped pieces — Shivratri special.', price: 40000, mrp: 48000, weight: 250, unit: 'g', featured: true },
      { name: 'Rose Kalakand', desc: 'Fragrant and creamy Indian sweet made from condensed milk infused with rose — Shivratri special.', price: 23000, mrp: 27000, weight: 250, unit: 'g' },
      { name: 'Mango Kalakand', desc: 'Made with pure milk and mango pulp, soft and creamy — Shivratri special.', price: 23000, mrp: 27000, weight: 250, unit: 'g' },
      { name: 'Farali Pattice', desc: 'Farali Pattice is a crispy golden potato patty stuffed with a sweet spicy coconut-peanut filling — upvas special.', price: 7000, mrp: 9000, weight: 4, unit: 'pcs' },
      { name: 'Dry Sabudana Stick 250g', desc: 'Crispy, light, and crunchy sticks made from sabudana — perfect for fasting (Shivratri).', price: 12000, mrp: 15000, weight: 250, unit: 'g', tags: ['fasting', 'upvas'] },
      { name: 'Dry Sada Salli 250g', desc: 'Dry Sada Potato Salli — simple dry-style Indian snack with thinly sliced potatoes, fasting-friendly.', price: 10000, mrp: 13000, weight: 250, unit: 'g', tags: ['fasting', 'upvas'] },
      { name: 'Dry Masala Salli 250g', desc: 'Dry Masala Potato Salli with thinly sliced potatoes and spices — fasting-friendly.', price: 10000, mrp: 13000, weight: 250, unit: 'g', tags: ['fasting', 'upvas'] },
      { name: 'Special Farali Chiwda', desc: 'A crunchy vrat snack made with thin potato salli and special farali ingredients — Shivratri special.', price: 13000, mrp: 16000, weight: 250, unit: 'g', tags: ['fasting', 'upvas'] },
    ],
  },
];

// Direct MongoDB insert — bypasses Mongoose pre-validate hook so slug prefix is preserved
async function insertProduct(
  catId: mongoose.Types.ObjectId,
  catSlug: string,
  catCode: string,
  p: P,
) {
  const productSlug = `${catSlug}-${slug(p.name)}`;
  const exists = await Product.collection.findOne({ slug: productSlug });
  if (exists) return 'skip';

  await Product.collection.insertOne({
    _id: new mongoose.Types.ObjectId(),
    name: p.name,
    slug: productSlug,
    categoryId: catId,
    description: p.desc ?? '',
    shortDescription: undefined,
    images: [],
    price: p.price,
    mrp: p.mrp,
    weight: p.weight,
    unit: p.unit,
    stock: 100,
    sku: sku(catCode, p.name),
    tags: p.tags ?? [],
    featured: p.featured ?? false,
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return 'added';
}

async function addMissing() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  let added = 0;
  let skipped = 0;

  // Add products to existing categories
  for (const entry of ADDITIONS) {
    const cat = await Category.findOne({ name: entry.category });
    if (!cat) {
      console.warn(`  ⚠ Category not found: ${entry.category}`);
      continue;
    }
    const catCode = cat.name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 4);
    const catSlug = slugify(cat.name, { lower: true, strict: true });

    let catAdded = 0;
    for (const p of entry.products) {
      const result = await insertProduct(cat._id as mongoose.Types.ObjectId, catSlug, catCode, p);
      if (result === 'added') { added++; catAdded++; }
      else skipped++;
    }
    console.log(`  ${entry.category}: +${catAdded} products`);
  }

  // Create new categories with products
  for (const cat of NEW_CATEGORIES) {
    let catDoc = await Category.findOne({ name: cat.name });
    if (!catDoc) {
      catDoc = await Category.create({
        name: cat.name,
        displayOrder: cat.order,
        active: true,
      });
    }
    const catCode = cat.name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 4);
    const catSlug = slugify(cat.name, { lower: true, strict: true });

    let catAdded = 0;
    for (const p of cat.products) {
      const result = await insertProduct(catDoc._id as mongoose.Types.ObjectId, catSlug, catCode, p);
      if (result === 'added') { added++; catAdded++; }
      else skipped++;
    }
    console.log(`  [NEW] ${cat.name}: ${catAdded} products`);
  }

  const total = await Product.countDocuments();
  const catTotal = await Category.countDocuments();
  console.log(`\nDone. Added ${added} products (${skipped} skipped — already exist).`);
  console.log(`Database now has ${catTotal} categories, ${total} products.`);
  await mongoose.disconnect();
  process.exit(0);
}

addMissing().catch((err) => {
  console.error(err);
  process.exit(1);
});
