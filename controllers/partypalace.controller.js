import mongoose from "mongoose";
import PartyPalace from "../models/partypalace.model.js";
import uploadImageCloudinary from "../utils/uploadImageCloud.js";
import { io } from "../utils/socketConn.js";

//create a party palace controller
export const createPartyPalaceController = async (req, res) => {
  try {
    const { name, description, location, capacity, pricePerHour, category } =
      req.body;
    const userId = req.userId; // middleware bata lini
    const userRole = req.userRole; // middleware bata lini

    const comingImg = req.files;
    // console.log(comingImg);

    if (comingImg.length === 0) {
      return res.status(400).json({
        msg: "At least one image is required",
        success: false,
        error: true,
      });
    }

    if (userRole !== "admin") {
      return res.status(401).json({
        msg: "only admin can create party palace",
        success: false,
        error: true,
      });
    }

    if (
      !name ||
      !description ||
      !location ||
      !capacity ||
      !pricePerHour ||
      !category
    ) {
      return res.status(400).json({
        msg: "All fields are required",
        success: false,
        error: true,
      });
    }

    const uploadRes = await Promise.all(
      comingImg.map((f) => uploadImageCloudinary(f))
    );

    const imageUrls = uploadRes.map((f) => f.url);

    let categoriesArray = category;

if (typeof categoriesArray === "string") {
  categoriesArray = JSON.parse(categoriesArray);
}

    const createPartyPalace = new PartyPalace({
      name,
      description,
      location,
      capacity,
      pricePerHour,
      category: categoriesArray,
      createdBy: userId,
      images: imageUrls,
    });
    await createPartyPalace.save();

    //socket logic for real time update
    io.emit("createdPartyPalace", createPartyPalace);

    return res.status(200).json({
      msg: "party palace created successfully",
      data: createPartyPalace,
      success: true,
      error: false,
    });
  } catch (error) {
    return res.status(500).json({
      msg: error.message || error.msg || "Internal server error",
      success: false,
      error: true,
    });
  }
};

//update unavailable dates controller
export const updateUnavailableDatesController = async (req, res) => {
  try {
    const { partyPalaceId, unavailableDate } = req.body;

    if (!partyPalaceId || !unavailableDate) {
      return res.status(400).json({
        msg: "party palace id and unavailable date are required",
        success: false,
        error: true,
      });
    }

    const findPartyPalace = await PartyPalace.findById(partyPalaceId);

    const formattedDate = new Date(unavailableDate).toISOString().split("T")[0];

    if (
      findPartyPalace.unavailableDates
        .map((fdate) => new Date(fdate).toISOString().split("T")[0])
        .includes(formattedDate)
    ) {
      return res.status(400).json({
        msg: "unavailable date already exists",
        success: false,
        error: true,
      });
    }

    const updatePartyPalace = await PartyPalace.findByIdAndUpdate(
      partyPalaceId,
      {
        $push: { unavailableDates: unavailableDate },
      },
      { new: true }
    );

    return res.status(200).json({
      msg: "unavailable dates updated successfully",
      data: updatePartyPalace,
      success: true,
      error: false,
    });
  } catch (error) {
    return res.status(500).json({
      msg: error.message || error.msg || "Internal server error",
      success: false,
      error: true,
    });
  }
};

//update images controller
export const updateImagesController = async (req, res) => {
  try {
    const { partyPalaceId } = req.body;

    const comingImg = req.files;
    // console.log(comingImg);

    if (comingImg.length === 0) {
      return res.status(400).json({
        msg: "At least one image is required",
        success: false,
        error: true,
      });
    }

    const uploadRes = await Promise.all(
      comingImg.map((f) => uploadImageCloudinary(f))
    );

    const imageUrls = uploadRes.map((f) => f.url);

    // console.log(uploadRes);

    const updateImages = await PartyPalace.findByIdAndUpdate(
      partyPalaceId,
      {
        $set: { images: imageUrls },
      },
      { new: true }
    );

    return res.status(200).json({
      msg: "Images updated successfully",
      data: updateImages,
      success: true,
      error: false,
    });
  } catch (error) {
    return res.status(500).json({
      msg: error.message || error.msg || "Internal server error",
      success: false,
      error: true,
    });
  }
};

//get single party palace controller

export const getOnePartyPalaceController = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.staus(400).json({
        msg: "party palace id is required",
        success: false,
        error: true,
      });
    }

    const findPartyPalace = await PartyPalace.findById(id).populate(
      "createdBy"
    );

    return res.status(200).json({
      msg: "party palace found successfully",
      data: findPartyPalace,
      success: true,
      error: false,
    });
  } catch (error) {
    return res.status(500).json({
      msg: error.message || error.msg || "Internal server error",
      error: true,
      success: false,
    });
  }
};

//remove unavailable dates controller
export const removeUnavailableDatesController = async (req, res) => {
  try {
    const { partyPalaceId, unavailableDate } = req.body;

    if (!partyPalaceId || !unavailableDate) {
      return res.status(400).json({
        msg: "party palace id and unavailable date are required",
        success: false,
        error: true,
      });
    }

    const updatePartyPalace = await PartyPalace.findByIdAndUpdate(
      partyPalaceId,
      {
        $pull: { unavailableDates: unavailableDate },
      },
      { new: true }
    );

    return res.status(200).json({
      msg: "unavailable dates removed successfully",
      data: updatePartyPalace,
      success: true,
      error: false,
    });
  } catch (error) {
    return res.staus(500).json({
      msg: error.message || error.msg || "Internal server error",
      error: true,
      success: false,
    });
  }
};

//get all party palace controller with search and pagination and sorting
export const getAllPartyPalace = async (req, res) => {
  try {
    let { search, page, limit } = req.query;
    // console.log(search);

    if (!page) page = 1;
    if (!limit) limit = 6;

    const skip = (page - 1) * limit;

    const query = { ...(search ? { $text: { $search: search } } : {}) };

    const [data, total] = await Promise.all([
      PartyPalace.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("createdBy"),
      PartyPalace.countDocuments(query),
    ]);
    return res.status(200).json({
      msg: "party palace found successfully",
      data,
      totalCount: total,
      totalPage: Math.ceil(total / limit),
      success: true,
      error: false,
    });
  } catch (error) {
    return res.status(500).json({
      msg: error.message || error.msg || "Internal server error",
      error: true,
      success: false,
    });
  }
};

//get all party palace if same admin has create that
export const getAllPartyPalaceCreatedByAdmin = async (req, res) => {
  try {
    const userRole = req.userRole;

    if (userRole !== "admin") {
      return res.status(401).json({
        msg: "Only admin can get his party palace details",
        error: true,
        success: false,
      });
    }

    const { createdBy } = req.body;

    const formatedCreatedBy = new mongoose.Types.ObjectId(createdBy);

    const findPartyPalace = await PartyPalace.find({
      createdBy: formatedCreatedBy,
    }).sort({
      createdAt: -1,
    });
    // console.log(findPartyPalace);

    if (findPartyPalace.length === 0) {
      return res.status(400).json({
        msg: "Party palace not found for createdBy Id",
        success: false,
        error: true,
      });
    } else {
      return res.status(200).json({
        msg: "Party palace found",
        success: true,
        error: false,
        data: findPartyPalace,
      });
    }
  } catch (error) {
    return res.status(500).json({
      msg: error.message || error || "Internal server error",
    });
  }
};

//update name, desc, location, capacity and price per hour controller
export const updatePartyPalaceController = async (req, res) => {
  try {
    const userRole = req.userRole;

    if (userRole !== "admin") {
      return res.status(401).json({
        msg: "only admin can update party palace",
        success: false,
        error: true,
      });
    }

    const {
      partyPalaceId,
      name,
      description,
      location,
      capacity,
      pricePerHour,
    } = req.body;

    const payload = {
      name,
      description,
      location,
      capacity,
      pricePerHour,
    };

    const updatePartyPalace = await PartyPalace.findByIdAndUpdate(
      partyPalaceId,
      {
        $set: payload,
      },
      { new: true }
    );

    return res.status(200).json({
      msg: "party palace updated successfully",
      data: updatePartyPalace,
      success: true,
      error: false,
    });
  } catch (error) {
    return res.status(500).json({
      msg: error.message || error || "Internal server error",
      success: true,
      error: false,
    });
  }
};

//delete party palace
export const deletePartyPalaceController = async (req, res) => {
  try {
    const userRole = req.userRole;

    const { partyPalaceId } = req.query;

    if (userRole !== "admin") {
      return res.status(401).json({
        msg: "only admin can delete party palace",
        success: false,
        error: true,
      });
    }

    const deletePartyPalace = await PartyPalace.findByIdAndDelete(
      partyPalaceId
    );

    //socket implementation to delete party palace at realtime
    io.emit("deletePartyPalace", deletePartyPalace);

    if (deletePartyPalace) {
      return res.status(200).json({
        msg: "party palace deleted!",
        success: true,
        error: false,
      });
    } else {
      return res.status(404).json({
        msg: "Party palace not found!",
        success: false,
        error: true,
      });
    }
  } catch (error) {
    return res.status(500).json({
      msg: error.message || error || "Internal server error",
      success: false,
      error: true,
    });
  }
};

//increase decrease likes controller
export const likesController = async (req, res) => {
  try {
    const { partyPalaceId, incLikes } = req.body;

    const userId = req.userId; // middleware bata lini

    const updatePartyPalace = await PartyPalace.findByIdAndUpdate(
      partyPalaceId,
      { $inc: { likes: incLikes || 1 }, $push: { likedBy: userId } },
      { new: true }
    );

    return res.status(200).json({
      msg: "You liked party palace",
      data: updatePartyPalace,
      success: true,
      error: false,
    });
  } catch (error) {
    return res.status(500).json({
      msg: error.message || error || "Internal server error",
      success: false,
      error: true,
    });
  }
};

//get party palace according to the category with pagination
export const getPartyPalaceByCategory = async (req, res) => {
  try {
    let { category, page, limit } = req.query;

    if (!category) {
      return res.status(400).json({
        msg: "category is required",
        error: true,
        success: false,
      });
    }

    if (!page) page = 1;
    if (!limit) limit = 4;

    let skip = (page - 1) * limit;

    const [findPartyPalace, totalCount] = await Promise.all([
      PartyPalace.find({ category })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      PartyPalace.countDocuments({ category }),
    ]);

    if (findPartyPalace.length === 0) {
      return res.status(400).json({
        msg: "party palace not found",
        success: false,
        error: true,
      });
    }

    return res.status(200).json({
      msg: "party palace found successfully",
      success: true,
      error: false,
      data: findPartyPalace,
      totalCount,
      totalPage: Math.ceil(totalCount / limit),
    });
  } catch (error) {
    return res.status(500).json({
      msg: error.message || error || "Internal server error",
      success: false,
      error: true,
    });
  }
};

//get party palace by price range and category
export const getPartyPalaceByFilter = async (req, res) => {
  try {
    let { min, max, page, limit, category, capacity } = req.body;

    if (!page) page = 1;
    if (!limit) limit = 10;

    let skip = (page - 1) * limit;

    // Build dynamic query
    let query = {};

    if (min !== undefined && max !== undefined) {
      query.pricePerHour = { $gte: min, $lte: max };
    } else if (min !== undefined) {
      query.pricePerHour = { $gte: min };
    } else if (max !== undefined) {
      query.pricePerHour = { $lte: max };
    }

    if (category && category.length > 0) {
      query.category = { $in: category };
    }

    if (capacity) {
      query.capacity = { $gte: parseInt(capacity) };
    }

    const [totalCount, findPP] = await Promise.all([
      PartyPalace.countDocuments(query),
      PartyPalace.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
    ]);

    if (findPP.length === 0) {
      return res.status(400).json({
        msg: "No party found in this price range",
        success: false,
        error: true,
      });
    }

    return res.status(200).json({
      msg: "party palace found successfully",
      success: true,
      error: false,
      data: findPP,
      totalCount,
      totalPage: Math.ceil(totalCount / limit),
    });
  } catch (error) {
    return res.status(500).json({
      msg: error.message || error || "Internal server error",
      success: false,
      error: true,
    });
  }
};

//get top liked party palace controller
export const getTopLikedPartyPalace = async (_, res) => {
  try {
    const query = { likes: { $gte: 5 } };

    const findTopLikedPartyPalace = await PartyPalace.find(query)
      .sort({ createdAt: -1 })
      .limit(8);

    if (findTopLikedPartyPalace.length === 0) {
      return res.status(400).json({
        msg: "No top liked party palace found",
        success: false,
        error: true,
      });
    }

    return res.status(200).json({
      msg: "top liked party palace found successfully",
      success: true,
      error: false,
      data: findTopLikedPartyPalace,
    });
  } catch (error) {
    return res.status(500).json({
      msg: error.message || error || "Internal server error",
      success: false,
      error: true,
    });
  }
};

//get party palace by category and available dates
export const getPartyPalaceByCategoryAndAvailableDates = async (req, res) => {
  try {
    const { category, targetedDate } = req.body;
    let { page, limit } = req.body;

    if (!page) page = 1;
    if (!limit) limit = 2;

    if (!category || !targetedDate) {
      return res.status(400).json({
        msg: "category and date is required",
        success: false,
        error: true,
      });
    }

    let skip = (page - 1) * limit;

    const query = {
      category,
      unavailableDates: { $ne: targetedDate },
    };

    const [data, totalCount] = await Promise.all([
      PartyPalace.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      PartyPalace.countDocuments(query),
    ]);

    if (data.length === 0) {
      return res.status(400).json({
        msg: "party palace not found",
        success: false,
        error: true,
      });
    }

    return res.status(200).json({
      msg: "party palace found successfully",
      success: true,
      error: false,
      data,
      totalCount,
      totalPage: Math.ceil(totalCount / limit),
    });
  } catch (error) {
    return res.status(500).json({
      msg: error.message || error || "Internal server error",
      error: true,
      success: false,
    });
  }
};
