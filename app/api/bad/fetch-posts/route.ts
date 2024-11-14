import { NextRequest, NextResponse } from "next/server";
// @ts-ignore
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    // Fetch all posts
    const posts = await prisma.post.findMany();

    // For each post, fetch comments and author
    const detailedPosts = await Promise.all(
      posts.map(async (post: { id: any; authorId: any }) => {
        const comments = await prisma.comment.findMany({
          where: { postId: post.id },
        });

        const author = await prisma.user.findUnique({
          where: { id: post.authorId },
        });

        return { ...post, comments, author };
      })
    );

    return NextResponse.json(detailedPosts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
