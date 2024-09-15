/* eslint-disable @typescript-eslint/no-explicit-any */
import { notFound } from "next/navigation";
import { evaluate } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";

import { SaveIcon } from "lucide-react";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

import { createClient } from "@/lib/supabase/server";
// import { approveBlogPostAiSuggestions } from "@/app/actions";

export const revalidate = 0;

// shadcn markdown compat
const components: any = {
  h1: ({ children, ...props }: any) => (
    <h1
      {...props}
      className="scroll-m-20 text-2xl font-extrabold tracking-tight"
    >
      {children}
    </h1>
  ),
  h2: ({ children, ...props }: any) => (
    <h2
      {...props}
      className="mt-10 scroll-m-20 border-b pb-2 text-xl font-semibold tracking-tight transition-colors first:mt-0"
    >
      {children}
    </h2>
  ),
  p: ({ children, ...props }: any) => (
    <p {...props} className="leading-7 [&:not(:first-child)]:mt-6">
      {children}
    </p>
  ),
  ul: ({ children, ...props }: any) => (
    <ul {...props} className="my-6 ml-6 list-disc [&>li]:mt-2">
      {children}
    </ul>
  ),
  li: ({ children, ...props }: any) => (
    <li {...props} className="ml-4 list-outside list-disc mb-2">
      {children}
    </li>
  ),
  a: ({ children, ...props }: any) => (
    <a
      {...props}
      className="font-medium text-primary underline underline-offset-4"
    >
      {children}
    </a>
  ),
};

export default async function BlogPost({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: blogPosts } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("id", params.id!)
    .limit(1);

  if (blogPosts && blogPosts[0]) {
    const blogPost = blogPosts[0];

    const { default: MDXBlogPostContent } = await evaluate(
      blogPost.markdown || "",
      // @ts-expect-error <?>
      runtime
    );

    let MDXBlogPostAIRevisionContent: typeof MDXBlogPostContent | undefined;

    if (blogPost.markdown_ai_revision) {
      MDXBlogPostAIRevisionContent = (
        await evaluate(
          blogPost.markdown_ai_revision,
          // @ts-expect-error <?>
          runtime
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
                {MDXBlogPostAIRevisionContent && (
                  <TabsTrigger value="ai">AI version</TabsTrigger>
                )}
              </TabsList>
            </CardHeader>
            <CardContent>
              <TabsContent value="original">
                <MDXBlogPostContent components={components} />
              </TabsContent>
              {MDXBlogPostAIRevisionContent && (
                <TabsContent value="ai">
                  <MDXBlogPostAIRevisionContent components={components} />
                </TabsContent>
              )}
            </CardContent>
            <CardFooter className="flex justify-end align-bottom gap-4">
              <Button variant={"secondary"}>
                <SaveIcon className="mr-2 h-4 w-4" /> Discard suggestions &
                Publish
              </Button>
              <Button
              // onClick={() =>
              //   approveBlogPostAiSuggestions(blogPost.id.toString())
              // }
              >
                <SaveIcon className="mr-2 h-4 w-4" /> Approve suggestions &
                Publish
              </Button>
            </CardFooter>
          </Card>
        </Tabs>
      </div>
    );
  } else {
    return notFound();
  }
}
