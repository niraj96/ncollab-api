import { NextFunction, Request, Response} from "express";
import JWT from "../common/jwt";
import EnvData from "../common/env";

export default {
  validate: (req:Request, res: Response, next: NextFunction) => {
     // Simple auth middleware for demo purposes
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Authorization header missing or malformed', { cause: 401 });
    }
    const token: string | undefined = authHeader.split(' ')[1];
    try {
        if(!token) {
            throw new Error('Authentication token required', { cause: 401 });
        }
      // Define DecodedTokenType inline if not imported elsewhere
      type DecodedTokenType = { userId: string; name: string; iat?: number; exp?: number };
      const decoded = JWT.verify(token, EnvData.JWT_KEY) as DecodedTokenType;
      (req as any).user = decoded; // Attach user info to request object
      next();
    } catch (err) {
      throw new Error('Invalid or expired token', { cause: 401 });
    }
  },
};