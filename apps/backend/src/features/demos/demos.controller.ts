import { Controller, UploadedFile, Headers, UseInterceptors, Post, ParseFilePipe, Body } from '@nestjs/common';
import { DemosService } from './demos.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadDemoResponseInterface } from '@dfcomps/contracts';
import { DemoUploadDto } from './dto/demo-upload.dto';

@Controller('demos')
export class DemosController {
  constructor(private readonly demosService: DemosService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadDemo(
    @Headers('X-Auth') accessToken: string,
    @UploadedFile(new ParseFilePipe())
    demo: Express.Multer.File,
    @Body() { cupId, mapName }: DemoUploadDto,
  ): Promise<UploadDemoResponseInterface> {
    return this.demosService.upload(accessToken, demo, cupId, mapName);
  }

  @Post('match-upload')
  @UseInterceptors(FileInterceptor('file'))
  updateProfileAvatar(
    @Headers('X-Auth') accessToken: string,
    @UploadedFile(new ParseFilePipe())
    demo: Express.Multer.File,
  ): Promise<UploadDemoResponseInterface> {
    return this.demosService.matchUpload(accessToken, demo);
  }
}
