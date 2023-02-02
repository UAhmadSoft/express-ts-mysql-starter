import { Router, Request, Response, NextFunction } from 'express';
import Controller from '@/utils/interfaces/controller.interface';
import HttpException from '@/utils/exceptions/http.exception';
import validationMiddleware from '@/middleware/validation.middleware';
import validate from '@/resources/post/post.validation';
import PostService from '@/resources/post/post.service';
import catchAsync from '@/utils/helpers/catchAsync';

class PostController implements Controller {
  public path = '/posts';
  public router = Router();
  private PostService = new PostService();

  constructor() {
    this.initialiseRoutes();
  }

  private initialiseRoutes(): void {
    this.router.post(
      `${this.path}`,
      validationMiddleware(validate.create),
      this.create
    );
  }

  private create = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const { content } = req.body;

    const post = await this.PostService.create(content, req.user._id);

    res.status(201).json({ post });
  };
}

export default PostController;
