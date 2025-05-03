import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { ReviewTranslation } from './entities/review-translation.entity';
import { AdminReviewService } from './admin/services/admin-review.service';
import { FrontendReviewService } from './frontend/services/frontend-review.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Review, ReviewTranslation]),
  ],
  providers: [
    AdminReviewService,
    FrontendReviewService,
  ],
  exports: [
    AdminReviewService,
    FrontendReviewService,
  ],
})
export class ReviewModule {} 