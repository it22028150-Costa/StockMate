import { useState } from "react";
import axios from "axios";

const ChatBot = () => {
  const [message, setMessage] = useState("");
  const [chatResponse, setChatResponse] = useState("");

  const handleSend = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post("http://localhost:5000/api/chatbot", { message }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setChatResponse(res.data.response);
      setMessage("");
    } catch(err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">ChatBot Assistance</h2>
      <div className="mb-4">
        <input 
          type="text" 
          placeholder="Type your message..." 
          value={message} 
          onChange={(e) => setMessage(e.target.value)} 
          className="p-2 border rounded mr-2 w-2/3"
        />
        <button onClick={handleSend} className="bg-blue-600 text-white p-2 rounded">Send</button>
      </div>
      {chatResponse && (
        <div className="p-4 border rounded">
          <strong>Response:</strong>
          <p>{chatResponse}</p>
        </div>
      )}
    </div>
  );
};

export default ChatBot;
