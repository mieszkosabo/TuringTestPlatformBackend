import { getAnswerFromBot, messagesToPrompt } from "../src/chatbot";
import { AI_PREFIX, HUMAN_PREFIX, PROMPT_BEGINNING } from "../src/const";
import { GameMessage } from "../src/types";

const testMessages: GameMessage[] = [
  { text: "Hi, who are you?", fromEvaluator: true },
  { text: "Hi, I'm Ben", fromEvaluator: false },
  { text: "What are your hobbies?", fromEvaluator: true },
];

it("converts game messages to prompt string", () => {
  expect(messagesToPrompt(testMessages)).toEqual(
    `${PROMPT_BEGINNING}Human: Hi, who are you?
${AI_PREFIX} Hi, I'm Ben
${HUMAN_PREFIX} What are your hobbies?
${AI_PREFIX}`
  );
});

it("works with single message as well", () => {
  expect(messagesToPrompt([{ text: "hi how are you?", fromEvaluator: true }]))
    .toEqual(`${PROMPT_BEGINNING}Human: hi how are you?
${AI_PREFIX}`);
});

it("returns something", async () => {
  const answer = await getAnswerFromBot(testMessages);
  console.log(answer);

  expect(typeof answer.text).toBe("string");
});
