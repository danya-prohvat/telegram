const TelegramApi = require("node-telegram-bot-api");
const { gameOptions } = require("./options");

const token = "6383438397:AAFg8N5iHdh1cB5XASeuQYKkpvPta4_jYdI";

const bot = new TelegramApi(token, { polling: true });
const chats = {};

const start = async () => {
  bot.setMyCommands([
    { command: "/start", description: "start bot" },
    { command: "/info", description: "bot info" },
    { command: "/game", description: "bot info" },
  ]);

  bot.on("message", async (msg) => {
    const text = msg.text;
    const first_name = msg.from.first_name;
    const chatId = msg.chat.id;

    if (text === "/start")
      return await bot.sendMessage(chatId, `Welcome ${first_name}`);
    else if (text === "/info")
      return await bot.sendMessage(chatId, `There are info about bot`);
    else if (text === "/game") {
      await bot.sendMessage(chatId, `Try to guess a number from 0 to 9`);

      const randomNumber = Math.floor(Math.random() * 10);
      chats[chatId] = randomNumber;

      return await bot.sendMessage(chatId, "Guess", gameOptions);
    }
  });

  bot.on("callback_query", async (msg) => {
    const data = msg.data;
    const chatId = msg.from.id;

    if (+chats[chatId] === +data)
      return await bot.sendMessage(
        chatId,
        `Yees! you are win! ${chats[chatId]}`
      );
    else
      return await bot.sendMessage(
        chatId,
        `Unfortunately. you lose. ${chats[chatId]}`
      );
  });
};

start();
