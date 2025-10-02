import { PartialType } from '@nestjs/swagger';
import { AddReviewDto } from './add-review.dto';

export class UpdateReviewDto extends PartialType(AddReviewDto) {}
