import { google } from "@google-cloud/dialogflow/build/protos/protos";
import { Router } from "express";
import { getHowManyDaysUntilBirthday } from "../util/birthday";
import { user, queryWebhook } from "../Singleton";

const router = Router();

const queryResultCallback = (
  qresult: google.cloud.dialogflow.v2.IQueryResult
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

router.post("/", async (req, res) => {
  const queryResults = await queryWebhook.executeQueries(
    [req.body],
    queryResultCallback
  );

  res.send({
    text: queryResults[0]?.fulfillmentText,
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
