import { Body, Controller, Delete, Get, Inject, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { PaginationDto } from 'src/common';
import { catchError } from 'rxjs';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('products')
export class ProductsController {
  constructor(
    @Inject('NATS_SERVICE') private readonly client: ClientProxy
  ) {}

  @Post()
  createProduct(@Body() createProductDto: CreateProductDto) {
    return this.client.send({ cmd: 'create_product' }, createProductDto)
  }

  @Get()
  // @MessagePattern({ cmd: 'find_all_products' })
  findAllProducts(@Query() paginationDto: PaginationDto) {
    // return paginationDto;
    return this.client.send({ cmd: 'find_all_products' }, paginationDto);
  }

  @Get(':id')
  async findOne(@Param('id',ParseIntPipe) id: number) {

    return this.client.send({ cmd: 'find_one_product' }, {id})
    .pipe(catchError((error) => {
      throw new RpcException(error);
    }))
    // try {
    //   const product = await firstValueFrom(
    //     this.productsClient.send({ cmd: 'find_one_product' }, {id})
    //   )
    //   return product;
      
    // } catch (error) {
    //   throw new RpcException(error);
    // }
  }

  @Patch()
  // @MessagePattern({ cmd: 'update_product' })
  patchProduct(
    @Body() updateProductDto: UpdateProductDto
  ) {
    return this.client.send({ cmd: 'update_product' }, updateProductDto)
    .pipe(catchError((error) => {
      throw new RpcException(error);
    }))
  }

  @Delete(':id')
  // @MessagePattern({ cmd: 'delete_product' })
  deleteProduct(@Param('id', ParseIntPipe) id: number) {
    return this.client.send({ cmd: 'delete_product' }, {id})
    .pipe(catchError((error) => {
      throw new RpcException(error);
    }))
  }

}
