import { toast } from "react-hot-toast";
import { signIn } from "next-auth/react";
import config from "@/config";

// use this to interact with our own API (/app/api folder) from the front-end side
// See https://shipfa.st/docs/tutorials/api-call

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      errorData = { error: response.statusText };
    }

    let message = "";
    if (response.status === 401) {
      toast.error("Please login");
      signIn(undefined, { callbackUrl: config.auth.callbackUrl });
      throw new Error("Unauthorized");
    } else if (response.status === 403) {
      message = "Pick a plan to use this feature";
    } else {
      message = errorData.error || response.statusText;
    }

    const errorMessage = typeof message === "string" ? message : JSON.stringify(message);
    console.error(errorMessage);
    if (errorMessage) {
      toast.error(errorMessage);
    } else {
      toast.error("something went wrong...");
    }
    throw new Error(errorMessage);
  }
  return response.json();
};

const apiClient = {
  get: async (url: string, options?: RequestInit) => {
    const response = await fetch(`/api${url}`, {
      method: 'GET',
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    return handleResponse(response);
  },

  post: async (url: string, data?: any, options?: RequestInit) => {
    const response = await fetch(`/api${url}`, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    return handleResponse(response);
  },

  put: async (url: string, data?: any, options?: RequestInit) => {
    const response = await fetch(`/api${url}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    return handleResponse(response);
  },

  delete: async (url: string, options?: RequestInit) => {
    const response = await fetch(`/api${url}`, {
      method: 'DELETE',
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    return handleResponse(response);
  },
};

export default apiClient;
