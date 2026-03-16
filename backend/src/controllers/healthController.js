const healthController = {
  getHealth: (req, res) => {
    res.json({
      status: "OK",
      message: "Servidor funcionando correctamente",
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  },
};

module.exports = healthController;
