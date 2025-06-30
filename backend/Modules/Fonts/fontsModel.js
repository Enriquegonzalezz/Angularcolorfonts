const {Fuentes} = require('../../db/schema');
const fs = require('fs');
const path = require('path');

class FontsModel {
    static async updateFontPre(id, id_usuario) {
        try {
            // Set all fonts for the user to not default
            const [updated] = await Fuentes.update({ predeterminado: 0 }, { where: { id_usuario: id_usuario } });
            if (updated) {
                // Set the specified font as default
                return await Fuentes.update({ predeterminado: 1 }, { where: { id: id } });
            }
            return null;
        } catch (error) {
            throw new Error(`Error updating default font for font ${id}: ${error}`);
        }
    }

    static async getFontPredeterminado() {
        try {
            const font = await Fuentes.findOne({ where: { predeterminado: 1 } });
            if (!font) {
                throw new Error("No default font found.");
            }
            return {
                fuente_1: font.fuente_1,
                fuente_2: font.fuente_2,
                tamano_1: font.tamano_1,
                tamano_2: font.tamano_2,
                tamano_3: font.tamano_3
            };  
        } catch (error) {
            throw new Error(`Error retrieving default font: ${error}`);
        }
    }

    static async getFontsById(id) {
        try {
            const fonts = await Fuentes.findAll({ where: { id_usuario: id } });
            return fonts;
        } catch (error) {
            throw new Error(`Error retrieving fonts for user ${id}: ${error}`);
        }
    }

    static async createFont(id, fontData) {
        try {
            const newFont = await Fuentes.create({
                id_usuario: id,
                fuente_1: fontData.fuente_1,
                fuente_2: fontData.fuente_2,
                tamano_1: fontData.tamano_1,
                tamano_2: fontData.tamano_2,
                tamano_3: fontData.tamano_3,
                predeterminado: fontData.predeterminado || 0
            });
            return newFont;
        } catch (error) {
            throw new Error(`Error creating font: ${error}`);
        }
    }

    static async updateFont(id, fontData) {
        try {
            const [updated] = await Fuentes.update(fontData, { where: { id: id } });
            if (updated) {
                return await Fuentes.findOne({ where: { id: id } });
            }
            return null;
        } catch (error) {
            throw new Error(`Error updating font for font ${id}: ${error}`);
        }
    }

    static async updateFontPre(id, id_usuario) {
        try {
            const [updated] = await Fuentes.update({ predeterminado: 0 }, { where: { id_usuario: id_usuario } });
            if (updated) {
                return await Fuentes.update({ predeterminado: 1 }, { where: { id: id } });
            }
            return null;
        } catch (error) {
            throw new Error(`Error updating default font for font ${id}: ${error}`);
        }
    }

    static async deleteFont(id) {
        try {
        const font = await Fuentes.findOne({ where: { id: id } });
        if (!font) return false;
        if (font.fuente_1) {
            const filePath1 = path.join(__dirname, '../../public/fonts', font.fuente_1);
            if (fs.existsSync(filePath1)) fs.unlinkSync(filePath1);
        }
        if (font.fuente_2) {
            const filePath2 = path.join(__dirname, '../../public/fonts', font.fuente_2);
            if (fs.existsSync(filePath2)) fs.unlinkSync(filePath2);
        }
        const deleted = await Fuentes.destroy({ where: { id: id } });
        return deleted > 0;
        } catch (error) {
            throw new Error(`Error deleting font for font ${id}: ${error}`);
        }
    }
}

module.exports = { FontsModel };