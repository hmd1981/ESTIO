import { Body, Controller, Post } from '@nestjs/common';
import { IntakeAnswerDto } from './dto/intake-answer.dto';
import { IntakeCompleteDto } from './dto/intake-complete.dto';
import { IntakeStartDto } from './dto/intake-start.dto';
import { IntakeService } from './intake.service';

@Controller('intake')
export class IntakeController {
  constructor(private readonly intake: IntakeService) {}

  @Post('start')
  start(@Body() dto: IntakeStartDto) {
    return this.intake.start(dto);
  }

  @Post('answer')
  answer(@Body() dto: IntakeAnswerDto) {
    return this.intake.answer(dto);
  }

  @Post('complete')
  complete(@Body() dto: IntakeCompleteDto) {
    return this.intake.complete(dto);
  }
}
