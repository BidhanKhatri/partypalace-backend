import CategoryModel from "../models/category.model.js";

//get all category controller
export const getAllCategoryController = async (_, res) => {
  try {
    const allCategory = await CategoryModel.find({}).select("name");
    return res.status(200).json({
      msg: "Fetched all category successfully",
      success: true,
      error: false,
      data: allCategory,
    });
  } catch (error) {
    return res.status(500).json({
      msg: error.message || error || "Internal server error",
      success: false,
      error: true,
    });
  }
};
