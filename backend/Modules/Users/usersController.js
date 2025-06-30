const { validateRegistro, validateLogin } = require("./usersValidate");
const { UsersModel } = require("./usersModel");
const jwt = require("jsonwebtoken")
const { SECRET_JWT_KEY } = require("../../config");
const { ca } = require("zod/v4/locales");

class UsersController {
    getUserInfo = async (req, res) => {
        console.log("controlador getUserInfo")
        const isAuthenticated = await this.auth(req);
        if (!isAuthenticated.valid) {
            return res.status(401).json({ message: "El usuario no está autorizado." });
        }
        const { id } = req.params;
        try {
            const result = await UsersModel.getUserInfo(id);
            return res.json(result);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    cambiarEstado = async (req, res) => {
        console.log("controlador cambiarEstado")
        const isAuthenticated = await this.auth(req);
        if (!isAuthenticated.valid) {
            return res.status(401).json({ message: "El usuario no está autorizado." });
        }
        const { id } = req.params; 
        const { estado } = req.body;
        if (!id) {
            return res.status(400).json({ message: "Falta el id del usuario." });
        }
        try {
            const result = await UsersModel.cambiarEstadoUsuario(id, estado);
            return res.json(result);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    getUsersInfo = async (req, res) => {
        console.log("controlador getUsersInfo")
        const isAuthenticated = await this.auth(req);
        if (!isAuthenticated.valid) {
            return res.status(401).json({ message: "El usuario no está autorizado." });
        }
        try{
            const response = await UsersModel.getUsersInfo();
            if (!response) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }
            return res.json(response);
        }catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Error al obtener la información del usuario' });
        }
    }

    register = async (req, res) => {
        //console.log(req.body)
        const result = validateRegistro(req.body)
        //console.log(result)
        //console.log(result.data)
        if (!result.success) {
            console.log(result.error.message)
            return res.status(400).json({ error: JSON.parse(result.error.message) })
        }
        const usuario = result.data    

        try {
            const response = await UsersModel.register({ usuario })
            return res.json(response)
        } catch (error) {
            console.log(error)
            return res.status(500).json({ error: 'Usuario ya existe' });
        }
    }

    login = async (req, res) => {
        console.log("controlador login")
        const result = validateLogin(req.body)
        if (!result.success) {
            console.log("error en validación de login");
            return res.status(400).json({ error: JSON.parse(result.error.message) })
        }
        
        const usuario = result.data
        try {
            const response = await UsersModel.login({ usuario })
            return res.status(200).json({
                message: `El usuario ${response.email} ha iniciado sesión exitosamente`,
                token: response.token
            })
        } catch (error) {
            console.log(error)
            return res.status(500).json({ error: 'Error al iniciar sesión' });
        }
    }

    getAuth = async (req, res) => {
        const authResult = await this.auth(req);
        console.log(authResult)
        return res.json(authResult);
    }

    async auth(req) {
        const token = req.headers.authorization?.split(' ')[1];
    
        if (!token) {
            return { valid: false };
        }
    
        try {
            const decoded = await new Promise((resolve, reject) => {
                jwt.verify(token, SECRET_JWT_KEY, (err, decoded) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(decoded); 
                    } 
                });
            });
            //console.log(decoded);
            const id = decoded.id;
            const admin = decoded.admin || 0; 
            return { valid: true , id: id , admin: admin};
    
        } catch (err) {
            console.log(err);
            return { valid: false, error: `Error al verificar el token:, ${err.message}` };
        }
    }
}

module.exports = { UsersController }