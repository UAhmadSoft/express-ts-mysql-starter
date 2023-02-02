import { Router, Request, Response, NextFunction } from 'express';
import Controller from '@/utils/interfaces/controller.interface';
import HttpException from '@/utils/exceptions/http.exception';
import validationMiddleware from '@/middleware/validation.middleware';
import validate from '@/resources/user/user.validation';
import UserService from '@/resources/user/user.service';
import authenticated from '@/middleware/authenticated.middleware';
import { HTTPCodes } from '@/utils/helpers/response';
import AuthService from './auth.service';
import { sendMail } from '@/utils/helpers/email';
import catchAsync from '@/utils/helpers/catchAsync';

class AuthController implements Controller {
  public path = '/auth';
  public router = Router();
  private UserService = new UserService();
  private AuthService = new AuthService();

  constructor() {
    this.initialiseRoutes();
  }

  private initialiseRoutes(): void {
    // this.router.get(`${this.path}`, authenticated, this.getUsers);

    this.router.post(
      `${this.path}/login`,
      validationMiddleware(validate.login),
      this.login
    );

    this.router.post(
      `${this.path}/signUp`,
      validationMiddleware(validate.signUp),
      this.signUp
    );

    this.router.get(`${this.path}/confirmMail/:token`, this.confirmMail);
    this.router.patch(`${this.path}/update-password`, this.updatePassword);
    // this.router.patch(`${this.path}/forgot-password`, this.forgotPassword);
    // this.router.patch(`${this.path}/reset-password`, this.forgotPassword);
    // this.router.patch(`${this.path}/-password`, this.forgotPassword);
  }

  private login = catchAsync(
    async (
      req: Request,
      res: Response,
      next: NextFunction
    ): Promise<Response | void> => {
      const { email, password } = req.body;

      const { user, token } = await this.AuthService.login(email, password);

      user.password = undefined;
      user.passwordConfirm = undefined;

      res.status(HTTPCodes.OK).json({ user, token });
    }
  );

  private signUp = catchAsync(
    async (
      req: Request,
      res: Response,
      next: NextFunction
    ): Promise<Response | void> => {
      const { firstName, lastName, passwordConfirm, email, password } =
        req.body;

      const { user, token, activationToken } = await this.AuthService.signUp(
        firstName,
        lastName,
        email,
        password,
        passwordConfirm
      );

      user.password = undefined;
      user.passwordConfirm = undefined;

      let activationURL = `${req.headers.origin}/confirmMail/${activationToken}`;
      const message = `GO to this link to activate your App Account : ${activationURL} .`;

      sendMail({
        email: user.email,
        message,
        subject: 'Your Account Activation Link for Package App !',
        user,
        template: 'signup.ejs',
        url: activationURL,
      });

      res.status(HTTPCodes.CREATED).json({ user, token });
    }
  );

  private confirmMail = catchAsync(
    async (
      req: Request,
      res: Response,
      next: NextFunction
    ): Promise<Response | void> => {
      const { token } = req.params;

      const user = await this.AuthService.confirmMail(token);

      user.active = true;
      user.activationLink = undefined;

      res.status(HTTPCodes.OK).json({ user });
    }
  );

  private updatePassword = catchAsync(
    async (
      req: Request,
      res: Response,
      next: NextFunction
    ): Promise<Response | void> => {
      const { password, passwordConfirm } = req.body;

      const user = await this.AuthService.updatePassword(
        req.user.email,
        password,
        passwordConfirm
      );

      user.password = undefined;
      user.passwordConfirm = undefined;

      res.status(HTTPCodes.OK).json({ user });
    }
  );

  private forgotPassword = catchAsync(
    async (
      req: Request,
      res: Response,
      next: NextFunction
    ): Promise<Response | void> => {
      const { email } = req.body;

      const user = await this.AuthService.forgotPassword(email);

      user.password = undefined;
      user.passwordConfirm = undefined;

      res.status(HTTPCodes.OK).json({ user });
    }
  );

  private resetPassword = catchAsync(
    async (
      req: Request,
      res: Response,
      next: NextFunction
    ): Promise<Response | void> => {
      const { email, password, passwordConfirm } = req.body;

      const user = await this.AuthService.resetPassword(
        email,
        password,
        passwordConfirm
      );

      user.password = undefined;
      user.passwordConfirm = undefined;

      res.status(HTTPCodes.OK).json({ user });
    }
  );
}

export default AuthController;
