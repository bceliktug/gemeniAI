const {
  FunctionDeclarationSchemaType,
  HarmBlockThreshold,
  HarmCategory,
  VertexAI,
} = require("@google-cloud/vertexai");

const project = "geminiai-426105";
const location = "us-central1";
const textModel = "gemini-1.0-pro";

const vertexAI = new VertexAI({ project: project, location: location });

// Instantiate Gemini text model
const generativeModel = vertexAI.getGenerativeModel({
  model: textModel,
  // Safety settings and generation config (optional)
  safetySettings: [
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ],
  generationConfig: { maxOutputTokens: 256 },
});

async function chatLoop() {
  let chat = generativeModel.startChat();
  let fullResponse = "";

  while (true) {
    // Get user input with colored prompt
    const userInput = await new Promise((resolve) => resolve(readLine()));
    console.log(`\x1b[36mSen:> ${userInput}\x1b[0m`); // User input with cyan color

    if (userInput.toLowerCase() === "exit") {
      console.log("Ending chat session.");
      break;
    }

    const result = await chat.sendMessageStream(userInput);
    fullResponse = "";

    // Process response stream and concatenate text
    for await (const item of result.stream) {
      fullResponse +=
        item.candidates &&
        item.candidates[0] &&
        item.candidates[0].content &&
        item.candidates[0].content.parts &&
        item.candidates[0].content.parts[0]
          ? item.candidates[0].content.parts[0].text
          : "";
    }

    // Separate question and response with a unique separator string
    console.log(
      `\x1b[35mGemini AI:> ${fullResponse}\x1b[0m\n\x1b[38;5;240m-----------------------------------------\x1b[0m`
    ); // Separator with gray color
  }

  chat.end(); // Explicitly end chat session after loop exits
}

function readLine() {
  const readline = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    readline.question("> ", (answer) => {
      readline.close();
      resolve(answer);
    });
  });
}

chatLoop();