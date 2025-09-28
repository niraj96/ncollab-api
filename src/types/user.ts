export interface registerUserRequest{
  readonly name: string;
  readonly email: string;
  readonly password: string;
} 

export interface loginUserRequest{
  readonly email: string;
  readonly password: string;
};

export interface loginResponse {
  userId: string;
  token: string;
}

export interface userType {
  id: string;
  name: string;
  email: string;
  password: string; // In a real application, passwords should be hashed
  createdAt: Date;
  updatedAt: Date;
};
