/////////////////////////////////////////////////////
// USER SERVICE
/////////////////////////////////////////////////////

Table users {
  id           varchar [pk]
  name         varchar
  email        varchar [unique]
  passwordHash varchar
  createdAt    datetime
}

Table sessions {
  id          varchar [pk]
  userId      varchar [ref: > users.id]
  token       varchar
  expiresAt   datetime
  createdAt   datetime
}

/////////////////////////////////////////////////////
// PRODUCT SERVICE
/////////////////////////////////////////////////////

Table products {
  id          varchar [pk]
  name        varchar
  description text
  price       decimal
  imageUrl    text
  stock       int
  createdAt   datetime
}

/////////////////////////////////////////////////////
// CART SERVICE
/////////////////////////////////////////////////////

Table carts {
  id        varchar [pk]
  userId    varchar
  total     decimal
  updatedAt datetime
}

Table cart_items {
  id        varchar [pk]
  cartId    varchar [ref: > carts.id]
  productId varchar
  qty       int
  price     decimal
}

/////////////////////////////////////////////////////
// ORDER SERVICE
/////////////////////////////////////////////////////

Table orders {
  id           varchar [pk]
  userId       varchar
  total        decimal
  status       varchar  // PENDING, CONFIRMED, PAID, etc.
  paymentMethod varchar
  createdAt    datetime
}

Table order_items {
  id        varchar [pk]
  orderId   varchar [ref: > orders.id]
  productId varchar
  qty       int
  price     decimal
}

/////////////////////////////////////////////////////
// PAYMENT SERVICE
/////////////////////////////////////////////////////

Table payments {
  id          varchar [pk]
  orderId     varchar
  userId      varchar
  amount      decimal
  method      varchar   // CARD, CASH, WALLET, etc.
  status      varchar   // SUCCESS, FAILED
  createdAt   datetime
}

Table refunds {
  id        varchar [pk]
  paymentId varchar [ref: > payments.id]
  orderId   varchar
  amount    decimal
  reason    varchar
  createdAt datetime
}

/////////////////////////////////////////////////////
// DELIVERY SERVICE
/////////////////////////////////////////////////////

Table deliveries {
  id         varchar [pk]
  orderId    varchar
  riderId    varchar
  status     varchar  // ASSIGNED, PICKED_UP, etc.
  etaMinutes int
  updatedAt  datetime
}

Table delivery_tracking {
  id         varchar [pk]
  deliveryId varchar [ref: > deliveries.id]
  lat        decimal
  lng        decimal
  eventTime  datetime
}

/////////////////////////////////////////////////////
// NOTIFICATION SERVICE
/////////////////////////////////////////////////////

Table notifications {
  id        varchar [pk]
  userId    varchar
  channel   varchar   // EMAIL, SMS, PUSH
  type      varchar   // ORDER_CONFIRMATION, PAYMENT_SUCCESS, etc.
  payload   text
  createdAt datetime
}

/////////////////////////////////////////////////////
// ANALYTICS SERVICE
/////////////////////////////////////////////////////

Table analytics_events {
  id         varchar [pk]
  eventType  varchar
  source     varchar
  eventJson  text
  timestamp  datetime
}
