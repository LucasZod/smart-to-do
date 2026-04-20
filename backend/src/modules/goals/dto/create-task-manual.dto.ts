import { IsString, IsNotEmpty, MaxLength } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CreateTaskManualDto {
  @IsString()
  @IsNotEmpty({ message: 'O título não pode estar vazio' })
  @MaxLength(255, { message: 'O título deve ter no máximo 255 caracteres' })
  @ApiProperty({ example: 'Reservar voos' })
  title: string
}
