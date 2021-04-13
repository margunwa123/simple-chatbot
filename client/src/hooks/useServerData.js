import axios from "axios";
import { useEffect, useState } from "react";

const basePath = "http://localhost:5000";

function useServerData(path, initialState, callback) {
  const [state, setState] = useState(initialState);
  const [requestDone, setRequestDone] = useState(false);

  useEffect(() => {
    async function getAndSetServerData() {
      try {
        const res = await axios.get(basePath + path);
        setState(res.data);
      } catch (err) {
        throw new Error(err.message);
      }
      setRequestDone(true);
      if (callback) {
        callback();
      }
    }
    getAndSetServerData();
  }, []);

  return [state, setState, requestDone];
}

export default useServerData;
