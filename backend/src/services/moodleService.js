const axios = require('axios');

class MoodleService {
    constructor() {
        this.baseUrl = process.env.MOODLE_URL;
        this.token = process.env.MOODLE_TOKEN;
        this.apiUrl = `${this.baseUrl}/webservice/rest/server.php`;
    }

    /**
     * Genera el nombre de usuario de Moodle basado en el NIF
     * @param {string} nif - NIF completo con letra
     * @returns {string} - Nombre de usuario (NIF en minúsculas sin espacios)
     */
    generateUsername(nif) {
        if (!nif) throw new Error('NIF es requerido');
        return nif.toLowerCase().replace(/\s/g, '');
    }

    /**
     * Genera la contraseña de Moodle basada en el NIF
     * @param {string} nif - NIF completo con letra
     * @returns {string} - Contraseña generada
     */
    generatePassword(nif) {
        if (!nif) throw new Error('NIF es requerido');
        
        const numeros = nif.replace(/\D/g, '');
        const ultimasCifras = numeros.slice(-5);
        const letra = nif.replace(/\d/g, '').toUpperCase();
        return `${ultimasCifras}.${letra}${letra.toLowerCase()}`;
    }

    /**
     * Verifica si un usuario existe en Moodle
     * @param {string} username - Nombre de usuario
     * @returns {Promise<boolean>} - True si existe, false si no
     */
    async userExists(username) {
        try {
            const params = {
                wstoken: this.token,
                wsfunction: 'core_user_get_users_by_field',
                moodlewsrestformat: 'json',
                field: 'username',
                values: [username]
            };

            const response = await axios.get(this.apiUrl, { params });
            
            if (response.data && response.data.exception) {
                console.error('Error verificando usuario en Moodle:', response.data.errorcode, response.data.message);
                return false;
            }
            const users = Array.isArray(response.data) ? response.data : (response.data?.users || []);
            
            if (users && users.length > 0) {
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error verificando usuario en Moodle:', error.message);
            throw new Error('Error al verificar usuario en Moodle');
        }
    }

    /**
     * Crea un usuario en Moodle
     * @param {Object} userData - Datos del usuario
     * @returns {Promise<Object>} - Respuesta de Moodle
     */
    async createUser(userData) {
        try {
            const params = {
                wstoken: this.token,
                wsfunction: 'core_user_create_users',
                moodlewsrestformat: 'json',
                users: [{
                    username: userData.username,
                    password: userData.password,
                    firstname: userData.firstname,
                    lastname: userData.lastname,
                    email: userData.email || `${userData.username}@example.com`,
                    auth: 'manual',
                    createpassword: 0
                }]
            };

            const response = await axios.post(this.apiUrl, params, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });

            if (response.data && response.data.exception) {
                console.error('Error creando usuario en Moodle:', response.data.errorcode, response.data.message);
                throw new Error(`Error de Moodle: ${response.data.errorcode} - ${response.data.message}`);
            }
            
            if (response.data && response.data.length > 0 && response.data[0].id) {
                return {
                    success: true,
                    userId: response.data[0].id,
                    username: userData.username
                };
            }
            
            if (response.data && response.data.length > 0 && response.data[0].errorcode) {
                throw new Error(`Error de Moodle: ${response.data[0].errorcode} - ${response.data[0].message}`);
            }
            
            throw new Error('Error al crear usuario en Moodle - respuesta inesperada');
        } catch (error) {
            console.error('Error creando usuario en Moodle:', error.message);
            throw error;
        }
    }

    /**
     * Matricula un usuario en un curso de Moodle
     * @param {number} userId - ID del usuario en Moodle
     * @param {string} courseId - ID del curso en Moodle
     * @param {number} roleId - ID del rol (5 = estudiante por defecto)
     * @returns {Promise<Object>} - Respuesta de Moodle
     */
    async enrollUser(userId, courseId, roleId = 5) {
        try {
            const params = {
                wstoken: this.token,
                wsfunction: 'enrol_manual_enrol_users',
                moodlewsrestformat: 'json',
                enrolments: [{
                    roleid: roleId,
                    userid: userId,
                    courseid: courseId
                }]
            };

            const response = await axios.post(this.apiUrl, params, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });

            return {
                success: true,
                userId,
                courseId
            };
        } catch (error) {
            console.error('Error en enrol_manual_enrol_users:', error.response?.data || error.message);
            throw new Error('Error al matricular usuario en Moodle');
        }
    }

    /**
     * Obtiene información de un curso por ID
     * @param {string} courseId - ID del curso
     * @returns {Promise<Object>} - Información del curso
     */
    async getCourse(courseId) {
        try {
            const params = {
                wstoken: this.token,
                wsfunction: 'core_course_get_courses_by_field',
                moodlewsrestformat: 'json',
                field: 'id',
                value: courseId
            };

            const response = await axios.get(this.apiUrl, { params });
            
            if (response.data && response.data.courses && response.data.courses.length > 0) {
                return response.data.courses[0];
            }
            return null;
        } catch (error) {
            console.error('Error en core_course_get_courses_by_field:', error.response?.data || error.message);
            throw new Error('Error al obtener curso de Moodle');
        }
    }

    /**
     * Procesa la matriculación de un alumno en Moodle
     * @param {Object} alumno - Datos del alumno
     * @param {string} courseId - ID del curso en Moodle
     * @returns {Promise<Object>} - Resultado del proceso
     */
    async processStudentEnrollment(alumno, courseId) {
        const result = {
            alumnoId: alumno.id_alumno_grupo,
            personaId: alumno.id_persona,
            nombre: `${alumno.persona.nombre} ${alumno.persona.apellido1}`,
            documento: alumno.persona.documento,
            success: false,
            message: '',
            username: '',
            userId: null,
            action: ''
        };

        try {
            const username = this.generateUsername(alumno.persona.documento);
            const password = this.generatePassword(alumno.persona.documento);
            
            result.username = username;
            const userExists = await this.userExists(username);
            
            let userId;
            if (userExists) {
                const params = {
                    wstoken: this.token,
                    wsfunction: 'core_user_get_users_by_field',
                    moodlewsrestformat: 'json',
                    field: 'username',
                    values: [username]
                };
                
                const response = await axios.get(this.apiUrl, { params });
                const users = Array.isArray(response.data) ? response.data : (response.data?.users || []);
                userId = users[0].id;
                result.action = 'existing_user';
                result.message = 'Usuario ya existía en Moodle';
            } else {
                const userData = {
                    username,
                    password,
                    firstname: alumno.persona.nombre,
                    lastname: alumno.persona.apellido1,
                    email: alumno.persona.correoElectronico || `${username}@example.com`
                };
                
                const createResult = await this.createUser(userData);
                userId = createResult.userId;
                result.action = 'new_user';
                result.message = 'Usuario creado en Moodle';
            }

            result.userId = userId;

            await this.enrollUser(userId, courseId);
            result.success = true;
            result.message += ' y matriculado en el curso';

        } catch (error) {
            result.success = false;
            result.message = `Error: ${error.message}`;
        }

        return result;
    }
}

module.exports = new MoodleService();
