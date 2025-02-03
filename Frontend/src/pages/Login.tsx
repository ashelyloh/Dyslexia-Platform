import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
// import { LoginUser } from "../api/auth";
import { useDispatch } from "react-redux";
import { getToken, setUserDetails } from "../redux/authSlice";
import usePost from "../customHooks/usePost";
import { Loader } from "lucide-react";
import toast from "react-hot-toast";
import { CurrentUser } from "../api/auth";
function Login() {
  const nav = useNavigate();
  const dispatch = useDispatch();
  const { loading, PostData } = usePost("/auth/login/");
  const formik = useFormik({
    initialValues: {
      email: "",

      password: "",
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),

      password: Yup.string()
        .min(8, "Password must be at least 8 characters")
        .required("Password is required"),
    }),
    onSubmit: async (values: any) => {
      console.log("Form data", values);
      // const resp = await LoginUser(values);
      const resp = await PostData(values);
      console.log("responxe ", resp);
      if (resp) {
        toast.success(resp?.message);

        dispatch(getToken(resp?.token));
        const user = await CurrentUser(resp?.token);
        console.log("current user", user);
        dispatch(setUserDetails(user));
        nav("/home");
        window.location.reload();
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
            Login
          </h2>
          <form onSubmit={formik.handleSubmit} className="space-y-5">
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
                  {formik?.errors?.password}
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
                "Login"
              )}
            </button>
            <p className="text-center text-sm text-gray-700 mt-4">
              Dont't have an account?{" "}
              <Link to="/" className="text-indigo-600 hover:underline">
                Create account
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
