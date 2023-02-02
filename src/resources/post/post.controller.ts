import { Router, Request, Response, NextFunction } from 'express';
import Controller from '@/utils/interfaces/controller.interface';
import HttpException from '@/utils/exceptions/http.exception';
import validationMiddleware from '@/middleware/validation.middleware';
import validate from '@/resources/post/post.validation';
import PostService from '@/resources/post/post.service';
import catchAsync from '@/utils/helpers/catchAsync';
import authenticatedMiddleware from '@/middleware/authenticated.middleware';

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
      authenticatedMiddleware,
      validationMiddleware(validate.create),
      this.create
    );
    this.router.get(`${this.path}`, this.getAll);
    this.router.get(`${this.path}/:id`, this.getOne);
    this.router.patch(
      `${this.path}/:id`,
      authenticatedMiddleware,
      validationMiddleware(validate.update),
      this.update
    );

    this.router.delete(
      `${this.path}/:id`,
      authenticatedMiddleware,
      this.delete
    );
  }

  private create = catchAsync(
    async (
      req: Request,
      res: Response,
      next: NextFunction
    ): Promise<Response | void> => {
      const { content } = req.body;

      const post = await this.PostService.create(content, req.user.id);

      res.status(201).json({ post });
    }
  );

  private getAll = catchAsync(
    async (
      req: Request,
      res: Response,
      next: NextFunction
    ): Promise<Response | void> => {
      const posts = await this.PostService.getAll(req.query);

      res.status(200).json({ posts });
    }
  );

  private getOne = catchAsync(
    async (
      req: Request,
      res: Response,
      next: NextFunction
    ): Promise<Response | void> => {
      const post = await this.PostService.getPostById(req.params.id);

      if (!post) {
        return next(new HttpException(404, 'Post not found'));
      }

      res.status(200).json({ post });
    }
  );

  private update = catchAsync(
    async (
      req: Request,
      res: Response,
      next: NextFunction
    ): Promise<Response | void> => {
      const { content } = req.body;

      const post = await this.PostService.updatePostById(
        req.params.id,
        content
      );

      if (!post) {
        return next(new HttpException(404, 'Post not found'));
      }

      res.status(200).json({ post });
    }
  );

  private delete = catchAsync(
    async (
      req: Request,
      res: Response,
      next: NextFunction
    ): Promise<Response | void> => {
      const post = await this.PostService.deletePostById(req.params.id);

      if (!post) {
        return next(new HttpException(404, 'Post not found'));
      }

      res.status(200).json({ post });
    }
  );
}

export default PostController;
