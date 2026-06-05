require("dotenv").config()

const axios = require("axios")

async function sendTelegramMessage(message) {

  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  const url = `https://api.telegram.org/bot${token}/sendMessage`

  try {

    const response = await axios.post(url, {
      chat_id: chatId,
      text: message
    })

    return response.data

  } catch (error) {

    console.error(
      "Erro ao enviar mensagem para o Telegram:",
      error.response?.data || error.message
    )

    throw error
  }
}

module.exports = {
  sendTelegramMessage
}