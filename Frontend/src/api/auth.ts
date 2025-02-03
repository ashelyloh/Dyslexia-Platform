import axios from "axios";

export const RegisterUser = async (data: any) => {
  console.log("Recieve", data);
  try {
    const resp = await axios.post("/auth/register", data);

    return resp.data;
  } catch (error: any) {
    alert(error?.response?.data?.message);
  }
};

export const LoginUser = async (data: any) => {
  console.log("Recieve", data);
  try {
    const resp = await axios.post("/auth/login", data, {});

    return resp.data;
  } catch (error: any) {
    alert(error?.response?.data?.message);
  }
};

export const CurrentUser = async (token: string) => {
  try {
    const resp = await axios.get("/user/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return resp.data;
  } catch (error: any) {
    alert(error?.response?.data?.message);
  }
};
