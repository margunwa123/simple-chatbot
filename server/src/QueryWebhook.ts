import dialogflow from "@google-cloud/dialogflow";
import { google } from "@google-cloud/dialogflow/build/protos/protos";
import { v4 } from "uuid";

const sessionClient = new dialogflow.SessionsClient();

class DialogflowQueryWebHook {
  private timer: NodeJS.Timeout | null = null;
  private messages: Message[] = [];

  constructor(
    private projectId: string,
    private sessionId: string,
    private contexts: google.cloud.dialogflow.v2.IContext[] = [],
    private languageCode: string = "en-US"
  ) {}

  appendMessages(messages: Message[]) {
    this.messages = this.messages.concat(messages);
  }

  getAllMessages() {
    return this.messages;
  }

  getMessageById(id: string): Message | undefined {
    return this.messages.find((el) => el.id === id);
  }

  deleteMessageById(id: string) {
    const deletedMessage = this.messages.find((message) => message.id === id);
    this.messages = this.messages.filter((message) => message.id !== id);
    return deletedMessage;
  }

  async detectIntent(
    query: string
  ): Promise<google.cloud.dialogflow.v2.IDetectIntentResponse> {
    const { projectId, sessionId, contexts, languageCode } = this;

    const sessionPath = sessionClient.projectAgentSessionPath(
      projectId,
      sessionId
    );

    const request: {
      [propName: string]: any;
    } = {
      session: sessionPath,
      queryInput: {
        text: {
          text: query,
          languageCode,
        },
      },
    };

    if (contexts && contexts.length > 0) {
      request.queryParams = {
        contexts,
      };
    }

    const responses = await sessionClient.detectIntent(request);
    const intentResponse = responses[0];
    const outputContexts = intentResponse.queryResult?.outputContexts;
    this.setContexts(outputContexts);
    return intentResponse;
  }

  async executeQueries(
    queries: Message[],
    queryResultCallback?: Function
  ): Promise<(google.cloud.dialogflow.v2.IQueryResult | null)[]> {
    const result: (google.cloud.dialogflow.v2.IQueryResult | null)[] = [];

    this.appendMessages(queries);

    for (const query of queries) {
      let qResult = await this.executeQuery(query, queryResultCallback);
      result.push(qResult);
    }

    return result;
  }

  async executeQuery(
    query: Message,
    queryResultCallback?: Function
  ): Promise<google.cloud.dialogflow.v2.IQueryResult | null> {
    try {
      let intentResponse = await this.detectIntent(query.text);
      const queryResult:
        | google.cloud.dialogflow.v2.IQueryResult
        | null
        | undefined = queryResultCallback
        ? queryResultCallback(intentResponse.queryResult)
        : intentResponse.queryResult;

      console.log(queryResult?.outputContexts);
      this.setContexts(queryResult?.outputContexts);
      const fulfillmentText = queryResult?.fulfillmentText;
      this.appendMessages([
        {
          text: fulfillmentText || "",
          sender: "bot",
          id: v4(),
        },
      ]);
      return queryResult || null;
    } catch (error) {
      return null;
    }
  }

  setContexts(contexts?: google.cloud.dialogflow.v2.IContext[] | null) {
    this.contexts = contexts ?? [];
    if (this.timer) {
      // delete previous timer if exists
      clearTimeout(this.timer);
    }
    if (this.contexts.length > 0) {
      const N = 5;
      this.timer = setTimeout(() => {
        // let contexts expire after N minutes
        this.contexts = [];
      }, 60 * N);
    }
  }

  createContext(
    raw_name: string,
    lifespanCount: number = 5,
    parameters: google.protobuf.IStruct = { fields: {} }
  ): google.cloud.dialogflow.v2.IContext {
    const name = `projects/${this.projectId}/agent/sessions/${this.sessionId}/contexts/${raw_name}`;
    return {
      name,
      lifespanCount,
      parameters,
    };
  }
}

export { DialogflowQueryWebHook };
