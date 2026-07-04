import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuditService } from '../audit/audit.service';

@UseGuards(JwtAuthGuard)
@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly auditService: AuditService
  ) {}

  @Get()
  findAll(@Request() req, @Query() query: any) {
    return this.productsService.findAll(req.user.sub, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.productsService.findOne(id, req.user.sub);
  }

  @Post()
  async create(@Body() body: any, @Request() req) {
    const product = await this.productsService.create(req.user.sub, body);
    this.auditService.log(req.user.sub, 'criação', 'Product', product.id).catch(()=>{});
    return product;
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any, @Request() req) {
    const product = await this.productsService.update(id, req.user.sub, body);
    this.auditService.log(req.user.sub, 'atualização', 'Product', id).catch(()=>{});
    return product;
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    const result = await this.productsService.remove(id, req.user.sub);
    this.auditService.log(req.user.sub, 'exclusão', 'Product', id).catch(()=>{});
    return result;
  }
}
