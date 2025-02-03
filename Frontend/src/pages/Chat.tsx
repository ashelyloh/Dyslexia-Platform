import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { Button, Modal, Avatar, TextInput, FileInput } from "flowbite-react";
import { Loader, Paperclip, Plus, PlusCircle, Send } from "lucide-react";
import { getChats } from "../redux/chatSlice";
import { HiUserGroup } from "react-icons/hi";
import toast from "react-hot-toast";

const socket = io("http://localhost:4000", { autoConnect: false });

const Chat = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState([]);

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isPending, setIsPending] = useState(false);
  const [members, setMembers] = useState([]);
  const { token, user } = useSelector((state: any) => state.auth);
  const { chats } = useSelector((state: any) => state.chat);
  const [groupName, setGroupName] = useState("");
  const [singleUser, setSingleUser] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const dispatch = useDispatch();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [file, setFile] = useState(null);
  const [logo, setLogo] = useState(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleAddUser = async () => {
    try {
      const resp = await axios.post("/user/add", newUser, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers((prev) => [...prev, resp.data.user]);
      setNewUser({ username: "", email: "" });
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error adding user:", error);
    }
  };

  // Create new group
  const handleCreateGroup = async () => {
    // if (!groupName || !selectedUsers.length || !logo) {
    //   toast.error("Please fill in all required fields.");
    //   return;
    // }

    const formData = new FormData();

    // Append the required fields to the form data
    formData.append("groupName", groupName);
    formData.append("otherUser", JSON.stringify(selectedUsers)); // Convert array to JSON string
    formData.append("isGroupChat", "true"); // FormData values must be strings
    formData.append("logo", logo);

    try {
      // Make the API call
      const response = await axios.post("/chat/create", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data", // Ensure correct content type
        },
      });

      // Dispatch actions and reset states after a successful response
      dispatch(getChats()); // Refresh chats list
      setLogo(null);
      setGroupName("");
      setSelectedUsers([]);
      setIsGroupModalOpen(false);

      // Notify the user of success
      toast.success(response.data?.message || "Group created successfully!");
    } catch (error: any) {
      // Log error and notify user
      console.error("Error creating group:", error);
      toast.error(
        error.response?.data?.message ||
          "An error occurred while creating the group."
      );
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch all users
  const getALLUsers = async () => {
    try {
      const resp = await axios.get("/user/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(resp?.data?.users);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // Fetch messages for the selected chat
  const getMessages = async () => {
    try {
      const resp = await axios.get(`/message/${selectedChat}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setMessages(resp?.data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  // Initialize socket connection and listeners
  useEffect(() => {
    socket.connect();

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    socket.emit("user-connected", user._id);
    dispatch(getChats());
    socket.on("online-users", (users) => {
      console.log("Online users:", users);
      setOnlineUsers(users);
    });

    socket.on("receiveMessage", (message: any) => {
      setMessages((prevMessages) => [...prevMessages, message]);
      const audio = new Audio("/sound/notif.mp3");
      audio.play();
    });

    socket.on("disconnect", () => {
      console.error("Socket disconnected");
    });

    return () => {
      socket.disconnect();
    };
  }, [socket]);

  const textColor = localStorage.getItem("textColor");

  // Fetch users on component mount
  useEffect(() => {
    getALLUsers();
  }, [token]);

  // Join the selected chat room and fetch messages
  useEffect(() => {
    if (selectedChat) {
      socket.emit("joinChat", { chatId: selectedChat });
      getMessages();

      return () => {
        socket.emit("leaveRoom", selectedChat);
      };
    }
  }, [selectedChat, socket]);

  // Dispatch to fetch all chats
  useEffect(() => {
    console.log("calling api");
    dispatch(getChats());
  }, [dispatch, search]);

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!socket.connected) {
      console.error("Socket not connected");
      return;
    }

    if (file) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const { data } = await axios.post(
          `http://localhost:4000/chat/${selectedChat}/upload`,
          formData
        );
        console.log("data", data);

        const newMessage = {
          chat: selectedChat,
          content: data.fileUrl,
          ext: data?.ext,
          sender: user._id,
          type: "file",
          isGroupChat: selectedUser.isGroupChat,
        };

        socket.emit("sendMessage", newMessage);
        getMessages();

        const audio = new Audio("/sound/burbuja.mp3");
        audio.play();

        setFile(null);
        setMessageInput("");
      } catch (error) {
        console.error("Error uploading file:", error);
      }
      return;
    } else {
      if (messageInput.trim()) {
        const newMessage = {
          chat: selectedChat,
          content: messageInput,
          sender: user._id,
          type: "text",
          isGroupChat: selectedUser.isGroupChat,
        };

        try {
          socket.emit("sendMessage", newMessage);
          getMessages();

          const audio = new Audio("/sound/burbuja.mp3");
          audio.play();

          setMessageInput("");
        } catch (error) {
          console.error("Error sending message:", error);
        }
      }
    }
  };

  // Handle adding a user to the contact list
  const addToList = async (userId: string) => {
    try {
      const resp = await axios.post(
        "/chat/create/",
        {
          isGroupChat: false,
          groupName: "",
          otherUser: userId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Added to contact list:", resp.data);
      dispatch(getChats());
    } catch (error) {
      console.error("Error adding user:", error);
    }
  };

  console.log("chats", chats);
  console.log("messss", messages);

  const AddUser_TO_GROUP = async (id: string) => {
    try {
      const resp = await axios.put(
        `/chat/add/user/${selectedChat}`,
        { newUser: id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      dispatch(getChats({ search: "" }));
      toast.success(resp?.data?.message);
    } catch (error: any) {
      toast.error(error.response?.data?.message);
    }
  };

  const ChangeMessageStatus = async (id: string) => {
    const resp = await axios.put(
      `/message/status/${id}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    dispatch(getChats());
  };

  const handleFileSend = async (e: any) => {
    const file = e.target.files[0]; // Get the selected file
    if (!file) return;

    console.log("Selected file:", file);

    // Create FormData for file upload
    const formData = new FormData();
    formData.append("file", file); // Attach file
    formData.append("sender", user._id); // Add sender ID
    formData.append("chat", selectedChat); // Add chat ID
    formData.append("content", "this is file sending"); // Empty content for file message
    formData.append("isGroupChat", selectedUser.isGroupChat); // Is group chat or not
    console.log("form data", formData);
    try {
      // Upload file to the server
      const { data } = await axios.post(
        `http://localhost:4000/chat/${selectedChat}/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data", // Ensure multipart/form-data headers
          },
        }
      );

      console.log("File uploaded successfully:", data);

      // Emit file message to the server
      const fileMessage = {
        chat: selectedChat,
        file: data.file, // Use returned file info (e.g., filename or URL)
        sender: user._id,
        isGroupChat: selectedUser.isGroupChat,
      };

      // Emit to server via Socket.io
      socket.emit("sendFile", fileMessage);

      console.log("File message sent:", fileMessage);

      // Optionally update UI
      // setMessages((prev) => [...prev, fileMessage]);
    } catch (error) {
      console.error("File upload failed:", error);
    }
  };

  console.log("selected userccc", selectedUser);
  console.log("selected chattt", selectedChat);

  return (
    <>
      <div className="flex h-screen bg-white relative">
        {file && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="relative bg-white rounded-lg shadow-lg p-6 max-w-lg w-full">
              <button
                className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full focus:outline-none hover:bg-red-600"
                onClick={() => setFile(null)}
              >
                ✕
              </button>
              {file?.type.startsWith("image/") && (
                <img
                  src={URL.createObjectURL(file)}
                  alt="Image Preview"
                  className="w-full max-h-80 object-cover rounded"
                />
              )}
              {file?.type === "application/pdf" && (
                <iframe
                  src={URL.createObjectURL(file)}
                  className="w-full h-80 border rounded"
                  title="PDF Preview"
                ></iframe>
              )}
              {file.type ===
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document" && (
                <div className="text-center py-6">
                  <span className="text-gray-700 text-lg font-medium">
                    Preview not available for DOCX files.
                  </span>
                </div>
              )}
              <button
                className="mt-4 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none"
                onClick={handleSendMessage}
              >
                Send File
              </button>
            </div>
          </div>
        )}

        {/* Sidebar */}
        <aside className="w-1/4 bg-white border relative p-4 overflow-auto">
          <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-md">
            <div className="text-blue-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M21 16.11A7.003 7.003 0 0111 4.9 7.003 7.003 0 0113 19h.11A7.003 7.003 0 0121 16.11zM9.828 21a6.978 6.978 0 01-4.19-1.51A4.002 4.002 0 013 15h.1A4.978 4.978 0 017.07 17H9.828a4.978 4.978 0 012.07.51A4.978 4.978 0 0113 19H9.828z"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
              Chats
            </h2>
          </div>

          {isPending ? (
            <div className="h-[150px] flex justify-center items-center">
              <Loader className="animate-spin" />
            </div>
          ) : (
            <div className="space-y-4 overflow-y-auto h-[390px]">
              {chats?.map((chat: any) => (
                <div
                  key={chat._id}
                  onClick={() => {
                    setSelectedChat(chat._id);
                    ChangeMessageStatus(chat?._id);
                    chat?.isGroupChat === true
                      ? setMembers(chat?.participants)
                      : setMembers([]);

                    setSelectedUser(
                      chat.isGroupChat
                        ? {
                            group: chat?.groupName,
                            logo: chat?.logo,
                            isGroupChat: chat?.isGroupChat,
                          }
                        : chat.participants.find((p: any) => p._id !== user._id)
                    );
                  }}
                  className={`flex items-center relative space-x-3 p-3 rounded-lg cursor-pointer transition ${
                    selectedChat === chat._id
                      ? "bg-blue-50 border-l-4 border-blue-600"
                      : "hover:bg-gray-100"
                  }`}
                >
                  <div className="relative">
                    {chat.isGroupChat ? (
                      <Avatar
                        img={
                          chat.logo !== ""
                            ? `http://localhost:4000/group/${chat.logo}`
                            : "https://img.freepik.com/premium-vector/user-profile-icon-flat-style-member-avatar-vector-illustration-isolated-background-human-permission-sign-business-concept_157943-15752.jpg"
                        }
                        rounded
                      />
                    ) : (
                      <Avatar
                        img={
                          chat.isGroupChat
                            ? chat.groupName
                            : chat.participants
                                .filter((p: any) => p._id !== user._id)
                                .map(
                                  (p: any) =>
                                    `http://localhost:4000/uploads/${p.profile_pic}` ||
                                    "https://img.freepik.com/premium-vector/user-profile-icon-flat-style-member-avatar-vector-illustration-isolated-background-human-permission-sign-business-concept_157943-15752.jpg"
                                )
                                .join(", ")
                        }
                        rounded
                      />
                    )}
                    {!chat.isGroupChat &&
                      chat.participants
                        .filter((p: any) => p._id !== user._id)
                        .map((p: any) => (
                          <span
                            className={`w-[15px] top-0 right-0 border-2 absolute border-white h-[15px] rounded-full ${
                              p.isOnline ? "bg-green-400" : "bg-yellow-400"
                            }`}
                          ></span>
                        ))}

                    {/* {chat.participants.map((participant: any) => {
                      const isOnline = onlineUsers.includes(participant); // Check if the participant is online
                      return (
                        <span
                          key={participant} // Add a unique key for each participant
                          className={`w-[15px] top-0 right-0 border-2 absolute border-white h-[15px] rounded-full ${
                            isOnline ? "bg-green-400" : "bg-yellow-400"
                          }`}
                        ></span>
                      );
                    })} */}
                  </div>
                  <div className="flex-1">
                    <span className="font-semibold">
                      {chat.isGroupChat
                        ? chat.groupName
                        : chat.participants
                            .filter((p: any) => p._id !== user._id)
                            .map((p: any) => p.username)
                            .join(", ")}
                    </span>
                    <p
                      style={{ color: `${textColor ? textColor : ""}` }}
                      className="text-[13px] text-gray-500 truncate"
                    >
                      {chat?.messages?.length
                        ? chat.messages[0]?.content.substring(0, 15) + "..."
                        : "No messages yet"}
                    </p>
                  </div>
                  {chat.messages.filter(
                    (c: any) => c.isSeen === false && c.sender !== user._id
                  ).length > 0 && (
                    <span className="absolute right-2 top-2 p-2 bg-green-400 border text-white text-[12px] h-[20px] w-[20px] flex justify-center items-center rounded-full">
                      {
                        chat.messages.filter(
                          (c: any) =>
                            c.isSeen === false && c.sender !== user._id
                        ).length
                      }
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
          <div className="mt-4 absolute p-5 w-[90%] bottom-0">
            <Button
              onClick={() => setIsModalOpen(true)}
              className="w-full text-white bg-blue-600 hover:bg-blue-700 mb-2"
            >
              <PlusCircle size={20} className="mr-2" />
              Add User
            </Button>
            <Button
              onClick={() => setIsGroupModalOpen(true)}
              className="w-full text-white bg-green-600 hover:bg-green-700"
            >
              <HiUserGroup size={20} className="mr-2" />
              Create Group
            </Button>
          </div>
        </aside>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          <div
            style={{ color: `${textColor ? textColor : ""}` }}
            className="h-16 bg-blue-300 text-white flex items-center px-4 shadow-lg"
          >
            {selectedChat ? (
              <div className="flex items-center gap-2">
                <div className="relative">
                  <img
                    src={
                      selectedUser?.isGroupChat === true
                        ? `http://localhost:4000/group/${selectedUser.logo}`
                        : `http://localhost:4000/uploads/${selectedUser.profile_pic}`
                    }
                    className="h-[40px] w-[40px]  rounded-full"
                    alt=""
                  />
                  {selectedUser.isGroupChat === false && (
                    <span
                      className={`w-[15px] top-0 right-0 border-2 absolute border-white h-[15px] rounded-full ${
                        selectedUser?.isOnline
                          ? "bg-green-500"
                          : "bg-yellow-400"
                      } `}
                    ></span>
                  )}
                </div>
                <div>
                  <h3 style={{ color: `${textColor ? textColor : ""}` }}>
                    {selectedUser?.username || selectedUser?.group}
                  </h3>
                  <p
                    style={{ color: `${textColor ? textColor : ""}` }}
                    className="text-sm font-medium"
                  >
                    {!selectedUser?.isGroupChat && selectedUser?.email}
                  </p>
                </div>
              </div>
            ) : (
              <h2
                style={{ color: `${textColor}` }}
                className="text-xl font-semibold"
              >
                Select a chat to start messaging
              </h2>
            )}
          </div>
          <div className="flex-1 p-4 overflow-y-auto bg-white">
            {selectedChat ? (
              messages.map((message: any, idx: number) =>
                message.chat.isGroupChat === true ? (
                  <div
                    key={idx}
                    className={`flex ${
                      message.sender &&
                      (message.sender._id || message.sender) === user._id
                        ? "justify-end"
                        : ""
                    } mb-3`}
                  >
                    <div
                      className={`relative p-4 rounded-2xl shadow-md max-w-xs ${
                        message.sender &&
                        (message.sender._id || message.sender) === user._id
                          ? "bg-blue-200 text-white text-right"
                          : "bg-gray-100 text-gray-800"
                      }`}
                      style={{
                        color: `${textColor ? textColor : ""}`,
                        borderRadius:
                          message.sender &&
                          (message.sender._id || message.sender) === user._id
                            ? "20px 20px 4px 20px"
                            : "20px 20px 20px 4px",
                      }}
                    >
                      <p className="text-sm font-semibold">
                        {message.sender === user._id
                          ? "You"
                          : message?.sender?.username || selectedUser?.username}
                      </p>
                      <p className="mt-1">
                        {message.type === "text" ? (
                          message.content
                        ) : message?.ext === "application/pdf" ? (
                          <div className="relative">
                            <object
                              height="150px"
                              width="150px"
                              data={`http://localhost:4000/files/${message.content}`}
                              type="application/pdf"
                              className="border rounded w-full max-w-[150px] h-auto"
                            >
                              <div className="absolute top-0 left-0 w-full h-full bg-opacity-50 bg-gray-500 flex items-center justify-center text-white font-semibold text-sm rounded">
                                <div className="text-center">
                                  <p>PDF Preview Not Available</p>
                                  <a
                                    href={`http://localhost:4000/files/${message.content}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-300 underline flex items-center gap-2 mt-2"
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-5 w-5"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 4v16h16V4M9 12h6m-6 4h6"
                                      />
                                    </svg>
                                    Download PDF
                                  </a>
                                </div>
                              </div>
                            </object>
                          </div>
                        ) : message?.ext?.startsWith("image") ? (
                          <div className="relative group">
                            <img
                              src={`http://localhost:4000/files/${message.content}`}
                              alt="Image Preview"
                              height="150px"
                              width="150px"
                              className="rounded shadow-md object-cover w-full h-auto max-w-[150px]"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center text-white text-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="font-semibold">
                                Image Preview
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="relative flex flex-col items-center justify-center w-[150px] h-[150px] bg-gray-200 rounded shadow-md">
                            <div className="text-gray-500 mb-2">
                              Preview Not Available
                            </div>
                            <a
                              href={`http://localhost:4000/files/${message.content}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 underline flex items-center gap-2"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M4 4v16h16V4M9 12h6m-6 4h6"
                                />
                              </svg>
                              Download File
                            </a>
                          </div>
                        )}
                      </p>

                      <p className="mt-2 text-xs opacity-80">
                        {new Date(message.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      <span
                        className={`absolute w-0 h-0 border-t-[10px] border-t-transparent ${
                          message.sender &&
                          (message.sender._id || message.sender) === user._id
                            ? "border-r-[10px] border-r-blue-500 right-0 translate-x-1"
                            : "border-l-[10px] border-l-gray-100 left-0 -translate-x-1"
                        }`}
                      ></span>
                    </div>
                  </div>
                ) : (
                  <div
                    key={idx}
                    className={`flex ${
                      message.sender &&
                      (message.sender._id || message.sender) === user._id
                        ? "justify-end"
                        : ""
                    } mb-3`}
                    style={{ color: `${textColor ? textColor : ""}` }}
                  >
                    <div
                      className={`relative p-4 rounded-2xl shadow-md max-w-xs ${
                        message.sender &&
                        (message.sender._id || message.sender) === user._id
                          ? "bg-blue-200 text-white text-right"
                          : "bg-gray-100 text-gray-800"
                      }`}
                      style={{
                        color: `${textColor ? textColor : ""}`,
                        borderRadius:
                          message.sender &&
                          (message.sender._id || message.sender) === user._id
                            ? "20px 20px 4px 20px"
                            : "20px 20px 20px 4px",
                      }}
                    >
                      <p className="text-sm font-semibold">
                        {message.sender &&
                        (message.sender._id || message.sender) === user._id
                          ? "You"
                          : selectedUser?.username}
                      </p>
                      <p className="mt-1">
                        {message.type === "text" ? (
                          message.content
                        ) : message?.ext === "application/pdf" ? (
                          <div className="relative">
                            <object
                              height="150px"
                              width="150px"
                              data={`http://localhost:4000/files/${message.content}`}
                              type="application/pdf"
                              className="border rounded w-full max-w-[150px] h-auto"
                            >
                              <div className="absolute top-0 left-0 w-full h-full bg-opacity-50 bg-gray-500 flex items-center justify-center text-white font-semibold text-sm rounded">
                                <div className="text-center">
                                  <p>PDF Preview Not Available</p>
                                  <a
                                    href={`http://localhost:4000/files/${message.content}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-300 underline flex items-center gap-2 mt-2"
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-5 w-5"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 4v16h16V4M9 12h6m-6 4h6"
                                      />
                                    </svg>
                                    Download PDF
                                  </a>
                                </div>
                              </div>
                            </object>
                          </div>
                        ) : message?.ext?.startsWith("image") ? (
                          <div className="relative group">
                            <img
                              src={`http://localhost:4000/files/${message.content}`}
                              alt="Image Preview"
                              height="150px"
                              width="150px"
                              className="rounded shadow-md object-cover w-full h-auto max-w-[150px]"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center text-white text-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="font-semibold">
                                Image Preview
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="relative flex flex-col items-center justify-center w-[150px] h-[150px] bg-gray-200 rounded shadow-md">
                            <div className="text-gray-500 mb-2">
                              Preview Not Available
                            </div>
                            <a
                              href={`http://localhost:4000/files/${message.content}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 underline flex items-center gap-2"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M4 4v16h16V4M9 12h6m-6 4h6"
                                />
                              </svg>
                              Download File
                            </a>
                          </div>
                        )}
                      </p>

                      <p className="mt-2 text-xs opacity-80">
                        {new Date(message.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      <span
                        className={`absolute w-0 h-0 border-t-[10px] border-t-transparent ${
                          message.sender &&
                          (message.sender._id || message.sender) === user._id
                            ? "border-r-[10px] border-r-blue-500 right-0 translate-x-1"
                            : "border-l-[10px] border-l-gray-100 left-0 -translate-x-1"
                        }`}
                      ></span>
                    </div>
                  </div>
                )
              )
            ) : (
              <div className="flex justify-center items-center h-full flex-col gap-4 p-4 bg-gray-50 rounded-lg shadow-md">
                {/* Chat Icon */}
                <div
                  style={{ color: `${textColor ? textColor : ""}` }}
                  className="p-4 bg-blue-100 rounded-full"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    style={{ color: `${textColor ? textColor : ""}` }}
                    className="w-12 h-12 text-blue-600"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M20 13.999V16a2 2 0 01-2 2H8l-4 4V6a2 2 0 012-2h12a2 2 0 012 2v7.999z"
                    />
                  </svg>
                </div>

                {/* Heading */}
                <h2
                  style={{ color: `${textColor ? textColor : ""}` }}
                  className="text-3xl font-bold text-blue-600"
                >
                  Dyslexia Chat Platform
                </h2>

                {/* Subtext */}
                <p
                  style={{ color: `${textColor ? textColor : ""}` }}
                  className="text-gray-600 text-center max-w-md"
                >
                  Select a user or group to view messages and start meaningful
                  conversations.
                </p>

                {/* Action Button */}
                {/* <button
                  className="px-6 py-2 mt-4 text-white bg-blue-600 rounded-lg shadow hover:bg-blue-700 transition"
                  onClick={() => console.log("Create a new chat clicked!")}
                >
                  Create New Chat
                </button> */}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          {selectedChat && (
            <div className="h-16 border-t flex items-center px-4 space-x-3 bg-white">
              <label className="p-2 hover:bg-gray-200 rounded-full cursor-pointer">
                <Paperclip size={20} />
                <input
                  type="file"
                  onChange={(e: any) => setFile(e.target.files[0])}
                  className="hidden"
                />
              </label>
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 p-2 border rounded-md"
              />
              <button
                onClick={handleSendMessage}
                className="p-2 bg-blue-600 text-white rounded-full"
              >
                <Send size={20} />
              </button>
            </div>
          )}
        </div>

        <Modal
          show={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          size="xxl"
        >
          <Modal.Header>Add New User</Modal.Header>
          <Modal.Body>
            <div className="grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-5 my-5">
              {users
                .filter((p: any) => p._id !== user._id)
                .map((u: any) => {
                  // Check if the chat is not a group and both participants match

                  const isInChat = chats.some((chat: any) => {
                    if (chat.isGroupChat === false) {
                      return chat.participants.some(
                        (c: any) => c._id === u._id
                      );
                    }
                    return false; // Explicitly return false for group chats
                  });

                  return (
                    <label
                      key={u._id}
                      className={`relative flex flex-col items-center p-4 border rounded-lg shadow-lg 
        ${
          isInChat
            ? "bg-green-200 cursor-not-allowed"
            : "bg-white hover:shadow-xl cursor-pointer"
        } 
        transition-shadow`}
                    >
                      {/* User Image */}
                      <div className="w-20 h-20  rounded-full overflow-hidden border mb-3">
                        <img
                          src={
                            `http://localhost:4000/uploads/${u.profile_pic}` ||
                            "https://via.placeholder.com/150"
                          }
                          alt={`${u.username}'s avatar`}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* User Details */}
                      <div
                        style={{ color: `${textColor ? textColor : ""}` }}
                        className="text-center space-y-2"
                      >
                        <h3
                          style={{ color: `${textColor ? textColor : ""}` }}
                          className="text-lg font-semibold text-gray-800"
                        >
                          {u.username}
                        </h3>
                        <p
                          style={{ color: `${textColor ? textColor : ""}` }}
                          className="text-sm text-gray-500"
                        >
                          {u.email}
                        </p>
                      </div>
                      <div className="absolute top-2 left-2">
                        <button
                          className="text-gray-500 hover:text-green-500"
                          onClick={() => addToList(u._id)}
                        >
                          <PlusCircle />
                        </button>
                      </div>
                    </label>
                  );
                })}
            </div>
          </Modal.Body>
        </Modal>

        <Modal
          style={{ color: `${textColor ? textColor : ""}` }}
          show={isGroupModalOpen}
          onClose={() => setIsGroupModalOpen(false)}
          size="xxl"
        >
          <Modal.Header style={{ color: `${textColor ? textColor : ""}` }}>
            Create New Group
          </Modal.Header>
          <Modal.Body>
            <TextInput
              placeholder="Group Name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
            <div className="my-4">
              <input
                type="file"
                className="border rounded-lg w-full"
                accept="image/*"
                onChange={(e: any) => setLogo(e.target.files[0])}
              />
            </div>
            <div
              style={{ color: `${textColor ? textColor : ""}` }}
              className="grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-5 my-5"
            >
              {users
                .filter((p: any) => p._id !== user._id)
                .map((u: any) => {
                  const isSelected = selectedUsers.includes(u._id); // Check if the user is selected

                  return (
                    <label
                      key={u._id}
                      className={`relative flex flex-col items-center p-4 border rounded-lg shadow-lg transition-shadow cursor-pointer ${
                        isSelected
                          ? "bg-blue-100 border-blue-500 shadow-md"
                          : "bg-white"
                      } hover:shadow-xl`}
                    >
                      {/* User Image */}
                      <div className="w-20 h-20 rounded-full overflow-hidden border mb-3">
                        <img
                          src={
                            u.profile_pic
                              ? `http://localhost:4000/uploads/${u.profile_pic}`
                              : "https://via.placeholder.com/150"
                          }
                          alt={`${u.username}'s avatar`}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* User Details */}
                      <div className="text-center space-y-2">
                        <h3
                          style={{ color: `${textColor ? textColor : ""}` }}
                          className="text-lg font-semibold text-gray-800"
                        >
                          {u.username}
                        </h3>
                        <p
                          style={{ color: `${textColor ? textColor : ""}` }}
                          className="text-sm text-gray-500"
                        >
                          {u.email}
                        </p>
                      </div>

                      {/* Icon */}
                      <div className="absolute top-4 right-4">
                        <input
                          type="checkbox"
                          className="hidden"
                          value={u._id}
                          onChange={(e) => {
                            const isChecked = e.target.checked;
                            setSelectedUsers((prev) =>
                              isChecked
                                ? [...prev, u._id]
                                : prev.filter((id) => id !== u._id)
                            );
                          }}
                        />
                        <span
                          className={`flex items-center justify-center w-6 h-6 border-2 rounded-full transition ${
                            isSelected
                              ? "border-blue-500 bg-blue-500 text-white"
                              : "border-gray-300 bg-white hover:border-blue-500"
                          }`}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="w-4 h-4"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </span>
                      </div>
                    </label>
                  );
                })}
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={handleCreateGroup}>Create Group</Button>
          </Modal.Footer>
        </Modal>
      </div>
      <br />

      <div>
        {/* Group Participants */}
        {members.length > 0 && (
          <h2 className="text-xl my-3">Group Participants</h2>
        )}
        {members && (
          <div className="w-full grid lg:grid-cols-5 grid-cols-2 gap-6">
            {members.map((user: any, idx: number) => {
              return (
                <div
                  key={idx}
                  className="border bg-white text-center shadow-lg rounded-lg flex flex-col justify-center items-center p-6 hover:shadow-xl transition-shadow duration-300"
                >
                  {/* Profile Picture */}
                  <div className="mb-4">
                    <img
                      className="w-[80px] h-[80px] rounded-full border-2 border-gray-200"
                      src={
                        user?.profile_pic
                          ? `http://localhost:4000/uploads/${user?.profile_pic}`
                          : "https://media.istockphoto.com/id/1337144146/vector/default-avatar-profile-icon-vector.jpg?s=612x612&w=0&k=20&c=BIbFwuv7FxTWvh5S3vB6bkT0Qv8Vn8N5Ffseq84ClGI="
                      }
                      alt={`${user?.username}'s profile`}
                    />
                  </div>

                  {/* Username */}
                  <h3
                    style={{ color: `${textColor ? textColor : ""}` }}
                    className="text-lg font-semibold text-gray-800"
                  >
                    {user?.username || "Unknown User"}
                  </h3>

                  {/* Email */}
                  {user?.email && (
                    <p
                      style={{ color: `${textColor ? textColor : ""}` }}
                      className="text-sm text-gray-500 mb-2"
                    >
                      {user.email}
                    </p>
                  )}

                  {/* Role (Optional) */}
                  {/* {user?.role && (
                    <p className="text-sm font-medium text-blue-500 bg-blue-100 px-3 py-1 rounded-full">
                      {user.role}
                    </p>
                  )} */}
                </div>
              );
            })}
          </div>
        )}

        {/* Suggested Users */}
        {members.length > 0 && (
          <div style={{ color: `${textColor ? textColor : ""}` }}>
            <h2 className="text-xl my-3">Suggested Users</h2>
            <div className="w-full grid lg:grid-cols-5 grid-cols-2 gap-6">
              {users
                .filter(
                  (user: any) => !members.some((m: any) => m._id === user._id)
                ) // Filter out members
                .map((user: any, idx: number) => {
                  return (
                    <div
                      key={idx}
                      className="border relative bg-white text-center shadow-lg rounded-lg flex flex-col justify-center items-center p-6 hover:shadow-xl transition-shadow duration-300"
                    >
                      {/* Profile Picture */}
                      <div className="mb-4">
                        <img
                          className="w-[80px] h-[80px] rounded-full border-2 border-gray-200"
                          src={
                            user?.profile_pic
                              ? `http://localhost:4000/uploads/${user?.profile_pic}`
                              : "https://media.istockphoto.com/id/1337144146/vector/default-avatar-profile-icon-vector.jpg?s=612x612&w=0&k=20&c=BIbFwuv7FxTWvh5S3vB6bkT0Qv8Vn8N5Ffseq84ClGI="
                          }
                          alt={`${user?.username}'s profile`}
                        />
                      </div>

                      {/* Username */}
                      <h3
                        style={{ color: `${textColor ? textColor : ""}` }}
                        className="text-lg font-semibold text-gray-800"
                      >
                        {user?.username || "Unknown User"}
                      </h3>

                      {/* Email */}
                      {user?.email && (
                        <p
                          style={{ color: `${textColor ? textColor : ""}` }}
                          className="text-sm text-gray-500 mb-2"
                        >
                          {user.email}
                        </p>
                      )}

                      {/* Role (Optional) */}
                      {/* {user?.role && (
                        <p className="text-sm font-medium text-blue-500 bg-blue-100 px-3 py-1 rounded-full">
                          {user.role}
                        </p>
                      )} */}
                      <div className="absolute top-2 right-2">
                        <button
                          className=""
                          onClick={() => AddUser_TO_GROUP(user._id)}
                        >
                          <PlusCircle className="text-gray-500 hover:text-green-500" />
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Chat;
