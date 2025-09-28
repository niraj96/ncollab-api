import { Router, Request, Response, NextFunction } from "express";
import {ApiResponse} from "../types/response";
import { loginUserRequest, registerUserRequest, loginResponse } from "../types/user";
import dbInstance from "../common/dummyDb";
import JWT from  "../common/jwt";
import EnvData from "../common/env";
import authMiddleware from "../middleware/auth.api.middleware";

const userRouter: Router = Router();

userRouter.post("/login", (req:Request, res:Response, next: NextFunction) => {
  // Handle user login
  try{

    const { email, password }: loginUserRequest = req.body;
    if(!email || !password){
        throw new Error("Email and password are required", { cause: 400 });
    }

    // In a real application, you would verify the user credentials here
    const user = dbInstance.getAllUsers().find(u => u.email === email && u.password === password);
    console.log('User found:', user);
    if(!user){
        throw new Error("Invalid email or password", { cause: 401 });
    }

    const token: string = JWT.sign({ userId: user.id, name: user.name }, EnvData.JWT_KEY, { expiresIn: EnvData.DEFAULT_JWT_EXPIRES_IN });

    const loginResponse:loginResponse = { userId: user.id, token };
   
    const result: ApiResponse<loginResponse, null> = {
      code: 200,
      success: true,
      data:loginResponse,
      message: "Login successful",
      error: null,
      meta: null
    };

    return res.status(result.code).json(result);

  }catch(err){
    next(err);
  }
});

userRouter.post("/register", (req: Request, res: Response, next:NextFunction) => {
    // Handle user registration
    try{

        const body: registerUserRequest = req.body;

        const { name, email, password } = body;
       
        if(!name || !password || !email){
            throw new Error("Username, Email and password are required", { cause: 400 });
        }

        // In a real application, you would save the user to the database here
        dbInstance.saveUser({
            name: name,
            email,
            password,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        const result: ApiResponse<null, null> = {
          code: 201,
          success: true,
          data: null,
          message: "User registered successfully",
          error: null,
          meta: null
        };

        return res.status(result.code).json(result);

    }catch(err){
        next(err);
    }
});


//private route  below - requires authentication
userRouter.use(authMiddleware.validate);

userRouter.get("/:id", (req: Request, res: Response, next:NextFunction) => {

    try{
        const userId: string = req?.params?.id as string;
        if(!userId){
            throw new Error("User ID is required", { cause: 400 });
        }

        const user = dbInstance.getUserById(userId);
        if(!user){
            throw new Error("User not found", { cause: 404 });
        }

        const result: ApiResponse<typeof user, null> = {
          code: 200,
          success: true,
          data: user,
          message: "User fetched successfully",
          error: null,
          meta: null
        };

        return res.status(result.code).json(result);

    }catch(err){
      next(err);
    }
  const userId = req.params.id;
  // Fetch user by ID
  res.send(`User details for ID: ${userId}`);
});

userRouter.get("/users", (req: Request, res: Response, next:NextFunction) => {

    try{
        const users = dbInstance.getAllUsers();

        const result: ApiResponse<typeof users, null> = {
          code: 200,
          success: true,
          data: users,
          message: "Users fetched successfully",
          error: null,
          meta: null
        };

        return res.status(result.code).json(result);

    }catch(err){
      next(err);
    }
  // Fetch all users
  //res.send("List of all users");
});

export default userRouter;