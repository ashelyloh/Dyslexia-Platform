import { Chat } from "../models/chat.js";

// export const getAllChat = async (req, res) => {
//   try {
//     const { search } = req.query; // Extract search query from request

//     // Build search criteria
//     const searchCriteria = {
//       participants: { $in: [req.user] },
//     };

//     // If a search query is provided, add it to the criteria
//     if (search) {
//       searchCriteria["participants"] = {
//         $elemMatch: { username: { $regex: search, $options: "i" } }, // Use $elemMatch to search within array
//       };
//     }

//     // Fetch chats based on criteria
//     const chats = await Chat.find(searchCriteria)
//       .populate("participants") // Populate participants with user details
//       .populate({
//         path: "messages",
//         options: { sort: { createdAt: -1 } }, // Sort messages by creation time (latest first)
//       })
//       .sort({ updatedAt: -1 }); // Sort chats by their latest activity

//     return res.status(200).json(chats);
//   } catch (error) {
//     console.error("Error fetching chats:", error);
//     return res.status(500).json({ message: "Something went wrong", error });
//   }
// };

export const getAllChat = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};
    if (search) {
      query = {
        $elemMatch: { groupName: { $regex: search, $options: "i" } },
      };
    }
    const chats = await Chat.find({ participants: { $in: req.user } })
      .populate("participants")
      .populate({
        path: "messages",
        options: { sort: { createdAt: -1 } },
      })
      .sort({ updatedAt: -1 }); // Sort chats by their latest activity

    return res.status(200).json(chats);
  } catch (error) {
    console.error("Error fetching chats:", error);
    return res.status(500).json({ message: "Something went wrong", error });
  }
};
export const createChat = async (req, res) => {
  console.log("body", req.body);
  console.log(req.file);
  try {
    const { isGroupChat, otherUser, groupName } = req.body;
    let participants = "";

    if (isGroupChat) {
      participants = JSON.parse(otherUser);
    }

    // Validation for group chats
    if (isGroupChat && (!groupName || !otherUser || otherUser.length < 2)) {
      return res.status(400).json({
        message:
          "Group chats must have a group name and at least two other participants.",
      });
    }

    if (isGroupChat) {
      // Create a group chat
      const chat = await Chat.create({
        participants: [...participants, req.user],
        isGroupChat: true,
        groupName,
        creator: req.user,
        logo: req.file.filename,
      });
      return res
        .status(201)
        .json({ message: "Group chat created successfully", chat });
    }

    // Check if a one-to-one chat already exists
    const existingChat = await Chat.findOne({
      isGroupChat: false,
      participants: { $all: [req.user, otherUser] },
    });

    if (existingChat) {
      return res
        .status(200)
        .json({ message: "Chat already exists", chat: existingChat });
    }

    // Create a one-to-one chat
    const chat = await Chat.create({
      participants: [req.user, otherUser],
    });

    return res.status(201).json({ message: "Chat created successfully", chat });
  } catch (error) {
    console.error("Error creating chat:", error);
    return res.status(500).json({ message: "Something went wrong", error });
  }
};

export const deleteChat = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // Ensure the user is a participant
    if (!chat.participants.includes(req.user)) {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this chat" });
    }

    await chat.deleteOne();
    return res.status(200).json({ message: "Chat deleted successfully" });
  } catch (error) {
    console.error("Error deleting chat:", error);
    return res.status(500).json({ message: "Something went wrong", error });
  }
};

export const getAllChatMessages = async (req, res) => {
  const messages = await Chat.find(req.params.id);

  return res.status(200).json(messages);
};

export const ADD_USER_TO_GROUP = async (req, res) => {
  try {
    // Fetch the chat by ID
    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res
        .status(404)
        .json({ success: false, message: "Chat not found" });
    }

    // Check if the authenticated user is the creator of the chat
    if (chat.creator.toString() !== req.user.toString()) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to add users to this chat",
      });
    }

    // Check if the user is already a participant
    if (chat.participants.includes(req.body.newUser)) {
      return res.status(400).json({
        success: false,
        message: "User is already a participant in this chat",
      });
    }

    // Add the new user to participants
    chat.participants.push(req.body.newUser);
    await chat.save();

    return res.status(200).json({
      success: true,
      message: "User successfully added to the chat",
    });
  } catch (error) {
    console.error("Error adding user to chat:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while adding the user to the chat",
      error: error.message,
    });
  }
};
