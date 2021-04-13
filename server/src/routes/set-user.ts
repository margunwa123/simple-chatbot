import { query, Router } from "express";
import User from "../model/User";
import { queryWebhook, user } from "../Singleton";

const router: Router = Router();

router.post("/", async (req, res) => {
  const { id } = req.body;
  try {
    const new_user = await User.getUserById(id);
    user.name = new_user.name;
    user.birthdate = new_user.birthdate;
    queryWebhook.setContexts([queryWebhook.createContext("welcome-back")]);
    res.status(200).send(user);
  } catch (err) {
    res.status(400).send("Error while saving user to database");
  }
});

export default router;
