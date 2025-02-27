const { z } = require("zod");

const CreateUserSchema = z.object({
    username: z.string().min(3).max(20),
    password: z.string(),
    name: z.string()
});

const SigninSchema = z.object({
    username: z.string().min(3).max(20),
    password: z.string(),
});

const CreateRoomSchema = z.object({
    name: z.string().min(3).max(20),
});

module.exports = { CreateUserSchema, SigninSchema, CreateRoomSchema };
