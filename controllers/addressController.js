import Address from "../models/Address.js";

export const addAddress = async (req, res, next) => {
  try {
    const { fullName, mobile, street, city, state, zipCode } = req.body;

    if (!fullName || !mobile || !street || !city || !state || !zipCode) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    const addressCount = await Address.countDocuments({
      userId: req.user.id
    });

    const isDefault = addressCount === 0;

    const newAddress = await Address.create({
      userId: req.user.id,
      fullName,
      mobile,
      street,
      city,
      state,
      zipCode,
      isDefault
    });

    res.status(201).json({
      success: true,
      message: "Address added successfully",
      data: newAddress
    });

  } catch (err) {
    next(err);
  }
};



export const getAddresses = async (req, res, next) => {
  try {

    const addresses = await Address.find({
      userId: req.user.id
    }).sort({ isDefault: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Addresses fetched successfully",
      data: {
        count: addresses.length,
        addresses
      }
    });

  } catch (err) {
    next(err);
  }
};



export const setDefaultAddress = async (req, res, next) => {
  try {
    const { id } = req.params;

    await Address.updateMany(
      { userId: req.user.id },
      { $set: { isDefault: false } }
    );

    const updatedAddress = await Address.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      { $set: { isDefault: true } },
      { new: true }
    );

    if (!updatedAddress) {
      return res.status(404).json({
        success: false,
        message: "Address not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Default address updated successfully",
      data: updatedAddress
    });

  } catch (err) {
    next(err);
  }
};


export const deleteAddress = async (req, res, next) => {
  try {
    const { id } = req.params;

    const deleted = await Address.findOneAndDelete({
      _id: id,
      userId: req.user.id
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Address not found"
      });
    }

    if (deleted.isDefault) {
      await Address.findOneAndUpdate(
        { userId: req.user.id },
        { $set: { isDefault: true } }
      );
    }

    res.status(200).json({
      success: true,
      message: "Address deleted successfully"
    });

  } catch (err) {
    next(err);
  }
};
