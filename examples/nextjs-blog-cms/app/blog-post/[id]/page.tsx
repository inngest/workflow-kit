import { notFound } from "next/navigation";
import { evaluate } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BlogPostActions } from "@/components/blog-post-actions";

import { loadBlogPost } from "@/lib/loaders/blog-post";
import { mdxComponents } from "@/lib/mdxComponents";

export const revalidate = 0;

export default async function BlogPost({ params }: { params: { id: string } }) {
  const blogPost = await loadBlogPost(params.id);

  if (blogPost) {
    const { default: MDXBlogPostContent } = await evaluate(
      blogPost.markdown || "",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      runtime as any
    );

    let MDXBlogPostAIContent: typeof MDXBlogPostContent | undefined;

    if (
      blogPost.markdown_ai_revision ||
      blogPost.ai_publishing_recommendations
    ) {
      MDXBlogPostAIContent = (
        await evaluate(
          blogPost.markdown_ai_revision ||
            blogPost.ai_publishing_recommendations,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          runtime as any
        )
      ).default;
    }

    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Blog Post</h2>
        </div>
        <Tabs defaultValue="original">
          <Card>
            <CardHeader>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="original">Original</TabsTrigger>
                {MDXBlogPostAIContent && (
                  <TabsTrigger value="ai">
                    {blogPost.markdown_ai_revision
                      ? "AI version"
                      : "AI Publishing recommendations"}
                  </TabsTrigger>
                )}
              </TabsList>
            </CardHeader>
            <CardContent>
              <TabsContent value="original">
                <MDXBlogPostContent components={mdxComponents} />
              </TabsContent>
              {MDXBlogPostAIContent && (
                <TabsContent value="ai">
                  <MDXBlogPostAIContent components={mdxComponents} />
                </TabsContent>
              )}
            </CardContent>
            <CardFooter className="flex justify-end align-bottom gap-4">
              {blogPost.status === "needs approval" && (
                <BlogPostActions id={blogPost.id.toString()} />
              )}
            </CardFooter>
          </Card>
        </Tabs>
      </div>
    );
  } else {
    return notFound();
  }
}
