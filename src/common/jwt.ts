
import jwt from "jsonwebtoken";

export class JWT {
  static sign(payload: object, secretKey: string, options?: jwt.SignOptions| object): string {
    return jwt.sign(payload, secretKey, options);
  }

  static verify(token: string, secretKey: string): object | string  {
    return jwt.verify(token, secretKey);
  }

  static decode(token: string): null | { [key: string]: any } | string {
    return jwt.decode(token);
  }
}

export default JWT;
