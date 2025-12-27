const {Router} = require('express'); 
const {ColorsController} = require('./colorsController');

const createColorsRouter = () => {
    const colorsRouter = Router();
    const colorsController = new ColorsController();

    colorsRouter.get('/', colorsController.getColors);
    colorsRouter.get('/predeterminado', colorsController.getColorPredeterminado);
    colorsRouter.post('/store', colorsController.createColor);
    colorsRouter.put('/update/:id', colorsController.updateColor);
    colorsRouter.put('/update/predeterminado/:id', colorsController.updateColorPredeterminado);
    colorsRouter.delete('/delete/:id', colorsController.deleteColor);

    return colorsRouter;
}

module.exports = {createColorsRouter};