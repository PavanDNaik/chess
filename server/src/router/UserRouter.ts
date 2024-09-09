import { Router } from "express";
import prisma from "../prisma";
const userRouter = Router();

userRouter.post("/signUp", async (req, res) => {
  let name: string | undefined = "";
  let email: string | undefined = "";

  name = req.body.name;
  email = req.body.email;
  if (name && email) {
    const user = await prisma.user.findFirst({
      where: {
        email: email,
        name: name,
      },
    });
    if (user) {
      return res.send({ success: true, user: user });
    } else {
      const user = await prisma.user.create({
        data: {
          name: name,
          email: email,
        },
      });
      return res.send({ success: true, user: user });
    }
  } else {
    res.send({ succes: false, error: "Invalid credential" });
  }
});

userRouter.post("/signIn", async (req, res) => {
  let name: string | undefined = "";
  let email: string | undefined = "";

  name = req.body.name;
  email = req.body.email;
  if (name && email) {
    const user = await prisma.user.findFirst({
      where: {
        email: email,
        name: name,
      },
    });
    if (user) {
      return res.send({ success: true, user: user });
    } else {
      res.send({ succes: false, error: "Invalid credential" });
    }
  } else {
    res.send({ succes: false, error: "Invalid credential" });
  }
});

export default userRouter;
