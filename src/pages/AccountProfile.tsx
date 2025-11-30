import React, { useEffect, useState } from "react";
import Button from "../components/General/Button";
import { supabase, useAuth } from "../lib/db/db.auth";
import { Heading } from "../components/General/Heading";
import { userApi } from "../lib/db/db.api";

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
  const [saving, setSaving] = useState(false); // to prevent multiple clicks

  useEffect(() => {
    if (user && !loading) {
      const username = user.email?.split("@")[0];
      setForm({
        name:
          username
            .split(/[\s._-]+/)
            .map(
              (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
            )
            .join(" "),
        email: user.email,
        password: "", // Password handled separately
        role: user.role || "User",
      });
    }
  }, [user, loading]);

  const handleSaveField = async (fieldKey: keyof typeof form) => {
    if (!user) return;
    setSaving(true);
    try {
      await userApi.updateUserField(user.id, fieldKey, form[fieldKey]);
      alert(`${fieldKey.charAt(0).toUpperCase() + fieldKey.slice(1)} updated!`);
      setEditing({ ...editing, [fieldKey]: false });
    } catch (err) {
      console.error(err);
      alert(`Failed to update ${fieldKey}.`);
    } finally {
      setSaving(false);
    }
  };

  const handleRequestAdmin = async () => {
    if (!user) return;
    try {
      await userApi.requestAdminAccess(user.id);
      alert("Admin access request sent!");
    } catch (err) {
      console.error(err);
      // Check if the error is a unique constraint violation
      // that is, a user can only make one admin request at a time
      if (err.code === "23505") {
        alert("You have already sent an admin access request!");
      } else {
        alert("Failed to send admin request. Please try again.");
      }
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    if (!confirm("Are you sure you want to delete your account? This cannot be undone.")) return;

    try {
      await userApi.deleteUser(user.id);
      alert("Your account has been deleted.");
      logout(); // Log out after deletion
    } catch (err) {
      console.error(err);
      alert("Failed to delete account.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[500px]">
        <div className="w-12 h-12 border-4 border-gray-300 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-50">
      <div className="w-[950px] bg-white border border-gray-300 rounded-lg shadow p-12 flex flex-col gap-6">
        <div className="flex flex-col items-center mb-4">
          <Heading size="xl">Account Profile</Heading>
        </div>

        {[
          { label: "Username", key: "name" },
          { label: "Email", key: "email" },
          { label: "Password", key: "password" },
          { label: "Role", key: "role", editable: false },
        ].map((field) => (
          <div key={field.key} className="flex items-center justify-center gap-4">
            <div className="w-96 flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">{field.label}</label>
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

            {field.editable !== false && field.key !== "role" && (
              <Button
                size="xs"
                variant="secondary"
                disabled={saving}
                onClick={() => {
                  if (editing[field.key as keyof typeof editing]) {
                    handleSaveField(field.key as keyof typeof form);
                  } else {
                    setEditing({ ...editing, [field.key]: true });
                  }
                }}
                className="mt-7"
              >
                {editing[field.key as keyof typeof editing] ? "Save" : "Edit"}
              </Button>
            )}

            {field.key === "role" && user?.role !== "admin" && (
              <Button
                size="xs"
                variant="secondary"
                onClick={handleRequestAdmin}
                className="mt-7"
              >
                Request Access
              </Button>
            )}
          </div>
        ))}

        <div className="flex justify-center mt-6 pt-6">
          <button
            className="text-sm text-secondary hover:text-secondary hover:underline"
            onClick={handleDeleteAccount}
          >
            Delete My Account
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;