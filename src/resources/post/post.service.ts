import PostModel from '@/resources/post/post.model';
import Post from '@/resources/post/post.interface';
import mysql from '@/utils/helpers/mysql';
import ApiFeatures from '@/utils/helpers/apiFeatures';

class PostService {
  private post = PostModel;

  /**
   * Create a new post
   */
  public async create(content: string, userId: string): Promise<any> {
    console.log('content', content);
    console.log('userId', userId);
    const post = await mysql.query(
      'INSERT INTO posts (content, userId) VALUES (?, ?)',
      [content, userId]
    );
    return post;
  }

  public async getAll(queryString: {
    sort?: string;
    limit?: number;
    page?: number;
  }): Promise<any> {
    let query: string = 'SELECT * FROM posts';
    let args: any[] = [];

    // * Inner join with users table
    // * Select all columns from posts table and only name from users table
    // * select * from posts , users where posts.userId = users.id

    query += ' INNER JOIN users ON posts.userId = users.id';
    // query += ' LEFT JOIN users ON posts.userId = users.id';

    const apiFeatures = new ApiFeatures(query, queryString, args, 'posts')
      .filter()
      .sort()
      .paginate();

    query = apiFeatures.query;
    args = apiFeatures.args;

    // * Inner join with users table

    //     query += `SELECT * FROM posts p
    // inner join users u ON p.userId = u.id`;

    console.log('query', query);
    console.log('args', args);

    const posts = await mysql.query(query, args);
    return posts;
  }

  public async getPostById(postId: string): Promise<any> {
    const post = await mysql.query('SELECT * FROM posts WHERE id = ?', [
      postId,
    ]);
    return post;
  }

  public async updatePostById(postId: string, content: string): Promise<any> {
    const post = await mysql.query(
      'UPDATE posts SET content = ? WHERE id = ?',
      [content, postId]
    );
    return post;
  }

  public async deletePostById(postId: string): Promise<any> {
    const post = await mysql.query('DELETE FROM posts WHERE id = ?', [postId]);
    return post;
  }
}

export default PostService;
