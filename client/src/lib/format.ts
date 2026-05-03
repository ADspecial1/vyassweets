export const formatINR = (paise: number): string =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(paise / 100);

export const discountPercent = (price: number, mrp: number): number =>
  mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
