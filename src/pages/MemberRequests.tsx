import React, { useState, useEffect, use } from "react";
import { Heading } from "../components/General/Heading";
import Button from "../components/General/Button";
import { userApi } from "../lib/db/db.api";

function AdminRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const data = await userApi.getAdminRequests(); // call backend function
        setRequests(data); // fill state with real data
        console.log("Fetched admin requests:", data);
      } catch (error) {
        console.error("Error fetching admin requests:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const handleAccept = async (requestId, userId) => {
    try {
      await userApi.updateUserAdminStatus(userId, true); // call API first
      setRequests((prev) => prev.filter((req) => req.id !== requestId)); // update state safely
      alert("Request accepted!");
    } catch (err) {
      console.error("Failed to accept admin request:", err);
      alert("Failed to accept request. Please try again.");
    }
  };

  const handleReject = async (requestId, userId) => {
    try {
      await userApi.updateUserAdminStatus(userId, false); // call API first
      setRequests((prev) => prev.filter((req) => req.id !== requestId)); // update state safely
      alert("Request rejected!");
    } catch (err) {
      console.error("Failed to reject admin request:", err);
      alert("Failed to reject request. Please try again.");
    }
  };

  const handleAcceptAll = () => {
    // TODO: accept all pending requests
    if (confirm(`Accept all ${requests.length} admin requests?`)) {
      setRequests([]);
      alert("All requests accepted!");
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
      <div className="w-full max-w-4xl bg-white border border-gray-300 rounded-lg shadow p-8">
        <div className="flex flex-col items-center mb-8">
          <Heading size="xl">Admin Access Requests</Heading>
          <p className="text-sm text-gray-600 mt-2">
            {requests.length} pending {requests.length === 1 ? "request" : "requests"}
          </p>
        </div>

        {requests.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No pending admin requests
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div
                key={request.id}
                className="flex items-center justify-between p-6 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
              >
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">
                    {request.name}
                  </h3>
                  <p className="text-sm text-gray-600">{request.email}</p>
                </div>

                <div className="flex gap-3">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => handleAccept(request.id, request.userId)}
                  >
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleReject(request.id, request.userId)}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            ))}

            {requests.length > 1 && (
              <div className="flex justify-end pt-4">
                <Button
                  size="md"
                  variant="primary"
                  onClick={handleAcceptAll}
                  className="bg-red-900 hover:bg-red-800"
                >
                  Accept All
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminRequests;