import { useState, useEffect } from "react";

const PREFIX = "chatbot-app-";

function useLocalStorage(key, initialState) {
  const [state, setState] = useState(() => {
    const jsonString = localStorage.getItem(PREFIX + key);
    if (jsonString != null) {
      return JSON.parse(jsonString);
    }
    if (typeof initialState == "function") {
      return initialState();
    }
    return initialState;
  });

  useEffect(() => {
    localStorage.setItem(PREFIX + key, JSON.stringify(state));
  }, [state, key]);

  return [state, setState];
}

export default useLocalStorage;
