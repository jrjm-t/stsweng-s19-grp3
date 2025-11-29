import React, { useState, useEffect } from "react";
import { Heading } from "../components/General/Heading";
import Button from "../components/General/Button";

function AdminRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: fetch pending admin requests from backend
    
    // FIXME: mock data for now
    setRequests([
      { id: 1, userId: "user1", name: "LUI CASAS", email: "lui@example.com", requestedAt: "2024-01-15" },
      { id: 2, userId: "user2", name: "AKI", email: "aki@example.com", requestedAt: "2024-01-16" },
      { id: 3, userId: "user3", name: "DWIGHT RAMOS", email: "dwight@example.com", requestedAt: "2024-01-17" },
    ]);
    setLoading(false);
  }, []);

  const handleAccept = (requestId, userId) => {
    // TODO: accept admin request
    setRequests(requests.filter(req => req.id !== requestId));
    alert("Request accepted!");
  };

  const handleReject = (requestId) => {
    // TODO: reject admin request
    setRequests(requests.filter(req => req.id !== requestId));
    alert("Request rejected!");
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
                    onClick={() => handleReject(request.id)}
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