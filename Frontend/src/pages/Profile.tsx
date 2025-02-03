import { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { CurrentUser } from "../api/auth";
import { setUserDetails } from "../redux/authSlice";
import { Loader } from "lucide-react";
import { User, Calendar } from "lucide-react";
const Profile = () => {
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");
  const { user } = useSelector((state: any) => state?.auth);
  const dispatch = useDispatch();

  console.log("profile", user);
  const getUser = async () => {
    const resp = await CurrentUser(token as string);
    dispatch(setUserDetails(resp));
  };

  const formik = useFormik({
    initialValues: {
      username: user?.username || "",
      email: user?.email || "",
      bio: user.bio || "",
    },

    validationSchema: Yup.object({
      username: Yup.string()
        .min(3, "Username must be at least 3 characters")
        .required("Username is required"),
      email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
      bio: Yup.string().max(5000).optional(),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const resp = await axios.put("/user/edit/profile", values, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const user = await CurrentUser(token as string);
        dispatch(setUserDetails(user));
        toast.success(resp?.data?.message);
        // Simulate API request
        await new Promise((resolve) => setTimeout(resolve, 2000));
        toast.success("Profile updated successfully!");
      } catch (error) {
        console.log("error", error);
        toast.error("Failed to update profile!");
      } finally {
        setLoading(false);
      }
    },
  });
  useEffect(() => {
    getUser();
  }, [token, dispatch]);
  const handleFileChange = (event: any) => {
    const file = event.target.files[0];
    if (file) {
      formik.setFieldValue("profilePicture", file);
      const reader: any = new FileReader();
      reader.onloadend = async () => {
        setImagePreview(reader.result);
        const pic = await axios.put(
          `/user/edit/`,
          { profile_pic: file },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        const user = await CurrentUser(token as string);
        dispatch(setUserDetails(user));
        toast.success(pic?.data?.message);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full bg-white p-8">
      <form onSubmit={formik.handleSubmit}>
        {/* Banner Section with Gradient */}
        <div className="relative h-[250px]  w-full  rounded-lg  bg-gradient-to-r from-purple-500 via-pink-500 to-red-500">
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 mb-8">
            {/* Profile Picture Preview */}
            <img
              src={
                imagePreview ||
                `http://localhost:4000/uploads/${user.profile_pic}`
              }
              className="h-[180px] w-[180px] rounded-full border-4 border-white object-cover"
              alt={`profile-${user.username}`}
            />
            <div className="mt-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer text-white bg-blue-500 py-1 px-3 rounded-full text-sm"
              >
                Change Photo
              </label>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
          {/* Gender */}
          <div className="flex items-center p-4 border rounded-md bg-gray-50 dark:bg-gray-800 shadow-sm">
            <User className="text-blue-500 w-6 h-6 mr-4" />
            <div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Gender
              </h3>
              <p className="text-base font-semibold text-gray-800 dark:text-gray-100">
                {user.gender || "Not specified"}
              </p>
            </div>
          </div>

          {/* Date of Birth */}
          <div className="flex items-center p-4 border rounded-md bg-gray-50 dark:bg-gray-800 shadow-sm">
            <Calendar className="text-green-500 w-6 h-6 mr-4" />
            <div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Date of Birth
              </h3>
              <p className="text-base font-semibold text-gray-800 dark:text-gray-100">
                {new Date(user.dob).toLocaleDateString() || "Not specified"}
              </p>
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <div className="py-8 rounded-lg w-full mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Username */}
            <div>
              <label
                htmlFor="username"
                className="text-sm font-medium text-gray-600"
              >
                Username <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="username"
                {...formik.getFieldProps("username")}
                className={`w-full px-4 py-2 mt-1 border rounded-md focus:ring focus:ring-indigo-200 focus:border-indigo-300 ${
                  formik.touched.username && formik.errors.username
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />
              {formik.touched.username && formik.errors.username && (
                <div className="text-red-500 text-sm">
                  {formik.errors.username}
                </div>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="text-sm font-medium text-gray-600"
              >
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                readOnly
                id="email"
                {...formik.getFieldProps("email")}
                className={`w-full px-4 py-2 mt-1 border rounded-md focus:ring focus:ring-indigo-200 focus:border-indigo-300 ${
                  formik.touched.email && formik.errors.email
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />
              {formik.touched.email && formik.errors.email && (
                <div className="text-red-500 text-sm">
                  {formik.errors.email}
                </div>
              )}
            </div>
          </div>
          {/* Biography */}
          <div className="w-full">
            <label htmlFor="bio" className="text-sm font-medium text-gray-600">
              Biography <span className="text-red-500">*</span>
            </label>
            <textarea
              id="bio"
              {...formik.getFieldProps("bio")}
              className={`w-full px-4 h-[200px] py-2 mt-1 border rounded-md focus:ring focus:ring-indigo-200 focus:border-indigo-300 ${
                formik.touched.bio && formik.errors.bio
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            />
            {formik.touched.bio && formik.errors.bio && (
              <div className="text-red-500 text-sm">{formik.errors.bio}</div>
            )}
          </div>

          {/* Password */}
          {/* <div>
            <label
              htmlFor="password"
              className="text-sm font-medium text-gray-600"
            >
              Password <span className="text-red-500">*</span>
            </label>
            <input
              readOnly
              type="password"
              id="password"
              {...formik.getFieldProps("password")}
              className={`w-full px-4 py-2 mt-1 border rounded-md focus:ring focus:ring-indigo-200 focus:border-indigo-300 ${
                formik.touched.password && formik.errors.password
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            />
            {formik.touched.password && formik.errors.password && (
              <div className="text-red-500 text-sm">
                {formik.errors.password}
              </div>
            )}
          </div> */}

          {/* Submit Button with Loader */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full mt-4 py-2 flex justify-center items-center text-lg font-semibold ${
              loading
                ? "bg-gray-100"
                : "text-white bg-indigo-600  hover:bg-indigo-700 "
            } rounded-md focus:outline-none focus:ring focus:ring-indigo-300`}
          >
            {loading ? (
              <Loader className="animate-spin text-gray-500" />
            ) : (
              "Update Profile"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
