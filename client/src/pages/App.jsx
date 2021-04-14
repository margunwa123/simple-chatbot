import axios from "axios";
import { useCallback, useRef, useState, useEffect } from "react";
import { v4 } from "uuid";
import Chat from "../components/Chat";
import useServerData from "../hooks/useServerData";
import useLocalStorage from "../hooks/useLocalStorage";

const axiosInstance = axios.create({
  // asumsi tahap development
  baseURL: "http://localhost:5000",
});

function App() {
  const messageRef = useCallback((node) => {
    if (node) {
      node.scrollIntoView({ smooth: true });
    }
  }, []);
  const textRef = useRef();
  const [text, setText] = useState("");
  const [messages, setMessages, isRequestDone] = useServerData(
    "/messages",
    [],
    () => {
      textRef.current.focus();
    }
  );
  const [pendingState, setPendingState] = useState(false);
  const [user, setUser] = useState({ name: null, birthdate: null });
  const [userId, setUserId] = useLocalStorage("user-id", null);

  async function sendMessage() {
    addMessage();
    try {
      setPendingState(true);
      const res = await axiosInstance.post("/messages", {
        message: {
          text,
          sender: "self",
          id: v4(),
        },
        user: {
          ...user,
          id: userId,
        },
      });
      if (res.data.user.id !== userId) {
        setUser(res.data.user);
      }
      addMessage("bot", res.data.message.text, res.data.message.id);
    } catch (err) {
      console.error(err);
    }
    setPendingState(false);
    textRef.current.focus();
  }

  function addMessage(sender = "self", newText = text, id = v4()) {
    if (text.length === 0) return;
    setMessages((oldMessages) => {
      return [...oldMessages, { sender, text: newText, id }];
    });
    setText("");
  }

  return (
    <div className="h-screen flex flex-col bg-red-200 p-10 items-center">
      <h1 className="font-bold text-4xl text-center mb-2">Chatbot App</h1>
      <button
        onClick={() => {
          setMessages([]);
        }}
        className="bg-red-500 btn text-white"
      >
        Clear
      </button>
      <div className="flex flex-col bg-white rounded-lg h-full lg:w-2/5 xs:w-full relative">
        <div className="flex p-4 absolute bg-white border-b-2 space-x-4 rounded-tl-lg rounded-tr-lg h-20 top-0 left-0 right-0">
          <img src="logo.png" width="auto" height={40}></img>
          <div>
            <p className="font-bold text-2xl mb-0 pb-0">
              <span className="w-4 h-4 bg-green-500 rounded-full inline-block"></span>{" "}
              Mario Bot
            </p>
            <small
              className={` ${
                pendingState ? "italic" : ""
              } opacity-60 mt-0 pt-0`}
            >
              {pendingState ? "is typing..." : "idle"}
            </small>
          </div>
        </div>
        <div
          id="chat-log"
          className="flex flex-col flex-grow overflow-auto h-10 mt-20"
        >
          {messages.map((message, idx) => (
            <Chat
              key={idx}
              ref={idx === messages.length - 1 ? messageRef : null}
              sender={message.sender}
            >
              {message.text}
            </Chat>
          ))}
        </div>
        <div id="text-input" className="flex">
          <input
            disabled={pendingState || !isRequestDone}
            type="text"
            name="text"
            id="text"
            className={`w-full px-2 py-3 rounded border ${
              pendingState || !isRequestDone ? "bg-gray-300" : "bg-white"
            }`}
            placeholder={
              pendingState || !isRequestDone
                ? "Please wait for a bit..."
                : "Type your text here..."
            }
            onChange={(e) => {
              setText(e.target.value);
            }}
            ref={textRef}
            value={text}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                sendMessage();
              }
            }}
          />
          <button
            onClick={sendMessage}
            className="bg-green-600 px-4 text-white"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
