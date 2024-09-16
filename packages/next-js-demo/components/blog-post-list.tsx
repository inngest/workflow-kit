"use client";
/* eslint-disable react-hooks/exhaustive-deps */

import { useCallback, useEffect, useState } from "react";
import { CalendarIcon, Edit, Eye, RocketIcon } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { capitalize } from "@/lib/utils";
import Link from "next/link";
import { BlogPost } from "@/lib/supabase/client";
import { listBlogPosts, sendBlogPostToReview } from "@/app/actions";

export const BlogPostList = () => {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);

  const refreshBlogPosts = useCallback(async () => {
    const list = await listBlogPosts();
    setBlogPosts(list);
  }, []);

  useEffect(() => {
    const interval = setInterval(refreshBlogPosts, 1000);
    refreshBlogPosts();

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Blog Posts</h2>
        {/* <Button>
              <PlusIcon className="mr-2 h-4 w-4" /> Create a new blog post
            </Button> */}
      </div>
      <div className="grid gap-6">
        {(blogPosts || []).map((blogPost) => (
          <Card key={blogPost.id}>
            <CardHeader className="flex flex-row">
              <div className="flex-1">
                <CardTitle>{blogPost.title}</CardTitle>
                <CardDescription>{blogPost.subtitle}</CardDescription>
              </div>
              {blogPost.markdown_ai_revision && (
                <div className="flex">
                  <Badge variant="secondary">
                    An AI revision need approval
                  </Badge>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-muted-foreground">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {new Date(blogPost.created_at!).toLocaleDateString()}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div
                className={`px-2 py-1 rounded-full text-xs ${
                  blogPost.status === "published"
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {capitalize(blogPost.status!)}
              </div>
              {blogPost.markdown_ai_revision ? (
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/blog-post/${blogPost.id}`}>
                    <Edit className="mr-2 h-4 w-4" /> Review
                  </Link>
                </Button>
              ) : blogPost.status === "draft" ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => sendBlogPostToReview(blogPost.id.toString())}
                >
                  <RocketIcon className="mr-2 h-4 w-4" /> Send to review
                </Button>
              ) : (
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/blog-post/${blogPost.id}`}>
                    <Eye className="mr-2 h-4 w-4" /> View
                  </Link>
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};
