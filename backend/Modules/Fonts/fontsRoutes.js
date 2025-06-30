const {Router} = require('express');
const {FontsController} = require('./fontsController');
const uploadFuente = require('../../middleware/uploadFont'); // Importa el middleware

const createFontsRouter = () => {
    const fontsRouter = Router();
    const fontsController = new FontsController();

    fontsRouter.get('/', fontsController.getFonts);
    fontsRouter.get('/predeterminado', fontsController.getFontPredeterminado);
    fontsRouter.post('/store', uploadFuente.fields([{ name: 'fuente_1' }, { name: 'fuente_2' }]), fontsController.createFont);
    fontsRouter.put('/update/:id', fontsController.updateFont);
    fontsRouter.put('/update/predeterminado/:id', fontsController.updateFontPre);
    fontsRouter.delete('/delete/:id', fontsController.deleteFont);

    return fontsRouter;
}

module.exports = {createFontsRouter};