import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import socket from "./Socketservice";

const Button = ({ children, onClick, className }) => (
  <button
    onClick={onClick}
    className={`px-6 py-3 text-xl rounded transition-all duration-300 ease-in-out hover:scale-105 ${className}`}
  >
    {children}
  </button>
);

const Loader2 = () => (
  <svg className="w-10 h-10 animate-spin text-gray-800" viewBox="0 0 24 24">
    <circle
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
      fill="none"
    />
  </svg>
);

export default function SearchingPage() {
  const [searching, setSearching] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Only connect if not already connected
    if (!socket.connected) {
      socket.connect();
    }

    socket.on("connect", () => {
      console.log("Connected to server");
      setConnectionError(false);
    });

    socket.on("connect_error", (error) => {
      console.error("Connection error:", error);
      setConnectionError(true);
      setSearching(false);
    });

    socket.on("matchFound", (gameState) => {
      console.log("Match found:", gameState);
      localStorage.setItem("gameState", JSON.stringify(gameState));
      navigate("/MainPage");
    });

    // Don't disconnect on unmount, just remove listeners
    return () => {
      socket.off("connect");
      socket.off("connect_error");
      socket.off("matchFound");
    };
  }, [navigate]);

  // Function to send the selected symbol to the backend
  const sendSymbolToBackend = (symbol) => {
    if (!socket.connected) {
      console.log("Attempting to reconnect...");
      socket.connect();
    }

    if (socket.connected) {
      socket.emit("joinGame", symbol);
      console.log(`Sent symbol: ${symbol}`);
    } else {
      setConnectionError(true);
      setSearching(false);
      console.log("Socket is not connected");
    }
  };

  // Handle search button click
  const handleSearch = (symbol) => {
    setSearching(true);
    sendSymbolToBackend(symbol); // Send the selected symbol to the backend
    setTimeout(() => {
      setSearching(false);
    }, 4000); // Simulate a 4-second search
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      {connectionError && (
        <div className="bg-red-500 text-white p-4 rounded mb-4">
          Unable to connect to server. Please try again later.
        </div>
      )}
      <h1 className="text-3xl font-bold mb-6">Select Your Symbol</h1>
      <div className="flex flex-col items-center space-y-4">
        <div className="flex space-x-4">
          <Button
            onClick={() => handleSearch("X")}
            className="bg-blue-500 hover:bg-blue-600"
          >
            X
          </Button>
          <Button
            onClick={() => handleSearch("O")}
            className="bg-green-500 hover:bg-green-600"
          >
            O
          </Button>
          <Button
            onClick={() => handleSearch("R")}
            className="bg-purple-500 hover:bg-purple-600"
          >
            Random
          </Button>
        </div>

      </div>
      {searching && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
        >
          <div className="bg-white p-8 rounded-xl flex flex-col items-center space-y-6 w-96">
            <Loader2 />
            <p className="text-gray-800 text-xl">Wait For Other Player</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
