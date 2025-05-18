import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [ws, setWs] = useState(null);
  const [feed, setFeed] = useState([]);

  useEffect(() => {
    // Fetch initial feed
    fetch('http://localhost:4000/feed')
      .then(res => res.json())
      .then(data => setFeed(data))
      .catch(console.error);

    // Setup WebSocket connection
    const socket = new WebSocket('ws://localhost:4000');
    socket.onopen = () => console.log('WebSocket connected');
    socket.onmessage = (event) => console.log('Received:', event.data);
    socket.onclose = () => console.log('WebSocket disconnected');
    setWs(socket);

    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, []);

  const handleClick = (item) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'interaction',
        action: 'click',
        itemId: item.id,
        timestamp: Date.now(),
      }));
    }
  };

  return (
    <div className="App">
      <h1>Feed</h1>
      <ul>
        {feed.map(item => (
          <li key={item.id} onClick={() => handleClick(item)}>
            {item.content}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App; 