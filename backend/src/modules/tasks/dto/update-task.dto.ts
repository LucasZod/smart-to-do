import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsString, IsBoolean, IsOptional, IsNotEmpty, MaxLength } from 'class-validator'

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'O título não pode estar vazio' })
  @MaxLength(255, { message: 'O título deve ter no máximo 255 caracteres' })
  @ApiPropertyOptional({ example: 'Reservar voos para Paris' })
  title?: string

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({ example: true })
  isCompleted?: boolean
}
