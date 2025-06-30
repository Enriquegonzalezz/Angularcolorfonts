const {ColorsModel} = require('./colorsModel');
const {UsersController} = require('../Users/usersController');
const { validateColor } = require('./colorsValidate');

const usuariosController = new UsersController();

class ColorsController {
    getColorPredeterminado = async (req, res) => {
        console.log("getColorPredeterminado");
        try {
            const color = await ColorsModel.getColorPredeterminado();
            if (!color) {
                return res.status(404).json({ error: 'Color predeterminado no encontrado' });
            }
            return res.json(color);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Error retrieving default color' });
        }
    }

    getColors = async (req, res) => {
        const isAuthenticated = await usuariosController.auth(req)
        if (!isAuthenticated.valid) {
            return res.status(401).json({ message: "El usuario no está autorizado."})
        }
        const  id  = isAuthenticated.id;
        try {
            const colors = await ColorsModel.getColorsById(id);
            if (!colors) {
                return res.status(404).json({ error: 'Colores no encontrados' });
            }
            return res.json(colors);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Error retrieving color' });
        }
    }

    createColor = async (req, res) => {
        const isAuthenticated = await usuariosController.auth(req)
        if (!isAuthenticated.valid) {
            return res.status(401).json({ message: "El usuario no está autorizado."})
        }
        const  id  = isAuthenticated.id;
        console.log(isAuthenticated.id);
        const result = validateColor(req.body);
        if (!result.success) {
            return res.status(400).json({ error: JSON.parse(result.error.message) });
        }
        
        const colorData = result.data;
        try {
            const newColor = await ColorsModel.createColor(id , colorData);
            return res.status(201).json(newColor);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Error creating color' });
        }
    }

    updateColor = async (req, res) => {
        const isAuthenticated = await usuariosController.auth(req)
        if (!isAuthenticated.valid) {
            return res.status(401).json({ message: "El usuario no está autorizado."})
        }
        const { id } = req.params;
        const result = validateColor(req.body);
        console.log(result);
        if (!result.success) {
            return res.status(400).json({ error: JSON.parse(result.error.message) });
        }

        const colorData = result.data;
        try {
            const updatedColor = await ColorsModel.updateColor(id, colorData);
            if (!updatedColor) {
                return res.status(404).json({ error: 'Color not found' });
            }
            return res.json(updatedColor);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Error updating color' });
        }
    }

    updateColorPredeterminado = async (req, res) => {
        const isAuthenticated = await usuariosController.auth(req)
        if (!isAuthenticated.valid) {
            return res.status(401).json({ message: "El usuario no está autorizado."})
        }
        const id_usuario = isAuthenticated.id;
        const { id } = req.params;
        try {
            const updatedColor = await ColorsModel.updateColorPre(id, id_usuario);
            if (!updatedColor) {
                return res.status(404).json({ error: 'Color not found' });
            }
            return res.json(updatedColor);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Error updating color' });
        }
    }

    deleteColor = async (req, res) => {
        const isAuthenticated = await usuariosController.auth(req)
        if (!isAuthenticated.valid) {
            return res.status(401).json({ message: "El usuario no está autorizado."})
        }
        const { id } = req.params;
        try {
            const deleted = await ColorsModel.deleteColor(id);
            if (!deleted) {
                return res.status(404).json({ error: 'Color not found' });
            }
            return res.status(204).send();
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Error deleting color' });
        }
    }
}

module.exports = { ColorsController };