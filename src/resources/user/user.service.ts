import UserModel from '@/resources/user/user.model';
import token from '@/utils/token';

import mysql from '@/utils/helpers/mysql';
class UserService {
  private user = UserModel;

  /**
   * Register a new user
   */

  /**
   * Attempt to login a user
   */

  public async createUser(
    body: Body & {
      password: string;
      firstName: string;
      lastName: string;
      email: string;
    }
  ): Promise<any> {
    const { firstName, lastName, email, password } = body;

    const user = await mysql.query(
      'INSERT INTO users (firstName, lastName, email, password) VALUES (?, ?, ?, ?)',
      [firstName, lastName, email, password]
    );

    return user;
  }

  public async getAllUsers(queryString: {
    ORDER_BY?: string;
    LIMIT?: number;
  }): Promise<any> {
    try {
      let query: string = 'SELECT * FROM users';
      // let query: string = `SELECT * FROM users ORDER BY ${queryString.ORDER_BY} ASC`;
      let args: any[] = [];

      if (queryString.ORDER_BY) {
        query += ` ORDER BY`;
        queryString.ORDER_BY.split(',').forEach((orderBy, index) => {
          if (index > 0) {
            query += ',';
          }
          query += ` ${orderBy.replace('-', '')}`;

          const isDescending = queryString.ORDER_BY?.includes('-');
          if (isDescending) {
            query += ' DESC';
          } else {
            query += ' ASC';
          }
        });
      }

      // if (queryString.LIMIT) {
      //   query += ' LIMIT ?';
      //   args.push(queryString.LIMIT);
      // }

      console.log('query', query);
      console.log('args', args);
      const users = await mysql.query(query, args);

      return users;
    } catch (error) {
      console.log('error', error);
      throw new Error('Unable to fetch users');
    }
  }

  public async getUser(id: string): Promise<any> {
    const user = await mysql.query('SELECT * FROM users WHERE id = ?', [id]);
    return user;
  }

  public async updateUser(id: string, body: Body): Promise<any> {
    // TODO: Update user
    // await mysql.query('UPDATE users SET ? WHERE id = ?', [body, id]);
    return null;
  }

  public async deleteUser(id: string): Promise<any> {
    const user = await this.user.findByIdAndDelete(id);
    return user;
  }
}

export default UserService;
