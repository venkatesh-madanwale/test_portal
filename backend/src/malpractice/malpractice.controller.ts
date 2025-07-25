import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
  BadRequestException,
  Header,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MalpracticeService } from './malpractice.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { RegisterCandidateDto } from './dto/create-malpractice.dto';
import { AddAlertDto } from './dto/create-alert.dto';

@Controller('malpractice')
export class MalpracticeController {
  constructor(
    private readonly service: MalpracticeService,
    private readonly cloudinary: CloudinaryService,
  ) { }

  @Post('register-candidate')
  @UseInterceptors(FileInterceptor('file'))
  @Header('Access-Control-Allow-Origin', 'http://localhost:5173')
  @Header('Access-Control-Allow-Credentials', 'true')
  async registerCandidate(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: RegisterCandidateDto,
  ) {
    if (!file) throw new BadRequestException('No file uploaded');

    const imageUrl = await this.cloudinary.uploadImage(file, 'profile');

    const result = await this.service.registerCandidate({
      applicantId: body.applicantId,
      profileImageUrl: imageUrl,
    });

    return {
      success: true,
      profileImageUrl: result.profileImageUrl,
      applicantId: result.applicantId,
    };
  }

  @Post('alert')
  @UseInterceptors(FileInterceptor('file'))
  async addAlert(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: AddAlertDto,
  ) {
    if (!file) {
      throw new BadRequestException('No image file provided');
    }

    const imageUrl = await this.cloudinary.uploadImage(file, 'alerts');

    const result = await this.service.addAlert({
      applicantId: body.applicantId,
      alertMessage: body.alertMessage,
      malpracticeImageUrl: imageUrl,
    });

    return {
      success: true,
      alertMessage: result.alertMessage,
      malpracticeImageUrl: result.malpracticeImageUrl,
    };
  }
}



// import {
//   Controller,
//   Post,
//   UploadedFile,
//   UseInterceptors,
//   Body,
//   BadRequestException,
//   Header,
// } from '@nestjs/common';
// import { FileInterceptor } from '@nestjs/platform-express';
// import { MalpracticeService } from './malpractice.service';
// import { CloudinaryService } from '../cloudinary/cloudinary.service';

// @Controller('malpractice')
// export class MalpracticeController {
//   constructor(
//     private readonly service: MalpracticeService,
//     private readonly cloudinary: CloudinaryService,
//   ) {}

//   @Post('register-candidate')
//   @UseInterceptors(FileInterceptor('file'))
//   // @Header('Access-Control-Allow-Origin', 'http://localhost:5173')
//   // @Header('Access-Control-Allow-Credentials', 'true')
//   async registerCandidate(
//     @UploadedFile() file: Express.Multer.File,
//     @Body() body: { applicantId: string },
//   ) {
//     if (!file) throw new BadRequestException('No file uploaded');
//     const imageUrl = await this.cloudinary.uploadImage(file, 'profile');
//     const result = await this.service.registerCandidate({
//       applicantId: body.applicantId,
//       profileImageUrl: imageUrl,
//     });

//     return {
//       success: true,
//       profileImageUrl: result.profileImageUrl,
//       applicantId: result.applicantId,
//     };
//   }

//   @Post('alert')
//   @UseInterceptors(FileInterceptor('file'))
//   async addAlert(
//     @UploadedFile() file: Express.Multer.File,
//     @Body() body: { alertMessage: string; applicantId: string },
//   ) {
//     if (!file) {
//       throw new BadRequestException('No image file provided');
//     }

//     // Upload to Cloudinary (in 'alerts' folder)
//     const imageUrl = await this.cloudinary.uploadImage(file, 'alerts');

//     return this.service.addAlert({
//       applicantId: body.applicantId,
//       alertMessage: body.alertMessage,
//       malpracticeImageUrl: imageUrl,
//     });
//   }
// }
