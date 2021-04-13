import React from "react";

const Chat = React.forwardRef(({ children, sender = "self" }, ref) => {
  const boxStyle =
    sender === "self"
      ? "bg-green-600 text-white"
      : "bg-white text-black border-2";
  const alignment = sender === "self" ? "self-end" : "self-start";
  return (
    <div className="mx-3 my-2 flex flex-col">
      <div ref={ref} className={`p-2 rounded-xl ${boxStyle} ${alignment}`}>
        {children}
      </div>
      <small className={alignment}>{sender}</small>
    </div>
  );
});

export default Chat;
