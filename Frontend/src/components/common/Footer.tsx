const Footer = () => {
  const textColor = localStorage.getItem("textColor");
  return (
    <footer
      style={{ color: `${textColor ? textColor : ""}` }}
      className="py-6 text-center text-gray-500 text-sm mt-10"
    >
      &copy; {new Date().getFullYear()} Dyslexia Learning Platform. All rights
      reserved.
    </footer>
  );
};

export default Footer;
