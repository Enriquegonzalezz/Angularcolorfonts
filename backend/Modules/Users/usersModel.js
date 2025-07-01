require('dotenv/config');
const { Op } = require('sequelize');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { SALT_ROUNDS, SECRET_JWT_KEY } = require("../../config");
const { Usuarios, Cabellos, Direcciones, InformacionBancaria, InformacionCompania, Criptomonedas } = require('../../db/schema');

class UsersModel {
    static async updateUser(id, userData) {
        try {
            console.log("🔄 Iniciando updateUser para ID:", id);
            console.log("📋 Datos recibidos:", JSON.stringify(userData, null, 2));
            
            const usuario = await Usuarios.findByPk(id);
            if (!usuario) {
                throw new Error("Usuario no encontrado.");
            }

            // Actualizar datos básicos del usuario (excluyendo campos únicos)
            if (userData.firstName) usuario.first_name = userData.firstName;
            if (userData.lastName) usuario.last_name = userData.lastName;
            if (userData.maidenName) usuario.maiden_name = userData.maidenName;
            if (userData.age) usuario.age = userData.age;
            if (userData.gender) {
                // Mapear valores en español a inglés para compatibilidad
                const genderMap = {
                    'masculino': 'male',
                    'femenino': 'female',
                    'otro': 'other'
                };
                usuario.gender = genderMap[userData.gender] || userData.gender;
            }
            // NO actualizar email ni username para evitar conflictos de unicidad
            // Estos campos son únicos y no deberían cambiarse durante una actualización
            // Si se necesita cambiar email/username, debería ser un proceso separado
            // if (userData.email) usuario.email = userData.email;
            // if (userData.username) usuario.username = userData.username;
            if (userData.phone) usuario.phone = userData.phone;
            if (userData.birthDate) usuario.birth_date = userData.birthDate;
            if (userData.image) usuario.image_url = userData.image;
            if (userData.bloodGroup) usuario.blood_group = userData.bloodGroup;
            if (userData.height) usuario.height_cm = userData.height;
            if (userData.weight) usuario.weight_kg = userData.weight;
            if (userData.eyeColor) usuario.eye_color = userData.eyeColor;
            if (userData.ip) usuario.ip_address = userData.ip;
            if (userData.macAddress) usuario.mac_address = userData.macAddress;
            if (userData.university) usuario.university = userData.university;
            if (userData.ein) usuario.ein = userData.ein;
            if (userData.ssn) usuario.ssn = userData.ssn;
            if (userData.userAgent) usuario.user_agent = userData.userAgent;
            if (userData.role) usuario.admin = userData.role === 'administrador' ? 1 : 0;

            console.log("💾 Guardando datos básicos del usuario...");
            await usuario.save();
            console.log("✅ Datos básicos guardados exitosamente");

            // Actualizar información del cabello
            if (userData.hair) {
                console.log("💇 Procesando información del cabello...");
                const cabello = await Cabellos.findOne({ where: { user_id: id } });
                if (cabello) {
                    console.log("🔄 Actualizando registro de cabello existente");
                    if (userData.hair.color) cabello.color = userData.hair.color;
                    if (userData.hair.type) cabello.type = userData.hair.type;
                    await cabello.save();
                    console.log("✅ Cabello actualizado exitosamente");
                } else {
                    console.log("🆕 Creando nuevo registro de cabello");
                    // Crear nuevo registro de cabello si no existe
                    await Cabellos.create({
                        user_id: id,
                        color: userData.hair.color || '',
                        type: userData.hair.type || ''
                    });
                    console.log("✅ Cabello creado exitosamente");
                }
            }

            // Actualizar dirección personal
            if (userData.address) {
                console.log("📍 Procesando dirección personal...");
                const direccion = await Direcciones.findOne({ 
                    where: { 
                        user_id: id,
                        type: 'personal'
                    } 
                });
                
                if (direccion) {
                    if (userData.address.address) direccion.address_line = userData.address.address;
                    if (userData.address.city) direccion.city = userData.address.city;
                    if (userData.address.state) direccion.state = userData.address.state;
                    if (userData.address.stateCode) direccion.state_code = userData.address.stateCode;
                    if (userData.address.postalCode) direccion.postal_code = userData.address.postalCode;
                    if (userData.address.country) direccion.country = userData.address.country;
                    if (userData.address.coordinates) {
                        direccion.latitude = userData.address.coordinates.lat;
                        direccion.longitude = userData.address.coordinates.lng;
                    }
                    await direccion.save();
                } else {
                    // Crear nueva dirección personal si no existe
                    await Direcciones.create({
                        user_id: id,
                        address_line: userData.address.address,
                        city: userData.address.city,
                        state: userData.address.state,
                        state_code: userData.address.stateCode,
                        postal_code: userData.address.postalCode,
                        country: userData.address.country,
                        latitude: userData.address.coordinates?.lat,
                        longitude: userData.address.coordinates?.lng,
                        type: 'personal'
                    });
                }
            }

            // Actualizar información bancaria
            if (userData.bank) {
                console.log("💳 Procesando información bancaria...");
                const infoBancaria = await InformacionBancaria.findOne({ where: { user_id: id } });
                if (infoBancaria) {
                    if (userData.bank.cardExpire) infoBancaria.card_expire = userData.bank.cardExpire;
                    if (userData.bank.cardNumber) infoBancaria.card_number = userData.bank.cardNumber;
                    if (userData.bank.cardType) infoBancaria.card_type = userData.bank.cardType;
                    if (userData.bank.currency) infoBancaria.currency = userData.bank.currency;
                    if (userData.bank.iban) infoBancaria.iban = userData.bank.iban;
                    await infoBancaria.save();
                } else {
                    // Crear nueva información bancaria si no existe
                    await InformacionBancaria.create({
                        user_id: id,
                        card_expire: userData.bank.cardExpire || '',
                        card_number: userData.bank.cardNumber || '',
                        card_type: userData.bank.cardType || '',
                        currency: userData.bank.currency || '',
                        iban: userData.bank.iban || ''
                    });
                }
            }

            // Actualizar información de la empresa
            if (userData.company) {
                console.log("🏢 Procesando información de la empresa...");
                const infoCompania = await InformacionCompania.findOne({ where: { user_id: id } });
                if (infoCompania) {
                    if (userData.company.department) infoCompania.department = userData.company.department;
                    if (userData.company.name) infoCompania.company_name = userData.company.name;
                    if (userData.company.title) infoCompania.title = userData.company.title;
                    
                    // Actualizar dirección de la empresa
                    if (userData.company.address) {
                        if (userData.company.address.address) infoCompania.address_line = userData.company.address.address;
                        if (userData.company.address.city) infoCompania.city = userData.company.address.city;
                        if (userData.company.address.state) infoCompania.state = userData.company.address.state;
                        if (userData.company.address.stateCode) infoCompania.state_code = userData.company.address.stateCode;
                        if (userData.company.address.postalCode) infoCompania.postal_code = userData.company.address.postalCode;
                        if (userData.company.address.country) infoCompania.country = userData.company.address.country;
                        if (userData.company.address.coordinates) {
                            infoCompania.latitude = userData.company.address.coordinates.lat;
                            infoCompania.longitude = userData.company.address.coordinates.lng;
                        }
                    }
                    await infoCompania.save();
                } else {
                    // Crear nueva información de empresa si no existe
                    await InformacionCompania.create({
                        user_id: id,
                        department: userData.company.department || '',
                        company_name: userData.company.name || '',
                        title: userData.company.title || '',
                        address_line: userData.company.address?.address || '',
                        city: userData.company.address?.city || '',
                        state: userData.company.address?.state || '',
                        state_code: userData.company.address?.stateCode || '',
                        postal_code: userData.company.address?.postalCode || '',
                        country: userData.company.address?.country || '',
                        latitude: userData.company.address?.coordinates?.lat || null,
                        longitude: userData.company.address?.coordinates?.lng || null
                    });
                }
            }

            // Actualizar información de criptomonedas
            if (userData.crypto) {
                console.log("₿ Procesando información de criptomonedas...");
                const criptomoneda = await Criptomonedas.findOne({ where: { user_id: id } });
                if (criptomoneda) {
                    if (userData.crypto.coin) criptomoneda.coin = userData.crypto.coin;
                    if (userData.crypto.wallet) criptomoneda.wallet = userData.crypto.wallet;
                    if (userData.crypto.network) criptomoneda.network = userData.crypto.network;
                    await criptomoneda.save();
                } else {
                    // Crear nueva información de criptomonedas si no existe
                    await Criptomonedas.create({
                        user_id: id,
                        coin: userData.crypto.coin || '',
                        wallet: userData.crypto.wallet || '',
                        network: userData.crypto.network || ''
                    });
                }
            }

            console.log("🔄 Obteniendo usuario actualizado con todas las relaciones...");
            // Obtener el usuario actualizado con todas las relaciones
            const usuarioActualizado = await Usuarios.findByPk(id, {
                include: [
                    { model: Cabellos },
                    { model: Direcciones },
                    { model: InformacionBancaria },
                    { model: InformacionCompania },
                    { model: Criptomonedas }
                ]
            });

            // Mapear gender de vuelta a español para el frontend
            if (usuarioActualizado.gender) {
                const genderMapReverse = {
                    'male': 'masculino',
                    'female': 'femenino',
                    'other': 'otro'
                };
                usuarioActualizado.gender = genderMapReverse[usuarioActualizado.gender] || usuarioActualizado.gender;
            }
            
            console.log("✅ Usuario actualizado exitosamente con todas las relaciones");
            return usuarioActualizado;
        } catch (error) {
            console.error("❌ Error detallado en updateUser:", error);
            
            if (error.name === 'SequelizeValidationError') {
                console.error("📋 Errores de validación:");
                error.errors.forEach((err, index) => {
                    console.error(`  ${index + 1}. Campo: ${err.path}, Valor: ${err.value}, Mensaje: ${err.message}`);
                });
            } else if (error.name === 'SequelizeUniqueConstraintError') {
                console.error("🔒 Error de restricción única:");
                error.errors.forEach((err, index) => {
                    console.error(`  ${index + 1}. Campo: ${err.path}, Valor: ${err.value}, Mensaje: ${err.message}`);
                });
                throw new Error(`Error de unicidad: El ${error.errors[0].path} '${error.errors[0].value}' ya está en uso`);
            }
            
            throw new Error(`Error al actualizar el usuario: ${error.message}`);
        }
    }
    static async getUserInfo(id) {
        try {
            console.log("🔍 UsersModel.getUserInfo - Buscando usuario con ID:", id);
            
            const usuario = await Usuarios.findByPk(id, {
                include: [
                    { model: Cabellos },
                    { model: Direcciones },
                    { model: InformacionBancaria },
                    { model: InformacionCompania },
                    { model: Criptomonedas }
                ]
            });
            
            console.log("📋 Usuario encontrado:", usuario ? "Sí" : "No");
            
            if (!usuario) {
                console.log("❌ Usuario no encontrado");
                throw new Error("Usuario no encontrado.");
            }
            
            console.log("✅ Usuario encontrado con todas las relaciones");
            console.log("📊 Datos del usuario:", {
                id: usuario.id,
                email: usuario.email,
                username: usuario.username,
                hasCabellos: !!usuario.Cabellos,
                hasDirecciones: !!usuario.Direcciones,
                hasInformacionBancaria: !!usuario.InformacionBancaria,
                hasInformacionCompania: !!usuario.InformacionCompania,
                hasCriptomonedas: !!usuario.Criptomonedas
            });
            
            // Mapear gender de vuelta a español para el frontend
            if (usuario.gender) {
                const genderMapReverse = {
                    'male': 'masculino',
                    'female': 'femenino',
                    'other': 'otro'
                };
                usuario.gender = genderMapReverse[usuario.gender] || usuario.gender;
            }
            
            return usuario;
        } catch (error) {
            console.error("❌ Error en UsersModel.getUserInfo:", error);
            throw new Error(`Error al obtener la información del usuario: ${error.message}`);
        }
    }
    static async cambiarEstadoUsuario(id,estado) {
        try {
            const usuario = await Usuarios.findByPk(id);
            if (!usuario) {
                throw new Error("Usuario no encontrado.");
            }
            usuario.estado = estado;
            await usuario.save();
            return { id: usuario.id, estado: usuario.estado };
        } catch (error) {
            throw new Error(`Error al cambiar el estado del usuario: ${error.message}`);
        }
    }

    static async getUsersInfo() {
        try {
            const users = await Usuarios.findAll({
                attributes: ['id', 'username', 'email', 'admin', 'estado', 'first_name'],
                where: { admin: 0 }
            });
            if (!users || users.length === 0) {
                throw new Error("No se encontraron usuarios.");
            }
            return users;
        }catch (error) {
            throw new Error(`Error al obtener la información de los usuarios: ${error.message}`);
        }
    }

    static async register({ usuario }) {
        const {
            username,
            password,
            email
        } = usuario;
        const hashedPassword = bcrypt.hashSync(password, SALT_ROUNDS);

        try {
            // Verificar si ya existe un usuario con el mismo username o email
            const existingUser = await Usuarios.findOne({
                where: {
                    [Op.or]: [
                        { email }
                    ]
                }
            });
            if (existingUser) {
                throw new Error("Ya existe un usuario con ese nombre de usuario o correo electrónico.");
            }

            const user = await Usuarios.create({
                username,
                password: hashedPassword,
                email,
                estado: 'V' // Usuario habilitado por defecto
            });

            await Cabellos.create({ user_id: user.id });
            await Direcciones.create({ user_id: user.id });
            await InformacionBancaria.create({ user_id: user.id });
            await InformacionCompania.create({ user_id: user.id });
            await Criptomonedas.create({ user_id: user.id });

            return {
                username: user.username,
                email: user.email
            };
        } catch (error) {
            throw new Error(`Error al crear el usuario ${username}: ${error}`);
        }
    }

    static async login({ usuario }) {
        const {
            email,
            password
        } = usuario;
        try {
            const user = await Usuarios.findOne({ where: { email } });
            if (!user) {
                throw new Error(`El usuario ${email} no existe.`);
            }
            
            // Verificar si el usuario está habilitado
            if (user.estado === 'F') {
                throw new Error("Tu cuenta ha sido inhabilitada. Contacta al administrador.");
            }
            
            const isValid = await bcrypt.compare(password, user.password);
            if (!isValid) {
                throw new Error("Contraseña inválida.");
            }

            const token = jwt.sign(
                { email: user.email, id: user.id, admin: user.admin },
                SECRET_JWT_KEY,
                {
                    expiresIn: "1h"
                }
            );
            return {
                email: user.email,
                token: token,
                admin: user.admin
            };
        } catch (error) {
            throw new Error(`Error al buscar el usuario ${email}: ${error.message}`);
        }
    }

    static async verifyToken({ token }) {
        try {
            jwt.verify(token, SECRET_JWT_KEY);
            return { valid: true };
        } catch (err) {
            return { valid: false };
        }
    }
}

module.exports = { UsersModel };