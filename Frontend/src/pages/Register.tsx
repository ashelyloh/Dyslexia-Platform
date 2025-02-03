import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import usePost from "../customHooks/usePost";
import toast from "react-hot-toast";
import { Loader } from "lucide-react";
// import { RegisterUser } from "../api/auth";
function Register() {
  const navigate = useNavigate();
  const { loading, PostData } = usePost("/auth/register/");
  const formik = useFormik({
    initialValues: {
      username: "",
      email: "",
      dob: "",
      gender: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema: Yup.object({
      username: Yup.string()
        .min(3, "Username must be at least 3 characters")
        .required("Username is required"),
      email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
      dob: Yup.date().required("Date of Birth is required"),
      gender: Yup.string().required("Gender is required"),
      password: Yup.string()
        .min(8, "Password must be at least 8 characters")
        .required("Password is required"),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref("password")], "Passwords must match")
        .required("Confirm Password is required"),
    }),
    onSubmit: async (values) => {
      console.log("Form data", values);
      const resp = await PostData(values);

      if (resp) {
        toast.success(resp?.message);
        navigate("/login");
      }
    },
  });

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-indigo-50 to-indigo-100">
      {/* Left Side - Image */}
      <div className="hidden fixed left-0 bottom-0 top-0 md:flex w-1/2 items-center justify-center bg-indigo-200">
        <img
          src="https://media.licdn.com/dms/image/D5612AQHF1qFhYQPLOw/article-cover_image-shrink_720_1280/0/1707736322094?e=2147483647&v=beta&t=Fmr4Log4ooaKI1flBETckDsoI2NtzidwGG2w1jtoqkk"
          alt="Dyslexia-Friendly Learning"
          className="h-full w-full object-cover"
        />
      </div>

      {/* Right Side - Form */}
      <div className="flex w-full md:w-1/2 ml-auto items-center justify-center p-8">
        <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-xl transform transition duration-500 hover:scale-105">
          <h2 className="text-4xl font-bold text-center text-indigo-800 mb-6">
            Register
          </h2>
          <form onSubmit={formik.handleSubmit} className="space-y-5">
            {/* Username */}
            <div>
              <label
                htmlFor="username"
                className="text-sm font-semibold text-gray-700"
              >
                Username <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="username"
                {...formik.getFieldProps("username")}
                className={`w-full mt-1 px-4 py-2 border rounded-md shadow-sm focus:ring-indigo-300 ${
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
                className="text-sm font-semibold text-gray-700"
              >
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                {...formik.getFieldProps("email")}
                className={`w-full mt-1 px-4 py-2 border rounded-md shadow-sm focus:ring-indigo-300 ${
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

            {/* Date of Birth */}
            <div>
              <label
                htmlFor="dob"
                className="text-sm font-semibold text-gray-700"
              >
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="dob"
                {...formik.getFieldProps("dob")}
                className={`w-full mt-1 px-4 py-2 border rounded-md shadow-sm focus:ring-indigo-300 ${
                  formik.touched.dob && formik.errors.dob
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />
              {formik.touched.dob && formik.errors.dob && (
                <div className="text-red-500 text-sm">{formik.errors.dob}</div>
              )}
            </div>

            {/* Gender */}
            <div>
              <label className="text-sm font-semibold text-gray-700">
                Gender <span className="text-red-500">*</span>
              </label>
              <div className="flex space-x-4 mt-2">
                {["Male", "Female", "Other"].map((option) => (
                  <div
                    key={option}
                    onClick={() => formik.setFieldValue("gender", option)}
                    className={`cursor-pointer border rounded-md px-4 py-2 text-center ${
                      formik.values.gender === option
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {option}
                  </div>
                ))}
              </div>
              {formik.touched.gender && formik.errors.gender && (
                <div className="text-red-500 text-sm">
                  {formik.errors.gender}
                </div>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="text-sm font-semibold text-gray-700"
              >
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                id="password"
                {...formik.getFieldProps("password")}
                className={`w-full mt-1 px-4 py-2 border rounded-md shadow-sm focus:ring-indigo-300 ${
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
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="text-sm font-semibold text-gray-700"
              >
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                id="confirmPassword"
                {...formik.getFieldProps("confirmPassword")}
                className={`w-full mt-1 px-4 py-2 border rounded-md shadow-sm focus:ring-indigo-300 ${
                  formik.touched.confirmPassword &&
                  formik.errors.confirmPassword
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />
              {formik.touched.confirmPassword &&
                formik.errors.confirmPassword && (
                  <div className="text-red-500 text-sm">
                    {formik.errors.confirmPassword}
                  </div>
                )}
            </div>

            {/* Submit Button */}
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
                "Register"
              )}
            </button>
            <p className="text-center text-sm text-gray-700 mt-4">
              Already have an account?{" "}
              <Link to="/login" className="text-indigo-600 hover:underline">
                Login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;
