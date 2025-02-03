import React from "react";

const Home = () => {
  const galleryImages = [
    {
      src: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ-1GwhBmTIffZKm8pCbWeh6hy8j5tX4OWlFw&s",
      alt: "Image 1",
      caption: "Accessible Learning Materials",
    },
    {
      src: "https://swordsandstationery.com/wp-content/uploads/Dyslexia.jpg",
      alt: "Image 2",
      caption: "Dyslexia-Friendly Fonts",
    },
    {
      src: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQcNW4lABoSjqC74616zil16LInNqsl8NIglg&s",
      alt: "Image 3",
      caption: "Interactive Learning Tools",
    },
    {
      src: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTeIMuvmrFToWsjhJzxI4R_FUNBjEgG6ql1LQ&s",
      alt: "Image 4",
      caption: "Personalized Support",
    },
  ];

  const textColor = localStorage.getItem("textColor");
  return (
    <div
      style={{ color: `${textColor ? textColor : ""}` }}
      className="min-h-screen w-full bg-gray-50 p-5"
    >
      {/* Header */}
      <header className="text-center py-10">
        <h1
          style={{ color: `${textColor ? textColor : ""}` }}
          className="text-4xl font-bold text-blue-600"
        >
          Welcome to Dyslexia Learning Platform
        </h1>
        <p
          style={{ color: `${textColor ? textColor : ""}` }}
          className="text-gray-600 mt-3 text-lg"
        >
          Empowering dyslexic adults with accessible and engaging learning
          tools.
        </p>
      </header>

      {/* Image Gallery */}
      <section className="py-10">
        <h2
          style={{ color: `${textColor ? textColor : ""}` }}
          className="text-2xl font-semibold text-center mb-5 text-blue-600"
        >
          Interactive Image Gallery
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {galleryImages.map((image, idx) => (
            <div
              key={idx}
              className="bg-white shadow-md rounded-md overflow-hidden"
            >
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
              />
              <div className="p-3">
                <p
                  style={{ color: `${textColor ? textColor : ""}` }}
                  className="text-gray-800 text-center font-medium"
                >
                  {image.caption}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      {/* <section className="py-10 bg-blue-100 rounded-md shadow-md">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-blue-600 mb-3">
            Join Our Community
          </h2>
          <p className="text-gray-700 mb-5">
            Connect with other learners, track your progress, and customize your
            experience.
          </p>
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
            Join Now
          </button>
        </div>
      </section> */}

      {/* Footer */}
    </div>
  );
};

export default Home;
