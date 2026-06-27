import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseUUIDPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ShipmentsService } from './shipments.service';
import { JwtAuthGuard, RolesGuard } from '../common/guards/auth.guards';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayload } from '../common/decorators/auth.decorator';
import { CreateShipmentDto, UpdateShipmentStatusDto } from './dto/shipment.dto';
import { ShipmentStatus } from '@prisma/client';

const storage = diskStorage({
  destination: './uploads',
  filename: (_req, file, cb) => {
    cb(null, `${uuidv4()}${extname(file.originalname)}`);
  },
});

@ApiTags('shipments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('shipments')
export class ShipmentsController {
  constructor(private shipmentsService: ShipmentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create shipment' })
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateShipmentDto) {
    return this.shipmentsService.create(user, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List shipments' })
  findAll(
    @CurrentUser() user: JwtPayload,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: ShipmentStatus,
  ) {
    return this.shipmentsService.findAll(user, page ? +page : 1, limit ? +limit : 20, status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get shipment by ID' })
  findOne(@CurrentUser() user: JwtPayload, @Param('id', ParseUUIDPipe) id: string) {
    return this.shipmentsService.findOne(user, id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update shipment status' })
  updateStatus(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateShipmentStatusDto,
  ) {
    return this.shipmentsService.updateStatus(user, id, dto);
  }

  @Post(':id/documents')
  @ApiOperation({ summary: 'Upload shipment document' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', { storage }))
  uploadDocument(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('documentType') documentType: string,
  ) {
    return this.shipmentsService.uploadDocument(user, id, file, documentType || 'general');
  }

  @Post(':id/proof-of-delivery')
  @ApiOperation({ summary: 'Upload proof of delivery' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', { storage }))
  uploadPod(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('notes') notes?: string,
  ) {
    return this.shipmentsService.uploadProofOfDelivery(user, id, file, notes);
  }
}
