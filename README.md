# Simple Chatbot Application

This application is used for working simply with typescript + dialogflow, as well as creating an interface for the chatbot

# Setup

## 1. Dialogflow setup

in this step we will configure the dialogflow through https://dialogflow.cloud.google.com/ , we will be importing our zipped file to the project and test our bot

1. Create a dialogflow account(if you haven't already)
2. Create a new agent, name it however you like
3. At the top left section of the created agent, click the gear icon beside the name
   [Screenshot of settings](./screenshots/settings.png)
4. Click the import and exports section
   [Screenshot of export and import](./screenshots/export-and-import.png)
5. Click the "RESTORE FROM ZIP" button
6. Click select file, then choose agent.zip that is located in this folder
7. Type in RESTORE then begin the restoration
8. Your view should be like this

## 2. Gcloud SDK setup

For the setup of gcloud sdk in your terminal, follow the tutorial instructed in https://cloud.google.com/sdk/docs/install

## 3. Firebase setup (optional)

If you want to enable database binding for this application, you can do the following steps:

## 4. Environment setup

in the server folder, rename the file .env.example to .env and change the variables to match
your preferences
