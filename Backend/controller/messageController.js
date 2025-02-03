import { Chat, Message } from "../models/chat.js";

export const getChatMessages = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "Chat ID is required" });
  }

  try {
    const messages = await Message.find({ chat: id })
      .populate("sender", "username")
      .populate("chat", "isGroupChat");

    if (!messages) {
      return res
        .status(404)
        .json({ message: "No messages found for this chat" });
    }

    return res.status(200).json(messages);
  } catch (error) {
    console.error(error); // Log error for debugging
    return res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};

export const changeMessageStatus = async (req, res) => {
  const { id } = req.params;
  console.log("checking", id);
  if (!id) {
    return res.status(400).json({ message: "Chat ID is required" });
  }

  try {
    // Find the chat document
    const chat = await Chat.findById(id); // Populate messages within the chat
    // console.log("chats", chat);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // Check if there are any messages to update
    const updatedMessages = chat.messages.map((message) => {
      // If the message is not seen, update it
      if (!message.isSeen && message.sender !== req.user) {
        message.isSeen = true;
      }
      return message;
    });

    // Save the updated messages in the chat
    chat.messages = updatedMessages;
    await chat.save();
    // console.log("chat messagss", chat.messages);
    await Message.updateMany(
      { chat: id, isSeen: false, sender: { $ne: req.user } }, // Filter for messages in the chat with isSeen === false
      { $set: { isSeen: true } }, // Set isSeen to true
      { multi: true } // Update multiple messages
    );
    // Save the chat document with the updated messages

    return res.status(200).json({
      message: "Message statuses updated",
    });
  } catch (error) {
    console.error(error); // Log error for debugging
    return res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};
