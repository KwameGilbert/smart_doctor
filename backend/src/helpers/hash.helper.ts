import bcrypt from "bcryptjs";

/**
 * Hash a plain text password using bcryptjs.
 * @param password The plain text password.
 */
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

/**
 * Compare a plain text password with a hashed password.
 * @param password The plain text password.
 * @param hash The hashed password.
 */
export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};
