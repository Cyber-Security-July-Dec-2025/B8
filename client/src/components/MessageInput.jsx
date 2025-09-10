import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useChatStore } from '../store/chatStore';

function MessageInput() {
  const [message, setMessage] = useState('');
  const { sendMessage } = useChatStore();

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    try {
      sendMessage(message);
      setMessage('');
    } catch (error) {
      console.log("Failed to send message", error);
      toast.error("Failed to send message");
    }
  };

  return (
    <form onSubmit={handleSendMessage} className="flex items-center gap-2 p-4">
      <input
        type="text"
        className="w-full input input-bordered rounded-lg input-sm sm:input-md"
        placeholder="Type a message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button
        type="submit"
        className="btn btn-sm btn-circle"
        disabled={!message.trim()}
      >
        <Send size={22} />
      </button>
    </form>
  );
}

export default MessageInput;
