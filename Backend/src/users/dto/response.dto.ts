export class UserResponseDto {
  id: string;
  name: string;
  email: string;
  workspaces?: any[];
  createdAt: Date;
  updatedAt?: Date;
}

export class PaginationResponseDto {
  currentPage: number;
  totalPages: number;
  totalUsers: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export class GetAllUsersResponseDto {
  users: UserResponseDto[];
  pagination: PaginationResponseDto;
}

export class SingleUserResponseDto {
  message: string;
  user: UserResponseDto;
}

export class DeleteUserResponseDto {
  message: string;
}

export class AssignWorkspaceResponseDto {
  message: string;
  user: {
    id: string;
    name: string;
    email: string;
    workspaces: any[];
  };
}
