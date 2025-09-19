import { Expose } from 'class-transformer';
import { Role } from '../../common/enum/role.enum';

export class UserResponseDto {
  @Expose()
  id: number;

  @Expose()
  fullName: string;

  @Expose()
  phone?: string;

  @Expose()
  role: Role;

  @Expose()
  isActive: boolean;

//   @Expose()
//   avatarUrl: string;

  @Expose()
  createdAt: Date;

//   @Expose()
//   updatedAt: Date;
}
