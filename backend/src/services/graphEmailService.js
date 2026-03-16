class GraphEmailService {
  async sendEmail(to, subject, body) {
    console.log("Email simulado:");
    console.log("Para:", to);
    console.log("Asunto:", subject);
    console.log("Contenido:", body);

    return {
      success: true,
      message: "Email simulado (no se envió realmente)"
    };
  }
}

module.exports = new GraphEmailService();


/** 
const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const { getApplicationAccessToken } = require('../controllers/msGraphController');

const prisma = new PrismaClient();

/**
 * Servicio para envío de emails a través de Microsoft Graph API
 * 
 * Este servicio proporciona funcionalidades para:
 * - Enviar emails con texto plano
 * - Enviar emails con HTML
 * - Enviar emails con adjuntos
 * - Validar direcciones de email
 * - Manejar errores de envío


class GraphEmailService {
  constructor() {
    // Usuario de Office 365 desde el cual se enviarán los emails
    // Variable de entorno obligatoria: GRAPH_SENDER_EMAIL
    if (!process.env.GRAPH_SENDER_EMAIL) {
      throw new Error(
        'GRAPH_SENDER_EMAIL es obligatoria y no está configurada. ' +
        'Por favor, configura esta variable de entorno con el email remitente para Microsoft Graph API.'
      );
    }
    
    this.senderEmail = process.env.GRAPH_SENDER_EMAIL;
  }

  /**
   * Valida una dirección de email
   * @param {string} email - Dirección de email a validar
   * @returns {boolean} - True si el email es válido

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Obtiene el token de acceso para Microsoft Graph API
   * @returns {Promise<string>} - Access token
  
  async getAccessToken() {
    return await getApplicationAccessToken();
  }

  /**
   * Envía un email simple (solo texto)
   * @param {string} to - Dirección de email del destinatario
   * @param {string} subject - Asunto del email
   * @param {string} textContent - Contenido en texto plano
   * @param {Object} options - Opciones adicionales para el registro
   * @returns {Promise<Object>} - Resultado del envío
  
  async sendSimpleEmail(to, subject, textContent, options = {}) {
    let emailLog = null;
    
    try {
      // Validar email del destinatario
      if (!this.isValidEmail(to)) {
        throw new Error('Dirección de email del destinatario inválida');
      }

      // Crear registro inicial en la base de datos
      emailLog = await prisma.emailLogs.create({
        data: {
          id_grupo: options.idGrupo || null,
          id_persona: options.idPersona || null,
          tipo_envio: options.tipoEnvio || 'general',
          enviado: false
        }
      });

      // Obtener token de acceso
      const accessToken = await this.getAccessToken();

      // Construir el mensaje
      const message = {
        message: {
          subject: subject,
          body: {
            contentType: 'Text',
            content: textContent
          },
          toRecipients: [
            {
              emailAddress: {
                address: to
              }
            }
          ]
        },
        saveToSentItems: true
      };

      // Enviar email usando Microsoft Graph API
      const graphUrl = `https://graph.microsoft.com/v1.0/users/${this.senderEmail}/sendMail`;
      
      const startTime = Date.now();
      await axios.post(graphUrl, message, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      const endTime = Date.now();

      // Actualizar el registro con el resultado exitoso
      await prisma.emailLogs.update({
        where: { id_email_log: emailLog.id_email_log },
        data: {
          enviado: true,
          fecha_envio: new Date()
        }
      });

      return {
        success: true,
        messageId: `graph-${emailLog.id_email_log}`,
        status: 'sent',
        sentAt: new Date().toISOString(),
        emailLogId: emailLog.id_email_log,
        responseTime: `${endTime - startTime}ms`
      };

    } catch (error) {
      console.error('Error al enviar email simple con Graph API:', error);
      
      // Actualizar el registro con el error si existe
      if (emailLog) {
        await prisma.emailLogs.update({
          where: { id_email_log: emailLog.id_email_log },
          data: {
            enviado: false,
            fecha_envio: new Date()
          }
        });
      }
      
      throw error;
    }
  }

  /**
   * Envía un email con HTML personalizado
   * @param {string} to - Dirección de email del destinatario
   * @param {string} subject - Asunto del email
   * @param {string} textContent - Contenido en texto plano (fallback)
   * @param {string} htmlContent - Contenido HTML
   * @param {Object} options - Opciones adicionales para el registro
   * @returns {Promise<Object>} - Resultado del envío
  
  async sendEmailWithHTML(to, subject, textContent, htmlContent, options = {}) {
    let emailLog = null;
    
    try {
      // Validar email del destinatario
      if (!this.isValidEmail(to)) {
        throw new Error('Dirección de email del destinatario inválida');
      }

      // Crear registro inicial en la base de datos
      emailLog = await prisma.emailLogs.create({
        data: {
          id_grupo: options.idGrupo || null,
          id_persona: options.idPersona || null,
          tipo_envio: options.tipoEnvio || 'general',
          enviado: false
        }
      });

      // Obtener token de acceso
      const accessToken = await this.getAccessToken();

      // Construir el mensaje con HTML
      const message = {
        message: {
          subject: subject,
          body: {
            contentType: 'HTML',
            content: htmlContent
          },
          toRecipients: [
            {
              emailAddress: {
                address: to
              }
            }
          ]
        },
        saveToSentItems: true
      };

      // Enviar email usando Microsoft Graph API
      const graphUrl = `https://graph.microsoft.com/v1.0/users/${this.senderEmail}/sendMail`;
      
      const startTime = Date.now();
      await axios.post(graphUrl, message, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      const endTime = Date.now();

      // Actualizar el registro con el resultado exitoso
      await prisma.emailLogs.update({
        where: { id_email_log: emailLog.id_email_log },
        data: {
          enviado: true,
          fecha_envio: new Date()
        }
      });

      return {
        success: true,
        messageId: `graph-${emailLog.id_email_log}`,
        status: 'sent',
        sentAt: new Date().toISOString(),
        emailLogId: emailLog.id_email_log,
        responseTime: `${endTime - startTime}ms`
      };

    } catch (error) {
      console.error('Error al enviar email con HTML usando Graph API:', error);
      
      // Actualizar el registro con el error si existe
      if (emailLog) {
        await prisma.emailLogs.update({
          where: { id_email_log: emailLog.id_email_log },
          data: {
            enviado: false,
            fecha_envio: new Date()
          }
        });
      }
      
      throw error;
    }
  }

  /**
   * Envía un email con adjuntos usando Microsoft Graph API
   * @param {string} to - Dirección de email del destinatario
   * @param {string} subject - Asunto del email
   * @param {string} textContent - Contenido en texto plano
   * @param {Array} attachments - Array de adjuntos con {name, contentType, contentInBase64}
   * @param {string} htmlContent - Contenido HTML (opcional)
   * @param {Object} options - Opciones adicionales para el registro
   * @returns {Promise<Object>} - Resultado del envío

  async sendEmailWithAttachmentsSDK(to, subject, textContent, attachments = [], htmlContent = null, options = {}) {
    let emailLog = null;
    
    try {
      // Validar email del destinatario
      if (!this.isValidEmail(to)) {
        throw new Error('Dirección de email del destinatario inválida');
      }

      // Crear registro inicial en la base de datos
      emailLog = await prisma.emailLogs.create({
        data: {
          id_grupo: options.idGrupo || null,
          id_persona: options.idPersona || null,
          tipo_envio: options.tipoEnvio || 'general',
          enviado: false
        }
      });

      // Obtener token de acceso
      const accessToken = await this.getAccessToken();

      // Construir el mensaje con adjuntos
      const message = {
        message: {
          subject: subject,
          body: {
            contentType: htmlContent ? 'HTML' : 'Text',
            content: htmlContent || textContent
          },
          toRecipients: [
            {
              emailAddress: {
                address: to
              }
            }
          ],
          attachments: []
        },
        saveToSentItems: true
      };

      // Añadir adjuntos si existen
      if (attachments && attachments.length > 0) {
        message.message.attachments = attachments.map(attachment => ({
          '@odata.type': '#microsoft.graph.fileAttachment',
          name: attachment.name,
          contentType: attachment.contentType,
          contentBytes: attachment.contentInBase64
        }));
      }

      // Enviar email usando Microsoft Graph API
      const graphUrl = `https://graph.microsoft.com/v1.0/users/${this.senderEmail}/sendMail`;
      
      const startTime = Date.now();
      await axios.post(graphUrl, message, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      const endTime = Date.now();

      // Actualizar el registro con el resultado exitoso
      await prisma.emailLogs.update({
        where: { id_email_log: emailLog.id_email_log },
        data: {
          enviado: true,
          fecha_envio: new Date()
        }
      });

      return {
        success: true,
        messageId: `graph-${emailLog.id_email_log}`,
        status: 'sent',
        sentAt: new Date().toISOString(),
        emailLogId: emailLog.id_email_log,
        attachments: attachments.length,
        responseTime: `${endTime - startTime}ms`
      };

    } catch (error) {
      console.error('Error al enviar email con adjuntos usando Graph API:', error);
      
      // Actualizar el registro con el error si existe
      if (emailLog) {
        await prisma.emailLogs.update({
          where: { id_email_log: emailLog.id_email_log },
          data: {
            enviado: false,
            fecha_envio: new Date()
          }
        });
      }
      
      throw error;
    }
  }
  */

  /**
   * Envía un email con adjuntos (método legacy para compatibilidad)
   * @param {string} to - Dirección de email del destinatario
   * @param {string} subject - Asunto del email
   * @param {string} textContent - Contenido en texto plano
   * @param {Array} attachments - Array de adjuntos
   * @param {Object} options - Opciones adicionales para el registro
   * @returns {Promise<Object>} - Resultado del envío

  async sendEmailWithAttachments(to, subject, textContent, attachments = [], options = {}) {
    // Procesar adjuntos y crear contenido HTML
    let htmlContent = textContent.replace(/\n/g, '<br>');
    
    if (attachments.length > 0) {
      htmlContent += '<br><br><h3>Archivos adjuntos:</h3><ul>';
      
      for (const attachment of attachments) {
        if (attachment.url) {
          htmlContent += `<li><a href="${attachment.url}" target="_blank">${attachment.name}</a></li>`;
        }
      }
      
      htmlContent += '</ul>';
    }

    // Usar el método de envío con HTML
    return await this.sendEmailWithHTML(to, subject, textContent, htmlContent, options);
  }
}
*/

//module.exports = new GraphEmailService();
