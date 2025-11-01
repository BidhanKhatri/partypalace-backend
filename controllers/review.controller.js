import Review from "../models/review.model.js";
import { io } from "../utils/socketConn.js";

// create review controller;
export const createReviewController = async (req, res) => {
  try {
    const { partyPalaceId, comment, ratings } = req.body;

    const userId = req?.userId; //from middleware

    if (!partyPalaceId) {
      return res.status(400).json({
        msg: "partyPalaceId is required",
        success: false,
        error: true,
      });
    }
    if (!comment) {
      return res.status(400).json({
        msg: "comment is required",
        success: false,
        error: true,
      });
    }
    if (!ratings) {
      return res.status(400).json({
        msg: "provide a ratings max 5",
        success: false,
        error: true,
      });
    }
    if (!userId) {
      return res.status(400).json({
        msg: "reviewBy userId is required",
        success: false,
        error: true,
      });
    }

    const createReview = new Review({
      partyPalaceId,
      reviews: {
        comment,
        ratings,
      },
      reviewBy: userId,
    });
    await createReview.save();

    //socket implementation
    io.emit("createReview", createReview);

    if (!createReview) {
      return res.status(400).json({
        msg: "sorry unable to create review",
        success: false,
        error: true,
      });
    }

    return res.status(200).json({
      msg: "Review submitted successful",
      success: true,
      error: false,
      data: createReview,
    });
  } catch (error) {
    return res.status(500).json({
      msg: error.message || error || "Internal server error",
      success: false,
      error: true,
    });
  }
};

//get review controller
export const getReviewController = async (req, res) => {
  try {
    const { partyPalaceId } = req.query;

    if (!partyPalaceId) {
      return res.status(400).json({
        msg: "partyPalaceId is required",
        error: true,
        success: false,
      });
    }

    const findReview = await Review.find({ partyPalaceId }).populate(
      "reviewBy"
    );

    if (findReview.length === 0) {
      return res.status(400).json({
        msg: "No review found",
        error: true,
        success: false,
      });
    }

    return res.status(200).json({
      msg: "Review found successfully",
      error: false,
      success: true,
      data: findReview,
    });
  } catch (error) {
    return res.status(500).json({
      msg: error.message || error || "Internal server error",
      success: false,
      error: true,
    });
  }
};

//update review controller
export const updateMyReviewController = async (req, res) => {
  try {
    const { partyPalaceId, _id: reviewId, comment } = req.body;
    const userId = req.userId; //from middleware
    const userRole = req.userRole;

    if (userRole !== "user") {
      return res.status(401).json({
        msg: "Only user can update review",
        success: false,
        error: true,
      });
    }

    if (!partyPalaceId || !reviewId) {
      return res.status(400).json({
        msg: "partyPalaceId & reviewId is required",
        success: false,
        error: true,
      });
    }

    if (!comment) {
      return res.status(400).json({
        msg: "new comment is required",
        success: false,
        error: true,
      });
    }

    //find the review with partyPalaceId
    const findReview = await Review.findOne({
      _id: reviewId,
      partyPalaceId,
      reviewBy: userId,
    }); // return object

    console.log(findReview);

    if (findReview !== null) {
      const updateReview = await Review.findOneAndUpdate(
        { _id: findReview._id },
        {
          $set: { "reviews.comment": comment, "reviews.updatedAt": Date.now() },
        },
        { new: true }
      );

      return res.status(200).json({
        msg: "Review updated successfuly",
        success: true,
        error: false,
        data: updateReview,
      });
    }

    if (findReview === null) {
      return res.status(400).json({
        msg: "Unable to update review",
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
