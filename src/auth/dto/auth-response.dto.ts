import { Role } from 'src/common/enum/role.enum';

export class AuthResponseDto {
  id: number;
  email: string;
  role: Role;
}
