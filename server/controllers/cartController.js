import { Cart } from "../models/cartModel.js";
import { Product } from "../models/productModel.js";

const PRODUCT_FIELDS =
  "productName productPrice productImg category brand stock isActive";

const normalizeQuantity = (value) => {
  const quantity = Number(value);
  if (!Number.isFinite(quantity)) return 1;
  return Math.max(1, Math.floor(quantity));
};

const normalizePrice = (value) => {
  const price = Number(value);
  return Number.isFinite(price) ? price : 0;
};

const populateCart = (query) => query.populate("items.productId", PRODUCT_FIELDS);

const recalculateCart = (cart) => {
  cart.items = cart.items.filter((item) => item.productId);
  cart.totalPrice = cart.items.reduce((acc, item) => {
    const hasPopulatedProduct =
      item.productId &&
      typeof item.productId === "object" &&
      "productPrice" in item.productId;
    // Always use current product price if available (populated)
    const productPrice = normalizePrice(item.productId?.productPrice);
    const price = hasPopulatedProduct ? productPrice : normalizePrice(item.price);
    // Sync stored price with current product price
    item.price = price;
    item.quantity = normalizeQuantity(item.quantity);
    return acc + price * item.quantity;
  }, 0);
};

const saveAndReturnCart = async (cart) => {
  recalculateCart(cart);
  await cart.save();
  return populateCart(Cart.findById(cart._id));
};

const getUserCart = (userId) => populateCart(Cart.findOne({ userId }));

export const getCart = async (req, res) => {
  try {
    const userId = req.id;

    let cart = await getUserCart(userId);
    if (!cart) {
      cart = await Cart.create({ userId, items: [], totalPrice: 0 });
      cart = await populateCart(Cart.findById(cart._id));
    }

    cart = await saveAndReturnCart(cart);
    return res.status(200).json({ success: true, cart });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const addToCart = async (req, res) => {
  try {
    const userId = req.user?._id || req.id;
    const { productId } = req.body;
    const quantity = normalizeQuantity(req.body.quantity);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product id is required",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (product.isActive === false) {
      return res.status(400).json({
        success: false,
        message: `${product.productName} is currently unavailable`,
      });
    }

    const price = normalizePrice(product.productPrice);
    const stock = Number(product.stock || 0);
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      if (stock < quantity) {
        return res.status(400).json({
          success: false,
          message: `Only ${stock} item${stock === 1 ? "" : "s"} available`,
        });
      }

      cart = new Cart({
        userId,
        items: [{ productId, quantity, price }],
        totalPrice: price * quantity,
      });
    } else {
      const itemIndex = cart.items.findIndex(
        (item) => item.productId.toString() === productId.toString(),
      );
      const currentQuantity =
        itemIndex > -1 ? Number(cart.items[itemIndex].quantity || 0) : 0;

      if (stock < currentQuantity + quantity) {
        return res.status(400).json({
          success: false,
          message: `Only ${stock} item${stock === 1 ? "" : "s"} available`,
        });
      }

      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += quantity;
        cart.items[itemIndex].price = price;
      } else {
        cart.items.push({ productId, quantity, price });
      }
    }

    const populatedCart = await saveAndReturnCart(cart);

    return res.status(200).json({
      success: true,
      message: "Product added to cart successfully",
      cart: populatedCart,
    });
  } catch (error) {
    console.error("ADD TO CART ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateQuantity = async (req, res) => {
  try {
    const userId = req.id;
    const { productId, type } = req.body;

    if (!["increase", "decrease"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid quantity update type",
      });
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    }

    const item = cart.items.find(
      (cartItem) => cartItem.productId.toString() === productId,
    );
    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });
    }

    const product = await Product.findById(item.productId);
    if (!product || product.isActive === false) {
      cart.items = cart.items.filter(
        (cartItem) => cartItem.productId.toString() !== productId,
      );
      const updatedCart = await saveAndReturnCart(cart);
      return res.status(404).json({
        success: false,
        message: "Product is no longer available and was removed from cart",
        cart: updatedCart,
      });
    }

    if (type === "increase") {
      if (Number(item.quantity || 0) >= Number(product.stock || 0)) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stock} item${
            product.stock === 1 ? "" : "s"
          } available`,
        });
      }
      item.quantity += 1;
    }

    if (type === "decrease" && item.quantity > 1) {
      item.quantity -= 1;
    }

    // Always sync with current product price
    item.price = normalizePrice(product.productPrice);
    cart = await saveAndReturnCart(cart);

    return res.status(200).json({ success: true, cart });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const userId = req.id;
    const { productId } = req.body;

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productId,
    );

    cart = await saveAndReturnCart(cart);

    return res.status(200).json({
      success: true,
      cart,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
