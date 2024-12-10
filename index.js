import { Octokit } from "@octokit/core";
import express from "express";
import OpenAI from 'openai';
const app = express();


app.post("/", express.json(), async (req, res) => {
  // Identify the user, using the GitHub API token provided in the request headers.
  const tokenForUser = req.get("X-GitHub-Token");
  const octokit = new Octokit({ auth: tokenForUser });
  const user = await octokit.request("GET /user");
  console.log("User:", user.data.login);


  const capiClient = new OpenAI({
    baseURL: "https://api.githubcopilot.com",
    apiKey: tokenForUser
  });


  // Parse the request payload and log it.
  const payload = req.body;
  console.log("Payload:", payload);

  let movies_api_res = await fetch(process.env.MOVIES_API_URL);
  let movies_json = await movies_api_res.json();
  console.log("Movies:", movies_json);

  // Insert a special super hero system message in our message list.
  const messages = payload.messages;
  messages.unshift({
    role: "system",
    content: "You are a helpful assistant that replies to user messages as if you were a super hero.",
  });

  messages.unshift({
    role: "system",
    content: `If the user is asking for a movie in the cinema you should respond taking into account the following information: ${JSON.stringify(movies_json)}`
  });

  messages.unshift({
    role: "system",
    content: `Start every response with the user's name, which is @${user.data.login} and include emojis in your responses.`,
  });


  const copilotLLMResponse = await capiClient.chat.completions.create({
    model: "gpt-4o",
    messages,
    stream: true,
  });

  // Stream the response straight back to the user.
  for await (const chunk of copilotLLMResponse) {
    const chunkStr = "data: " + JSON.stringify(chunk) + "\n\n";
    res.write(chunkStr);
  }
  res.write("data: [DONE]\n\n");
  res.end();
  return;
})

const port = Number(process.env.PORT || '3000')
app.listen(port, () => {
  console.log(`Server running on port ${port}`)
});