import { Router } from "express";
import User from "../model/User";

const router: Router = Router();

router.post("/", async (req, res) => {
  const { user } = req.body;
  try {
    const classifiedUser = new User(user.name, user.birthdate);
    const userid = await classifiedUser.saveToDatabase();
    res.send(userid);
  } catch (err) {
    res.status(400).send("Error while saving user to database");
  }
});

export default router;
