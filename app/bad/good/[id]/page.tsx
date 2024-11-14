import { GetStaticPaths, GetStaticProps } from "next";
import { PrismaClient } from "@prisma/client";
import React from "react";

const prisma = new PrismaClient();

type BlogPostProps = {
  post: {
    id: string;
    title: string;
    content: string;
    author: string;
  };
};

const BlogPost = ({ post }: BlogPostProps) => {
  return (
    <div>
      <h1>{post.title}</h1>
      <p>By {post.author}</p>
      <article>{post.content}</article>
    </div>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await prisma.post.findMany({
    select: { id: true },
  });

  const paths = posts.map((post) => ({
    params: { id: post.id },
  }));

  return { paths, fallback: "blocking" };
};

export const getStaticProps: GetStaticProps = async (context) => {
  const { id } = context.params!;

  const post = await prisma.post.findUnique({
    where: { id: String(id) },
    include: { author: true },
  });

  if (!post) {
    return { notFound: true };
  }

  return {
    props: {
      post: {
        id: post.id,
        title: post.title,
        content: post.content,
        author: post.author.name,
      },
    },
    revalidate: 60 * 10, // Revalidate every 10 minutes
  };
};

export default BlogPost;
