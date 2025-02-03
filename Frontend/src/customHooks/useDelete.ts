import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";

const useDelete = <T = any>(url: string, token: string) => {
  const [loading, setLoading] = useState<boolean>(false);

  const deleteData = async (): Promise<T | undefined> => {
    try {
      setLoading(true);

      const response = await axios.delete<T>(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "An error occurred");
      } else {
        toast.error("Unexpected error occurred");
      }
      return undefined;
    } finally {
      setLoading(false);
    }
  };

  return { loading, deleteData };
};

export default useDelete;
