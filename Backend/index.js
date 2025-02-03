import express from "express";
import { createServer } from "http"; // Import HTTP to attach Socket.io
import { Server } from "socket.io"; // Import Socket.io
import { connectDB } from "./config/database.js";
import dotenv from "dotenv";
import authRoute from "./routes/authRoute.js";
import userRoutes from "./routes/userRoute.js";
import chatRoute from "./routes/chatRoute.js";
import chatMessages from "./routes/messageRoute.js";
import feedRoute from "./routes/feedRoute.js";
import taskRoute from "./routes/taskRoute.js";
import cors from "cors";
import { verifyToken } from "./middleware/verifyToken.js";
import { Message, Chat } from "./models/chat.js";

const app = express();
dotenv.config();
import path from "path";
import { fileURLToPath } from "url";
import User from "./models/user.js";
import { upload } from "./middleware/FileSend.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware for parsing JSON
app.use(express.json());

// Serve static files from the "public" folder
app.use(express.static("public"));

app.use(
  cors({
    origin: "*",
  })
);

// Connect to the database
connectDB();

// Define routes
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/user", verifyToken, userRoutes);
app.use("/api/v1/chat", verifyToken, chatRoute);
app.use("/api/v1/message", chatMessages);
app.use("/api/v1/feedback", feedRoute);
app.use("/api/v1/task", verifyToken, taskRoute);

// Create an HTTP server to attach Socket.io
const httpServer = createServer(app);

// Initialize Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Allow all origins
  },
});

const users = new Map();

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("user-connected", async (userId) => {
    if (!userId) return;

    users.set(userId, socket.id);

    // Update user's isOnline status in your database
    updateUserStatus(userId, "online");

    console.log(`User ${userId} is online`);
  });

  socket.on("joinChat", ({ chatId }) => {
    socket.join(chatId);
    console.log(`User joined chat: ${chatId}`);
  });

  socket.on("leaveRoom", (chatId) => {
    socket.leave(chatId);
    console.log(`User left chat: ${chatId}`);
  });

  socket.on("sendFile", async (data) => {
    console.log("file", data);
    const newMessage = {
      isGroupChat: data.isGroupChat,
      sender: data.sender,
      file: data.file,
      chat: data.chat,
      content: "",
    };
    io.to(data.chat).emit("receiveMessage");
  });

  socket.on(
    "sendMessage",
    async ({ sender, chat, content, isGroupChat, type, ext }) => {
      const newMessage = {
        isGroupChat,
        sender,
        content,
        chat,
        ext: ext,
        type: type,
      };

      try {
        const savedMessage = await Message.create(newMessage);
        console.log("message sent to chat", savedMessage);
        io.to(chat).emit("receiveMessage", savedMessage);
        await addMessageToChat(chat, savedMessage);
      } catch (error) {
        console.error("Error saving or emitting message:", error);
      }
    }
  );

  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
    const userId = [...users.entries()].find(
      ([, value]) => value === socket.id
    )?.[0];

    if (userId) {
      users.delete(userId);

      // Update user's isOnline status in your database
      updateUserStatus(userId, "offline");
      console.log(`User ${userId} is offline`);
    }
  });
});

// Helper function to add a message to a chat
const addMessageToChat = async (chatId, savedMessage) => {
  try {
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      {
        $push: {
          messages: savedMessage,
        },
      },
      { new: true } // Return the updated document
    );

    return updatedChat;
  } catch (error) {
    console.error("Error updating chat:", error);
    throw error; // Re-throw the error for higher-level handling
  }
};

// Helper function to update user status
const updateUserStatus = async (id, status) => {
  if (status === "online") {
    await User.findByIdAndUpdate(id, { isOnline: true });
  } else {
    await User.findByIdAndUpdate(id, { isOnline: false });
  }
};

// Start the server
const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`Server is running at port ${PORT}`);
});

app.post("/chat/:id/upload", upload.single("file"), async (req, res) => {
  try {
    console.log("file", req.file);

    return res.status(201).json({
      message: "file send successfully",
      fileUrl: req.file.filename,
      ext: req.file.mimetype,
    });
  } catch (error) {
    res.status(500).json({ message: "something went wrong", error });
  }
});
