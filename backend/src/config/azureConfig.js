let cca = null;

if (process.env.NODE_ENV === "production") {
  const { ConfidentialClientApplication } = require("@azure/msal-node");

  const config = {
    auth: {
      clientId: process.env.AZURE_CLIENT_ID,
      authority: process.env.AZURE_AUTHORITY,
      clientSecret: process.env.AZURE_CLIENT_SECRET,
    },
  };

  cca = new ConfidentialClientApplication(config);
}

module.exports = cca;


/** 
const { ConfidentialClientApplication } = require('@azure/msal-node');
const { BlobServiceClient } = require('@azure/storage-blob');
const { EmailClient } = require('@azure/communication-email');
require('dotenv').config();
*/

/**
 * Configuración de Azure AD para autenticación con Microsoft Identity Platform
 * 
 * Este archivo configura y exporta:
 * - msalInstance: Instancia de MSAL para manejar la autenticación
 * - authCodeUrlParameters: Parámetros para generar URL de autorización
 * - tokenRequest: Configuración para intercambiar código por token
 * 
 * Funcionalidades:
 * - Configuración de cliente confidencial con clientId, clientSecret y tenantId
 * - Configuración de scopes para acceso a datos del usuario (User.Read, openid, profile, email)
 * - URI de redirección dinámico basado en FRONTEND_URL para desarrollo y producción
 * - Configuración de logging para debugging (sin PII)
 * - Parámetros de respuesta para flujo de autorización con código
 

const msalConfig = {
  auth: {
    clientId: process.env.AD_CLIENT_ID,
    clientSecret: process.env.AD_CLIENT_SECRET,
    authority: `https://login.microsoftonline.com/${process.env.AD_TENANT_ID}`,
  },
  system: {
    loggerOptions: {
      loggerCallback(loglevel, message, containsPii) {
        console.log(message);
      },
      piiLoggingEnabled: false,
      logLevel: 'Info',
    }
  }
};

const msalInstance = new ConfidentialClientApplication(msalConfig);

const redirectUri = process.env.AD_REDIRECT_URI || `${process.env.FRONTEND_URL}/.auth/login/aad/callback`;
const authCodeUrlParameters = {
  scopes: ['User.Read', 'openid', 'profile', 'email'],
  redirectUri: redirectUri,
  responseMode: 'query',
  responseType: 'code',
  prompt: 'select_account'
};

const tokenRequest = {
  scopes: ['User.Read', 'openid', 'profile', 'email'],
  redirectUri: redirectUri,
};

// Configuración para Microsoft Graph API con permisos de grupos
const graphScopes = ['https://graph.microsoft.com/.default'];

/**
 * Configuración de Azure Blob Storage
 * 
 * Este archivo también configura y exporta:
 * - blobServiceClient: Cliente para interactuar con Azure Blob Storage
 * - containerName: Nombre del contenedor de archivos
 * 
 * Funcionalidades:
 * - Configuración de cliente de Blob Storage usando connection string
 * - Configuración del contenedor 'files' para almacenar documentos
 * - Configuración de permisos y políticas de acceso
 */

/**  Configuración de Azure Blob Storage
const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING || 
  'DefaultEndpointsProtocol=https;AccountName=stagestionformacionesdev;AccountKey=rUuFxphaZJtKs6MSVj5sLkhr0by+rafylFx5VSvlbKTQs2F7/3t4bGGZrvs6e75STfZIFVZE0R/b+AStvbY8cg==;EndpointSuffix=core.windows.net';

const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);

const containerName = 'files';
*/
/**
 * Configuración de Azure Communication Services para envío de emails
 * 
 * Este archivo también configura y exporta:
 * - emailClient: Cliente para interactuar con Azure Communication Services Email
 * - senderEmail: Dirección de correo electrónico del remitente
 * 
 * Funcionalidades:
 * - Configuración de cliente de Email usando connection string
 * - Configuración del remitente para envío de correos electrónicos

// Configuración de Azure Communication Services Email
const emailConnectionString = process.env.AZURE_COMMUNICATION_CONNECTION_STRING || 
  'endpoint=https://your-communication-service.communication.azure.com/;accesskey=your-access-key';

// Verificar si la cadena de conexión está configurada
if (!process.env.AZURE_COMMUNICATION_CONNECTION_STRING) {
  console.warn('AZURE_COMMUNICATION_CONNECTION_STRING no está configurada. Usando valor por defecto.');
}

const emailClient = new EmailClient(emailConnectionString);

// Usar el dominio de Azure Communication Services
// Reemplaza con el dominio exacto de tu Email Communication Service
const senderEmail = 'DoNotReply@f776cb2e-ddd7-4c10-9b39-2f74bb3e1aa2.azurecomm.net';

module.exports = {
  msalInstance,
  authCodeUrlParameters,
  tokenRequest,
  graphScopes,
  blobServiceClient,
  containerName,
  emailClient,
  senderEmail
};
*/