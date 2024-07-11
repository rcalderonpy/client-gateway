import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ClientProxy,
  Payload,
  RpcException,
} from '@nestjs/microservices';
import { CreateOrderDto, OrderPaginationDto, StatusDto } from './dto';
import { UUID } from 'crypto';
import { firstValueFrom } from 'rxjs';
import { PaginationDto } from 'src/common';
import { NATS_SERVICE } from 'src/config';

@Controller('orders')
export class OrdersController {
  constructor(
    @Inject(NATS_SERVICE) private readonly client: ClientProxy,
  ) {}

  @Post()
  create(@Payload() createOrderDto: CreateOrderDto) {
    console.log({ createOrderDto });
    return this.client.send('createOrder', createOrderDto);
  }

  @Get()
  async findAll(@Query() orderPaginationDto: OrderPaginationDto) {
    try {
      const orders = await firstValueFrom(
        this.client.send('findAllOrders', orderPaginationDto)
      )
      return orders;
    } catch (error) {
      throw new RpcException(error);      
    }
  }

  @Get('id/:id')
  async findOne(@Param('id', ParseUUIDPipe) id: UUID) {
    try {
      const order = await firstValueFrom(
        await this.client.send('findOneOrder', { id }),
      );
      return order;
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get(':status')
  async findAllByStatus(
    @Param() statusDto: StatusDto,
    @Query() paginationDto: PaginationDto,
  ) {
    try {
      // return {statusDto, paginationDto};
      const order = await firstValueFrom(
        await this.client.send('findAllOrders', {
          ...paginationDto,
          status: statusDto.status,
        })
      );
      return order;
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Patch(':id')
  changeStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() statusDto: StatusDto
  ){
    try {
      return this.client.send('changeOrderStatus', {id, status: statusDto.status})
      
    } catch (error) {
      throw new RpcException(error);
    }
  }
}
