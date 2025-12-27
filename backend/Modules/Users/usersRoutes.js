const {Router} = require('express');
const {UsersController} = require('./usersController');

const createUsersRouter = () => {
    const usersRouter = Router();
    const usersController = new UsersController();
    
    usersRouter.post('/login', usersController.login);
    usersRouter.post('/register', usersController.register);
    usersRouter.get('/auth', usersController.getAuth);
    usersRouter.get('/usersInfo', usersController.getUsersInfo);
    usersRouter.get('/userInfo/:id', usersController.getUserInfo);
    usersRouter.patch('/cambiarEstado/:id', usersController.cambiarEstado);
    usersRouter.patch('/updateUserInfo/:id', usersController.updateUser);

    return usersRouter;
}

module.exports = {createUsersRouter};