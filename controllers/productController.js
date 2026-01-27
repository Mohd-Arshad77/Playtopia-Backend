import Product from "../models/Product.js";

export const getAllProducts = async (req, res, next) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      count: products.length,
      products: products
    });
  } catch (err) {
    next(err);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      const error = new Error("Product not found");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json(product);
  } catch (err) {
    next(err);
  }
};

export const getProductsByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;

    const products = await Product.find({ category, status: "active" });

    res.status(200).json({
      success: true,
      message: `Fetched products from category: ${category}`,
      count: products.length,
      products: products
    });
  } catch (err) {
    next(err);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const { name, price, category, description, stock } = req.body;

    let imagePath = "";

    if (req.file) {
      imagePath = `http://localhost:5000/${req.file.path.replace(/\\/g, "/")}`;
    } else {
      const error = new Error("Image is required");
      error.statusCode = 400;
      throw error;
    }

    const product = await Product.create({
      name,
      price,
      category,
      description,
      stock,
      image: imagePath,
      status: "active"
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product: product
    });
  } catch (err) {
    next(err);
  }
};

export const updateProductPut = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      const error = new Error("Product not found");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      message: "Product updated successfully (PUT)",
      product: product
    });
  } catch (err) {
    next(err);
  }
};

export const updateProductPatch = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!product) {
      const error = new Error("Product not found");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      message: "Product updated successfully (PATCH)",
      product: product
    });
  } catch (err) {
    next(err);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      const error = new Error("Product not found");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      message: "Product deleted successfully"
    });
  } catch (err) {
    next(err);
  }
};
