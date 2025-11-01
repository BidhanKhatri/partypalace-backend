import mongoose from "mongoose";
import MessageModel from "../models/message.model.js";
import User from "../models/user.model.js";
import PartyPalace from "../models/partypalace.model.js";

//getting the side bar data
// export const getSideMessageController = () => async (req, res) => {
//   try {
//     const userId = req.userId; // taking my id from middleware

//     const { partyPalaceId } = req?.body;
//     const formattedPartyPalaceId = new mongoose.Types.ObjectId(partyPalaceId);

//     if (!userId || !partyPalaceId) {
//       return res.status(400).json({
//         msg: "userId and partyPalaceId is required",
//         success: false,
//         error: true,
//       });
//     }

//     // const findUser = await MessageModel.find({
//     //   $and: [
//     //     { _id: { $ne: userId } },
//     //     { partyPalaceId: formattedPartyPalaceId },
//     //   ],
//     // });

//     // if (findUser.length === 0) {
//     //   return res.status(400).json({
//     //     msg: "User not found",
//     //     success: false,
//     //     error: true,
//     //   });
//     // }

//     return res.status(200).json({
//       msg: "User left side message found successfully",
//       error: false,
//       success: true,
//       data: { userId, partyPalaceId },
//     });
//   } catch (error) {
//     return res.status(500).json({
//       msg: error.message || error || "Internal server error",
//     });
//   }
// };

//sending the message
// export const sendMessage = () => async (req, res) => {
//   try {
//     const userId = req.userId; // taking my id from middleware
//     const partyPalaceId = req.query;
//     return res.status(200).json({
//       msg: "Message sent successfully",
//       success: true,
//       error: false,
//       data: { userId, partyPalaceId },
//     })
//   } catch (error) {
//     return res.status(500).json({
//       msg: error.message || error || "Internal server error",
//     });
//   }
// };

//send message controller

export const sendMyMessage = async (req, res) => {
  const { receiverId, partyPalaceId, text } = req.body;
  const senderId = req.userId;

  if (!receiverId || !partyPalaceId || !text) {
    return res.status(400).json({
      msg: "receiverId, partyPalaceId and text is required",
      success: false,
      error: true,
    });
  }

  const createMessage = new MessageModel({
    senderId,
    receiverId,
    partyPalaceId,
    text,
  });

  await createMessage.save();

  return res.status(200).json({
    msg: "Message sent successfully",
    success: true,
    error: false,
    data: createMessage,
  });
};

//get message controller
export const getMessage = async (req, res) => {
  try {
    const myId = req.userId; // My ID from middleware
    const { receiverId } = req.query;

    if (!myId || !receiverId) {
      return res.status(400).json({
        msg: "userId and receiverId are required",
        success: false,
        error: true,
      });
    }

    const formattedReceiverId = new mongoose.Types.ObjectId(receiverId);

    // Fetch messages where either you are the sender or the receiver
    const messages = await MessageModel.find({
      $or: [
        { senderId: myId, receiverId: formattedReceiverId },
        { senderId: formattedReceiverId, receiverId: myId },
      ],
    })
      .sort({ createdAt: 1 })
      .populate("senderId"); // Sorting messages by creation date in ascending order

    if (messages.length === 0) {
      return res.status(404).json({
        msg: "No messages found",
        success: false,
        error: true,
      });
    }

    return res.status(200).json({
      msg: "Messages retrieved successfully",
      success: true,
      error: false,
      data: messages,
    });
  } catch (error) {
    return res.status(500).json({
      msg: error.message || "Internal server error",
      success: false,
      error: true,
    });
  }
};

//get left side message for admin
export const getLeftSideMessageForAdmin = async (req, res) => {
  try {
    const { createdBy } = req.query;

    const userRole = req?.userRole;
    if (userRole !== "admin")
      return res.status(401).json({
        msg: "only admin can access this route",
        success: false,
        error: true,
      });

    const findMyAllPartyPalace = await PartyPalace.find({ createdBy });
    const partyPalaceIds = findMyAllPartyPalace.map((item) => {
      return item._id.toString();
    }); // returing the partyPalaceId array like this ['67a45abf92ec4704b3fb7457','67a48e7cb207a3a89c591cc5','67a5ebb8bc0fd69fbdc0989d',]
    // console.log(partyPalaceIds);

    if (!createdBy) {
      return res.status(400).json({
        msg: "createdBy is required",
        success: false,
        error: true,
      });
    }

    const findAllMessage = await MessageModel.find({})
      .populate("senderId")
      .select("-image");

    const findMessage = findAllMessage.filter((item) => {
      return partyPalaceIds.includes(item.partyPalaceId.toString());
    }); //It return the message where the partyPalaceId is in the partyPalaceId array
    // console.log(findMessage);

    if (findMessage.length === 0) {
      return res.status(400).json({
        msg: "No message found",
        success: false,
        error: true,
      });
    }

    return res.status(200).json({
      msg: "success",
      success: true,
      error: false,
      data: findMessage,
    });
  } catch (error) {
    return res.status(500).json({
      msg: error.message || "Internal server error",
      success: false,
      error: true,
    });
  }
};
