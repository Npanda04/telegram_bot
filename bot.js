// index.js
const TelegramBot = require("node-telegram-bot-api");
const schedule = require("node-schedule");
require('dotenv').config();


const axios = require("axios");
const { User, Admin } = require("./db");

// Replace 'YOUR_TELEGRAM_BOT_TOKEN' with your actual bot token
const botToken = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(botToken, { polling: true });

// Bot command handlers
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    "Welcome! Please provide your name, city, and country, separated by commas (e.g., John Doe, City, Country)."
  );
});

// Event handler for receiving user input
bot.on("text", async (msg) => {
  const chatId = msg.chat.id;
  const userData = msg.text.split(",").map((item) => item.trim());
  if (userData.length === 3) {
    const [name, city, country] = userData;

    const existUser = await User.findOne({ chatId: chatId });

    if (existUser) {
      console.log("user already exist");
    } else {
      await User.create({
        chatId: chatId,
        name: name,
        city: city,
        country: country,
      });

      console.log("user created");
    }

    if (existUser.allowed == true) {
      const weatherData = await getWeatherData(city, country);

      bot.sendMessage(
        chatId,
        `Weather update for ${city}, ${country}:\n${weatherData}`
      );
    } else {
      bot.sendMessage(chatId, "you are blocked kindly contact admin");
    }
  } else {
    bot.sendMessage(
      chatId,
      "Invalid format. Please provide your name, city, and country, separated by commas."
    );
  }
});

//automated send weather data to existing users

const getMessageNumber = async () => {
  const messageFrequency = await Admin.findOne({});
  return messageFrequency.messageFrequency;
};

const scheduleWeatherUpdatesJob = async () => {
  const messageNumber = await getMessageNumber();
  const scheduleExpression = `0 0 */${messageNumber} * * *`;
  // Schedule the job
  const job = schedule.scheduleJob(scheduleExpression, async () => {
    await sendWeatherUpdatesToAllUsers();
  });
};

scheduleWeatherUpdatesJob();

async function sendWeatherUpdatesToAllUsers() {
  const allUsers = await User.find({}, "chatId city country");

  for (const user of allUsers) {
    const { chatId, city, country } = user;
    const weatherData = await getWeatherData(city, country);
    bot.sendMessage(
      chatId,
      `Daily Weather Update for ${city}, ${country}:\n${weatherData}`
    );
  }
}

// Function to fetch weather data using OpenWeatherMap API
async function getWeatherData(city, country) {
  const apiKey = process.env.OPEN_WEATHERAPI_KEY;
  const apiUrl = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
  try {
    const response = await axios.get(apiUrl);
    const weather = response.data.weather[0].description;
    const temperature = response.data.main.temp;

    return `Weather in ${city}, ${country}: ${weather}, Temperature: ${temperature}°C`;
  } catch (error) {
    console.error("Error fetching weather data:", error.message);
    return "Unable to fetch weather data at the moment.";
  }
}

console.log("Telegram Bot is running...");
