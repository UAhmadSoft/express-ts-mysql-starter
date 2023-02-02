import mysql2 from 'mysql2/promise';
import 'dotenv/config';

const options: {
  host: string | undefined;
  user: string | undefined;
  password: string | undefined;
  database: string | undefined;
} = {
  host: process.env.MY_SQL_HOST,
  user: process.env.MY_SQL_USER,
  password: process.env.MY_SQL_PASSWORD,
  database: process.env.MY_SQL_DATABASE,
};

class mysql {
  static async createConnection(): Promise<any> {
    console.log('options', options);
    const connection = await mysql2.createConnection(options);
    return connection;
  }

  static async query(sql: string, params: any[] = []): Promise<any> {
    const connection = await mysql2.createConnection(options);

    const [rows, fields] = await connection.execute(sql, params);
    return rows;
  }
}

export default mysql;
