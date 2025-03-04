import { IsString, IsNotEmpty, IsObject, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFooterDto {
  @ApiProperty({ description: 'Tên của footer template' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Loại footer (simple, complex, custom)' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({ 
    description: 'Nội dung của footer dạng JSON',
    example: {
      sections: [
        {
          type: 'links',
          title: 'Quick Links',
          items: [
            { label: 'About Us', url: '/about' }
          ]
        }
      ]
    }
  })
  @IsObject()
  @IsNotEmpty()
  content: Record<string, any>;

  @ApiProperty({ description: 'Trạng thái kích hoạt của footer' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
} 