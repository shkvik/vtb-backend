import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';


export class CreatePaymentRequestDtoReq {

  @ApiProperty({ description: 'Portfolio title' })
  @IsString()
  public title: string;
}


export class CreatePrtfolioRes {

}