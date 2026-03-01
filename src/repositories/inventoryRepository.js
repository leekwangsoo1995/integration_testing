const stockBySku = new Map([
  ["SKU-APPLE", 10],
  ["SKU-BANANA", 2],
  ["SKU-COFFEE", 0]
]);

function getStock(sku) {
  return stockBySku.get(sku) || 0;
}

function reserve(sku, quantity) {
  const current = getStock(sku);

  if (current < quantity) {
    return false;
  }

  stockBySku.set(sku, current - quantity);
  return true;
}

function release(sku, quantity) {
  stockBySku.set(sku, getStock(sku) + quantity);
}

module.exports = {
  getStock,
  reserve,
  release
};
