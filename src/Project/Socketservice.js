import io from 'socket.io-client';

const socket = io('https://tictactoe-b.onrender.com', {
      transports: ["websocket"],
    });

export default socket;