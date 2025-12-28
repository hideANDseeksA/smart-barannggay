import bcrypt from "bcryptjs"

const SALT_ROUNDS = 12

export const hashData = async (data: string): Promise<string> => {
  return bcrypt.hash(data, SALT_ROUNDS)
}

export const compareHash = async (
  plain: string,
  hashed: string
): Promise<boolean> => {
  return bcrypt.compare(plain, hashed)
}
