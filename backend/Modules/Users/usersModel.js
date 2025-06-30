require('dotenv/config');
const { Op } = require('sequelize');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { SALT_ROUNDS, SECRET_JWT_KEY } = require("../../config");
const { Usuarios, Cabellos, Direcciones, InformacionBancaria, InformacionCompania, Criptomonedas } = require('../../db/schema');

class UsersModel {
    static async getUserInfo(id) {
        try {
            const usuario = await Usuarios.findByPk(id, {
                include: [
                    { model: Cabellos },
                    { model: Direcciones },
                    { model: InformacionBancaria },
                    { model: InformacionCompania },
                    { model: Criptomonedas }
                ]
            });
            if (!usuario) {
                throw new Error("Usuario no encontrado.");
            }
            return usuario;
        } catch (error) {
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
                email
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
                token: token
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