import UserModel from '@/resources/user/user.model';
import mysql from '@/utils/helpers/mysql';
import token from '@/utils/token';
import crypto from 'crypto';
class AuthService {
  private user = UserModel;

  public async login(email: string, password: string): Promise<any | Error> {
    const [user] = await mysql.query(
      'SELECT * FROM users WHERE email = ? AND password = ?',
      [email, password]
    );

    const accessToken = token.createToken(user);

    return { user, token: accessToken };
  }

  public async signUp(
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    passwordConfirm: string
  ): Promise<any> {
    const user = await this.user.create({
      email,
      password,
      firstName,
      lastName,
      passwordConfirm,
    });

    const accessToken = token.createToken(user);

    const activationToken = user.createAccountActivationLink();

    return { user, token: accessToken, activationToken };
  }

  public async confirmMail(token: string): Promise<any> {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await this.user.findOne({
      activationLink: hashedToken,
    });

    if (!user) {
      throw new Error('Unable to find user with that email address');
    }

    await user.save();

    return user;
  }

  public async updatePassword(
    email: string,
    password: string,
    passwordConfirm: string
  ): Promise<any> {
    const user = await this.user.findOne({ email });

    if (!user) {
      throw new Error('Unable to find user with that email address');
    }

    user.password = password;
    user.passwordConfirm = passwordConfirm;

    await user.save();

    return user;
  }

  public async forgotPassword(email: string): Promise<any> {
    const user = await this.user.findOne({ email });

    if (!user) {
      throw new Error('Unable to find user with that email address');
    }

    const resetToken = user.createPasswordResetToken();

    await user.save();

    return resetToken;
  }

  public async resetPassword(
    token: string,
    password: string,
    passwordConfirm: string
  ): Promise<any> {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await this.user.findOne({
      passwordResetToken: hashedToken,
    });

    if (!user) {
      throw new Error('Unable to find user with that email address');
    }

    user.password = password;
    user.passwordConfirm = passwordConfirm;

    await user.save();

    return user;
  }
}

export default AuthService;
