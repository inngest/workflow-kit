// import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { capitalize } from "@/lib/utils";
import { CalendarIcon, PlusIcon, RocketIcon } from "lucide-react";

export default async function Dashboard() {
  const supabase = createClient();
  const { data: blogPosts } = await supabase.from("blog_posts").select("*");

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Blog Posts</h2>
        <Button>
          <PlusIcon className="mr-2 h-4 w-4" /> Create a new blog post
        </Button>
      </div>
      <div className="grid gap-6">
        {(blogPosts || []).map((post) => (
          <Card key={post.id}>
            <CardHeader>
              <CardTitle>{post.title}</CardTitle>
              <CardDescription>{post.subtitle}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-muted-foreground">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {new Date(post.created_at!).toLocaleDateString()}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div
                className={`px-2 py-1 rounded-full text-xs ${
                  post.status === "published"
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {capitalize(post.status!)}
              </div>
              {post.status !== "published" && (
                <Button variant="outline" size="sm">
                  <RocketIcon className="mr-2 h-4 w-4" /> Review & Publish
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
