const axios = require('axios');
require('dotenv').config();

/**
 * Obtiene un access token de aplicación usando el flujo de credenciales de cliente
 * Este método es necesario para acceder a Microsoft Graph con permisos de aplicación
 * 
 * @returns {Promise<string>} Access token de aplicación
 */
async function getApplicationAccessToken() {
  try {
    const tenantId = process.env.AD_TENANT_ID;
    const clientId = process.env.AD_CLIENT_ID;
    const clientSecret = process.env.AD_CLIENT_SECRET;

    if (!tenantId || !clientId || !clientSecret) {
      throw new Error('Faltan variables de entorno requeridas: AD_TENANT_ID, AD_CLIENT_ID, AD_CLIENT_SECRET');
    }

    const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
    
    const tokenData = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      scope: 'https://graph.microsoft.com/.default',
      grant_type: 'client_credentials'
    });

    const response = await axios.post(tokenUrl, tokenData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    return response.data.access_token;
  } catch (error) {
    console.error('Error obteniendo token de aplicación:', error);
    throw new Error(`Error de autenticación: ${error.message}`);
  }
}

/**
 * Obtiene el access token del usuario desde las cookies
 * 
 * @param {Object} req - Request object
 * @returns {string} Access token del usuario
 */
function getUserAccessToken(req) {
  const accessToken = req.cookies.azure_access_token;
  
  if (!accessToken) {
    throw new Error('No se encontró el access token del usuario en las cookies');
  }
  
  return accessToken;
}

/**
 * GET /api/ms-graph/group-users
 * Obtiene la lista de usuarios de un grupo específico de Azure AD
 * Usa autenticación de aplicación (client credentials) para acceder a Microsoft Graph
 * 
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const getGroupUsers = async (req, res) => {
  try {
    const groupId = process.env.RESPONSIBLES_GROUP_ID;
    
    if (!groupId) {
      return res.status(400).json({
        success: false,
        message: 'RESPONSIBLES_GROUP_ID no está configurado en las variables de entorno'
      });
    }

    // Obtener token de aplicación usando client credentials
    const accessToken = await getApplicationAccessToken();
    
    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    };
    
    const graphUrl = `https://graph.microsoft.com/v1.0/groups/${groupId}/members`;
    
    const response = await axios.get(graphUrl, { headers });
    
    const users = response.data.value.map(user => ({
      id: user.id,
      displayName: user.displayName,
      mail: user.mail,
    }));

    res.json({
      success: true,
      data: {
        groupId: groupId,
        totalUsers: users.length,
        users: users
      },
      message: `Se encontraron ${users.length} usuarios en el grupo`
    });

  } catch (error) {
    console.error('Error obteniendo usuarios del grupo:', error);
    
    if (error.response) {
      const statusCode = error.response.status;
      const errorMessage = error.response.data?.error?.message || 'Error desconocido de Microsoft Graph';
      
      console.error('Detalles del error de Graph API:', {
        status: statusCode,
        data: error.response.data
      });
      
      return res.status(statusCode).json({
        success: false,
        message: `Error de Microsoft Graph: ${errorMessage}`,
        error: error.response.data
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener usuarios del grupo',
      error: error.message
    });
  }
};

/**
 * GET /api/ms-graph/group-users-detailed
 * Obtiene la lista detallada de usuarios de un grupo específico de Azure AD
 * Filtra solo usuarios (no grupos) y obtiene información completa
 * 
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const getGroupUsersDetailed = async (req, res) => {
  try {
    const groupId = process.env.RESPONSIBLES_GROUP_ID;
    
    if (!groupId) {
      return res.status(400).json({
        success: false,
        message: 'RESPONSIBLES_GROUP_ID no está configurado en las variables de entorno'
      });
    }

    // Obtener token de aplicación usando client credentials
    const accessToken = await getApplicationAccessToken();
    
    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    };
    
    // Usar el endpoint que filtra solo usuarios
    const graphUrl = `https://graph.microsoft.com/v1.0/groups/${groupId}/members/microsoft.graph.user`;
    
    const response = await axios.get(graphUrl, { headers });
    
    const users = response.data.value.map(user => ({
      id: user.id,
      displayName: user.displayName,
      mail: user.mail,
      userPrincipalName: user.userPrincipalName,
      givenName: user.givenName,
      surname: user.surname,
      jobTitle: user.jobTitle,
      department: user.department,
      companyName: user.companyName
    }));

    res.json({
      success: true,
      data: {
        groupId: groupId,
        totalUsers: users.length,
        users: users
      },
      message: `Se encontraron ${users.length} usuarios en el grupo`
    });

  } catch (error) {
    console.error('Error obteniendo usuarios detallados del grupo:', error);
    
    if (error.response) {
      const statusCode = error.response.status;
      const errorMessage = error.response.data?.error?.message || 'Error desconocido de Microsoft Graph';
      
      console.error('Detalles del error de Graph API:', {
        status: statusCode,
        data: error.response.data
      });
      
      return res.status(statusCode).json({
        success: false,
        message: `Error de Microsoft Graph: ${errorMessage}`,
        error: error.response.data
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener usuarios detallados del grupo',
      error: error.message
    });
  }
};

module.exports = {
  getGroupUsers,
  getGroupUsersDetailed,
  getApplicationAccessToken
};
