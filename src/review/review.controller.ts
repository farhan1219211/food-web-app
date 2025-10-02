import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, ParseIntPipe, Query } from '@nestjs/common';
import { ReviewService } from './review.service';
import { AddReviewDto } from './dto/add-review.dto';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { Guard } from 'src/common/guard/guard.guard';
import { Roles } from 'src/common/guard/role/role.decorator';
import { Role } from 'src/common/enum/role.enum';
import { ReviewPaginationDto } from './dto/paginated.dto';

@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService){}

  // create a review
  @ApiBearerAuth()
  @UseGuards(Guard)
  @Roles(Role.CUSTOMER)
  @Post('add-review')
  @ApiOperation({
    summary: 'Add dish review',
    description:
      'Allows an authenticated customer to submit a review for a ordered dished. A review includes a rating (1–5), an optional comment, the dish ID, and the order ID to ensure the review is linked to a valid purchase.',
  })
  createReview(@GetUser('id') customerId: number, @Body() addReviewDto: AddReviewDto,
  ) {
    console.log("value of customer Id is: ", customerId);
    return  this.reviewService.createReview(customerId, addReviewDto);
  }
  
  // get reviews
  @ApiBearerAuth()
  @UseGuards(Guard)
  @Get()
  @ApiOperation({ summary: 'Fetch paginated reviews for a dish' })
  async getReviews(@Query() query: ReviewPaginationDto) {
    return this.reviewService.findReviewsByDish(query);
  }

  // delete review
  @ApiBearerAuth()
  @UseGuards(Guard)
  @Roles(Role.CUSTOMER, Role.SUPER_ADMIN)
  @Delete('delete/:id')
  @ApiOperation({ summary: 'Delete a review (only author or super admin)' })
  @ApiParam({ name: 'id', type: Number, description: 'ID of the review to delete' })
  async deleteReview(@GetUser() user: any, @Param('id') id: number) {
    return this.reviewService.deleteReview(user, id);
  }
  
}
