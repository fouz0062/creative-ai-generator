"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function AuthPlaceholder() {
  const { isLoggedIn, user, login, logout } = useAuth();
  const [email, setEmail] = useState("");

  if (isLoggedIn) {
    return (
      <div className="flex items-center gap-2 p-4 bg-gray-800 rounded-lg">
        <span className="text-gray-300">Logged in as: {user?.email}</span>
        <button
          onClick={logout}
          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 p-4 bg-gray-800 rounded-lg">
      <input
        type="email"
        placeholder="Enter email to mock login"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="p-2 bg-gray-700 text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        onClick={() => login(email)}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
      >
        Mock Login
      </button>
    </div>
  );
}
