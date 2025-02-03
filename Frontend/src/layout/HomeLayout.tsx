import Header from "../components/common/Header";
import { Outlet } from "react-router-dom";
import Customizer from "../components/site/Customizer";
import Footer from "../components/common/Footer";

const HomeLayout = () => {
  const fontFamily = localStorage.getItem("fontFamily");
  const bgColor = localStorage.getItem("bgColor");
  const textColor = localStorage.getItem("textColor");
  const weight = localStorage.getItem("fontWeight");
  const fontStyle = localStorage.getItem("fontStyle");
  const letter = localStorage.getItem("letterSpacing");
  const word = localStorage.getItem("wordSpacing");
  const line = localStorage.getItem("lineHeight");
  return (
    <>
      <div
        className="absolute w-full min-h-screen h-auto "
        style={{
          fontFamily: `${fontFamily}, Arial, sans-serif`,
          backgroundColor: `${bgColor}`,
          color: `${textColor}`,
          fontWeight: `${weight}`,
          fontStyle: `${fontStyle}`,
          wordSpacing: `${word}px`,
          letterSpacing: `${letter}px`,
          lineHeight: `${line}px`,
        }}
      >
        <Header />

        <Customizer />

        <main className="w-full lg:w-[90%]   mx-auto  p-5">
          <Outlet />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default HomeLayout;
