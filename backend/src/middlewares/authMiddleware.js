const requireAuth = async (req, res, next) => {
  //const accessToken = req.cookies.azure_access_token;
  //const userInfo = req.cookies.azure_user_info;
  

/** 
  if (!accessToken || !userInfo) {
    return res.status(401).json({ 
      error: 'No autenticado',
      message: 'Debes iniciar sesión para acceder a este recurso'
    });
  } */
  
  try {
    //Comento esta info del parseo del user
    //req.user = JSON.parse(userInfo);
    //next();

     // Usuario simulado para entorno local
      req.user = {
        id: 1,
        nombre: "Dev Local",
        email: "dev@local"
      }
      next()

  } catch (error) {
    console.error('Error en autenticación:', error);
    return res.status(401).json({ 
      error: 'Error de autenticación',
      message: 'Error verificando la sesión',
      code: 'AUTH_ERROR'
    });
  }
}; 

module.exports = { requireAuth };
