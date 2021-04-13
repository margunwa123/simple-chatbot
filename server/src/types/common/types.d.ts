interface Message {
  text: string;
  sender: "self" | "bot";
  id: string;
}
