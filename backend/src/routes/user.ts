


import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { Hono } from 'hono';
import { sign } from 'hono/jwt'
import { signupInput, signinInput } from 'sahilkumar_common_file';


export const user = new Hono<{
    Bindings: {
        DATABASE_URL: string,
        JWT_SECRET: string,
    }
}>();




user.post('/signup', async (c) => {

    const prisma = new PrismaClient({
        datasourceUrl: c.env?.DATABASE_URL,
    }).$extends(withAccelerate());

    const body = await c.req.json();
    const { success } = signupInput.safeParse(body);
    if (!success) {
        c.status(400);
        return c.json({ error: "invalid input" });
    }


    try {
        const user = await prisma.user.create({
            data: {
                email: body.email,
                password: body.password,
                name: body.name
            }
        });
        const jwt = await sign({ id: user.id }, c.env.JWT_SECRET);
        return c.json({ jwt });
    }
    catch (e) {
        c.status(403);
        console.log(e);
        return c.json({ error: "error while signing up" });
    }
})


user.post('/signin', async (c) => {

    const prisma = new PrismaClient({
        datasourceUrl: c.env?.DATABASE_URL,
    }).$extends(withAccelerate());

    const body = await c.req.json();
    const { success } = signinInput.safeParse(body);
    if (!success) {
        c.status(400);
        return c.json({ error: "invalid input" });
    }


    try {
        const user = await prisma.user.findUnique({
            where: {
                email: body.email,
                password: body.password
            }
        });
        if (!user) {
            return c.status(403);
        }
        else {
            const jwt = await sign({ id: user.id }, c.env.JWT_SECRET);
            return c.json({ jwt });
        }
    }
    catch (e) {
        c.status(403);
        console.log(e);
        return c.json({ error: "error while signing up" });
    }
})

