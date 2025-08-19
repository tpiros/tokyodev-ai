# Setting up Google Cloud

In order to run the samples you must have a Google Cloud setup with the appropriate APIs enabled as well as a billing account setup. Follow the instructions on https://cloud.google.com/free?hl=en.

# Setup API keys

To run most of these examples you'll need to have a valid Gemini API key which you can obtain by visiting https://ai.google.dev/gemini-api/docs/api-key.

For the function calling and the agent examples you'll need to have a Weather API Key, which you can obtain from https://www.weatherapi.com/docs/.

If you plan on running your own fine tuned model, that will require a separate API key, please refer to the Gemini documentation.

Once you have all these API keys, you need to create a `.env` file at the root of the project folder and add your values:

```
GEMINI_API_KEY=""
WEATHER_API=""
GEMINI_API_KEY_FOR_FINE_TUNED_MODEL=""
```

## Setup the dependencies

Run `npm i` in the root folder to install the required dependencies.

# Available `npm` command list

These are the various `npm` commands that you can run - please refer to the slides on what they do and how to use them exactly:

- npm run chat ^
- npm run chat-stream ^
- npm run chat-with-history ^
- npm run code ^
- npm run ecommerce
- npm run fine-tuning ^^
- npm run function ^ ^^^
- npm run grounding ^
- npm run prompt ^
- npm run prompt-stream ^
- npm run structured ^
- npm run temperature ^
- npm run weather ^

```
^     Requires a Gemini API key
^^    Requires Fine Tuning Gemini API key for the fine tuned model
^^^   Requires Weather API key
```
