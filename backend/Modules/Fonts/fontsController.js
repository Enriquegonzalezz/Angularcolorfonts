const {FontsModel} = require('./fontsModel');
const {UsersController} = require('../Users/usersController');

const usuariosController = new UsersController();

class FontsController {
    updateFontPre = async (req, res) => {
        const isAuthenticated = await usuariosController.auth(req);
        if (!isAuthenticated.valid) {
            return res.status(401).json({ message: "El usuario no está autorizado." });
        }
        const { id } = req.params;
        const id_usuario = isAuthenticated.id;
        try {
            const updatedFont = await FontsModel.updateFontPre(id, id_usuario);
            if (!updatedFont) {
                return res.status(404).json({ error: 'Fuente no encontrada' });
            }
            return res.json(updatedFont);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Error updating default font' });
        }
    }

    getFontPredeterminado = async (req, res) => {
        try {
            const font = await FontsModel.getFontPredeterminado();
            if (!font) {
                return res.status(404).json({ error: 'Fuente predeterminada no encontrada' });
            }
            return res.json(font);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Error retrieving default font' });
        }
    } 

    getFonts = async (req, res) => {
        const isAuthenticated = await usuariosController.auth(req);
        if (!isAuthenticated.valid) {
            return res.status(401).json({ message: "El usuario no está autorizado." });
        }
        const id = isAuthenticated.id;
        try {
            const fonts = await FontsModel.getFontsById(id);
            if (!fonts) {
                return res.status(404).json({ error: 'Fuentes no encontradas' });
            }
            return res.json(fonts);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Error retrieving fonts' });
        }
    }

    createFont = async (req, res) => {
        const isAuthenticated = await usuariosController.auth(req);
        if (!isAuthenticated.valid) {
            return res.status(401).json({ message: "El usuario no está autorizado." });
        }
        const id = isAuthenticated.id;
        try {
            const fontData = {
            fuente_1: req.files['fuente_1'] ? req.files['fuente_1'][0].filename : null,
            fuente_2: req.files['fuente_2'] ? req.files['fuente_2'][0].filename : null,
            tamano_1: req.body.tamano_1 || null,
            tamano_2: req.body.tamano_2 || null,
            tamano_3: req.body.tamano_3 || null,
            predeterminado: req.body.predeterminado || 0
            };
            const newFont = await FontsModel.createFont(id, fontData);
            return res.status(201).json(newFont);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Error creating font' });
        }
    }

    updateFont = async (req, res) => {
        const isAuthenticated = await usuariosController.auth(req);
        if (!isAuthenticated.valid) {
            return res.status(401).json({ message: "El usuario no está autorizado." });
        }
        const { id } = req.params;
        
        try {
            const fontData = {
            tamano_1: req.body.tamano_1 ? Number(req.body.tamano_1) : null,
            tamano_2: req.body.tamano_2 ? Number(req.body.tamano_2) : null,
            tamano_3: req.body.tamano_3 ? Number(req.body.tamano_3) : null,
             };
            const updatedFont = await FontsModel.updateFont(id, fontData);
            if (!updatedFont) {
                return res.status(404).json({ error: 'Fuente no encontrada' });
            }
            return res.json(updatedFont);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Error updating font' });
        }
    }

    deleteFont = async (req, res) => {
        const isAuthenticated = await usuariosController.auth(req);
        if (!isAuthenticated.valid) {
            return res.status(401).json({ message: "El usuario no está autorizado." });
        }
        const { id } = req.params;
        try {
            const deletedFont = await FontsModel.deleteFont(id);
            if (!deletedFont) {
                return res.status(404).json({ error: 'Fuente no encontrada' });
            }
            return res.status(204).send();
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Error deleting font' });
        }
    }
}
module.exports = { FontsController };