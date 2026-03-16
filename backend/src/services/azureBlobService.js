const path = require("path");
const fs = require("fs");

const uploadFile = async (file) => {
  const uploadPath = path.join(__dirname, "../../uploads");

  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath);
  }

  const filePath = path.join(uploadPath, file.originalname);

  fs.writeFileSync(filePath, file.buffer);

  return {
    message: "Archivo guardado localmente",
    filePath
  };
};

module.exports = {
  uploadFile
};


//const { blobServiceClient, containerName } = require('../config/azureConfig');
//const { v4: uuidv4 } = require('uuid');
//const path = require('path');
//const { BlobSASPermissions, generateBlobSASQueryParameters, StorageSharedKeyCredential } = require('@azure/storage-blob');

/**
 * Servicio para manejo de archivos en Azure Blob Storage
 * 
 * Este servicio proporciona funcionalidades para:
 * - Subir archivos al contenedor de Azure Blob Storage
 * - Obtener URLs de descarga de archivos
 * - Eliminar archivos del contenedor
 * - Listar archivos del contenedor
 * - Generar nombres únicos para evitar conflictos
 */

/**
 * 

class AzureBlobService {
  constructor() {
    this.containerClient = blobServiceClient.getContainerClient(containerName);
  }
     */

  /**
   * Inicializa el contenedor si no existe
  
  async initializeContainer() {
    try {
      const exists = await this.containerClient.exists();
      if (!exists) {
        await this.containerClient.create({
          access: 'blob' // Permite acceso público de lectura a los blobs
        });
        console.log(`Contenedor '${containerName}' creado exitosamente`);
      }
    } catch (error) {
      console.error('Error al inicializar contenedor:', error);
      throw error;
    }
  }  */

  /**
   * Genera un nombre único para el archivo
   * @param {string} originalName - Nombre original del archivo
   * @param {string} prefix - Prefijo opcional para organizar archivos
   * @returns {string} - Nombre único del archivo
   */

  /**
   * 
 
  generateUniqueFileName(originalName, prefix = '') {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const uuid = uuidv4().substring(0, 8);
    const extension = path.extname(originalName);
    const baseName = path.basename(originalName, extension);
    
    // Sanitizar el nombre base para Azure (eliminar acentos y caracteres especiales)
    const sanitizedBaseName = baseName
      .normalize('NFD') // Descomponer caracteres acentuados
      .replace(/[\u0300-\u036f]/g, '') // Eliminar marcas diacríticas
      .replace(/[^\w\s.-]/g, '_') // Reemplazar caracteres especiales
      .replace(/\s+/g, '_') // Reemplazar espacios con guiones bajos
      .substring(0, 50); // Limitar longitud
    
    const fileName = `${prefix}${sanitizedBaseName}_${timestamp}_${uuid}${extension}`;
    return fileName;
  }   */

  /**
   * Sanitiza los metadatos para Azure Blob Storage
   * Azure no permite ciertos caracteres en los metadatos
   * @param {string} value - Valor a sanitizar
   * @returns {string} - Valor sanitizado
   */
  /**
  sanitizeMetadata(value) {
    if (!value) return '';
    
    return value
      .replace(/[^\x20-\x7E]/g, '') // Eliminar caracteres no ASCII
      .replace(/[^\w\s.-]/g, '_') // Reemplazar caracteres especiales con guión bajo
      .substring(0, 1024); // Limitar longitud (límite de Azure)
  }
   */

  /**
   * Sube un archivo al contenedor de Azure Blob Storage
   * @param {Buffer} fileBuffer - Buffer del archivo
   * @param {string} fileName - Nombre del archivo
   * @param {string} contentType - Tipo de contenido del archivo
   * @param {string} prefix - Prefijo opcional para organizar archivos
   * @returns {Promise<Object>} - Información del archivo subido
   */
  /** 
  async uploadFile(fileBuffer, fileName, contentType, prefix = '') {
    try {
      await this.initializeContainer();
      
      const uniqueFileName = this.generateUniqueFileName(fileName, prefix);
      const blockBlobClient = this.containerClient.getBlockBlobClient(uniqueFileName);
      
      const uploadOptions = {
        blobHTTPHeaders: {
          blobContentType: contentType
        },
        metadata: {
          originalName: this.sanitizeMetadata(fileName),
          uploadedAt: new Date().toISOString()
        }
      };

      await blockBlobClient.upload(fileBuffer, fileBuffer.length, uploadOptions);
      
      const url = blockBlobClient.url;
      
      return {
        fileName: uniqueFileName,
        originalName: fileName,
        url: url,
        size: fileBuffer.length,
        contentType: contentType,
        uploadedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error al subir archivo:', error);
      throw error;
    }
  }
    */

  /**
   * Obtiene la URL de descarga de un archivo
   * @param {string} fileName - Nombre del archivo en el contenedor
   * @returns {string} - URL del archivo

  getFileUrl(fileName) {
    const blockBlobClient = this.containerClient.getBlockBlobClient(fileName);
    return blockBlobClient.url;
  }    */

  /**
   * Genera una URL firmada (SAS) para acceder a un archivo de forma segura
   * @param {string} fileName - Nombre del archivo en el contenedor
   * @param {number} expiresInMinutes - Minutos hasta que expire la URL (default: 60)
   * @returns {string} - URL firmada del archivo
   
  generateSignedUrl(fileName, expiresInMinutes = 60) {
    try {
      const blockBlobClient = this.containerClient.getBlockBlobClient(fileName);
      
      // Crear permisos de lectura
      const permissions = BlobSASPermissions.parse('r');
      
      // Fecha de expiración
      const expiresOn = new Date();
      expiresOn.setMinutes(expiresOn.getMinutes() + expiresInMinutes);
      
      // Generar parámetros SAS
      const sasOptions = {
        containerName: containerName,
        blobName: fileName,
        permissions: permissions,
        expiresOn: expiresOn
      };
      
      // Generar URL firmada
      const sasToken = generateBlobSASQueryParameters(sasOptions, blobServiceClient.credential).toString();
      const signedUrl = `${blockBlobClient.url}?${sasToken}`;
      
      return signedUrl;
    } catch (error) {
      console.error('Error al generar URL firmada:', error);
      throw error;
    }
  } */

  /**
   * Elimina un archivo del contenedor
   * @param {string} fileName - Nombre del archivo a eliminar
   * @returns {Promise<boolean>} - True si se eliminó exitosamente
   
  async deleteFile(fileName) {
    try {
      const blockBlobClient = this.containerClient.getBlockBlobClient(fileName);
      await blockBlobClient.delete();
      return true;
    } catch (error) {
      console.error('Error al eliminar archivo:', error);
      throw error;
    }
  } */

  /**
   * Verifica si un archivo existe en el contenedor
   * @param {string} fileName - Nombre del archivo
   * @returns {Promise<boolean>} - True si el archivo existe
   
  async fileExists(fileName) {
    try {
      const blockBlobClient = this.containerClient.getBlockBlobClient(fileName);
      return await blockBlobClient.exists();
    } catch (error) {
      console.error('Error al verificar existencia del archivo:', error);
      return false;
    }
  } */

  /**
   * Obtiene información de un archivo
   * @param {string} fileName - Nombre del archivo
   * @returns {Promise<Object>} - Información del archivo
  
  async getFileInfo(fileName) {
    try {
      const blockBlobClient = this.containerClient.getBlockBlobClient(fileName);
      const properties = await blockBlobClient.getProperties();
      
      return {
        fileName: fileName,
        url: blockBlobClient.url,
        size: properties.contentLength,
        contentType: properties.contentType,
        lastModified: properties.lastModified,
        metadata: properties.metadata
      };
    } catch (error) {
      console.error('Error al obtener información del archivo:', error);
      throw error;
    }
  }  */

  /**
   * Lista archivos en el contenedor con un prefijo específico
   * @param {string} prefix - Prefijo para filtrar archivos
   * @returns {Promise<Array>} - Lista de archivos
 
  async listFiles(prefix = '') {
    try {
      const files = [];
      const listOptions = prefix ? { prefix } : {};
      
      for await (const blob of this.containerClient.listBlobsFlat(listOptions)) {
        files.push({
          name: blob.name,
          url: this.getFileUrl(blob.name),
          size: blob.properties.contentLength,
          contentType: blob.properties.contentType,
          lastModified: blob.properties.lastModified,
          metadata: blob.metadata
        });
      }
      
      return files;
    } catch (error) {
      console.error('Error al listar archivos:', error);
      throw error;
    }
  }   */

  /**
   * Descarga un archivo desde Azure Blob Storage
   * @param {string} fileName - Nombre del archivo en el contenedor
   * @returns {Promise<Buffer>} - Buffer del archivo descargado
  
  async downloadFile(fileName) {
    try {
      const blockBlobClient = this.containerClient.getBlockBlobClient(fileName);
      const downloadResponse = await blockBlobClient.download();
      
      // Convertir el stream a buffer
      const chunks = [];
      for await (const chunk of downloadResponse.readableStreamBody) {
        chunks.push(chunk);
      }
      
      return Buffer.concat(chunks);
    } catch (error) {
      console.error('Error al descargar archivo:', error);
      throw error;
    }
  }
}

module.exports = new AzureBlobService();
 */