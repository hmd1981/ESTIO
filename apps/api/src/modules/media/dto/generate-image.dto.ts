import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { GENERATE_IMAGE_PROMPT_MAX_LENGTH } from '../generate-image-payload';

/**
 * Minimum fields for POST /media/generate-image.
 * The controller forwards the full JSON body so optional worker fields are preserved
 * (global ValidationPipe uses forbidNonWhitelisted — use assertGenerateImagePayload for that route).
 */
export class GenerateImageDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(GENERATE_IMAGE_PROMPT_MAX_LENGTH)
  prompt!: string;
}
