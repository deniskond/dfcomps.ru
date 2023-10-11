import { Body, Controller, Get, Post, Headers } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentActionResultInterface, CommentInterface, PersonalSmileInterface } from '@dfcomps/contracts';
import { AddCommentDto } from './dto/add-comment.dto';
import { DeleteCommentDto } from './dto/delete-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get('personal-smiles')
  getPersonalSmiles(): Promise<PersonalSmileInterface[]> {
    return this.commentsService.getPersonalSmiles();
  }

  @Post('add')
  addComment(
    @Body() { text, newsId }: AddCommentDto,
    @Headers('X-Auth') accessToken: string,
  ): Promise<CommentInterface[]> {
    return this.commentsService.addComment(accessToken, text, newsId);
  }

  @Post('delete')
  deleteComment(@Body() { commentId }: DeleteCommentDto): Promise<CommentActionResultInterface> {
    return this.commentsService.deleteComment(commentId);
  }

  @Post('update')
  updateComment(
    @Body() { text, commentId }: UpdateCommentDto,
    @Headers('X-Auth') accessToken: string,
  ): Promise<CommentActionResultInterface> {
    return this.commentsService.updateComment(accessToken, text, commentId);
  }

  @Post('admin_delete')
  adminDeleteComment(
    @Body() { commentId }: DeleteCommentDto,
    @Headers('X-Auth') accessToken: string,
  ): Promise<CommentInterface[]> {
    return this.commentsService.adminDeleteComment(accessToken, commentId);
  }
}
