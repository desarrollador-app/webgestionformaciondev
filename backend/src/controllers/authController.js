exports.login = (req, res) => {
  res.json({
    message: "Login simulado (sin Azure)",
    user: {
      id: "local-user",
      name: "Usuario Local",
      email: "local@test.com"
    }
  });
};

exports.callback = (req, res) => {
  res.json({
    message: "Callback simulado"
  });
};


/**
 * const { msalInstance, authCodeUrlParameters, tokenRequest } = require('../config/azureConfig');
*/

/**
 * 
 *

const getAuthUrl = async (req, res) => {
  try {
    const authUrl = await msalInstance.getAuthCodeUrl(authCodeUrlParameters);
    res.json({ authUrl });
  } catch (error) {
    console.error('Error generando URL de autenticación:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const handleCallback = async (req, res) => {
  try {
    const { code } = req.query;
    
    if (!code) {
      console.error('No se encontró código de autorización');
      return res.status(400).json({ error: 'Código de autorización no encontrado' });
    }

    const tokenResponse = await msalInstance.acquireTokenByCode({
      ...tokenRequest,
      code: code,
    });

    const userInfo = {
      id: tokenResponse.account.localAccountId,
      name: tokenResponse.account.name,
      email: tokenResponse.account.username,
      tenantId: tokenResponse.account.tenantId
    };

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', 
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax', 
      maxAge: 24 * 60 * 60 * 1000, // 24 horas
      domain: process.env.NODE_ENV === 'production' ? undefined : 'localhost', 
      path: '/' 
    };

    res.cookie('azure_access_token', tokenResponse.accessToken, cookieOptions);
    res.cookie('azure_id_token', tokenResponse.idToken, cookieOptions);
    res.cookie('azure_user_info', JSON.stringify(userInfo), cookieOptions);

    const redirectTarget = process.env.POST_LOGIN_REDIRECT || process.env.FRONTEND_URL || '/';

    if (redirectTarget) {
      return res.redirect(redirectTarget);
    }

    res.json({
      success: true,
      message: 'Autenticación exitosa',
      user: userInfo,
      accessToken: tokenResponse.accessToken,
      idToken: tokenResponse.idToken
    });

  } catch (error) {
    console.error('Error en callback de autenticación:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};


const logout = (req, res) => {
  try {
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      domain: process.env.NODE_ENV === 'production' ? undefined : 'localhost',
      path: '/'
    };

    res.clearCookie('azure_access_token', cookieOptions);
    res.clearCookie('azure_id_token', cookieOptions);
    res.clearCookie('azure_user_info', cookieOptions);

    const tenantId = process.env.AD_TENANT_ID;
    const frontendUrl = process.env.FRONTEND_URL;
    const logoutUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/logout?post_logout_redirect_uri=${encodeURIComponent(frontendUrl)}`;
    
    res.json({ logoutUrl });
  } catch (error) {
    console.error('Error cerrando sesión:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const checkAuth = (req, res) => {
  try {
    const accessToken = req.cookies.azure_access_token;
    const userInfo = req.cookies.azure_user_info; 
    if (!accessToken || !userInfo) {
      console.error('El usuario no está autenticado');
      return res.status(401).json({ authenticated: false });
    }

    res.json({ 
      authenticated: true,
      user: JSON.parse(userInfo)
    });
  } catch (error) {
    console.error('Error verificando autenticación:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};


module.exports = {
  getAuthUrl,
  handleCallback,
  logout,
  checkAuth
};


 */
