import React, { useEffect, useState } from "react";
import Button from "../components/General/Button";
import { useAuth } from "../lib/db/db.auth";
import { Heading } from "../components/General/Heading";

function Profile() {
  const { user, logout, loading } = useAuth();

  const [editing, setEditing] = useState({
    name: false,
    email: false,
    password: false,
  });
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });

  useEffect(() => {
    if (user && !loading) {
      // TODO: fetch complete user profile data
      const username = user.email.split("@")[0];
      setForm({
        name:
          username
            .split(/[\s._-]+/)
            .map(
              (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
            )
            .join(" "),
        email: user.email,
        password: user.password || "", // TODO: return actual password from database
        role: user.role || "User",
      });
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[500px]">
        <div className="w-12 h-12 border-4 border-gray-300 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-50">
      {/* Profile Card */}
      <div className="w-[950px] bg-white border border-gray-300 rounded-lg shadow p-12 flex flex-col gap-6">
        <div className="flex flex-col items-center mb-4">
          <Heading size="xl">Account Profile</Heading>
        </div>

        {/* Fields */}
        {[
          { label: "Username", key: "name" },
          { label: "Email", key: "email" },
          { label: "Password", key: "password" },
          { label: "Role", key: "role", editable: false },
        ].map((field) => (
          <div
            key={field.key}
            className="flex items-center justify-center gap-4"
          >
            <div className="w-96 flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                {field.label}
              </label>
              <input
                type={field.key === "password" ? "password" : "text"}
                value={form[field.key as keyof typeof form]}
                disabled={!editing[field.key as keyof typeof editing]}
                onChange={(e) =>
                  setForm({ ...form, [field.key]: e.target.value })
                }
                className="border border-gray-300 rounded px-3 py-2 disabled:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>

            {/* Edit button or Request Admin Access */}
            {field.editable !== false && field.key !== "role" && (
              <Button
                size="xs"
                variant="secondary"
                onClick={() => {
                  if (editing[field.key as keyof typeof editing]) {
                    // TODO: save updated field to database
                  }
                  setEditing({
                    ...editing,
                    [field.key]: !editing[field.key as keyof typeof editing],
                  });
                }}
                className="mt-7"
              >
                {editing[field.key as keyof typeof editing] ? "Save" : "Edit"}
              </Button>
            )}
            {field.key === "role" && user?.role !== "admin" && user?.role !== "authenticated" && (
              <Button
                size="xs"
                variant="secondary"
                onClick={() => {
                  // TODO: handle admin access request
                  alert("Admin access request sent!");
                }}
                className="mt-7"
              >
                Request Access
              </Button>
            )}
          </div>
        ))}

        {/* Delete Account */}
        <div className="flex justify-center mt-6 pt-6">
          <button 
            className="text-sm text-secondary hover:text-secondary hover:underline"
            onClick={() => {
              // TODO: delete user account
              if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
              }
            }}
          >
            Delete My Account
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;