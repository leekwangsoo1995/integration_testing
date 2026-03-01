const orders = new Map();
let orderSequence = 1;

function nextId() {
  const id = `ORD-${String(orderSequence).padStart(3, "0")}`;
  orderSequence += 1;
  return id;
}

function save(order) {
  orders.set(order.id, order);
  return order;
}

function findById(orderId) {
  return orders.get(orderId) || null;
}

module.exports = {
  nextId,
  save,
  findById
};
