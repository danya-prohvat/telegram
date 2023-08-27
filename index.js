console.log("1");

const TelegramApi = require("node-telegram-bot-api");
const { gameOptions } = require("./options");
const sequelize = require("./db");
const UserModel = require("./models");
console.log("2");

require("dotenv").config();

const token = process.env.TOKEN;

const bot = new TelegramApi(token, { polling: true });
const chats = {};

const start = async () => {
  console.log("Server started");

  try {
    await sequelize.authenticate();
    await sequelize.sync();
    console.log("DB connected");
  } catch (e) {
    console.log("Something went wrong with connecting to DB", e);
  }

  bot.setMyCommands([
    { command: "/start", description: "start bot" },
    { command: "/info", description: "bot info" },
    { command: "/game", description: "bot info" },
  ]);

  bot.on("message", async (msg) => {
    const text = msg.text;
    const first_name = msg.from.first_name;
    const chatId = msg.chat.id;

    if (text === "/start") {
      await UserModel.create({ chatId });

      return await bot.sendMessage(chatId, `Welcome ${first_name}`);
    } else if (text === "/info") {
      const user = await UserModel.findOne({ chatId });

      return await bot.sendMessage(
        chatId,
        `There are info about bot. Your wrong answers: ${
          user.wrong ? user.wrong : 0
        }, right answers: ${user.right ? user.right : 0}`
      );
    } else if (text === "/game") {
      await bot.sendMessage(chatId, `Try to guess a number from 0 to 9`);

      const randomNumber = Math.floor(Math.random() * 10);
      chats[chatId] = randomNumber;

      return await bot.sendMessage(chatId, "Guess", gameOptions);
    }
  });

  bot.on("callback_query", async (msg) => {
    const data = msg.data;
    const chatId = msg.from.id;
    const user = await UserModel.findOne({ chatId });

    if (+chats[chatId] === +data) {
      user.right += 1;
      await user.save();

      return await bot.sendMessage(
        chatId,
        `Yees! you are win! ${chats[chatId]}`
      );
    } else {
      user.wrong += 1;
      await user.save();

      return await bot.sendMessage(
        chatId,
        `Unfortunately. you lose. ${chats[chatId]}`
      );
    }
  });
};

start();
