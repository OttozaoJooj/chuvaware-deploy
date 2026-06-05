function getRiskLevel(distancia) {

  if (distancia <= 20) {
    return "EMERGÊNCIA"
  }

  if (distancia <= 50) {
    return "RISCO ALTO"
  }
}

module.exports = {
  getRiskLevel
}