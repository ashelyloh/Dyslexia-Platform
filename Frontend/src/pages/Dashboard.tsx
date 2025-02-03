import { useEffect, useState } from "react";
import { Users, MessageSquare, Search, Loader } from "lucide-react";
import { ToggleSwitch } from "flowbite-react";
import axios from "axios";
import { FaBullseye } from "react-icons/fa";
const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loadingUser, setLoadingUser] = useState(false);
  const [loadingFeed, setLoadingFeed] = useState(false);
  const token = localStorage.getItem("token");
  const fetchUsers = async () => {
    try {
      setLoadingUser(true);
      const resp = await axios.get("/user/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log(resp?.data?.users);
      setUsers(resp.data?.users);
      setLoadingUser(false);
    } catch (error: any) {
      setLoadingUser(false);
    }
  };

  const fetchFeedbacks = async () => {
    try {
      setLoadingFeed(true);
      const resp = await axios.get("/feedback/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setLoadingFeed(false);
      console.log("cdccd", resp?.data);
      setFeedbacks(resp.data);
    } catch (error: any) {
      setLoadingFeed(false);
    }
  };

  const [searchQuery, setSearchQuery] = useState("");

  const handleRoleChange = async (id: number, currentRole: string) => {
    try {
      // Toggle the role
      const updatedRole = currentRole === "admin" ? "user" : "admin";

      // Make the API call
      const resp = await axios.put(
        "/user/role/",
        { id, role: updatedRole },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Optional: Simulate a delay (if needed for UX purposes)
      //   await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log(`User ${id} role updated to ${updatedRole} successfully.`);
      fetchUsers();
      return resp?.data;
    } catch (error: any) {
      console.error(
        "Failed to update user role:",
        error.response?.data || error.message
      );

      //   throw new Error(
      //     error.response?.data?.message ||
      //       "An error occurred while updating the user role."
      //   );
    }
  };

  // Filter users based on search query
  //   const filteredUsers = users.filter((user) =>
  //     user.name.toLowerCase().includes(searchQuery.toLowerCase())
  //   );

  //   const filteredUsers = users.filter((user) =>
  //     user.name.toLowerCase().includes(searchQuery.toLowerCase())
  //   );

  //   const filteredFeedbacks = feedbacks.filter((feedback) =>
  //     feedback.user.toLowerCase().includes(searchQuery.toLowerCase())
  //   );

  useEffect(() => {
    fetchUsers();
  }, []);

  console.log(users);

  useEffect(() => {
    fetchFeedbacks();
  }, []);
  const textColor = localStorage.getItem("textColor");
  return (
    <div className="min-h-screen p-5 ">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-6 bg-white rounded-lg shadow flex items-center justify-between">
            <div>
              <h2
                style={{ color: `${textColor ? textColor : ""}` }}
                className="text-lg font-medium text-gray-600"
              >
                Total Users
              </h2>
              <p className="text-2xl font-bold">{users.length}</p>
            </div>
            <Users size={32} className="text-blue-500" />
          </div>
          <div className="p-6 bg-white rounded-lg shadow flex items-center justify-between">
            <div>
              <h2
                style={{ color: `${textColor ? textColor : ""}` }}
                className="text-lg font-medium text-gray-600"
              >
                Total Feedbacks
              </h2>
              <p className="text-2xl font-bold">{feedbacks.length}</p>
            </div>
            <MessageSquare size={32} className="text-green-500" />
          </div>
        </div>


        {/* Users Table */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Users</h2>
          <div className="overflow-x-auto">
            {loadingUser && (
              <div className="text-center flex justify-center items-center h-[100px] w-full">
                <Loader className={"animate-spin"} />
              </div>
            )}
            {users && (
              <table className="w-full table-auto bg-white rounded-lg shadow">
                <thead className="bg-gray-200 text-left">
                  <tr>
                    <th className="p-4">#</th>
                    <th className="p-4">Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Joined</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user: any, idx: number) => (
                    <tr key={user._id} className="border-t">
                      <td className="p-4">{idx + 1}</td>
                      <td className="p-4">{user.username}</td>
                      <td className="p-4">{user.email}</td>
                      <td className="p-4">
                        {new Date(user.createdAt).toDateString()}
                      </td>
                      <td className="p-4">{user.role}</td>
                      <td className="p-4">
                        <ToggleSwitch
                          checked={user.role === "admin"}
                          onChange={() => handleRoleChange(user._id, user.role)}
                          className={`${
                            user.role === "admin"
                              ? "bg-blue-500"
                              : "bg-gray-300"
                          } relative inline-flex items-center h-6 rounded-full w-11`}
                        >
                          <span
                            className={`${
                              user.role === "admin"
                                ? "translate-x-6"
                                : "translate-x-1"
                            } inline-block w-4 h-4 transform bg-white rounded-full transition`}
                          />
                        </ToggleSwitch>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Feedbacks Table */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Feedbacks</h2>
          <div className="overflow-x-auto">
            {loadingFeed && (
              <div className="text-center flex justify-center items-center h-[100px] w-full">
                <Loader className={"animate-spin"} />
              </div>
            )}
            <table className="w-full table-auto bg-white rounded-lg shadow">
              <thead className="bg-gray-200 text-left">
                <tr>
                  <th className="p-4">#</th>
                  <th className="p-4">User</th>
                  <th className="p-4">Rating</th>
                  <th className="p-4">Message</th>
                </tr>
              </thead>
              <tbody>
                {feedbacks.map((feedback: any, idx: number) => (
                  <tr key={feedback._id} className="border-t">
                    <td className="p-4">{idx + 1}</td>
                    <td className="p-4">{feedback.user.username}</td>
                    <td className="p-4">{feedback.rating}</td>
                    <td className="p-4">{feedback.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
