import Product from "../models/Product.js";

export const getAllProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const search = req.query.search || "";
    const category = req.query.category || "All";

    const query = {};
    
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    if (category !== "All") {
      query.category = category;
    }

    const skip = (page - 1) * limit;
    const total = await Product.countDocuments(query);

    const products = await Product.find(query)
      .sort({ _id: -1 })   
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      products,
      pagination: {
        totalProducts: total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        itemsPerPage: limit
      }
    });
  } catch (err) {
    next(err);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
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

    if (!req.file) {
      return res.status(400).json({ success: false, message: "Image is required" });
    }

    const product = await Product.create({
      name,
      price,
      category,
      description,
      stock,
      image: req.file.path,
      status: "active",
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });

  } catch (err) {
    next(err);
  }
};

export const updateProductPut = async (req, res, next) => {
  try {
    const updateData = { ...req.body };
    if (req.file) {
      updateData.image = req.file.path;
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product
    });
  } catch (err) {
    next(err);
  }
};

export const updateProductPatch = async (req, res, next) => {
  try {
    const updateData = { ...req.body };
    if (req.file) {
      updateData.image = req.file.path;
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product
    });
  } catch (err) {
    next(err);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.status(200).json({
      success: true,
      message: "Product deleted successfully"
    });
  } catch (err) {
    next(err);
  }
};