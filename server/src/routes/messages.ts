import { google } from "@google-cloud/dialogflow/build/protos/protos";
import { Router } from "express";
import { getHowManyDaysUntilBirthday } from "../util/birthday";
import { db } from "../database";
import User from "../model/User";
import { DialogflowQueryWebHook } from "../QueryWebhook";
import { v4 } from "uuid";

const router = Router();
let user: User = new User("", null, null);

const queryWebhook = DialogflowQueryWebHook.createWebhook();

const queryResultCallback = (
  qresult: google.cloud.dialogflow.v2.IQueryResult,
  user: IUser
) => {
  const params = qresult.parameters?.fields as {
    [k: string]: google.protobuf.IValue;
  };
  if (params["date-time"]) {
    const stringBirthdate = params["date-time"].stringValue;
    if (!stringBirthdate) return qresult;
    const time = new Date(stringBirthdate);
    user.birthdate = time;
  }
  if (qresult.fulfillmentText === "get-days-until-birth-date") {
    if (!user.birthdate) throw Error("Birthdate is null or undefined");

    const days = getHowManyDaysUntilBirthday(user.birthdate);
    // impure blocks
    qresult.fulfillmentText = `There are about ${days} more days to your next birthday`;
    if (days === 0) {
      qresult.fulfillmentText = "Oh it's your birthday today, happy birthday!!";
    }
  }
  if (params.person) {
    const name = params.person.structValue?.fields?.name.stringValue;
    if (name) {
      user.name = name;
    }
  }
  return qresult;
};

async function getUser(query: { user: IUser }): Promise<User> {
  if (user.id) {
    return user;
  }
  const new_user = new User("", null, null);
  if (query.user.id != null) {
    const doc = await db.collection("user").doc(query.user.id).get();
    console.log(doc.data());
    const xdoc = await db.collection("user").doc("heheheheeheh").get();
    console.log(xdoc.data());
    if (doc.exists) {
      new_user.id = query.user.id;
      new_user.name = doc.data()?.name;
      new_user.birthdate = new Date(doc.data()?.birthdate._seconds);
    }
  } else {
    // create new user
    const userId = await new_user.saveToDatabase();
    new_user.id = userId;
  }
  return new_user;
}

router.post("/", async (req, res) => {
  const query: { message: Message; user: IUser } = req.body;
  user = await getUser(query);
  await queryWebhook.executeQueries([query.message], queryResultCallback);

  res.send({
    message: queryWebhook.getLastMessage(),
    user,
  });
});

router.get("/", async (req, res) => {
  res.status(200).send(queryWebhook.getAllMessages());
});

router.get("/:id", (req, res) => {
  const { id } = req.params;
  const message = queryWebhook.getMessageById(id);
  res.send(message);
});

router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const deletedMessage = queryWebhook.deleteMessageById(id);
  if (!deletedMessage) {
    res.status(400).send({
      message: "Specified message does not exist",
    });
    return;
  }
  res.send({
    message: "Successfully deleted message",
    deletedMessage: deletedMessage,
  });
});

export default router;
