interface Message {
  text: string;
  sender: "self" | "bot";
  id: string;
}

interface IUser {
  name: string;
  birthdate: Date;
  id: string;
}
