import { Router, Request, Response, NextFunction } from 'express';
import Controller from '@/utils/interfaces/controller.interface';
import HttpException from '@/utils/exceptions/http.exception';
import validationMiddleware from '@/middleware/validation.middleware';
import validate from '@/resources/user/user.validation';
import UserService from '@/resources/user/user.service';
import authenticated from '@/middleware/authenticated.middleware';
import { HTTPCodes } from '@/utils/helpers/response';

class UserController implements Controller {
  public path = '/users';
  public router = Router();
  private UserService = new UserService();

  constructor() {
    this.initialiseRoutes();
  }

  private initialiseRoutes(): void {
    // this.router.get(`${this.path}`, authenticated, this.getUsers);

    this.router.get(`${this.path}`, this.getUsers);

    this.router.get(`${this.path}/me`, this.getMe);

    this.router.post(
      `${this.path}`,
      validationMiddleware(validate.create),
      this.createUser
    );

    this.router.patch(
      `${this.path}/:id`,
      validationMiddleware(validate.update),
      this.updateUser
    );

    this.router.get(`${this.path}/:id`, this.getUser);

    this.router.delete(`${this.path}/:id`, this.deleteUser);
  }

  private createUser = async (
    req: Request,

    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const { firstName, lastName, email, password } = req.body;

    const user = await this.UserService.createUser(req.body);

    if (!user)
      return res.status(HTTPCodes.BAD_REQUEST).json({
        status: 'failed',
        messsage: `Cant create user`,
      });

    res.status(HTTPCodes.CREATED).json({ status: 'success', user });
  };

  private getMe = (
    req: Request,
    res: Response,
    next: NextFunction
  ): Response | void => {
    if (!req.user) {
      return next(new HttpException(HTTPCodes.NOT_FOUND, 'No logged in user'));
    }

    res.status(HTTPCodes.OK).json({ status: 'success', user: req.user });
  };

  private getUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const { id } = req.params;

    const user = await this.UserService.getUser(id);
    if (!user)
      return res.status(HTTPCodes.BAD_REQUEST).json({
        status: 'failed',
        messsage: `Cant find any user with id ${id}`,
      });

    res.status(HTTPCodes.OK).json({ status: 'success', user });
  };

  private deleteUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const { id } = req.params;

    const user = await this.UserService.deleteUser(id);
    if (!user)
      return res.status(HTTPCodes.BAD_REQUEST).json({
        status: 'failed',
        messsage: `Cant find any user with id ${id}`,
      });

    res.status(HTTPCodes.OK).json({ status: 'success', user: req.user });
  };
  private updateUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const { id } = req.params;

    const user = await this.UserService.updateUser(id, req.body);
    if (!user)
      return res.status(HTTPCodes.BAD_REQUEST).json({
        status: 'failed',
        messsage: `Cant find any user with id ${id}`,
      });

    res.status(HTTPCodes.OK).json({ status: 'success', user });
  };

  private getUsers = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const users = await this.UserService.getAllUsers(req.query);

      res
        .status(HTTPCodes.OK)
        .json({ status: 'success', results: users.length, users });
    } catch (error) {
      console.log('error', error);
      return res.status(HTTPCodes.BAD_REQUEST).json({
        status: 'failed',
        messsage: `Cant find any user`,
      });
    }
  };
}

export default UserController;
