import PostModel from '@/resources/post/post.model';
import Post from '@/resources/post/post.interface';
import mysql from '@/utils/helpers/mysql';

class PostService {
  private post = PostModel;

  /**
   * Create a new post
   */
  public async create(title: string, body: string): Promise<any> {
    // const post = await this.post.create({ content , userId });
    return {};
  }
}

export default PostService;
