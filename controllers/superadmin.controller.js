import CategoryModel from "../models/category.model.js";

//controller to create category
export const createCategory = async (req, res) => {
  try {
    const { category } = req.body;
    const userRole = req.userRole;
    const userId = req.userId;

    if (userRole !== "superadmin") {
      return res.status(401).json({
        msg: "only superadmin can create category",
        success: false,
        error: true,
      });
    }

    if (!category) {
      return res.status(400).json({
        msg: "at least one category is required",
        sucess: false,
        error: true,
      });
    }

    const lowerCaseCategory = category.toLowerCase().trim();
    const findCategory = await CategoryModel.findOne({
      name: lowerCaseCategory,
    });

    if (findCategory) {
      return res.status(400).json({
        msg: "category already exists",
        success: false,
        error: true,
      });
    }
    const createCategory = new CategoryModel({
      name: lowerCaseCategory,
      createdBy: userId,
    });
    await createCategory.save();

    return res.status(200).json({
      msg: "category created successfully",
      success: true,
      error: false,
      data: createCategory,
    });
  } catch (error) {
    return res.status(500).json({
      msg: error.message || error.msg || "Internal server error",
      success: false,
      error: true,
    });
  }
};

//update category controller
export const updateCategory = async (req, res) => {
  try {
    const { id, category } = req.body;
    const userRole = req.userRole;

    if (userRole !== "superadmin") {
      return res.status(401).json({
        msg: "only superadmin can update category",
        success: false,
        error: true,
      });
    }

    if (!id || !category) {
      return res.status(400).json({
        msg: "id & category name is required",
        success: false,
        error: true,
      });
    }

    //find if updating category already exists
    const findCategoryIfExists = await CategoryModel.findOne({
      name: category,
    });

    if (findCategoryIfExists) {
      return res.status(400).json({
        msg: `${category} category already exists`,
        success: false,
        error: true,
      });
    }

    const updateCategory = await CategoryModel.findByIdAndUpdate(
      id,
      {
        $set: { name: category.toLowerCase().trim() },
      },
      { new: true }
    );

    return res.status(200).json({
      msg: "category updated successfully",
      sucess: true,
      error: false,
      data: updateCategory,
    });
  } catch (error) {
    return res.status(500).json({
      msg: error.message || error.msg || "Internal server error",
      success: false,
      error: true,
    });
  }
};

//delete category controller
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.body;
    const userRole = req.userRole;

    if (userRole !== "superadmin") {
      return res.status(401).json({
        msg: "only superadmin can delete category",
        success: false,
        error: true,
      });
    }

    if (!id) {
      return res.status(400).json({
        msg: "category id is required",
        success: false,
        error: true,
      });
    }

    const deleteCategory = await CategoryModel.findByIdAndDelete(id);

    if (!deleteCategory) {
      return res.status(404).json({
        msg: "category not found, unable to delete",
        success: false,
        error: true,
      });
    }

    return res.status(200).json({
      msg: "category deleted successfully",
      success: true,
      error: false,
      data: deleteCategory,
    });
  } catch (error) {
    return res.status(500).json({
      msg: error.message || error.msg || "Internal server error",
      success: false,
      error: true,
    });
  }
};

