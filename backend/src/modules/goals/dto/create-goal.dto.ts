import { IsString, IsNotEmpty, IsBoolean, ValidateIf, MaxLength } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateGoalDto {
  @IsString()
  @IsNotEmpty({ message: 'O objetivo não pode estar vazio' })
  @MaxLength(255, { message: 'O objetivo deve ter no máximo 255 caracteres' })
  @ApiProperty({ example: 'Planejar uma viagem para a Europa' })
  objective: string

  @IsBoolean()
  @ApiProperty({ example: false })
  generateWithAi: boolean

  @ValidateIf((dto) => dto.generateWithAi === true)
  @IsString()
  @IsNotEmpty({ message: 'A chave da API é obrigatória quando generateWithAi é true' })
  @ApiPropertyOptional({ description: 'Obrigatório quando generateWithAi é true' })
  apiKey?: string
}
