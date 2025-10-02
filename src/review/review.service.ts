import { BadRequestException, ForbiddenException, Injectable, NotFoundException, UseGuards } from '@nestjs/common';
import { AddReviewDto } from './dto/add-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { Repository } from 'typeorm';
import { OrderService } from 'src/order/order.service';
import { MenuService } from 'src/menu/menu.service';
import { OrderStatus } from 'src/order/enum/order-status.enum';
import { ReviewPaginationDto } from './dto/paginated.dto';
import { Role } from 'src/common/enum/role.enum';

@Injectable()
export class ReviewService {

  constructor(
    @InjectRepository(Review) private readonly reviewRepository: Repository<Review>,
    private readonly orderService: OrderService,
    private readonly menuService: MenuService
  ) {}

  // create a review
  async createReview(customerId: number, dto: AddReviewDto) {
    // if user has purchased this dish in the given order
    const order = await this.orderService.findOrderToReview(
      customerId,
      dto.dishId,
      dto.orderId,
    );

    if (!order) {
      throw new BadRequestException(
        'You must purchase this product before reviewing',
      );
    } 
    console.log("review service: order is: ", order);

    // check if a review already exists for this (user + dish + order)
    const existing = await this.reviewRepository.findOne({
      where: {
        customer: { id: customerId},
        dish: { id: dto.dishId },
        order: { id: dto.orderId },
      },
    });

    if (existing) {
      throw new BadRequestException(
        'You already reviewed this dish in this order',
      );
    }

    //  create and save review
    if(order.status != OrderStatus.DELIVERED){
      throw new BadRequestException(`Order is not delivered yet, you can't post review for now`);
    }
    const review = this.reviewRepository.create({
      ...dto,
      customer: { id: customerId },
      dish: { id: dto.dishId },
      order: { id: dto.orderId },
    });

    await this.reviewRepository.save(review);
      //Recalculate product rating
    const { avg } = await this.reviewRepository
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'avg')
      .where('review.dishId = :dishId', { dishId: dto.dishId })
      .getRawOne();
      console.log("value of average is: ", avg);

     await this.menuService.updateReview(dto.dishId, Number(avg));

    return review;
  }

  // fetch review for a single dish
  async findReviewsByDish(query: ReviewPaginationDto) {
    const { page, limit, dishId } = query;

    const [reviews, total] = await this.reviewRepository.findAndCount({
      where: { dish: { id: dishId } },
      relations: ['customer', 'dish'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    console.log(reviews);
    if (!reviews.length) {
      throw new NotFoundException(`No reviews found for dish ID ${dishId}`);
    }

  return {
    data: reviews.map((review) => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
      customer: {
        id: review.customer.id,
        fullName: review.customer.fullName,
        avatarUrl: review.customer.avatarUrl,
      },
      dish: {
        id: review.dish.id,
        name: review.dish.name,
        price: review.dish.price,
        imageUrl: review.dish.imageUrl,
        rating: review.dish.rating,
      },
      orderId: review.orderId,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  }

  // delete review
  async deleteReview(user: any, reviewId: number) {
    const review = await this.reviewRepository.findOne({
      where: { id: reviewId },
      relations: ['customer'],
    });

    if (!review) {
      throw new NotFoundException(`Review with ID ${reviewId} not found`);
    }

    // check ownership or role
    const isOwner = review.customer.id === user.id;
    const isSuperAdmin = user.role === Role.SUPER_ADMIN;

    if (!isOwner && !isSuperAdmin) {
      throw new ForbiddenException('You are not allowed to delete this review');
    }

    await this.reviewRepository.remove(review);

    return { message: 'Review deleted successfully' };
  }



}

