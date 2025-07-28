"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";

export default function CallSyncPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [syncResults, setSyncResults] = useState<any>(null);
  const [dbResults, setDbResults] = useState<any>(null);

  // Function to trigger manual call sync
  const triggerSync = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/vapi/manual-sync");
      const data = await response.json();
      
      if (data.error) {
        toast.error(`Sync failed: ${data.error}`);
      } else {
        toast.success("Call sync completed successfully!");
        setSyncResults(data);
      }
    } catch (error) {
      console.error("Error triggering sync:", error);
      toast.error("Failed to trigger call sync");
    } finally {
      setLoading(false);
    }
  };

  // Function to check database
  const checkDatabase = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/debug/db-check");
      const data = await response.json();
      
      if (data.error) {
        toast.error(`DB check failed: ${data.error}`);
      } else {
        toast.success("Database check completed!");
        setDbResults(data);
      }
    } catch (error) {
      console.error("Error checking database:", error);
      toast.error("Failed to check database");
    } finally {
      setLoading(false);
    }
  };

  // Check if user is authenticated
  if (!session) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Admin: Call Sync</h1>
        <p>Please sign in to access this page.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin: Call Sync</h1>
      
      <div className="flex space-x-4 mb-8">
        <button
          onClick={triggerSync}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? "Processing..." : "Trigger Call Sync"}
        </button>
        
        <button
          onClick={checkDatabase}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
        >
          {loading ? "Processing..." : "Check Database"}
        </button>
      </div>
      
      {/* Display sync results */}
      {syncResults && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Sync Results</h2>
          <div className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
            <pre>{JSON.stringify(syncResults, null, 2)}</pre>
          </div>
        </div>
      )}
      
      {/* Display database results */}
      {dbResults && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Database Results</h2>
          
          <div className="mb-4">
            <h3 className="text-lg font-medium">Collections</h3>
            <ul className="list-disc pl-5">
              {dbResults.collections.map((collection: string) => (
                <li key={collection}>{collection}</li>
              ))}
            </ul>
          </div>
          
          <div className="mb-4">
            <h3 className="text-lg font-medium">Call Data</h3>
            <p>Call Collection Exists: {dbResults.hasCallsCollection ? "Yes" : "No"}</p>
            <p>Total Calls: {dbResults.callCount}</p>
          </div>
          
          {dbResults.sampleCalls && dbResults.sampleCalls.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-2">Sample Calls</h3>
              <div className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
                <pre>{JSON.stringify(dbResults.sampleCalls, null, 2)}</pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
