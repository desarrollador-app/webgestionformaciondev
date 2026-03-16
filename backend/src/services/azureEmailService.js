const { emailClient, senderEmail } = require('../config/azureConfig');
const { PrismaClient } = require('@prisma/client');
const axios = require('axios');

const prisma = new PrismaClient();

/**
 * Servicio para envío de emails a través de Azure Communication Services
 * 
 * Este servicio proporciona funcionalidades básicas para:
 * - Enviar emails con texto plano
 * - Validar direcciones de email
 * - Manejar errores de envío
 */

class AzureEmailService {
  constructor() {
    this.senderEmail = senderEmail;
  }

  /**
   * Valida una dirección de email
   * @param {string} email - Dirección de email a validar
   * @returns {boolean} - True si el email es válido
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Envía un email simple (solo texto)
   * @param {string} to - Dirección de email del destinatario
   * @param {string} subject - Asunto del email
   * @param {string} textContent - Contenido en texto plano
   * @param {Object} options - Opciones adicionales para el registro
   * @param {number} options.idGrupo - ID del grupo (opcional)
   * @param {number} options.idPersona - ID de la persona (opcional)
   * @param {string} options.tipoEnvio - Tipo de envío (bienvenida, diploma, etc.)
   * @param {string} options.enviadoPor - Azure ID del usuario que envía
   * @returns {Promise<Object>} - Resultado del envío
   */
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

      const message = {
        senderAddress: this.senderEmail,
        content: {
          subject: subject,
          plainText: textContent
        },
        recipients: {
          to: [{ address: to }]
        }
      };

      const poller = await emailClient.beginSend(message);
      const result = await poller.pollUntilDone();

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
        messageId: result.id,
        status: result.status,
        sentAt: new Date().toISOString(),
        emailLogId: emailLog.id_email_log
      };

    } catch (error) {
      console.error('Error al enviar email simple:', error);
      
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
   * Envía un email con adjuntos
   * @param {string} to - Dirección de email del destinatario
   * @param {string} subject - Asunto del email
   * @param {string} textContent - Contenido en texto plano
   * @param {Array} attachments - Array de adjuntos
   * @param {Object} options - Opciones adicionales para el registro
   * @returns {Promise<Object>} - Resultado del envío
   */
  async sendEmailWithAttachments(to, subject, textContent, attachments = [], options = {}) {
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

      const message = {
        senderAddress: this.senderEmail,
        content: {
          subject: subject,
          plainText: textContent,
          html: htmlContent
        },
        recipients: {
          to: [{ address: to }]
        }
      };

      const poller = await emailClient.beginSend(message);
      const result = await poller.pollUntilDone();

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
        messageId: result.id,
        status: result.status,
        sentAt: new Date().toISOString(),
        emailLogId: emailLog.id_email_log,
        attachments: attachments.length
      };

    } catch (error) {
      console.error('Error al enviar email con adjuntos:', error);
      
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
   * @param {string} textContent - Contenido en texto plano
   * @param {string} htmlContent - Contenido HTML
   * @param {Object} options - Opciones adicionales para el registro
   * @returns {Promise<Object>} - Resultado del envío
   */
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

      const message = {
        senderAddress: this.senderEmail,
        content: {
          subject: subject,
          plainText: textContent,
          html: htmlContent
        },
        recipients: {
          to: [{ address: to }]
        }
      };

      const poller = await emailClient.beginSend(message);
      const result = await poller.pollUntilDone();

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
        messageId: result.id,
        status: result.status,
        sentAt: new Date().toISOString(),
        emailLogId: emailLog.id_email_log
      };

    } catch (error) {
      console.error('Error al enviar email con HTML:', error);
      
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
   * Envía un email con adjuntos usando el SDK de Azure Communication Services
   * @param {string} to - Dirección de email del destinatario
   * @param {string} subject - Asunto del email
   * @param {string} textContent - Contenido en texto plano
   * @param {Array} attachments - Array de adjuntos con {name, contentType, contentInBase64}
   * @param {string} htmlContent - Contenido HTML (opcional)
   * @param {Object} options - Opciones adicionales para el registro
   * @returns {Promise<Object>} - Resultado del envío
   */
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

      // Crear el mensaje de email con adjuntos usando la estructura correcta
      const emailMessage = {
        senderAddress: this.senderEmail,
        content: {
          subject: subject,
          plainText: textContent
        },
        recipients: {
          to: [{ address: to }]
        }
      };

      // Añadir HTML si está disponible
      if (htmlContent) {
        emailMessage.content.html = htmlContent;
      }

      // Añadir adjuntos si existen
      if (attachments.length > 0) {
        emailMessage.attachments = attachments;
      }

      // Enviar email usando el SDK de Azure Communication Services
      const poller = await emailClient.beginSend(emailMessage);
      const result = await poller.pollUntilDone();

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
        messageId: result.id,
        status: result.status,
        sentAt: new Date().toISOString(),
        emailLogId: emailLog.id_email_log,
        attachments: attachments.length
      };

    } catch (error) {
      console.error('Error al enviar email con adjuntos (SDK):', error);
      
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
}

module.exports = new AzureEmailService();
