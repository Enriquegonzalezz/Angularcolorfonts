const { col } = require('sequelize');
const {Colores} = require('../../db/schema');
const { tr } = require('zod/v4/locales');

class ColorsModel {
    static async getColorPredeterminado() {
        try {
            const color = await Colores.findOne({where: { predeterminado: 1 } });
            if (!color) {
                throw new Error("No default color found.");
            }
            return {
                color_1: color.color_1,
                color_2: color.color_2,
                color_3: color.color_3,
                color_4: color.color_4,
                color_5: color.color_5
            };
        } catch (error) {
            throw new Error(`Error retrieving default color: ${error}`);
        }
    }

    static async getColorsById(id) {
        try {
            const colors = await Colores.findAll({ where: { id_usuario: id } });
            return colors;
        } catch (error) {
            throw new Error(`Error retrieving colors for user ${id}: ${error}`);
        }
    }

    static async createColor(id , colorData) {
        try {
            const newColor = await Colores.create({
                id_usuario: id,
                color_1: colorData.color_1,
                color_2: colorData.color_2,
                color_3: colorData.color_3,
                color_4: colorData.color_4,
                color_5: colorData.color_5,
                predeterminado: colorData.predeterminado || 0
            });
            return newColor;
        } catch (error) {
            throw new Error(`Error creating color: ${error}`);
        }
    }

    static async updateColor(id, colorData) {
        try {
            const [updated] = await Colores.update(colorData, { where: { id: id } });
            if (updated) {
                return await Colores.findOne({ where: { id: id } });
            }
            return null;
        } catch (error) {
            throw new Error(`Error updating color for color ${id}: ${error}`);
        }
    }

    static async updateColorPre(id , id_usuario){
        try {
            const [updated] = await Colores.update({ predeterminado: 0 }, { where: { id_usuario: id_usuario } });
            if (updated) {
                return await Colores.update({ predeterminado: 1 }, { where: { id: id } });
            }
            return null;
        } catch (error) {
            throw new Error(`Error updating default color for color ${id}: ${error}`);
        }
    }

    static async deleteColor(id) {
        try {
            const deleted = await Colores.destroy({ where: { id: id } });
            return deleted > 0;
        } catch (error) {
            throw new Error(`Error deleting color for color ${id}: ${error}`);
        }
    }
}

module.exports = {ColorsModel};