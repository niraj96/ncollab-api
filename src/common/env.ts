export default class EnvData {
  static PORT: number = parseInt(process.env.PORT || "3000", 10);
  static NODE_ENV: string = process.env.NODE_ENV || "development";
  static JWT_KEY: string = process.env.JWT_KEY || "default_secret_key";
  static MONGO_URI: string = process.env.MONGO_URI || "mongodb://localhost:27017/ncollab";
  static DEFAULT_JWT_EXPIRES_IN: string | unknown = process.env.DEFAULT_JWT_EXPIRES_IN || "1h";
}