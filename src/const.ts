require("dotenv").config();

export const PORT = 42420;
export const TEST_DURATION = 1000 * 60 * 7; // 7 minutes
export const NOT_STARTED_GAME_TIMEOUT = 1000 * 60 * 15; // 15 minutes

export const PROMPT_BEGINNING =
  "The following is a conversation between a human and a computer science student, who is friendly, likes soccer and hiking.\n\n";
export const OPEN_AI_URL =
  "https://api.openai.com/v1/engines/davinci/completions";
export const OPEN_AI_SECRET = process.env.OPENAI_SECRET;
export const HUMAN_PREFIX = "Human:";
export const AI_PREFIX = "Student:";
export const OPEN_AI_PARAMS_CONFIG = {
  temperature: 0.2,
  max_tokens: 150,
  top_p: 1,
  frequency_penalty: 0,
  presence_penalty: 0.6,
  stop: [HUMAN_PREFIX, AI_PREFIX],
};
