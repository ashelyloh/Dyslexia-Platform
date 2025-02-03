import { Avatar, Dropdown, Navbar } from "flowbite-react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { clearAuth } from "../../redux/authSlice";
import { useEffect, useState } from "react";
import { getChats } from "../../redux/chatSlice";

function Header() {
  const navbarColor = localStorage.getItem("navbarColor");
  const dispatch = useDispatch();
  const [notif, setNotif] = useState(0);
  const { user } = useSelector((state: any) => state?.auth);

  const { chats } = useSelector((state: any) => state.chat);

  useEffect(() => {
    dispatch(getChats());
  }, [dispatch]);

  const length = chats
    .map((chat: any) => {
      // Filter messages that are sent by someone other than the user and have isSeen === false
      const unreadMessages = chat.messages.filter(
        (message: any) =>
          message.sender._id !== user._id && message.isSeen === false
      );
      return unreadMessages.length; // Return the count of unread messages for this chat
    })
    .reduce((acc: number, curr: number) => acc + curr, 0); // Sum the unread message counts across all chats

  console.log("Total unread messages:", length);

  const links = [
    {
      text: "Home",
      path: "/home",
    },
    {
      text: "Tasks",
      path: "/home/tasks",
    },
    {
      text: "My Chats",
      path: "/home/chat",
    },

    {
      text: "File Reader",
      path: "/home/reader",
    },

    {
      text: "Contact Us",
      path: "/home/contact",
    },
  ];
  const { pathname } = useLocation();
  const textColor = localStorage.getItem("textColor");
  console.log("papth name", pathname);
  return (
    <div
      className="w-full px-16 shadow"
      style={{ backgroundColor: `${navbarColor}` }}
    >
      <Navbar
        fluid
        rounded
        className=" w-full  z-10  m-auto"
        style={{ backgroundColor: `${navbarColor}` }}
      >
        <Navbar.Brand href="/home">
          <img
            src="https://cdn-icons-png.flaticon.com/512/9759/9759879.png"
            className="mr-3 h-6 sm:h-9"
            alt="Dyslexia logo"
          />
          <span className="self-center whitespace-nowrap text-xl font-semibold">
            Dyslexia Learning
          </span>
        </Navbar.Brand>
        <div
          className="flex md:order-2"
          style={{ color: `${textColor ? textColor : ""}` }}
        >
          <Dropdown
            style={{ color: `${textColor ? textColor : ""}` }}
            arrowIcon={false}
            inline
            label={
              <Avatar
                alt="User settings"
                img={
                  user?.profile_pic
                    ? `http://localhost:4000/uploads/${user?.profile_pic}`
                    : "https://media.istockphoto.com/id/1337144146/vector/default-avatar-profile-icon-vector.jpg?s=612x612&w=0&k=20&c=BIbFwuv7FxTWvh5S3vB6bkT0Qv8Vn8N5Ffseq84ClGI="
                }
                rounded
              />
            }
          >
            <Dropdown.Header>
              <span
                style={{ color: `${textColor ? textColor : ""}` }}
                className="block text-sm"
              >
                {user.username}
              </span>
              <span
                style={{ color: `${textColor ? textColor : ""}` }}
                className="block truncate text-sm font-medium"
              >
                {user?.email}
              </span>
            </Dropdown.Header>
            {user?.role === "admin" && (
              <Link
                style={{ color: `${textColor ? textColor : ""}` }}
                to={"/home/dashboard/"}
              >
                <Dropdown.Item
                  style={{ color: `${textColor ? textColor : ""}` }}
                >
                  Dashboard
                </Dropdown.Item>
              </Link>
            )}

            <Link
              style={{ color: `${textColor ? textColor : ""}` }}
              to={"/home/profile"}
            >
              <Dropdown.Item style={{ color: `${textColor ? textColor : ""}` }}>
                Profile
              </Dropdown.Item>
            </Link>

            <Dropdown.Divider />
            <Dropdown.Item
              style={{ color: `${textColor ? textColor : ""}` }}
              onClick={() => dispatch(clearAuth())}
            >
              Sign out
            </Dropdown.Item>
          </Dropdown>
          <Navbar.Toggle />
        </div>
        <Navbar.Collapse className="">
          {links.map((link: any, idx: number) => {
            return (
              <Navbar.Link
                className="relative"
                style={{
                  color: `${link.path === pathname ? "green" : textColor}`,
                }}
                href={link.path}
                active={link.path === pathname ? true : false}
                key={idx}
              >
                {link.text}
                {link.text === "My Chats" && length > 1 && (
                  <span className="h-[25px] absolute top-[-15px] right-[-10px] text-[10px] animate-pulse w-[25px] rounded-full bg-red-600 text-white flex justify-center items-center">
                    {length}
                  </span>
                )}
              </Navbar.Link>
            );
          })}
        </Navbar.Collapse>
      </Navbar>
    </div>
  );
}

export default Header;
