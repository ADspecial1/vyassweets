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

interface C {
  name: string;
  order: number;
  products: P[];
}

function slug(text: string): string {
  return slugify(text, { lower: true, strict: true });
}

function sku(catCode: string, name: string): string {
  const n = name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 5);
  const r = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${catCode}-${n}-${r}`;
}

const CATALOG: C[] = [
  {
    name: 'Sweets',
    order: 1,
    products: [
      { name: 'Malai Kalakand', desc: 'A creamy and rich sweet made from milk and sugar. Malai translates to cream.', price: 22000, mrp: 25000, weight: 250, unit: 'g', featured: true },
      { name: 'Pure Ghee Jalebi', desc: 'Golden spirals expertly fried in rich desi ghee and soaked in saffron-infused sugar syrup.', price: 14000, mrp: 16000, weight: 250, unit: 'g', featured: true },
      { name: 'Pure Ghee Motichoor Laddu', desc: 'Traditional Indian sweet made with fine boondi where the balls are tiny and soft.', price: 20000, mrp: 24000, weight: 250, unit: 'g' },
      { name: 'Special Milk Cake', desc: 'Milk cake made by slowly simmering milk, sugar until it solidifies into a rich grainy texture.', price: 22000, mrp: 26000, weight: 250, unit: 'g' },
      { name: 'Kaju Katli', desc: 'Luxurious blend of cashews and sugar pressed into silky diamond-shaped pieces.', price: 40000, mrp: 48000, weight: 250, unit: 'g', featured: true },
      { name: 'Rose Kalakand', desc: 'Fragrant and creamy Indian sweet made from condensed milk infused with rose.', price: 23000, mrp: 27000, weight: 250, unit: 'g' },
      { name: 'Desi Ghee Boondi', desc: 'Traditional Indian sweet made from chickpea flour (besan) fried in pure desi ghee.', price: 16000, mrp: 20000, weight: 250, unit: 'g' },
      { name: 'Malai Peda', desc: 'Rich and creamy Indian sweet made from reduced milk and flavored with cardamom.', price: 22000, mrp: 26000, weight: 250, unit: 'g' },
      { name: 'Pure Ghee Churma Laddu', desc: 'Traditional Indian sweet delicacy, especially popular in Rajasthan and Gujarat.', price: 24000, mrp: 28000, weight: 250, unit: 'g' },
      { name: 'Rajkot Peda', desc: 'Famous Indian sweet made with khoya (mawa) and cardamom. [Veg preparation]', price: 22000, mrp: 26000, weight: 250, unit: 'g' },
      { name: 'Pure Ghee Gond Laddu', desc: 'Traditional Indian sweet made from goond (edible gum) loaded with dry fruits.', price: 30000, mrp: 36000, weight: 250, unit: 'g' },
      { name: 'Mohanthal', desc: 'Traditional Gujarati sweet made from besan (gram flour), ghee, sugar and dry fruits.', price: 22000, mrp: 26000, weight: 250, unit: 'g' },
      { name: 'Desi Ghee Besan Laddu', desc: 'Rich melt-in-the-mouth Indian sweet made from roasted gram flour in desi ghee.', price: 22000, mrp: 26000, weight: 250, unit: 'g' },
      { name: 'Mango Kalakand', desc: 'Made with pure milk and mango pulp, soft and creamy.', price: 23000, mrp: 27000, weight: 250, unit: 'g' },
      { name: 'Kaachi Peda', desc: 'Traditional Indian sweet made from fresh khoya (mawa) and sugar.', price: 20000, mrp: 24000, weight: 250, unit: 'g' },
      { name: 'Sutarfeni', desc: 'Delicate thread-like crispy sweet made from fine flour strands roasted to perfection.', price: 20000, mrp: 24000, weight: 150, unit: 'g' },
      { name: 'Mathura Peda', desc: 'Traditional Indian sweet originating from Mathura, made with full-fat milk.', price: 22000, mrp: 26000, weight: 250, unit: 'g' },
      { name: 'Imarti', desc: 'Traditional Indian sweet made from urad dal batter, deep fried into a flower shape.', price: 4500, mrp: 6000, weight: 1, unit: 'pcs' },
      { name: 'Malai Kesar Puri', desc: 'Rich Indian fried dessert made from dough enriched with saffron and cream.', price: 4000, mrp: 5000, weight: 1, unit: 'pcs' },
      { name: 'Malai Butterscotch Roll', desc: 'Decadent Indian sweet combining rich malai with butterscotch flavor.', price: 24000, mrp: 28000, weight: 250, unit: 'g' },
      { name: 'Kesar Burfi', desc: 'Rich and aromatic Indian sweet made from khoya (mawa) and saffron.', price: 28000, mrp: 34000, weight: 250, unit: 'g' },
      { name: 'Mini Kaju Katli', desc: 'Luxurious mini-sized kaju katli — a delicate blend of cashews and sugar.', price: 40000, mrp: 48000, weight: 250, unit: 'g' },
      { name: 'Saffron Katri', desc: 'Made with premium cashews, saffron, and pistachios, low on sugar.', price: 50000, mrp: 60000, weight: 250, unit: 'g' },
      { name: 'Mini Kesar Kaju Katli', desc: 'Mini saffron katli made with premium cashews, saffron and pistachios, low on sugar.', price: 50000, mrp: 60000, weight: 250, unit: 'g' },
      { name: 'Anjeer Katli', desc: 'Premium Indian sweet combining the richness of figs and cashews. [Veg preparation]', price: 48000, mrp: 58000, weight: 250, unit: 'g' },
      { name: 'Blueberry Katli', desc: 'Modern twist on classic Indian cashew fudge with blueberry flavor.', price: 48000, mrp: 58000, weight: 250, unit: 'g' },
      { name: 'Strawberry Katli', desc: 'Delightful fusion sweet blending cashew richness with fresh strawberry flavor.', price: 48000, mrp: 58000, weight: 250, unit: 'g' },
      { name: 'Kesar Peda', desc: 'Traditional Indian sweet made by combining khoya with sugar, pure saffron and cardamom.', price: 24000, mrp: 28000, weight: 250, unit: 'g' },
      { name: 'Bikaneri Burfi', desc: 'Popular sweet made from khoya (mawa), sugar, flavored with cardamom and spices.', price: 24000, mrp: 28000, weight: 250, unit: 'g' },
      { name: 'Malai Sandwich Burfi', desc: 'Creamy, indulgent Indian sweet made by layering malai. [Veg preparation]', price: 26000, mrp: 32000, weight: 250, unit: 'g' },
      { name: 'Malai Vanilla Wati', desc: 'Creamy, smooth Indian sweet made from a mixture of malai and vanilla.', price: 24000, mrp: 28000, weight: 250, unit: 'g' },
      { name: 'Malai Pista Roll', desc: 'Rich, indulgent Indian sweet made from malai (cream) and pistachios.', price: 26000, mrp: 32000, weight: 250, unit: 'g' },
      { name: 'Pure Ghee Boondi Laddu', desc: 'Classic Indian sweet made from crispy boondi and pure ghee.', price: 20000, mrp: 24000, weight: 250, unit: 'g' },
      { name: 'Pure Ghee Besan Laddu', desc: 'Rich traditional Indian sweet made from roasted gram flour in pure ghee.', price: 22000, mrp: 26000, weight: 250, unit: 'g' },
      { name: 'Pure Ghee Methi Laddu', desc: 'Nutritious and aromatic Indian sweet made from fenugreek in pure ghee.', price: 26000, mrp: 32000, weight: 250, unit: 'g' },
      { name: 'Pure Ghee Dink Laddu', desc: 'Traditional Indian sweet made from roasted coconut and edible gum (dink) in pure ghee.', price: 28000, mrp: 34000, weight: 250, unit: 'g' },
      { name: 'Pista Burfi', desc: 'Decadent Indian sweet made from khoya (mawa), sugar and pistachios.', price: 36000, mrp: 44000, weight: 250, unit: 'g' },
      { name: 'Chocolate Burfi', desc: 'Delicious fusion sweet made from khoya (mawa), sugar, and rich chocolate.', price: 28000, mrp: 34000, weight: 250, unit: 'g' },
      { name: 'South Mysore Pak', desc: 'Variation of the classic Mysore pak originating from South India.', price: 22000, mrp: 26000, weight: 250, unit: 'g' },
      { name: 'Maharashtrian Mysore Pak', desc: 'Rich, soft and ghee-loaded sweet made from gram flour.', price: 22000, mrp: 26000, weight: 250, unit: 'g' },
      { name: 'Desi Ghee Khaja', desc: 'Traditional Indian sweet made from layers of flour and soaked in sugar syrup.', price: 18000, mrp: 22000, weight: 250, unit: 'g' },
      { name: 'Desi Ghee Balushahi', desc: 'Rich traditional Indian sweet made from wheat flour, deep fried and soaked in sugar syrup.', price: 18000, mrp: 22000, weight: 250, unit: 'g' },
      { name: 'Special Malai Chikki', desc: 'Special chikki made with fresh malai for a rich, creamy texture.', price: 20000, mrp: 24000, weight: 250, unit: 'g' },
    ],
  },
  {
    name: 'Bengali Sweets',
    order: 2,
    products: [
      { name: 'Kesar Rasmalai', desc: 'Soft spongy chhena (paneer) dessert soaked in fragrant saffron-infused cream.', price: 5000, mrp: 6500, weight: 1, unit: 'pcs', featured: true },
      { name: 'Gulab Jamun Mini', desc: 'Soft bite-sized milk dumplings soaked in fragrant sugar syrup.', price: 3000, mrp: 4000, weight: 1, unit: 'pcs' },
      { name: 'Sponge Rasgulla', desc: 'Soft, spongy and juicy sweet made from fresh chena balls soaked in sugar syrup.', price: 3500, mrp: 4500, weight: 1, unit: 'pcs' },
      { name: 'Gulab Jamun', desc: 'Classic Indian sweet made from soft, deep-fried milk dumplings soaked in rose-flavored sugar syrup.', price: 4000, mrp: 5000, weight: 1, unit: 'pcs', featured: true },
      { name: 'Rasgulla Mini', desc: 'Bite-sized spongy chena balls soaked in fragrant sugar syrup.', price: 3000, mrp: 4000, weight: 1, unit: 'pcs' },
      { name: 'Malai Sandwich', desc: 'Soft creamy dessert made with layers of fresh cream and chena.', price: 7000, mrp: 9000, weight: 1, unit: 'pcs' },
      { name: 'Santra Chaap', desc: 'Refreshing Indian sweet made from tender, juicy orange soaked in sugar syrup.', price: 5000, mrp: 6500, weight: 1, unit: 'pcs' },
      { name: 'Desi Gud Rasgulla', desc: 'Traditional Indian sweet made from soft chena balls in jaggery syrup. [Veg preparation]', price: 4000, mrp: 5000, weight: 1, unit: 'pcs' },
      { name: 'Kala Jamun', desc: 'Rich deep brown variation of the classic sweet made from khoya.', price: 4500, mrp: 6000, weight: 1, unit: 'pcs' },
      { name: 'Malai Chaap', desc: 'Rich and creamy dessert made from soft spongy chena soaked in malai.', price: 6000, mrp: 8000, weight: 1, unit: 'pcs' },
      { name: 'Gulab Toast', desc: 'Malai Sandwich with Gulab Toast combination — a unique Bengali-style dessert.', price: 8000, mrp: 10000, weight: 1, unit: 'pcs' },
    ],
  },
  {
    name: 'Dry Fruits Sweets',
    order: 3,
    products: [
      { name: 'Santra Ball', desc: 'Delicate orange-flavored dry fruit sweet ball.', price: 30000, mrp: 36000, weight: 250, unit: 'g' },
      { name: 'Silver Touch', desc: 'Premium dry fruit sweet with silver vark finish.', price: 35000, mrp: 42000, weight: 250, unit: 'g' },
      { name: 'Rose Blossom', desc: 'Dry fruit sweet infused with rose flavor.', price: 32000, mrp: 38000, weight: 250, unit: 'g' },
      { name: 'Fresh Pine', desc: 'Pineapple-flavored dry fruit sweet.', price: 30000, mrp: 36000, weight: 250, unit: 'g' },
      { name: 'Dry Fruit Watermelon', desc: 'Watermelon-shaped and flavored dry fruit sweet.', price: 32000, mrp: 38000, weight: 250, unit: 'g' },
      { name: 'Kaju Kalash', desc: 'Elegant cashew-based sweet shaped like a kalash.', price: 50000, mrp: 60000, weight: 250, unit: 'g' },
      { name: 'Bharela Kaju', desc: 'Cashews filled with a rich dry fruit stuffing.', price: 55000, mrp: 65000, weight: 250, unit: 'g' },
      { name: 'Litchi Delight', desc: 'Litchi-shaped dry fruit sweet with a surprise filling.', price: 35000, mrp: 42000, weight: 250, unit: 'g' },
      { name: 'Summer Fruit', desc: 'Assorted summer fruit-shaped dry fruit sweets.', price: 32000, mrp: 38000, weight: 250, unit: 'g' },
      { name: 'Berry Delight', desc: 'Berry-flavored premium dry fruit sweet.', price: 32000, mrp: 38000, weight: 250, unit: 'g' },
    ],
  },
  {
    name: 'Sugar Free Sweets',
    order: 4,
    products: [
      { name: 'Sugar Free Orange Pak', desc: 'Healthy guilt-free sweet made with orange and stevia. [Veg preparation]', price: 28000, mrp: 34000, weight: 250, unit: 'g' },
      { name: 'Sugar Free Khajur Pak', desc: 'Wholesome guilt-free sweet made with nutrient-rich dates.', price: 28000, mrp: 34000, weight: 250, unit: 'g' },
      { name: 'Sugar Free Anjeer Pak', desc: 'Wholesome guilt-free sweet made with nutrient-rich figs.', price: 30000, mrp: 36000, weight: 250, unit: 'g' },
      { name: 'Sugar Free Cranberry', desc: 'Healthy guilt-free sweet made with cranberry. [Veg preparation]', price: 30000, mrp: 36000, weight: 250, unit: 'g' },
      { name: 'Sugar Free Blueberry Pak', desc: 'Wholesome guilt-free sweet made with natural blueberry. [Veg preparation]', price: 32000, mrp: 38000, weight: 250, unit: 'g' },
      { name: 'Sugar Free Oats Makhana Laddu', desc: 'Healthy Indian sweet made from roasted oats, makhana and stevia.', price: 28000, mrp: 34000, weight: 250, unit: 'g' },
      { name: 'Sugar Free Nachni Khajur Laddu', desc: 'Nutritious Indian sweet made from nachni (ragi) and dates without sugar.', price: 26000, mrp: 32000, weight: 250, unit: 'g' },
      { name: 'Jaggery Kaju Katli', desc: 'Wholesome twist on classic cashew katli sweetened with jaggery. [Veg preparation]', price: 44000, mrp: 52000, weight: 250, unit: 'g' },
      { name: 'Sugar Free Kaju Katli', desc: 'Rich smooth cashew-based sweet made without sugar, sweetened with stevia.', price: 48000, mrp: 58000, weight: 250, unit: 'g' },
      { name: 'Sugar Free Dry Fruits Laddu', desc: 'Wholesome guilt-free laddu made from assorted dry fruits without sugar.', price: 32000, mrp: 38000, weight: 250, unit: 'g' },
    ],
  },
  {
    name: 'Special Basundi',
    order: 5,
    products: [
      { name: 'Angoori Basundi', desc: 'Rich and creamy dessert made with sweetened condensed milk and tiny chena balls.', price: 6000, mrp: 8000, weight: 1, unit: 'pcs', featured: true },
    ],
  },
  {
    name: 'Petha',
    order: 6,
    products: [
      { name: 'Agra Petha', desc: 'Translucent, soft and juicy sweet made from ash gourd, sugar and rose water.', price: 14000, mrp: 18000, weight: 250, unit: 'g' },
      { name: 'Kesar Angoori Petha', desc: 'Bite-sized juicy saffron-infused delicacy made from ash gourd.', price: 16000, mrp: 20000, weight: 250, unit: 'g' },
    ],
  },
  {
    name: 'Premium Crunch',
    order: 7,
    products: [
      { name: 'Oreo Crunchy', desc: 'A perfect blend of creamy indulgence and crunchy delight with Oreo.', price: 18000, mrp: 22000, weight: 200, unit: 'g' },
      { name: 'Bourbon Crunch', desc: 'Rich and indulgent treat made for true chocolate lovers. [Veg preparation]', price: 18000, mrp: 22000, weight: 200, unit: 'g' },
      { name: 'Mango Crunch', desc: 'Refreshing tropical delight with a crunchy twist. Smooth mango with a crunch.', price: 18000, mrp: 22000, weight: 200, unit: 'g' },
      { name: 'Hazelnut Crunchy', desc: 'Rich nutty indulgence crafted for premium taste lovers. [Veg preparation]', price: 20000, mrp: 25000, weight: 200, unit: 'g' },
      { name: 'Kesar Crunch', desc: 'Royal Indian delight with a modern crunchy twist. [Veg preparation]', price: 20000, mrp: 25000, weight: 200, unit: 'g' },
      { name: 'Mewa Bites', desc: 'Premium dry fruit bites packed with rich mewa flavor.', price: 22000, mrp: 28000, weight: 200, unit: 'g' },
      { name: 'Orange Bites', desc: 'Citrusy orange-flavored premium chocolate bites.', price: 18000, mrp: 22000, weight: 200, unit: 'g' },
      { name: 'Chocolate Bites', desc: 'Rich chocolate premium bites with a smooth center.', price: 18000, mrp: 22000, weight: 200, unit: 'g' },
    ],
  },
  {
    name: 'Snacks',
    order: 8,
    products: [
      { name: 'Cheese Corn Ball', desc: 'Crispy bite-sized snacks combining creamy cheese with sweet corn.', price: 8000, mrp: 10000, weight: 6, unit: 'pcs', featured: true },
      { name: 'Fresh Corn Bhakarwadi', desc: 'Unique bhakarwadi featuring a filling that blends fresh corn with spices.', price: 7000, mrp: 9000, weight: 4, unit: 'pcs' },
      { name: 'Kothimbir Wadi', desc: 'Combines fresh coriander leaves with besan, green chilies and spices.', price: 7000, mrp: 9000, weight: 4, unit: 'pcs' },
      { name: 'Batata Vada Mini', desc: 'Mini batata wadas — spicy mashed potato filling in crispy chickpea batter.', price: 6000, mrp: 8000, weight: 6, unit: 'pcs' },
      { name: 'Fresh Green Lilva Kachori', desc: 'Traditional delicacy filled with a flavorful mixture of fresh green lilva beans.', price: 7000, mrp: 9000, weight: 4, unit: 'pcs' },
      { name: 'Chinese Samosa', desc: 'Combination of Chinese and Indian flavors in a crispy pastry shell.', price: 6000, mrp: 8000, weight: 4, unit: 'pcs' },
      { name: 'Onion Samosa', desc: 'Smaller, crispier and lighter samosa filled with finely chopped spiced onions.', price: 5000, mrp: 7000, weight: 4, unit: 'pcs' },
      { name: 'Jaipuri Aloo Pyaaz Kachori', desc: 'Famous Rajasthani snack from Jaipur with spicy potato and onion filling.', price: 7000, mrp: 9000, weight: 4, unit: 'pcs' },
      { name: 'Vegetable Samosa', desc: 'Classic Indian snack with crispy shell and spiced vegetable filling.', price: 5000, mrp: 7000, weight: 4, unit: 'pcs', featured: true },
      { name: 'Aloo Wadi', desc: 'Patra prepared by spreading a flavorful spiced batter over fresh taro leaves.', price: 7000, mrp: 9000, weight: 4, unit: 'pcs' },
      { name: 'Khasta Kachori', desc: '[No Onion No Garlic] Round deep fried pastry stuffed with spiced lentils.', price: 6000, mrp: 8000, weight: 4, unit: 'pcs' },
      { name: 'Methi Thepla', desc: 'Popular Gujarati flatbread made from whole wheat flour mixed with fenugreek leaves.', price: 6000, mrp: 8000, weight: 3, unit: 'pcs' },
      { name: 'Dahi Vada', desc: 'Classic Indian snack — soft deep fried lentil dumplings soaked in spiced yogurt.', price: 7000, mrp: 9000, weight: 1, unit: 'pcs', featured: true },
      { name: 'Schezwan Corn Roll', desc: 'Indo-Chinese snack featuring a crispy deep-fried roll with schezwan and corn filling.', price: 6000, mrp: 8000, weight: 1, unit: 'pcs' },
      { name: 'Paneer Chilli Samosa', desc: 'Crunchy deep-fried outer layer filled with delicious paneer and chilli stuffing.', price: 7000, mrp: 9000, weight: 4, unit: 'pcs' },
    ],
  },
  {
    name: 'Shrikhand',
    order: 9,
    products: [
      { name: 'Dry Fruit Shrikhand', desc: 'Creamy traditional Indian dessert made from thickened yogurt loaded with dry fruits.', price: 15000, mrp: 18000, weight: 400, unit: 'g', featured: true },
      { name: 'Kesar Shrikhand', desc: 'Traditional Indian dessert — thick, soft, creamy and infused with pure saffron.', price: 15000, mrp: 18000, weight: 400, unit: 'g' },
      { name: 'Dry Fruit Rose Petal Shrikhand', desc: 'Luxurious creamy dessert made from thickened yogurt with rose petals and dry fruits.', price: 17000, mrp: 20000, weight: 400, unit: 'g' },
      { name: 'Mango Shrikhand', desc: 'Thick flavorful mango shrikhand made from ripe Alphonso mangoes.', price: 15000, mrp: 18000, weight: 400, unit: 'g' },
    ],
  },
  {
    name: 'Halwa',
    order: 10,
    products: [
      { name: 'Kesar Halwa', desc: 'Rich aromatic dessert made from pure ghee, semolina and saffron.', price: 20000, mrp: 24000, weight: 250, unit: 'g', featured: true },
      { name: 'Pista Halwa', desc: 'Rich creamy dessert made from finely ground pistachios, sugar and ghee.', price: 30000, mrp: 36000, weight: 250, unit: 'g' },
      { name: 'Pineapple Halwa', desc: 'Sweet tropical dessert made from fresh pineapple, sugar and ghee.', price: 20000, mrp: 24000, weight: 250, unit: 'g' },
      { name: 'Maharaja Halwa', desc: 'Rich and indulgent dessert made with premium ingredients including dry fruits and saffron.', price: 35000, mrp: 42000, weight: 250, unit: 'g' },
      { name: 'Anjeer Halwa', desc: 'Rich wholesome dessert made from nutrient-packed figs, ghee and sugar.', price: 28000, mrp: 34000, weight: 250, unit: 'g' },
      { name: 'Desi Ghee Valiyati Halwa', desc: 'Rich luxurious sweet made in pure desi ghee — a classic recipe.', price: 28000, mrp: 34000, weight: 250, unit: 'g' },
      { name: 'Desi Ghee Badami Halwa', desc: 'Rich luxurious sweet made from almonds in pure desi ghee.', price: 32000, mrp: 38000, weight: 250, unit: 'g' },
      { name: 'Assorted Regular Desi Ghee Halwa', desc: 'Assorted Regular Desi Ghee Halwa [280 g].', price: 24000, mrp: 28000, weight: 280, unit: 'g' },
      { name: 'Assorted Fruit Desi Ghee Halwa', desc: 'Assorted Fruit Desi Ghee Halwa [280 g].', price: 26000, mrp: 32000, weight: 280, unit: 'g' },
      { name: 'Assorted Badami Halwa', desc: 'Assorted Badami Halwa [280 g].', price: 30000, mrp: 36000, weight: 280, unit: 'g' },
    ],
  },
  {
    name: 'Baklava',
    order: 11,
    products: [
      { name: 'Pyramid Baklava', desc: 'Rich layered pastry made with crisp phyllo dough and premium nuts. [Veg preparation]', price: 35000, mrp: 42000, weight: 250, unit: 'g' },
      { name: 'Walnut Baklava', desc: 'Rich layered pastry made with crisp phyllo dough and generously filled with walnuts.', price: 35000, mrp: 42000, weight: 250, unit: 'g' },
    ],
  },
  {
    name: 'Fafda and Papdi',
    order: 12,
    products: [
      { name: 'Hing Mari Fafda', desc: 'Crispy savory Gujarati snack flavored with asafoetida and black pepper.', price: 12000, mrp: 15000, weight: 250, unit: 'g', featured: true },
      { name: 'Nylon Papdi', desc: 'Light, crispy and delicate snack made from refined flour — named for its thin texture.', price: 10000, mrp: 13000, weight: 250, unit: 'g' },
      { name: 'Vanela Gathiya 200g', desc: 'Traditional Gujarati snack made from gram flour, subtly flavored with ajwain.', price: 10000, mrp: 13000, weight: 200, unit: 'g' },
    ],
  },
  {
    name: 'Upvas Specials',
    order: 13,
    products: [
      { name: 'Farali Pattice', desc: 'Crispy golden potato patty stuffed with a sweet, spicy coconut-peanut filling.', price: 7000, mrp: 9000, weight: 4, unit: 'pcs', featured: true },
      { name: 'Kela Chiwda', desc: 'Crispy and flavorful snack made from thinly sliced raw bananas with dry fruits.', price: 12000, mrp: 15000, weight: 250, unit: 'g' },
      { name: 'Dry Sabudana Stick 250g', desc: 'Crispy light and crunchy sticks made from sabudana, perfect for fasting.', price: 12000, mrp: 15000, weight: 250, unit: 'g' },
      { name: 'Dry Sabudana Puri 200g', desc: 'Crispy dry sabudana puris, a perfect fasting snack.', price: 10000, mrp: 13000, weight: 200, unit: 'g' },
      { name: 'Dry Sabudana Chiwda 200g', desc: 'Light crispy mix made from sabudana, peanuts, dry fruits and mild spices.', price: 10000, mrp: 13000, weight: 200, unit: 'g' },
      { name: 'Dry Rajgira Chiwda 200g', desc: 'Healthy and crunchy rajgira (amaranth) chiwda, perfect for fasting days.', price: 11000, mrp: 14000, weight: 200, unit: 'g' },
      { name: 'Farali Chiwda', desc: 'Crunchy vrat snack made from potato salli and peanuts.', price: 12000, mrp: 15000, weight: 250, unit: 'g' },
      { name: 'Special Farali Chiwda', desc: 'A crunchy vrat snack made with thin potato salli and special farali ingredients.', price: 13000, mrp: 16000, weight: 250, unit: 'g' },
      { name: 'Upwas Bhakri 200gms', desc: 'Soft and nutritious flatbread made from rajgira flour, perfect for fasting.', price: 9000, mrp: 12000, weight: 200, unit: 'g' },
      { name: 'Upwas Fulwadi 200gms', desc: 'Crispy farali fulwadi made with special fasting-friendly ingredients.', price: 10000, mrp: 13000, weight: 200, unit: 'g' },
    ],
  },
  {
    name: 'Namkeen',
    order: 14,
    products: [
      { name: 'Moong Dal Chakli 250g', desc: 'Crunchy spiral-shaped snack made from moong dal flour.', price: 13000, mrp: 16000, weight: 250, unit: 'g' },
      { name: 'Bhajani Chakli 250g', desc: 'Chakli made from a mix of various roasted grains and pulses.', price: 13000, mrp: 16000, weight: 250, unit: 'g', featured: true },
      { name: 'Makai Chivda 250g', desc: 'Crunchy and flavorful snack made from fried corn flakes.', price: 12000, mrp: 15000, weight: 250, unit: 'g' },
      { name: 'Garlic Chiwda 250g', desc: 'Crunchy savory snack made by roasting flattened rice with garlic.', price: 12000, mrp: 15000, weight: 250, unit: 'g' },
      { name: 'Whole Wheat Jeera Puri 250g', desc: 'Crisp golden brown deep fried bread made from whole wheat and cumin.', price: 12000, mrp: 15000, weight: 250, unit: 'g' },
      { name: 'Butter Chakli 200g', desc: 'Crispy spiral-shaped snack made with a rich blend of butter and rice flour.', price: 12000, mrp: 15000, weight: 200, unit: 'g' },
      { name: 'Butter Nachni Chakli Mini 200g', desc: 'Crispy spiral-shaped snack made from nutritious nachni (ragi) and butter.', price: 12000, mrp: 15000, weight: 200, unit: 'g' },
      { name: 'Patal Poha Chivda 250g', desc: 'Light crispy Maharashtrian snack made from thin flattened rice.', price: 12000, mrp: 15000, weight: 250, unit: 'g' },
      { name: 'Sev Puri 250g', desc: 'Classic Mumbai street food mix of sev and puri.', price: 10000, mrp: 13000, weight: 250, unit: 'g' },
      { name: 'Dry Karanji 8 Pieces', desc: 'Made from sukha naral, powdered sugar and cardamom in a crispy shell.', price: 13000, mrp: 16000, weight: 8, unit: 'pcs' },
      { name: 'Mini Chorafali 250g', desc: 'Crispy light airy Gujarati snack made from urad dal flour.', price: 13000, mrp: 16000, weight: 250, unit: 'g' },
      { name: 'Moong Dal Murukku 250g', desc: 'Crunchy spiral-shaped snack made from moong dal flour.', price: 13000, mrp: 16000, weight: 250, unit: 'g' },
      { name: 'Schezwan Stick 250g', desc: 'Spicy crunchy snack made from flour infused with schezwan spices.', price: 13000, mrp: 16000, weight: 250, unit: 'g' },
      { name: 'Soya Stick 250g', desc: 'Crunchy savory snack made from nutritious soya flour and spices.', price: 13000, mrp: 16000, weight: 250, unit: 'g' },
      { name: 'Ujjaini Sev 250g', desc: 'Made from gram flour (besan) and lightly spiced with salt and ajwain.', price: 10000, mrp: 13000, weight: 250, unit: 'g' },
      { name: 'Bhavnagari Gathiya 250g', desc: 'Soft mildly spiced Gujarati snack made from gram flour.', price: 11000, mrp: 14000, weight: 250, unit: 'g' },
      { name: 'Manchurian Stick 250g', desc: 'Crunchy sticks with Manchurian flavor.', price: 13000, mrp: 16000, weight: 250, unit: 'g' },
      { name: 'Tomato Stick 250g', desc: 'Crispy sticks with tangy tomato flavor.', price: 12000, mrp: 15000, weight: 250, unit: 'g' },
      { name: 'Mixed Farsan 250g', desc: 'Assorted mix of crispy Gujarati farsan snacks.', price: 12000, mrp: 15000, weight: 250, unit: 'g' },
      { name: 'Coconut Yellow Banana Chips 250g', desc: 'Crispy thin slices of ripe bananas with coconut flavor. [Veg preparation]', price: 12000, mrp: 15000, weight: 250, unit: 'g' },
      { name: 'Mari Banana Wafer', desc: 'Crispy thinly sliced banana snack lightly fried with black pepper (mari).', price: 11000, mrp: 14000, weight: 250, unit: 'g' },
      { name: 'Banana Tomato Chips 250g', desc: 'Thinly sliced raw banana chips flavored with tomato.', price: 12000, mrp: 15000, weight: 250, unit: 'g' },
      { name: 'Sweet Kela Banana Chips 250g', desc: 'Thin slices of ripe banana fried until crispy and sweetened. [Veg preparation]', price: 11000, mrp: 14000, weight: 250, unit: 'g' },
      { name: 'Fanas Chips 200g', desc: 'Thinly sliced raw jackfruit pieces deep-fried until crisp.', price: 13000, mrp: 16000, weight: 200, unit: 'g' },
      { name: 'Butter Masala Chakli Mini 200g', desc: 'Crispy spiral-shaped snack made with buttery dough and masala spices.', price: 12000, mrp: 15000, weight: 200, unit: 'g' },
      { name: 'Mozzarella Cheese Stick 250g', desc: 'Crispy crunchy snack sticks with mozzarella cheese flavor.', price: 15000, mrp: 18000, weight: 250, unit: 'g' },
      { name: 'Sada Sev 250g', desc: 'Plain crispy sev made from gram flour.', price: 9000, mrp: 12000, weight: 250, unit: 'g' },
      { name: 'Nylon Sev 250g', desc: 'Extra-thin delicate sev made from gram flour.', price: 9000, mrp: 12000, weight: 250, unit: 'g' },
      { name: 'Butter Bhavnagri Gathiya 200g', desc: 'Rich soft melt-in-the-mouth Gujarati snack made from gram flour and butter.', price: 12000, mrp: 15000, weight: 200, unit: 'g' },
      { name: 'Tikha Gathiya 250g', desc: 'Traditional spicy and crunchy gathiya snack.', price: 11000, mrp: 14000, weight: 250, unit: 'g' },
      { name: 'Tikha Sev 250g', desc: 'Spicy crispy Indian snack made from gram flour with extra heat.', price: 10000, mrp: 13000, weight: 250, unit: 'g' },
      { name: 'Baked Shakarpara 250g', desc: 'Healthier oven-baked version of the traditional crispy Indian snack.', price: 11000, mrp: 14000, weight: 250, unit: 'g' },
      { name: 'Jain Chiwda 250g', desc: 'Mild crispy mixture made from flattened rice (poha) and peanuts — Jain friendly.', price: 12000, mrp: 15000, weight: 250, unit: 'g' },
      { name: 'Mahalaxmi Chiwda 250g', desc: 'Popular ready-made Maharashtrian snack mix known for its crunchy texture.', price: 12000, mrp: 15000, weight: 250, unit: 'g' },
      { name: 'Dry Fruit Mahalaxmi Chiwda 250g', desc: 'Mahalaxmi Chiwda loaded with premium dry fruits.', price: 15000, mrp: 18000, weight: 250, unit: 'g' },
      { name: 'Dry Fruit Corn Chivda 250g', desc: 'Corn chiwda loaded with dry fruits for extra nutrition.', price: 14000, mrp: 17000, weight: 250, unit: 'g' },
      { name: 'Indori Mixture 250g', desc: 'Crunchy blend of sev, poha, peanuts, and spices — Indore style. [Veg preparation]', price: 12000, mrp: 15000, weight: 250, unit: 'g' },
      { name: 'Golden Mixture 250g', desc: 'Crispy mix of sev, boondi, lentils, peanuts, and spices.', price: 12000, mrp: 15000, weight: 250, unit: 'g' },
      { name: 'Puneri Misal Mixture 250g', desc: 'Crunchy mildly spicy blend of farsan, sev, chivda — Pune style.', price: 12000, mrp: 15000, weight: 250, unit: 'g' },
      { name: 'Nadiyadi Bhusa 250g', desc: 'Soft-crunchy spiced farsan mix made with thin sev and puffed grains.', price: 12000, mrp: 15000, weight: 250, unit: 'g' },
      { name: 'Navratan Mixture 250g', desc: 'Nine-ingredient crunchy mixture — a classic Mumbai farsan staple.', price: 12000, mrp: 15000, weight: 250, unit: 'g' },
      { name: 'Panchratan Mixture 250g', desc: 'Five-ingredient crunchy and flavorful farsan mix.', price: 12000, mrp: 15000, weight: 250, unit: 'g' },
      { name: 'Ratlami Sev 250g', desc: 'Made from gram flour and a blend of special Ratlami spices.', price: 11000, mrp: 14000, weight: 250, unit: 'g' },
      { name: 'Lounge Sev 250g', desc: 'Thick crispy sev made from gram flour, fried into thick strands.', price: 10000, mrp: 13000, weight: 250, unit: 'g' },
      { name: 'Garlic Sev 250g', desc: 'Savory crunchy Indian snack made from gram flour with garlic flavor.', price: 10000, mrp: 13000, weight: 250, unit: 'g' },
      { name: 'Schezwan Potato Sev 250g', desc: 'Made from gram flour and potato — crispy, spicy and tangy.', price: 11000, mrp: 14000, weight: 250, unit: 'g' },
      { name: 'Sada Boondi 250g', desc: 'Plain lightly salted and crunchy boondi without added spices.', price: 10000, mrp: 13000, weight: 250, unit: 'g' },
      { name: 'Masala Boondi 250g', desc: 'Spiced crunchy snack made from gram flour droplets with masala.', price: 10000, mrp: 13000, weight: 250, unit: 'g' },
      { name: 'Dry Sada Salli 250g', desc: 'Dry-style thinly sliced potato salli — plain version.', price: 10000, mrp: 13000, weight: 250, unit: 'g' },
      { name: 'Dry Masala Salli 250g', desc: 'Dry-style thinly sliced potato salli with masala spices.', price: 10000, mrp: 13000, weight: 250, unit: 'g' },
      { name: 'Masala Patla Poha Chiwda 250g', desc: 'Spicy and crispy Maharashtrian snack made from thin flattened rice.', price: 12000, mrp: 15000, weight: 250, unit: 'g' },
      { name: 'Manglori Mixture 250g', desc: 'Crispy blend of sev, peanuts, lentils and spices, flavored Manglori style.', price: 12000, mrp: 15000, weight: 250, unit: 'g' },
      { name: 'Papad Mixture 250g', desc: 'Crunchy savory Indian snack mix that features crispy papad pieces.', price: 12000, mrp: 15000, weight: 250, unit: 'g' },
      { name: 'Moong Dal 250g', desc: 'Classic fried moong dal — crunchy protein-rich snack.', price: 11000, mrp: 14000, weight: 250, unit: 'g' },
      { name: 'Chana Dal 250g', desc: 'Fried and salted chana dal — crunchy protein-rich snack.', price: 11000, mrp: 14000, weight: 250, unit: 'g' },
      { name: 'Green Moong 250g', desc: 'Crispy fried green moong beans — a healthy crunchy snack.', price: 11000, mrp: 14000, weight: 250, unit: 'g' },
      { name: 'Masala Moong 250g', desc: 'Spiced fried moong beans with a kick of masala.', price: 11000, mrp: 14000, weight: 250, unit: 'g' },
      { name: 'Oli Karanji 5 Pieces', desc: 'Fresh karanji stuffed with grated coconut, jaggery and cardamom.', price: 10000, mrp: 13000, weight: 5, unit: 'pcs' },
      { name: 'Meetha Shankarpali 250g', desc: 'Sweet crispy diamond-shaped snack made from flour and sugar.', price: 11000, mrp: 14000, weight: 250, unit: 'g' },
      { name: 'Khara Shankarpali 250g', desc: 'Savory crispy snack made from flour, salt, ajwain and jeera.', price: 11000, mrp: 14000, weight: 250, unit: 'g' },
      { name: 'Rumali Chorafali 250g', desc: 'Crispy light airy Gujarati snack made from urad dal flour — rumali style.', price: 13000, mrp: 16000, weight: 250, unit: 'g' },
      { name: 'Singh Bhujiya 250gms', desc: 'Crispy spicy bhujiya made with special spices and gram flour.', price: 11000, mrp: 14000, weight: 250, unit: 'g' },
    ],
  },
  {
    name: 'Roasted Snacks',
    order: 15,
    products: [
      { name: 'Diet Long Masala Banana Chips 250g', desc: 'Thin elongated raw banana slices with masala — baked not fried.', price: 13000, mrp: 16000, weight: 250, unit: 'g' },
      { name: 'Roasted Jawari Chiwda 250g', desc: 'Healthy roasted jowar (sorghum) chiwda — light and crunchy.', price: 13000, mrp: 16000, weight: 250, unit: 'g' },
      { name: 'Diet Long Banana Chips 250g', desc: 'Thin elongated slices of raw banana — baked not fried.', price: 13000, mrp: 16000, weight: 250, unit: 'g' },
      { name: 'Roasted Soya Chips 250g', desc: 'Thin crunchy chips made from soya flour — high protein snack.', price: 14000, mrp: 17000, weight: 250, unit: 'g' },
      { name: 'Roasted Multigrain Mixture 250g', desc: 'Healthy roasted mixture made from multiple grains.', price: 14000, mrp: 17000, weight: 250, unit: 'g' },
      { name: 'Roasted Karela Chips 100g', desc: 'Thinly sliced bitter gourd lightly roasted until crispy.', price: 10000, mrp: 13000, weight: 100, unit: 'g' },
      { name: 'Diet Long Mari Chips 250g', desc: 'Thin elongated chips made from raw tapioca with black pepper.', price: 13000, mrp: 16000, weight: 250, unit: 'g' },
      { name: 'Roasted Nachani Chips 250g', desc: 'Crispy chips made from nachni (ragi/finger millet) flour.', price: 13000, mrp: 16000, weight: 250, unit: 'g' },
      { name: 'Roasted Beetroot Chips 250g', desc: 'Thinly sliced beetroot baked until crispy — naturally colored.', price: 13000, mrp: 16000, weight: 250, unit: 'g' },
      { name: 'Roasted Tri In One Chips 200g', desc: 'Healthy crunchy snack mix made from palak, beetroot and pumpkin slices.', price: 14000, mrp: 17000, weight: 200, unit: 'g' },
      { name: 'Roasted Jalapeno Chips 200g', desc: 'Thin slices of jalapeno peppers roasted until crispy.', price: 13000, mrp: 16000, weight: 200, unit: 'g' },
      { name: 'Diet Chiwda 250g', desc: 'Healthy roasted chiwda with low fat content.', price: 12000, mrp: 15000, weight: 250, unit: 'g' },
      { name: 'Roasted Nachni Chiwda 250g', desc: 'Healthy roasted chiwda made from nachni (ragi).', price: 13000, mrp: 16000, weight: 250, unit: 'g' },
      { name: 'Roasted Quinoa Mixture 250g', desc: 'Healthy roasted mixture with quinoa as the star ingredient.', price: 16000, mrp: 20000, weight: 250, unit: 'g' },
      { name: 'Roasted Kabuli Chana 250g', desc: 'Roasted whole chickpeas — crunchy high-protein snack.', price: 12000, mrp: 15000, weight: 250, unit: 'g' },
      { name: 'Roasted Healthy Bhindy 100g', desc: 'Thinly sliced okra lightly roasted until crispy.', price: 10000, mrp: 13000, weight: 100, unit: 'g' },
      { name: 'Roasted Paneer Peanut Nutties 250g', desc: 'Roasted peanuts with paneer flavor coating.', price: 14000, mrp: 17000, weight: 250, unit: 'g' },
      { name: 'Diet Mini Chakli 250g', desc: 'Mini chaklis baked instead of fried for a healthier option.', price: 13000, mrp: 16000, weight: 250, unit: 'g' },
      { name: 'Roasted Pista Peanut 250gms', desc: 'Roasted peanuts with pistachio flavor — crunchy and nutty.', price: 16000, mrp: 20000, weight: 250, unit: 'g' },
      { name: 'Cheese Bingo 250g', desc: 'Crunchy bingo-style snack with cheese flavor.', price: 14000, mrp: 18000, weight: 250, unit: 'g' },
      { name: 'Achari Bingo 250g', desc: 'Crunchy bingo-style snack with tangy achari flavor.', price: 14000, mrp: 18000, weight: 250, unit: 'g' },
    ],
  },
  {
    name: 'Kettle Chips',
    order: 16,
    products: [
      { name: 'Kettle Spinach Chips 200g', desc: 'Kettle-cooked spinach chips — crunchy and nutritious.', price: 14000, mrp: 18000, weight: 200, unit: 'g' },
      { name: 'Kettle Beetroot Chips 200g', desc: 'Kettle-cooked beetroot chips — naturally sweet and crunchy.', price: 14000, mrp: 18000, weight: 200, unit: 'g' },
      { name: 'Kettle Carrot Chips 200g', desc: 'Kettle-cooked carrot chips — crunchy savory snack.', price: 14000, mrp: 18000, weight: 200, unit: 'g' },
      { name: 'Kettle Nachni Chips 200g', desc: 'Kettle-cooked nachni (ragi) chips — gluten-free crunchy snack.', price: 14000, mrp: 18000, weight: 200, unit: 'g' },
      { name: 'Kettle Jawar Chips 200g', desc: 'Gluten-free kettle-cooked jowar chips — wholesome and crunchy.', price: 14000, mrp: 18000, weight: 200, unit: 'g' },
      { name: 'Kettle Bajri Chips 200g', desc: 'Gluten-free kettle-cooked bajra chips — nutritious and crunchy.', price: 14000, mrp: 18000, weight: 200, unit: 'g' },
      { name: 'Kettle Moong Chips 200g', desc: 'Gluten-free kettle-cooked moong chips — high protein crunchy snack.', price: 14000, mrp: 18000, weight: 200, unit: 'g' },
    ],
  },
  {
    name: 'Makhana',
    order: 17,
    products: [
      { name: 'Cheese Makhana 100g', desc: 'Roasted fox nuts coated with cheese flavor.', price: 11000, mrp: 14000, weight: 100, unit: 'g' },
      { name: 'Black Pepper Makhana 100g', desc: 'Roasted fox nuts with bold black pepper seasoning.', price: 11000, mrp: 14000, weight: 100, unit: 'g' },
      { name: 'Pudina Makhana 100g', desc: 'Roasted fox nuts with refreshing mint flavor.', price: 11000, mrp: 14000, weight: 100, unit: 'g' },
      { name: 'Peri Peri Makhana 100g', desc: 'Roasted fox nuts with spicy peri-peri seasoning.', price: 11000, mrp: 14000, weight: 100, unit: 'g' },
      { name: 'Cream and Onion Makhana 100g', desc: 'Roasted fox nuts with cream and onion flavor.', price: 11000, mrp: 14000, weight: 100, unit: 'g' },
      { name: 'Salted Makhana 100g', desc: 'Simply roasted and salted fox nuts — light and healthy.', price: 10000, mrp: 13000, weight: 100, unit: 'g' },
      { name: 'Raw Makhana 250g', desc: 'Plain raw fox nuts for home roasting and cooking.', price: 18000, mrp: 22000, weight: 250, unit: 'g' },
    ],
  },
  {
    name: 'Dry Fruits and Nuts',
    order: 18,
    products: [
      { name: 'Salted Pista', desc: 'Pistachio lightly salted — crack open and enjoy. A wonderful fun and tasty snack.', price: 24000, mrp: 30000, weight: 250, unit: 'g', featured: true },
      { name: 'Special California Badam', desc: 'Premium quality California almonds — crunchy and nutritious.', price: 22000, mrp: 28000, weight: 250, unit: 'g', featured: true },
      { name: 'Special Goa Kaju', desc: 'Premium quality Goa cashews — buttery and delicious.', price: 28000, mrp: 35000, weight: 250, unit: 'g', featured: true },
      { name: 'Akhrot', desc: 'Fresh whole walnuts — rich in omega-3 and antioxidants.', price: 20000, mrp: 25000, weight: 250, unit: 'g' },
      { name: 'Anjeer Dry Fruits', desc: 'Premium quality dried figs — naturally sweet and nutritious.', price: 22000, mrp: 28000, weight: 250, unit: 'g' },
      { name: 'Special Indian Kismis', desc: 'Premium Indian raisins — sweet and chewy.', price: 12000, mrp: 15000, weight: 250, unit: 'g' },
      { name: 'Black Seedless Kismis', desc: 'Black seedless raisins — naturally sweet.', price: 13000, mrp: 16000, weight: 250, unit: 'g' },
      { name: 'Special Afghan Kismis', desc: 'Premium Afghan golden raisins. [Veg preparation]', price: 16000, mrp: 20000, weight: 250, unit: 'g' },
      { name: 'Special Tukda Mixed Dry Fruits', desc: 'Premium mix of chopped dry fruits. [Veg preparation]', price: 22000, mrp: 28000, weight: 250, unit: 'g' },
      { name: 'Special Shahi Mixed Dry Fruits', desc: 'Royal mix of premium dry fruits. [Veg preparation]', price: 28000, mrp: 35000, weight: 250, unit: 'g' },
      { name: 'Omani Seedless Dates', desc: 'Soft juicy and sweet Omani seedless dates.', price: 16000, mrp: 20000, weight: 250, unit: 'g' },
      { name: 'Omani Dates', desc: 'Premium quality Omani dates with seeds.', price: 14000, mrp: 18000, weight: 250, unit: 'g' },
      { name: 'Sugar Free Ajwa Dates', desc: 'Premium Ajwa dates — naturally sweet and sugar-free.', price: 30000, mrp: 38000, weight: 250, unit: 'g' },
      { name: 'Roasted Kadi Patta Kaju', desc: 'Cashews roasted with curry leaves for a unique savory flavor.', price: 26000, mrp: 32000, weight: 250, unit: 'g' },
      { name: 'Roasted Salted Kaju', desc: 'Cashews roasted and lightly salted — perfect snack.', price: 26000, mrp: 32000, weight: 250, unit: 'g' },
      { name: 'Ghee Fired Salted Kaju', desc: 'Cashews fried in pure ghee and salted — rich and indulgent.', price: 28000, mrp: 35000, weight: 250, unit: 'g' },
      { name: 'Muesli and Dryfruit Mix', desc: 'Healthy muesli mixed with premium dry fruits for a nutritious snack.', price: 18000, mrp: 22000, weight: 250, unit: 'g' },
      { name: 'Millenium Mixture', desc: 'Special blend of premium dry fruits and nuts.', price: 24000, mrp: 30000, weight: 250, unit: 'g' },
      { name: 'Honey Alwa 250g', desc: 'Traditional alwa made with honey and dry fruits.', price: 18000, mrp: 22000, weight: 250, unit: 'g' },
      { name: 'Sugar Free Cranberry Fruit', desc: 'Dried cranberry without added sugar — tangy and nutritious.', price: 18000, mrp: 22000, weight: 100, unit: 'g' },
      { name: 'Sugar Free Blueberry Fruit', desc: 'Dried blueberry without added sugar — antioxidant-rich.', price: 20000, mrp: 25000, weight: 100, unit: 'g' },
      { name: 'Golden Kharek', desc: 'Premium golden dried dates — naturally sweet and chewy.', price: 14000, mrp: 18000, weight: 250, unit: 'g' },
      { name: 'Mixed Dry Fruit 250g', desc: 'Assorted premium dry fruits mix.', price: 22000, mrp: 28000, weight: 250, unit: 'g' },
    ],
  },
  {
    name: 'Bakery',
    order: 19,
    products: [
      { name: 'Poona Butter', desc: 'Classic Pune-style butter khari — flaky and buttery.', price: 5000, mrp: 7000, weight: 4, unit: 'pcs' },
      { name: 'Amul Butter Khari', desc: 'Flaky crispy khari made with Amul butter.', price: 6000, mrp: 8000, weight: 6, unit: 'pcs', featured: true },
      { name: 'Special Maska Butter', desc: 'Premium maska butter khari — extra rich and flaky.', price: 6000, mrp: 8000, weight: 4, unit: 'pcs' },
      { name: 'Twist Butter', desc: 'Twisted butter khari — crispy and flaky.', price: 6000, mrp: 8000, weight: 4, unit: 'pcs' },
      { name: 'Multigrain Toast', desc: 'Nutritious multigrain bread toast — healthy breakfast option.', price: 12000, mrp: 15000, weight: 400, unit: 'g' },
      { name: 'Garlic Toast', desc: 'Crispy toast infused with garlic flavor.', price: 12000, mrp: 15000, weight: 400, unit: 'g' },
      { name: 'Whole Wheat Toast', desc: 'Healthy whole wheat bread toast.', price: 12000, mrp: 15000, weight: 400, unit: 'g' },
      { name: 'Special Indori Mawa Toast 400g', desc: 'Special toast made with mawa — Indore style.', price: 18000, mrp: 22000, weight: 400, unit: 'g' },
      { name: 'Fruit Cake Toast', desc: 'Delicious toast made with fruit cake base.', price: 14000, mrp: 17000, weight: 400, unit: 'g' },
      { name: 'Chocolate Cake Toast', desc: 'Rich chocolate cake toast.', price: 14000, mrp: 17000, weight: 400, unit: 'g' },
      { name: 'Mawa Cake Toast', desc: 'Rich mawa cake toast — indulgent and flavorful.', price: 16000, mrp: 20000, weight: 400, unit: 'g' },
      { name: 'Diet Nachni Khari', desc: 'Healthier khari made from nachni (ragi) flour.', price: 7000, mrp: 9000, weight: 6, unit: 'pcs' },
      { name: 'Whole Wheat Methi Khari', desc: 'Whole wheat khari flavored with fenugreek (methi) leaves.', price: 7000, mrp: 9000, weight: 6, unit: 'pcs' },
      { name: 'Oats and Honey Toast', desc: 'Nutritious oats and honey flavored toast.', price: 13000, mrp: 16000, weight: 400, unit: 'g' },
      { name: 'Whole Wheat Sugar Free Toast', desc: 'Healthy whole wheat toast without added sugar.', price: 13000, mrp: 16000, weight: 400, unit: 'g' },
      { name: 'Butter Dry Fruit Rusk', desc: 'Classic rusk loaded with butter and dry fruits.', price: 12000, mrp: 15000, weight: 400, unit: 'g' },
      { name: 'Dry Fruit Cake Rusk', desc: 'Rusk made from dry fruit cake base — rich and sweet.', price: 14000, mrp: 17000, weight: 400, unit: 'g' },
      { name: 'Butter Cake Rusk', desc: 'Classic butter cake rusk — crispy and buttery.', price: 12000, mrp: 15000, weight: 400, unit: 'g' },
      { name: 'Pista Badam Cookies 200g', desc: 'Buttery crunchy cookies made with the rich flavors of pistachios and almonds.', price: 14000, mrp: 17000, weight: 200, unit: 'g' },
      { name: 'Royal Cookies 200g', desc: 'Premium rich cookies made with butter and premium flour.', price: 14000, mrp: 17000, weight: 200, unit: 'g' },
      { name: 'Fruity Cookies 200g', desc: 'Sweet cookies studded with pieces of dried fruits. [Veg preparation]', price: 13000, mrp: 16000, weight: 200, unit: 'g' },
      { name: 'Dry Fruits Cookies 200g', desc: 'Rich flavorful cookies made with a mix of dried fruits and nuts.', price: 14000, mrp: 17000, weight: 200, unit: 'g' },
      { name: 'Nachni Cookies 200g', desc: 'Wholesome crunchy cookies made with nachni (ragi/finger millet) flour.', price: 13000, mrp: 16000, weight: 200, unit: 'g' },
    ],
  },
  {
    name: 'Dairy Products',
    order: 20,
    products: [
      { name: 'Fresh Mawa', desc: 'Dairy product made by slowly heating and reducing full-fat milk — khoya for sweets.', price: 9000, mrp: 11000, weight: 200, unit: 'g' },
      { name: 'Fresh Malai Paneer', desc: 'Fresh soft protein-rich paneer made from pure milk — perfect for curries and snacks.', price: 8000, mrp: 10000, weight: 200, unit: 'g' },
      { name: 'Homemade White Makhan 100g', desc: 'Fresh creamy naturally churned butter made from pure milk. [Veg preparation]', price: 10000, mrp: 13000, weight: 100, unit: 'g' },
      { name: 'A2 Cow Ghee', desc: 'Pure Desi Gir Cow A2 Bilona Ghee — aromatic, packed with rich flavor.', price: 70000, mrp: 85000, weight: 500, unit: 'g', featured: true },
    ],
  },
  {
    name: 'Khakhra',
    order: 21,
    products: [
      // Gluten Free
      { name: 'Gluten Free Oats Nachni Khakhra', desc: 'Gluten-free khakhra made from oats and nachni.', price: 13000, mrp: 16000, weight: 200, unit: 'g', tags: ['gluten-free'] },
      { name: 'Gluten Free Moong Khakhra', desc: 'Gluten-free khakhra made from moong flour.', price: 13000, mrp: 16000, weight: 200, unit: 'g', tags: ['gluten-free'] },
      { name: 'Gluten Free Jowar Khakhra', desc: 'Gluten-free khakhra made from jowar (sorghum) flour.', price: 13000, mrp: 16000, weight: 200, unit: 'g', tags: ['gluten-free'] },
      { name: 'Gluten Free Bajri Khakhra', desc: 'Gluten-free khakhra made from bajra (pearl millet) flour.', price: 13000, mrp: 16000, weight: 200, unit: 'g', tags: ['gluten-free'] },
      { name: 'Gluten Free Methi Khakhra', desc: 'Gluten-free khakhra made with fenugreek leaves.', price: 13000, mrp: 16000, weight: 200, unit: 'g', tags: ['gluten-free'] },
      // Coin Khakhra
      { name: 'Coin Manchurian Khakhra', desc: 'Mini coin-sized khakhra with Manchurian flavor.', price: 11000, mrp: 14000, weight: 200, unit: 'g', tags: ['coin'] },
      { name: 'Coin Sada Khakhra', desc: 'Plain mini coin-sized khakhra.', price: 10000, mrp: 13000, weight: 200, unit: 'g', tags: ['coin'] },
      { name: 'Coin Jeera Khakhra', desc: 'Mini coin-sized khakhra with cumin flavor.', price: 10000, mrp: 13000, weight: 200, unit: 'g', tags: ['coin'] },
      { name: 'Coin Jeeralu Khakhra', desc: 'Mini coin-sized khakhra with jeeralu spice blend.', price: 10000, mrp: 13000, weight: 200, unit: 'g', tags: ['coin'] },
      { name: 'Coin Hot Pizza Khakhra', desc: 'Mini coin-sized khakhra with spicy pizza flavor.', price: 11000, mrp: 14000, weight: 200, unit: 'g', tags: ['coin'] },
      { name: 'Coin Chat Masala Khakhra', desc: 'Mini coin-sized khakhra with tangy chaat masala.', price: 11000, mrp: 14000, weight: 200, unit: 'g', tags: ['coin'] },
      { name: 'Coin Dahi Methi Khakhra', desc: 'Mini coin-sized khakhra with dahi and methi flavor.', price: 11000, mrp: 14000, weight: 200, unit: 'g', tags: ['coin'] },
      // Whole Wheat
      { name: 'Special Methi Khakhra', desc: 'Made with whole wheat flour and fenugreek leaves — a classic.', price: 11000, mrp: 14000, weight: 200, unit: 'g', featured: true },
      { name: 'Ghee Jeera Khakhra', desc: 'Whole wheat khakhra made with ghee and cumin seeds.', price: 11000, mrp: 14000, weight: 200, unit: 'g' },
      { name: 'Achari Tadka Khakhra', desc: 'Whole wheat khakhra with tangy achari spice tempering.', price: 11000, mrp: 14000, weight: 200, unit: 'g' },
      { name: 'Special BJP Khakhra', desc: 'Special flavored whole wheat khakhra. [Veg preparation]', price: 11000, mrp: 14000, weight: 200, unit: 'g' },
      { name: 'Special Peanut Chutney Khakhra', desc: 'Whole wheat khakhra with peanut chutney flavor.', price: 11000, mrp: 14000, weight: 200, unit: 'g' },
      { name: 'Chorafali Khakhra', desc: 'Khakhra inspired by the classic Gujarati chorafali snack.', price: 12000, mrp: 15000, weight: 200, unit: 'g' },
      { name: 'Special Methi Masala Khakhra', desc: 'Whole wheat khakhra with methi and special masala blend.', price: 11000, mrp: 14000, weight: 200, unit: 'g' },
      { name: 'Special Pani Puri Khakhra', desc: 'Khakhra with the flavor of classic pani puri masala.', price: 11000, mrp: 14000, weight: 200, unit: 'g' },
      { name: 'Special Onion Khakhra', desc: 'Whole wheat khakhra with onion flavor.', price: 11000, mrp: 14000, weight: 200, unit: 'g' },
      { name: 'Special Garlic Khakhra', desc: 'Whole wheat khakhra with garlic flavor. [Veg preparation]', price: 11000, mrp: 14000, weight: 200, unit: 'g' },
      { name: 'Special Manglori Khakhra', desc: 'Khakhra with special Manglori spice blend. [Veg preparation]', price: 11000, mrp: 14000, weight: 200, unit: 'g' },
      { name: 'Special Methi Sambhari Khakhra', desc: 'Methi khakhra with sambhari spice seasoning.', price: 11000, mrp: 14000, weight: 200, unit: 'g' },
      { name: 'Special Vada Pav Khakhra', desc: 'Khakhra with the iconic Mumbai vada pav flavor.', price: 11000, mrp: 14000, weight: 200, unit: 'g' },
      { name: 'Special Bajra Methi Khakhra', desc: 'Khakhra made from bajra flour with methi leaves.', price: 11000, mrp: 14000, weight: 200, unit: 'g' },
      { name: 'Special Schezwan Khakhra', desc: 'Khakhra with spicy schezwan flavor.', price: 11000, mrp: 14000, weight: 200, unit: 'g' },
      { name: 'Special Sada Masala Khakhra', desc: 'Classic plain masala khakhra.', price: 10000, mrp: 13000, weight: 200, unit: 'g' },
      { name: 'Special Pizza Khakhra', desc: 'Khakhra with pizza masala seasoning.', price: 11000, mrp: 14000, weight: 200, unit: 'g' },
      { name: 'Special Maggie Masala Khakhra', desc: 'Khakhra with the popular Maggi masala flavor.', price: 11000, mrp: 14000, weight: 200, unit: 'g' },
      { name: 'Special Nachani Khakhra', desc: 'Khakhra made from nachni (ragi) flour — nutritious.', price: 11000, mrp: 14000, weight: 200, unit: 'g' },
      { name: 'Special Pav Bhaji Khakhra 250g', desc: 'Khakhra with pav bhaji masala flavor — packed item.', price: 14000, mrp: 17000, weight: 250, unit: 'g' },
      { name: 'Special Dahi Methi Khakhra', desc: 'Khakhra with yogurt and fenugreek combination.', price: 11000, mrp: 14000, weight: 200, unit: 'g' },
      { name: 'Special Peri Peri Khakhra', desc: 'Khakhra with fiery peri-peri seasoning.', price: 11000, mrp: 14000, weight: 200, unit: 'g' },
      { name: 'Special Palak Khakhra', desc: 'Khakhra made with spinach (palak) for added nutrition.', price: 11000, mrp: 14000, weight: 200, unit: 'g' },
      // Gud Khakhra
      { name: 'Gud Nachni Khakhra 200g', desc: 'Khakhra made from nachni and sweetened with jaggery.', price: 12000, mrp: 15000, weight: 200, unit: 'g', tags: ['jaggery', 'sweet'] },
      { name: 'Gud Jawari Khakhra 200g', desc: 'Jowar khakhra sweetened with jaggery.', price: 12000, mrp: 15000, weight: 200, unit: 'g', tags: ['jaggery', 'sweet'] },
      { name: 'Gud Multigrain Khakhra 200g', desc: 'Multigrain khakhra sweetened with jaggery.', price: 12000, mrp: 15000, weight: 200, unit: 'g', tags: ['jaggery', 'sweet'] },
      { name: 'Ghee Gud Khakhra 200g', desc: 'Khakhra made with pure ghee and jaggery — traditional recipe.', price: 13000, mrp: 16000, weight: 200, unit: 'g', tags: ['jaggery', 'ghee'] },
      { name: 'Gud Bajra Khakhra 200g', desc: 'Bajra khakhra sweetened with jaggery.', price: 12000, mrp: 15000, weight: 200, unit: 'g', tags: ['jaggery', 'sweet'] },
      // Dosa Khakhra
      { name: 'Cheese Dosa Khakhra', desc: 'Dosa-style khakhra with cheese flavor.', price: 13000, mrp: 16000, weight: 200, unit: 'g', tags: ['dosa'] },
      { name: 'Schezwan Dosa Khakhra', desc: 'Dosa-style khakhra with schezwan spice.', price: 13000, mrp: 16000, weight: 200, unit: 'g', tags: ['dosa'] },
      { name: 'Chilly Cheese Dosa Khakhra', desc: 'Dosa-style khakhra with chili cheese flavor.', price: 13000, mrp: 16000, weight: 200, unit: 'g', tags: ['dosa'] },
      { name: 'Amul Masala Dosa Khakhra', desc: 'Dosa-style khakhra with Amul masala flavor.', price: 13000, mrp: 16000, weight: 200, unit: 'g', tags: ['dosa'] },
      { name: 'Amul Sada Dosa Khakhra', desc: 'Plain dosa-style khakhra with Amul butter.', price: 12000, mrp: 15000, weight: 200, unit: 'g', tags: ['dosa'] },
      { name: 'Mysore Masala Dosa Khakhra', desc: 'Dosa-style khakhra with Mysore masala flavor.', price: 13000, mrp: 16000, weight: 200, unit: 'g', tags: ['dosa'] },
    ],
  },
  {
    name: 'Paan and Mukhwas',
    order: 22,
    products: [
      { name: 'Magai Paan', desc: 'Traditional Indian mouth freshener — meetha paan with betel leaf. [Non tobacco]', price: 4000, mrp: 5500, weight: 1, unit: 'pcs', featured: true },
      { name: 'Calcutta Paan', desc: 'Classic Calcutta-style sweet meetha paan. [Non tobacco]', price: 4500, mrp: 6000, weight: 1, unit: 'pcs' },
      { name: 'Banarasi Paan', desc: 'Traditional Banarasi meetha paan with silver vark. [Non tobacco]', price: 5000, mrp: 6500, weight: 1, unit: 'pcs' },
      { name: 'Paan Shots', desc: 'Modern fun twist on traditional meetha paan in shot form. [Non tobacco]', price: 3500, mrp: 5000, weight: 1, unit: 'pcs' },
      { name: 'Gola Paan 1 Box 15 Pieces', desc: 'Fun vibrant refreshing gola paan in a box of 15 pieces. [Non tobacco]', price: 15000, mrp: 18000, weight: 15, unit: 'pcs' },
    ],
  },
  {
    name: 'Masala',
    order: 23,
    products: [
      { name: 'Vyas Special Chai Masala 50g', desc: 'Aromatic spice blend to enhance your daily chai.', price: 6000, mrp: 8000, weight: 50, unit: 'g' },
      { name: 'Vyas Special Milk Masala 50g', desc: 'Special spice blend for flavored warm milk — calming and flavorful.', price: 6000, mrp: 8000, weight: 50, unit: 'g' },
    ],
  },
  {
    name: 'Combos',
    order: 24,
    products: [
      { name: 'Dhokla and Samosa Combo', desc: 'Nylon Dhokla [250 g] + Punjabi Samosa [2 Pc] — classic combo.', price: 18000, mrp: 22000, weight: 1, unit: 'pcs' },
      { name: 'Jalebi Fafda Combo', desc: 'Jalebi (Desi Ghee) [250 g] + Special Hing Mari Fafda [250 g] — classic Gujarati combo.', price: 26000, mrp: 32000, weight: 1, unit: 'pcs', featured: true },
      { name: 'Jalebi Papdi Combo', desc: 'Jalebi (Desi Ghee) [250 gms] + Special Nylon Papdi [250 gms] Combo.', price: 24000, mrp: 30000, weight: 1, unit: 'pcs' },
      { name: 'Cheese Chilli Chinese Samosa Combo', desc: 'Cheese Chilli Samosa [4 Pc] + Chinese Samosa [4 Pc] — fusion combo.', price: 20000, mrp: 26000, weight: 1, unit: 'pcs' },
      { name: 'Cheese Paneer Chilli Samosa Combo', desc: 'Cheese Chilli Samosa [4 Pc] + Paneer Chilli Samosa [4 Pc] — loaded combo.', price: 22000, mrp: 28000, weight: 1, unit: 'pcs' },
    ],
  },
  {
    name: 'Winter Specials',
    order: 25,
    products: [
      { name: 'Til Shikhari', desc: 'Traditional Indian sweet delicacy made from roasted sesame seeds. [Veg preparation]', price: 16000, mrp: 20000, weight: 250, unit: 'g' },
      { name: 'Gul Poli', desc: 'Sweet flatbread stuffed with jaggery and sesame seeds.', price: 14000, mrp: 18000, weight: 3, unit: 'pcs' },
      { name: 'Dry Fruits Chikki', desc: 'Crunchy jaggery-based chikki loaded with assorted dry fruits.', price: 22000, mrp: 26000, weight: 250, unit: 'g' },
      { name: 'Til Gud Rotla', desc: 'Traditional festive delicacy made with roasted sesame seeds and jaggery.', price: 12000, mrp: 16000, weight: 3, unit: 'pcs' },
      { name: 'Peanut Cube Chikki 200gms', desc: 'Peanut laddu — wholesome traditional sweet from roasted peanuts and jaggery.', price: 12000, mrp: 15000, weight: 200, unit: 'g' },
    ],
  },
  {
    name: 'Pickle',
    order: 26,
    products: [
      { name: 'Chilli Rajasthani Green Stuffed', desc: 'Spicy and flavorful Rajasthani delicacy — fresh green chillies stuffed with spices.', price: 15000, mrp: 18000, weight: 1, unit: 'pcs' },
    ],
  },
  {
    name: 'Gift Hampers',
    order: 27,
    products: [
      { name: 'Octagon Dryfruit Sweet 16 Pieces', desc: 'Elegant octagon-shaped gift box with 16 assorted dry fruit sweets.', price: 80000, mrp: 100000, weight: 1, unit: 'pcs', featured: true },
      { name: 'Fancy Dryfruit 400g', desc: 'Premium fancy dry fruit gift pack — 400g assorted dry fruits.', price: 80000, mrp: 100000, weight: 400, unit: 'g' },
      { name: 'Assorted Kaju Katli 500g', desc: 'Premium assorted kaju katli varieties in a gift box — 500g.', price: 100000, mrp: 120000, weight: 500, unit: 'g', featured: true },
      { name: 'Fancy Dryfruit Mix 800g', desc: 'Premium fancy dry fruit mix gift pack — 800g.', price: 160000, mrp: 200000, weight: 800, unit: 'g' },
      { name: 'Assorted Sugar Free Sweet 12 Pieces', desc: 'Assorted sugar-free sweets gift box — 12 pieces.', price: 70000, mrp: 85000, weight: 12, unit: 'pcs' },
      { name: 'Pure Ghee Mix Sweets', desc: 'Assorted pure ghee sweets gift box.', price: 60000, mrp: 72000, weight: 500, unit: 'g' },
      { name: 'Special Malai Mix Sweet', desc: 'Assorted special malai sweets gift box.', price: 65000, mrp: 78000, weight: 500, unit: 'g' },
      { name: 'Pure Ghee Milk Mawa Mix Sweets', desc: 'Assorted pure ghee milk mawa sweets gift box.', price: 70000, mrp: 84000, weight: 500, unit: 'g' },
      { name: '4 Part Dryfruit Box 200g', desc: 'Kaju [50g] + Almond [50g] + Salted Pista [50g] + Kismis [50g] — 4-part gift box.', price: 50000, mrp: 65000, weight: 200, unit: 'g' },
      { name: '6 Part Dryfruit Box 300g', desc: 'Kaju + Almond + Salted Pista + Kismis + Jardalu + Kiwi Fruit — 6-part gift box.', price: 80000, mrp: 100000, weight: 300, unit: 'g' },
      { name: '8 Part Dryfruit Box 400g', desc: 'Kaju + Almond + Salted Pista + Kismis + Anjeer + Jardalu + Akhrot + more — 8-part gift box.', price: 120000, mrp: 150000, weight: 400, unit: 'g' },
      { name: '6 Part Dryfruit Box 600g', desc: 'Kaju [100g] + Almond [100g] + Salted Pista [100g] + Afghan Kismis [100g] + Jardalu + Akhrot.', price: 150000, mrp: 185000, weight: 600, unit: 'g' },
      { name: 'Dryfruit Tin 4 Jar Gift Box', desc: 'Elegant tin gift box with 4 jars: Plain Kaju + Almond + Kismis + Roasted Pista [100g each].', price: 120000, mrp: 150000, weight: 400, unit: 'g' },
    ],
  },
  {
    name: 'Drinks',
    order: 28,
    products: [
      { name: 'Zero Sugar Coca Cola Can', desc: 'Zero sugar Coca Cola — full flavor without the calories.', price: 8500, mrp: 10000, weight: 300, unit: 'g' },
      { name: 'Diet Coca Cola Can', desc: 'Diet Coca Cola — the classic diet refreshment.', price: 8500, mrp: 10000, weight: 300, unit: 'g' },
      { name: 'Red Bull Can', desc: 'Red Bull energy drink — the original energy booster.', price: 13000, mrp: 15000, weight: 250, unit: 'g' },
      { name: 'Sugar Free Red Bull Can', desc: 'Red Bull energy drink without sugar.', price: 13000, mrp: 15000, weight: 250, unit: 'g' },
      { name: 'Monster Energy Drink Can', desc: 'Monster energy drink — unleash the beast.', price: 13000, mrp: 15000, weight: 500, unit: 'g' },
      { name: 'Zero Sugar Monster Energy Drink Can', desc: 'Monster energy drink without sugar.', price: 13000, mrp: 15000, weight: 500, unit: 'g' },
    ],
  },
  {
    name: 'Peanuts and Chana',
    order: 29,
    products: [
      { name: 'Roasted Peeled Chana 200g', desc: 'Roasted peeled chickpeas — light and crunchy protein snack.', price: 7000, mrp: 9000, weight: 200, unit: 'g' },
      { name: 'Roasted Unpeeled Chana 200g', desc: 'Roasted whole chickpeas with skin — high in fiber.', price: 7000, mrp: 9000, weight: 200, unit: 'g' },
      { name: 'Roasted Mahabaleshwar Chana 200g', desc: 'Special Mahabaleshwar-style roasted chana.', price: 8000, mrp: 10000, weight: 200, unit: 'g' },
      { name: 'Roasted Pudina Chana 200g', desc: 'Roasted chana with refreshing mint (pudina) flavor.', price: 8000, mrp: 10000, weight: 200, unit: 'g' },
      { name: 'Roasted Hing Jeera Chana 200g', desc: 'Roasted chana flavored with asafoetida and cumin.', price: 8000, mrp: 10000, weight: 200, unit: 'g' },
      { name: 'Roasted Peri Peri Chana 200g', desc: 'Roasted chana with spicy peri-peri seasoning.', price: 8000, mrp: 10000, weight: 200, unit: 'g' },
      { name: 'Roasted Chana and Peanuts Assorted 200g', desc: 'Mix of roasted chana and peanuts in various flavors.', price: 8000, mrp: 10000, weight: 200, unit: 'g' },
      { name: 'Baruch Peanut Salted 200g', desc: 'Baruch peanuts — salted and roasted to perfection.', price: 7000, mrp: 9000, weight: 200, unit: 'g' },
      { name: 'Baruch Peanut Saltless 200g', desc: 'Baruch peanuts — roasted without salt.', price: 7000, mrp: 9000, weight: 200, unit: 'g' },
      { name: 'Roasted Unpeeled Salted Peanut 200g', desc: 'Classic roasted unpeeled peanuts with salt.', price: 6000, mrp: 8000, weight: 200, unit: 'g' },
    ],
  },
  {
    name: 'Frozen Snacks',
    order: 30,
    products: [
      { name: 'Frozen Vegetable Samosa', desc: 'Ready-to-fry frozen vegetable samosas — crispy and delicious.', price: 18000, mrp: 22000, weight: 12, unit: 'pcs' },
      { name: 'Frozen Chinese Samosa', desc: 'Ready-to-fry frozen Chinese samosas — Indo-Chinese fusion.', price: 18000, mrp: 22000, weight: 12, unit: 'pcs' },
      { name: 'Frozen Kanda Poha Samosa', desc: 'Ready-to-fry frozen kanda (onion) poha samosas.', price: 18000, mrp: 22000, weight: 12, unit: 'pcs' },
      { name: 'Frozen Paneer Chilli Samosa', desc: 'Ready-to-fry frozen paneer chilli samosas.', price: 20000, mrp: 25000, weight: 12, unit: 'pcs' },
      { name: 'Frozen Cheese Corn Ball', desc: 'Ready-to-fry frozen cheese corn balls — crispy bites.', price: 20000, mrp: 25000, weight: 12, unit: 'pcs' },
      { name: 'Frozen Cheese Chilli Samosa', desc: 'Ready-to-fry frozen cheese chilli samosas.', price: 20000, mrp: 25000, weight: 12, unit: 'pcs' },
      { name: 'Frozen Jaipuri Aloo Pyaaz Kachori', desc: 'Ready-to-fry frozen Jaipuri kachoris with aloo pyaaz filling.', price: 20000, mrp: 25000, weight: 10, unit: 'pcs' },
      { name: 'Frozen Kothimbir Wadi', desc: 'Ready-to-fry frozen kothimbir wadis — Maharashtrian classic.', price: 18000, mrp: 22000, weight: 12, unit: 'pcs' },
    ],
  },
  {
    name: 'Summer Special',
    order: 31,
    products: [
      { name: 'Aamras', desc: 'Classic Indian mango pulp — naturally sweet and refreshing.', price: 8000, mrp: 10000, weight: 250, unit: 'g', featured: true },
      { name: 'Hapus Aamras', desc: 'Premium Ratnagiri Hapus Mango Pulp with added sugar — thick and flavorful.', price: 10000, mrp: 13000, weight: 250, unit: 'g', featured: true },
      { name: 'Hapus Pyaari Aamras', desc: 'Smooth blend of hapus and pyaari mangoes with added sugar.', price: 9000, mrp: 12000, weight: 250, unit: 'g' },
      { name: 'Cranberry Fruit Halwa', desc: 'Summer special halwa made with cranberry and desi ghee.', price: 22000, mrp: 28000, weight: 250, unit: 'g' },
      { name: 'Melon Fruit Halwa', desc: 'Summer special halwa made with melon and desi ghee.', price: 22000, mrp: 28000, weight: 250, unit: 'g' },
      { name: 'Kiwi Fruit Halwa', desc: 'Summer special halwa made with kiwi and desi ghee.', price: 22000, mrp: 28000, weight: 250, unit: 'g' },
      { name: 'Blueberry Fruit Halwa', desc: 'Summer special halwa made with blueberry and desi ghee.', price: 22000, mrp: 28000, weight: 250, unit: 'g' },
      { name: 'Santra Fruit Halwa', desc: 'Summer special halwa made with orange (santra) and desi ghee.', price: 22000, mrp: 28000, weight: 250, unit: 'g' },
    ],
  },
  {
    name: 'Dahi Bhalle',
    order: 32,
    products: [
      { name: 'Dahi Bhalle', desc: 'Soft deep fried lentil dumplings served in creamy yogurt with chutneys.', price: 8000, mrp: 10000, weight: 1, unit: 'pcs', featured: true },
    ],
  },
  {
    name: 'Gudi Padwa Special',
    order: 33,
    products: [
      { name: 'Batasha 1 Haar', desc: 'Traditional Indian sugar candy offered in festive occasions.', price: 5000, mrp: 7000, weight: 1, unit: 'pcs' },
    ],
  },
];

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  await Product.deleteMany({});
  await Category.deleteMany({});
  console.log('Cleared existing data');

  let totalProducts = 0;

  for (const cat of CATALOG) {
    const catDoc = await Category.create({
      name: cat.name,
      displayOrder: cat.order,
      active: true,
    });

    const catCode = cat.name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 4);
    const catSlug = catDoc.slug;

    for (const p of cat.products) {
      // prefix slug with category to guarantee uniqueness
      const productSlug = `${catSlug}-${slug(p.name)}`;

      try {
        await Product.create({
          name: p.name,
          slug: productSlug,
          categoryId: catDoc._id,
          description: p.desc ?? '',
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
        });
        totalProducts++;
      } catch (err) {
        console.error(`Failed: ${p.name} in ${cat.name}`, err);
      }
    }

    console.log(`  [${cat.order}] ${cat.name} — ${cat.products.length} products`);
  }

  console.log(`\nDone. ${CATALOG.length} categories, ${totalProducts} products seeded.`);
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
