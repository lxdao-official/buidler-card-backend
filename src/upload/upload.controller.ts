import { Controller, Get, Post, Body } from '@nestjs/common';
import { Buidler } from '@prisma/client';
import { BusinessException } from 'src/common/business.exception';
import { GetBuidler } from 'src/common/get-buidler.decorator';
import { UploadService } from './upload.service';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('/ipfs')
  async uploadToIPFS(
    @Body() payload: { imageDataUrl: string },
    @GetBuidler() buidler: Buidler,
  ) {
    if (!buidler) {
      throw new BusinessException('Connect wallet to upload image.');
    }
    const { imageDataUrl } = payload;
    const cid = await this.uploadService.uploadToNFTStorage(imageDataUrl);

    return {
      data: `https://${cid}.ipfs.nftstorage.link`,
    };
  }
}
