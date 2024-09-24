/* eslint-disable @typescript-eslint/no-explicit-any */
export const mdxComponents: any = {
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
