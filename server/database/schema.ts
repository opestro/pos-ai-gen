import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'

export const products = sqliteTable('products', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
  price: real('price').notNull(),
  stock: integer('stock').notNull(),
  barcode: text('barcode'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
})

export const customers = sqliteTable('customers', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email'),
  phone: text('phone'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
})

export const transactions = sqliteTable('transactions', {
  id: integer('id').primaryKey(),
  customerId: integer('customer_id').references(() => customers.id),
  total: real('total').notNull(),
  tax: real('tax').notNull(),
  status: text('status').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
})

export const transactionItems = sqliteTable('transaction_items', {
  id: integer('id').primaryKey(),
  transactionId: integer('transaction_id').references(() => transactions.id),
  productId: integer('product_id').references(() => products.id),
  quantity: integer('quantity').notNull(),
  price: real('price').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
})