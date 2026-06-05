const pool = require("../db")


function getCurrentTime(){
    return Math.floor(Date.now()/1000);
}

const {
  sendTelegramMessage
} = require("../services/telegramService")

const {
  getRiskLevel
} = require("../services/riskService")

let delay = getCurrentTime();
async function sensorRoutes(fastify) {

  fastify.post(
    "/api/sensor-data",
    async (request, reply) => {

      const {
        temperatura,
        umidade,
        chuva,
        nivel_chuva_raw,
        distancia_agua_cm
      } = request.body

      const risk = getRiskLevel(distancia_agua_cm);

      const result = await pool.query(
        `
        INSERT INTO sensor_reading
        (
          temperatura,
          umidade,
          chuva,
          nivel_chuva_raw,
          distancia_agua_cm
        )
        VALUES
        (
          $1,
          $2,
          $3,
          $4,
          $5
        )
        RETURNING *
        `,
        [
          temperatura,
          umidade,
          chuva,
          nivel_chuva_raw,
          distancia_agua_cm
        ]
      )

    if(chuva && risk && (getCurrentTime() - delay) > 600){
        const channelLevelPercent = Math.trunc(100 - (distancia_agua_cm * 100)/200);
        const rainIntensityPercent = Math.trunc((nivel_chuva_raw * 100)/1024);
        await sendTelegramMessage(
            `🚨 ${risk}

    🌧️ Chuva detectada

    📏 Nível do Canal: ${channelLevelPercent}%

    💧 Intensidade da chuva: ${rainIntensityPercent}%

    🕒 Horário: ${new Date().toLocaleString("pt-BR", {timeZone: "UTC"})}

    `
        )

        delay = getCurrentTime();
        
    }

    return {
    success: true,
    data: 'Dados Cadastrados com Sucesso'
    }
  }
)

  fastify.get(
    '/api/sensor-data',
    async (request, reply) =>{
      //"SELECT temperatura, umidade, chuva,nivel_chuva_raw, distancia_agua_cm, created_at FROM sensor_reading WHERE created_at >= NOW() - interval '1 hours' ORDER BY created_at ASC;"
        const result = pool.query("SELECT temperatura, umidade, chuva,nivel_chuva_raw, distancia_agua_cm, created_at FROM sensor_reading ORDER BY created_at desc LIMIT 1;")

        return {
            success: true,
            data: (await result).rows
        }
    }
  )

  fastify.get(
  "/api/test-telegram",
  async () => {

    await sendTelegramMessage(
      "🚨 Teste do sistema ChuvaWare"
    )

    return {
      success: true,
      message: "Mensagem enviada"
    }
  }
)
}

module.exports = sensorRoutes