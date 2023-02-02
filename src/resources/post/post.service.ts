import PostModel from '@/resources/post/post.model';
import Post from '@/resources/post/post.interface';

class PostService {
  private post = PostModel;

  /**
   * Create a new post
   */
  public async create(title: string, body: string): Promise<Post> {
    const post = await this.post.create({ body });

    return post;
  }
}

export default PostService;
