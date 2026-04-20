import { IsString, IsNotEmpty } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class GenerateTasksDto {
  @IsString()
  @IsNotEmpty({ message: 'A chave da API não pode estar vazia' })
  @ApiProperty({ description: 'Sua chave da API do OpenRouter' })
  apiKey: string
}
