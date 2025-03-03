import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import socket from "./Socketservice";

const MainPage = () => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [playerType, setPlayerType] = useState(null);
  const [turn, setTurn] = useState("X");
  const [winner, setWinner] = useState(null);
  const [waitingPopup, setWaitingPopup] = useState(false);
  // const [isDraw, setIsDraw] = useState(false);
  const [disconnectPopup, setDisconnectPopup] = useState(false);
  const navigate = useNavigate();

  // Load game state from local storage on mount
  useEffect(() => {
    const storedGameState = localStorage.getItem("gameState");
    if (storedGameState) {
      const gameState = JSON.parse(storedGameState);
      if (gameState.board) setBoard(gameState.board);
      if (gameState.symbol) setPlayerType(gameState.symbol);
      if (gameState.Turn) setTurn(gameState.Turn);
    }
  }, []);

  // Socket connection and event listeners
  useEffect(() => {
    socket.emit("joinGame");

    socket.on("gameUpdate", (res) => {
      // Update turn, board, and winner from server response
      setTurn(res.Turn);
      setBoard(res.board);
      setWinner(res.winner);
      // if(res.winner === "draw"){
      //   setIsDraw(true);
      // }
    });

    socket.on("playerDisconnected", () => {
      setDisconnectPopup(true);
      setTimeout(() => {
        setDisconnectPopup(false);
        handleExit();
      }, 3000);
    });

    // Listen for disconnect events and try to reconnect if game is still active
    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      // If there's no winner, attempt to reconnect
      if (!winner) {
        socket.connect();
      }
    });

    // Only remove event listeners on cleanup, don't disconnect
    return () => {
      socket.off("gameUpdate");
      socket.off("disconnect");
      socket.off("playerDisconnected");
    };
  }, );

 

  // Handle cell click
  const handleMove = (index) => {
    // Do nothing if the cell is already filled or if the game is over
    if (board[index] || winner) return;

    if (playerType === turn) {
      let room = null;
      const storedGameState = localStorage.getItem("gameState");
      if (storedGameState) {
        try {
          room = JSON.parse(storedGameState).room;
        } catch (error) {
          console.error("Error parsing game state from localStorage", error);
        }
      }
      const data = {
        room: room,
        position: index,
      };
      // Emit move event to server
      socket.emit("makeMove", data);
      // Optimistically update board
      const newBoard = [...board];
      newBoard[index] = playerType;
      setBoard(newBoard);
    } else {
      // Not your turn: show waiting popup for 3 seconds
      setWaitingPopup(true);
      setTimeout(() => {
        setWaitingPopup(false);
      }, 3000);
    }
  };

  // Add handler for exit button
  const handleExit = () => {
    localStorage.removeItem("gameState");
    navigate("/"); // Navigate to home page or wherever your initial page is
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-6">Real-Time Tic-Tac-Toe</h1>

      <div className="grid grid-cols-3 gap-2 bg-gray-800 p-4 rounded-lg shadow-lg">
        {board.map((cell, index) => (
          <button
            key={index}
            className="w-24 h-24 text-4xl flex items-center justify-center border-2 border-gray-700 bg-gray-600 hover:bg-gray-500 transition-all rounded-lg"
            onClick={() => handleMove(index)}
          >
            {cell}
          </button>
        ))}
      </div>

      <div className="mt-6 text-lg">
        <p>
          Your Symbol:{" "}
          <span className="font-bold text-yellow-400">{playerType}</span>
        </p>
        <p>
          Turn:{" "}
          <span className="font-bold text-green-400">
            {playerType === turn ? "Your Turn" : "Opponent Turn"}
          </span>
        </p>
      </div>

      {winner && (
        <>
          <div className="mt-4 text-2xl font-bold text-red-400">
            {winner === playerType ? "You Won!" : winner === "draw" ? "Game Draw!" : "Opponent Won!"}
          </div>
          <div className="mt-4 flex gap-4">
            {/* <button 
              onClick={handleRematch}
              className="px-6 py-2 bg-green-500 hover:bg-green-600 rounded-lg transition-colors"
            >
              Rematch
            </button> */}
            <button 
              onClick={handleExit}
              className="px-6 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
            >
              Exit
            </button>
          </div>
        </>
      )}

     

      {waitingPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-xl text-gray-800">
            <p>Wait for your turn</p>
          </div>
        </div>
      )}

      {disconnectPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-xl text-gray-800">
            <p>Opponent disconnected. Returning to home...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainPage;
