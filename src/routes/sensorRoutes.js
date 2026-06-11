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
        chuva,
        nivel_chuva_raw,
        distancia_agua_cm
      } = request.body

      const risk = getRiskLevel(distancia_agua_cm);

      console.log(risk);

      const result = await pool.query(
        `
        INSERT INTO sensor_reading
        (
          chuva,
          nivel_chuva_raw,
          distancia_agua_cm
        )
        VALUES
        (
          $1,
          $2,
          $3
        )
        RETURNING *
        `,
        [
          chuva,
          nivel_chuva_raw,
          distancia_agua_cm
        ]
      )

    if(chuva && risk && (getCurrentTime() - delay) > 600){
        const channelLevelPercent = Math.trunc(100 - (distancia_agua_cm * 100)/200);
        const rainIntensityPercent = Math.trunc((nivel_chuva_raw * 100)/1024);
        const date = new Date(); // The absolute point in time

        const formatter = new Intl.DateTimeFormat('pt-br', {
          timeZone: 'America/Sao_Paulo', // Target IANA time zone
          dateStyle: 'short',            // Options: 'full', 'long', 'medium', 'short'
          timeStyle: 'medium'             // Options: 'full', 'long', 'medium', 'short'
        });
        
        await sendTelegramMessage(
            `🚨 ${risk}

    🌧️ Chuva detectada

    📏 Nível do Canal: ${channelLevelPercent}%

    💧 Intensidade da chuva: ${rainIntensityPercent}%

    🕒 Horário: ${formatter.format(date)}

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
        const result = pool.query("SELECT chuva,nivel_chuva_raw, distancia_agua_cm, created_at FROM sensor_reading ORDER BY created_at desc LIMIT 1;")

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