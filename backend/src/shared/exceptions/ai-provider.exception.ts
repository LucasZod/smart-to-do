import { HttpException, HttpStatus } from '@nestjs/common'

export class AiProviderException extends HttpException {
  constructor(message: string, status = HttpStatus.UNPROCESSABLE_ENTITY) {
    super(message, status)
  }
}
