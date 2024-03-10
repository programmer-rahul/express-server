import bcrypt from "bcrypt";

const encryptUserPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

export { encryptUserPassword };
