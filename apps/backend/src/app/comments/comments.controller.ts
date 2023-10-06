import { Controller, Get, Headers } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { PersonalSmileInterface } from '@dfcomps/contracts';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get('personal-smiles')
  getPersonalSmiles(): Promise<PersonalSmileInterface[]> {
    return this.commentsService.getPersonalSmiles();
  }
}
