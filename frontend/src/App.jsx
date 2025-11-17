import { useEffect, useState } from "react";
import { api } from "./lib/api";

function App() {
  const [status, setStatus] = useState("Loading...");

  useEffect(() => {
    api
      .get("/health")
      .then((response) => {
        setStatus(JSON.stringify(response.data));
      })
      .catch((error) => {
        setStatus("Error: " + (error?.message ?? "unknown"));
      });
  }, []);

  return (
    <main style={{ padding: "24px", fontFamily: "system-ui, sans-serif" }}>
      <h1>OnTime – Frontend</h1>
      <p>Backend health: {status}</p>
    </main>
  );
}

export default App;
