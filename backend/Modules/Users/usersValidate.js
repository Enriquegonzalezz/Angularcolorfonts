const { z } = require("zod");
const registerSchema = z.object({
    username: z.string().max(30),
    email: z.string().max(30),
    password: z.string().max(30),
})

const loginSchema = z.object({
    email: z.string().max(30),
    password: z.string().max(30),
})

function validateRegistro (input) {
    return registerSchema.safeParse(input);
}
function validateLogin (input) {
    return loginSchema.safeParse(input);
}
module.exports = { validateRegistro, validateLogin };