import User from "./model/User";
import { DialogflowQueryWebHook } from "./QueryWebhook";

// project setup and session id setup
const projectId = process.env.projectId || "quickstart-uqes";
const sessionId = "12345678";

const queryWebhook = new DialogflowQueryWebHook(projectId, sessionId);

const user = new User("", null);

export { queryWebhook, user };
