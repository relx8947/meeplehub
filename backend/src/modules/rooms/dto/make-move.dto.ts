import { IsInt, IsOptional, IsBoolean, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MakeMoveDto {
  @ApiProperty({ example: 7 })
  @IsInt()
  @Min(-1)
  row: number;

  @ApiProperty({ example: 7 })
  @IsInt()
  @Min(-1)
  col: number;

  @ApiPropertyOptional({ example: false, description: 'Pass the turn (Reversi only)' })
  @IsOptional()
  @IsBoolean()
  pass?: boolean;
}
