import {
  Body,
  Controller,
  Get,
  Headers,
  HttpStatus,
  Param,
  ParseFilePipeBuilder,
  ParseIntPipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { AdminNewsService } from './admin-news.service';
import {
  AdminEditNewsInterface,
  AdminNewsListInterface,
  AdminNewsDto,
  UploadedFileLinkInterface,
} from '@dfcomps/contracts';
import { FileInterceptor } from '@nestjs/platform-express';
import { MulterFileInterface } from 'apps/backend/src/shared/interfaces/multer.interface';

@Controller('admin/news')
export class AdminNewsController {
  constructor(private readonly adminNewsService: AdminNewsService) {}

  @Get('get-all-news')
  getAllNews(@Headers('X-Auth') accessToken: string | undefined): Promise<AdminNewsListInterface[]> {
    return this.adminNewsService.getAllNews(accessToken);
  }

  @Get('get/:newsId')
  getSingleNews(
    @Headers('X-Auth') accessToken: string | undefined,
    @Param('newsId', new ParseIntPipe()) newsId: number,
  ): Promise<AdminEditNewsInterface> {
    return this.adminNewsService.getSingleNews(accessToken, newsId);
  }

  @Post('delete/:newsId')
  deleteNews(
    @Headers('X-Auth') accessToken: string | undefined,
    @Param('newsId', new ParseIntPipe()) newsId: number,
  ): Promise<void> {
    return this.adminNewsService.deleteNews(accessToken, newsId);
  }

  @Post('post')
  postNews(@Headers('X-Auth') accessToken: string | undefined, @Body() AdminNewsDto: AdminNewsDto): Promise<void> {
    return this.adminNewsService.postNews(accessToken, AdminNewsDto);
  }

  @Post('update/:newsId')
  updateNews(
    @Headers('X-Auth') accessToken: string | undefined,
    @Body() AdminNewsDto: AdminNewsDto,
    @Param('newsId', new ParseIntPipe()) newsId: number,
  ): Promise<void> {
    return this.adminNewsService.updateNews(accessToken, AdminNewsDto, newsId);
  }

  @Post('upload-news-image')
  @UseInterceptors(FileInterceptor('image'))
  uploadNewsImage(
    @Headers('X-Auth') accessToken: string | undefined,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /jpg|png|gif|jpeg/,
        })
        .addMaxSizeValidator({
          maxSize: 5000000,
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    image: MulterFileInterface,
  ): Promise<UploadedFileLinkInterface> {
    return this.adminNewsService.uploadNewsImage(accessToken, image);
  }
}
