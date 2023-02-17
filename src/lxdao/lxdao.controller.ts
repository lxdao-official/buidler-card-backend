import { Controller, Get, Res, Header } from '@nestjs/common';
import { existsSync, writeFileSync } from 'fs';
import { Buidler } from '@prisma/client';
import { join } from 'path';
import { createCanvas, loadImage } from 'canvas';
import { ProjectService } from '../project/project.service';
import { GetBuidler } from 'src/common/get-buidler.decorator';
import { convertIpfsGateway } from '../common/utils';
import { BuidlerService } from '../buidler/buidler.service';

@Controller('lxdao')
export class LxdaoController {
  constructor(
    private readonly buidlerService: BuidlerService,
    private readonly projectService: ProjectService,
  ) {}

  @Get('/lxdaoIntroduction')
  @Header('Content-Type', 'image/png')
  async lxdaoIntroduction(@GetBuidler() buidler: Buidler, @Res() response) {
    const buidlers = await this.buidlerService.findAll(
      undefined,
      undefined,
      undefined,
      undefined,
      {
        skip: 0,
        take: 6,
      },
    );
    const ids = [];
    for (let i = 0; i < buidlers.length; i++) {
      const item = buidlers[i];
      if (item.avatar) {
        let avatarImg;
        ids.push(item.address);
        try {
          const isExist = await existsSync(
            join(__dirname, `../../images/${item.address}.png`),
          );
          if (isExist) {
            avatarImg = await loadImage(
              join(__dirname, `../../images/${item.address}.png`),
            );
          } else {
            avatarImg = await loadImage(convertIpfsGateway(item.avatar));
            const canvasSave = createCanvas(avatarImg.width, avatarImg.height);
            const ctxSave = canvasSave.getContext('2d');
            ctxSave.drawImage(avatarImg, 0, 0);
            writeFileSync(
              join(__dirname, `../../images/${item.address}.png`),
              canvasSave.toBuffer(),
            );
          }
        } catch (error) {
          console.log(error);
        }
      }
    }

    const projects = await this.projectService.findAll('', {
      skip: 0,
      take: 5,
    });
    for (let i = 0; i < projects.length; i++) {
      const item = projects[i];
      if (item.logo) {
        let logoImg;
        ids.push(`project${item.id}`);
        try {
          const isExist = await existsSync(
            join(__dirname, `../../images/project${item.id}.png`),
          );
          if (isExist) {
            logoImg = await loadImage(
              join(__dirname, `../../images/project${item.id}.png`),
            );
          } else {
            logoImg = await loadImage(convertIpfsGateway(item.logo));
            const canvasSave = createCanvas(logoImg.width, logoImg.height);
            const ctxSave = canvasSave.getContext('2d');
            ctxSave.drawImage(logoImg, 0, 0);
            writeFileSync(
              join(__dirname, `../../images/project${item.id}.png`),
              canvasSave.toBuffer(),
            );
          }
        } catch (error) {
          console.log(error);
        }
      }
    }
    const imgList = [];
    for (let i = 0; i < ids.length; i++) {
      const img = await loadImage(
        join(__dirname, `../../images/${ids[i]}.png`),
      );
      imgList.push(img);
    }

    const canvas = createCanvas(481, 501);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const shuffle = (array) => {
      const copy = [];
      let len = array.length;
      while (len) {
        const index = Math.floor(Math.random() * len--);
        copy.push(array.splice(index, 1)[0]);
      }
      return copy;
    };
    let positions = [
      { x: 105, y: 7, width: 56, height: 56 },
      { x: 79, y: 98, width: 56, height: 56 },
      { x: 235, y: 115, width: 45, height: 45 },
      { x: 310, y: 48, width: 67, height: 67 },
      { x: 135, y: 168, width: 103, height: 103 },
      { x: 343, y: 160, width: 62, height: 62 },
      { x: 14, y: 241, width: 93, height: 93, radius: 70 },
      { x: 251, y: 257, width: 107, height: 107, radius: 73 },
      { x: 89, y: 353, width: 60, height: 60 },
      { x: 185, y: 390, width: 93, height: 93 },
      { x: 388, y: 322, width: 93, height: 93 },
    ];

    positions = shuffle(positions);

    for (let i = 0; i < imgList.length; i++) {
      const img = imgList[i];
      try {
        const x = positions[i].x,
          y = positions[i].y,
          w = positions[i].width,
          h = positions[i].height,
          borderRadius = positions[i].radius || positions[i].height / 2;
        const r = Math.min(borderRadius, w / 2, h / 2);

        ctx.save();
        ctx.beginPath();

        ctx.shadowOffsetX = 10;
        ctx.shadowOffsetY = 10;
        ctx.shadowBlur = 60;
        ctx.shadowColor = 'rgba(100,204,235,0.5)'; //#64CCEB或使用rgb（红色，绿色，蓝色）
        ctx.fillStyle = 'rgba(100,204,235,0.1)';
        ctx.moveTo(x, y + r);
        ctx.arcTo(x, y, x + r, y, r);
        ctx.lineTo(x + w - r, y);
        ctx.arcTo(x + w, y, x + w, y + r, r);
        ctx.lineTo(x + w, y + h - r);
        ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
        ctx.lineTo(x + r, y + h);
        ctx.arcTo(x, y + h, x, y + h - r, r);
        ctx.lineTo(x, y + r);
        ctx.fill();
        ctx.clip();

        ctx.drawImage(img, x, y, w, h);
        ctx.restore();
      } catch (error) {
        console.log(error);
      }
    }

    const stream = canvas.createPNGStream();
    return stream.pipe(response);
  }
}
