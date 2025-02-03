import { Link } from "react-router-dom";
import { Home, MessageCircle, Users, User, LogOut } from "lucide-react"; // Add more icons as needed

const Sidebar = () => {
  return (
    <aside className="fixed left-5 top-24 bottom-5 w-[250px] bg-gray-800 text-white rounded-lg shadow-xl">
      <div className="flex flex-col justify-between h-full py-4 px-4 ">
        {/* Logo or Branding Section */}
        <div className="flex items-center space-x-2 mb-8">
          {/* <img
            src="https://cdn.pixabay.com/photo/2020/07/06/14/32/letter-5376361_960_720.png"
            alt="Dyslexia Learning"
            className="h-12 w-12 rounded-full"
          /> */}
          <span className="text-2xl font-semibold text-indigo-400">
            Dyslexia Learning
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-4">
          <Link
            to="/dashboard"
            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-indigo-600 transition-all duration-300"
          >
            <Home size={22} />
            <span className="text-lg">Dashboard</span>
          </Link>

          <Link
            to="/chats"
            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-indigo-600 transition-all duration-300"
          >
            <MessageCircle size={22} />
            <span className="text-lg">Chats</span>
          </Link>

          <Link
            to="/users"
            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-indigo-600 transition-all duration-300"
          >
            <Users size={22} />
            <span className="text-lg">Users</span>
          </Link>

          <Link
            to="/dashboard/profile"
            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-indigo-600 transition-all duration-300"
          >
            <User size={22} />
            <span className="text-lg">Profile</span>
          </Link>
        </nav>

        {/* Logout Section */}
        <div className="mt-auto">
          <Link
            to="/logout"
            className="flex items-center space-x-3 p-2 rounded-lg text-red-500 hover:bg-gray-700 transition-all duration-300"
          >
            <LogOut size={22} />
            <span className="text-lg">Logout</span>
          </Link>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
