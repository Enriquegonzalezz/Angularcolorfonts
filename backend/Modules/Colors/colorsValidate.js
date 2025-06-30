const {z} = require('zod');

const colorsSchema = z.object({
    color_1: z.string().min(1, "Color 1 is required"),
    color_2: z.string().min(1, "Color 2 is required"),
    color_3: z.string().min(1, "Color 3 is required"),
    color_4: z.string().min(1, "Color 4 is required"),
    color_5: z.string().min(1, "Color 5 is required"),
    predeterminado: z.number().int().min(0, "Predeterminado must be 0 or 1").max(1, "Predeterminado must be 0 or 1").optional()
});

function validateColor(input) {
    return colorsSchema.safeParse(input);
}

module.exports = { validateColor };