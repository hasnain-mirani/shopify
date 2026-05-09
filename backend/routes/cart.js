const express = require("express");
const { v4: uuid } = require("uuid");
const { queryAll, execute } = require("../db-helpers");

const router = express.Router();

router.get("/:id", async (req, res) => {
  try {
    const carts = await queryAll("SELECT * FROM carts WHERE id = ?", [req.params.id]);
    const cart = carts[0];
    if (!cart) return res.status(404).json({ error: "Cart not found" });
    const items = await queryAll("SELECT * FROM cart_items WHERE cart_id = ?", [cart.id]);
    const totalQuantity = items.reduce((s, i) => s + i.quantity, 0);
    const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
    res.json({
      id: cart.id, totalQuantity, items,
      cost: {
        subtotalAmount: { amount: String(subtotal), currencyCode: "PKR" },
        totalAmount: { amount: String(subtotal), currencyCode: "PKR" },
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const id = uuid();
    await execute("INSERT INTO carts (id) VALUES (?)", [id]);
    res.status(201).json({
      id, totalQuantity: 0, items: [],
      cost: {
        subtotalAmount: { amount: "0", currencyCode: "PKR" },
        totalAmount: { amount: "0", currencyCode: "PKR" },
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/:id/items", async (req, res) => {
  try {
    const carts = await queryAll("SELECT * FROM carts WHERE id = ?", [req.params.id]);
    const cart = carts[0];
    if (!cart) return res.status(404).json({ error: "Cart not found" });

    const { variantId, productTitle, variantTitle = "", price, quantity = 1, imageUrl = "" } = req.body;
    await execute("INSERT INTO cart_items (id, cart_id, variant_id, product_title, variant_title, price, quantity, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [uuid(), cart.id, variantId, productTitle, variantTitle, price, quantity, imageUrl]);

    const items = await queryAll("SELECT * FROM cart_items WHERE cart_id = ?", [cart.id]);
    const totalQuantity = items.reduce((s, i) => s + i.quantity, 0);
    const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
    res.json({
      id: cart.id, totalQuantity, items,
      cost: {
        subtotalAmount: { amount: String(subtotal), currencyCode: "PKR" },
        totalAmount: { amount: String(subtotal), currencyCode: "PKR" },
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id/items/:itemId", async (req, res) => {
  try {
    const { quantity } = req.body;
    await execute("UPDATE cart_items SET quantity = ? WHERE id = ? AND cart_id = ?", [quantity, req.params.itemId, req.params.id]);

    const items = await queryAll("SELECT * FROM cart_items WHERE cart_id = ?", [req.params.id]);
    const totalQuantity = items.reduce((s, i) => s + i.quantity, 0);
    const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
    res.json({
      id: req.params.id, totalQuantity, items,
      cost: {
        subtotalAmount: { amount: String(subtotal), currencyCode: "PKR" },
        totalAmount: { amount: String(subtotal), currencyCode: "PKR" },
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id/items/:itemId", async (req, res) => {
  try {
    await execute("DELETE FROM cart_items WHERE id = ? AND cart_id = ?", [req.params.itemId, req.params.id]);

    const items = await queryAll("SELECT * FROM cart_items WHERE cart_id = ?", [req.params.id]);
    const totalQuantity = items.reduce((s, i) => s + i.quantity, 0);
    const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
    res.json({
      id: req.params.id, totalQuantity, items,
      cost: {
        subtotalAmount: { amount: String(subtotal), currencyCode: "PKR" },
        totalAmount: { amount: String(subtotal), currencyCode: "PKR" },
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
