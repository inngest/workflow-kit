SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- Dumped from database version 15.6
-- Dumped by pg_dump version 15.7 (Ubuntu 15.7-1.pgdg20.04+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: key; Type: TABLE DATA; Schema: pgsodium; Owner: supabase_admin
--



--
-- Data for Name: blog_posts; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."blog_posts" ("id", "title", "subtitle", "status", "markdown", "markdown_ai_revision", "created_at") VALUES
	(1, 'Getting Started with React', 'Learn the basics of React and start building your first app.', 'published', '# Getting Started with React: A Comprehensive Guide

## Introduction

React has revolutionized the way we build user interfaces for web applications. Its component-based architecture and efficient rendering mechanism have made it a favorite among developers worldwide. This guide will walk you through the fundamentals of React, helping you get started on your journey to becoming a proficient React developer.

## What is React?

React is an open-source JavaScript library for building user interfaces. Developed and maintained by Facebook, React allows developers to create large web applications that can change data without reloading the page. Its main goal is to be fast, scalable, and simple.

Key features of React include:
- Virtual DOM for efficient updates
- Component-based architecture
- Declarative syntax
- Unidirectional data flow
- Strong community support and ecosystem

## Setting Up Your Development Environment

Before diving into React, you need to set up your development environment. Here''s what you''ll need:

1. **Node.js and npm**: React relies on Node.js and npm (Node Package Manager) for development. Download and install the latest LTS version from the official Node.js website.

2. **Code Editor**: While you can use any text editor, popular choices among React developers include Visual Studio Code, WebStorm, and Sublime Text.

3. **Browser**: Use a modern browser like Chrome or Firefox for testing your React applications.

4. **React Developer Tools**: Install the React Developer Tools extension for your browser to help with debugging and inspecting React components.

## Creating Your First React App

The easiest way to start a new React project is by using Create React App, a tool developed by Facebook to bootstrap React applications. To create your first React app, follow these steps:

1. Open your terminal and run the following command:

   ```
   npx create-react-app my-first-react-app
   ```

2. Once the installation is complete, navigate to the project folder:

   ```
   cd my-first-react-app
   ```

3. Start the development server:

   ```
   npm start
   ```

Your default browser should open automatically, displaying the default React app running on `http://localhost:3000`.

## Understanding JSX

JSX is a syntax extension for JavaScript that looks similar to XML or HTML. It allows you to write HTML-like code in your JavaScript files, making it easier to describe what your UI should look like.

Here''s a simple example of JSX:

```jsx
const element = <h1>Hello, React!</h1>;
```

JSX is not required for using React, but it makes your code more readable and easier to write. Behind the scenes, JSX is transformed into regular JavaScript function calls.

## Components: The Building Blocks of React

React applications are built using components. A component is a self-contained module that renders some output. Components can be as simple as a button, or as complex as an entire page.

There are two types of components in React:

1. **Function Components**: These are simpler and more modern. They are JavaScript functions that return JSX.

   ```jsx
   function Welcome(props) {
     return <h1>Hello, {props.name}</h1>;
   }
   ```

2. **Class Components**: These are ES6 classes that extend from `React.Component` and have a render method.

   ```jsx
   class Welcome extends React.Component {
     render() {
       return <h1>Hello, {this.props.name}</h1>;
     }
   }
   ```

## Props and State

React uses two types of data to control a component''s behavior and rendering: props and state.

**Props** (short for properties) are how components receive data from their parent. They are read-only and help make your components reusable.

```jsx
function Welcome(props) {
  return <h1>Hello, {props.name}</h1>;
}

// Usage
<Welcome name="Alice" />
```

**State** is data that can change over time. Unlike props, state is managed within the component. When state changes, React re-renders the component.

```jsx
import React, { useState } from ''react'';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
```

## Handling Events

React events are named using camelCase and passed as functions. Here''s an example of handling a click event:

```jsx
function handleClick() {
  alert(''Button clicked!'');
}

return <button onClick={handleClick}>Click me</button>;
```

## Conditional Rendering

In React, you can create distinct components that encapsulate behavior you need. Then, you can render only some of them, depending on the state of your application.

```jsx
function UserGreeting(props) {
  return <h1>Welcome back!</h1>;
}

function GuestGreeting(props) {
  return <h1>Please sign up.</h1>;
}

function Greeting(props) {
  const isLoggedIn = props.isLoggedIn;
  if (isLoggedIn) {
    return <UserGreeting />;
  }
  return <GuestGreeting />;
}
```

## Lists and Keys

When rendering multiple items in React, you''ll often use the `map()` function to transform arrays into lists of elements. Each list item needs a unique "key" prop to help React identify which items have changed, been added, or been removed.

```jsx
function NumberList(props) {
  const numbers = props.numbers;
  const listItems = numbers.map((number) =>
    <li key={number.toString()}>
      {number}
    </li>
  );
  return <ul>{listItems}</ul>;
}
```

## Forms in React

HTML form elements work a bit differently from other DOM elements in React because form elements naturally keep some internal state. To have React control the form inputs, we use a technique called "controlled components".

```jsx
function NameForm() {
  const [name, setName] = useState('''');

  const handleSubmit = (event) => {
    alert(''A name was submitted: '' + name);
    event.preventDefault();
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Name:
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <input type="submit" value="Submit" />
    </form>
  );
}
```

## Hooks: A Game Changer

Hooks are a relatively new addition to React that allow you to use state and other React features without writing a class. The most commonly used hooks are:

- `useState`: For adding state to function components
- `useEffect`: For performing side effects in function components
- `useContext`: For consuming context in function components
- `useReducer`: For managing more complex state logic
- `useCallback` and `useMemo`: For optimizing performance

Here''s an example using `useState` and `useEffect`:

```jsx
import React, { useState, useEffect } from ''react'';

function Example() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    document.title = `You clicked ${count} times`;
  });

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
```

## Routing in React

While React doesn''t come with built-in routing capabilities, there are popular libraries like React Router that provide this functionality. Here''s a basic example using React Router:

```jsx
import { BrowserRouter as Router, Route, Link } from "react-router-dom";

function App() {
  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/users">Users</Link></li>
          </ul>
        </nav>

        <Route path="/" exact component={Home} />
        <Route path="/about" component={About} />
        <Route path="/users" component={Users} />
      </div>
    </Router>
  );
}
```

## Best Practices and Common Pitfalls

As you start your React journey, keep these best practices in mind:

1. **Keep components small and focused**: Each component should ideally do one thing well.
2. **Use functional components and hooks**: They''re simpler and make it easier to reuse stateful logic.
3. **Avoid modifying state directly**: Always use `setState` or the state updating function returned by `useState`.
4. **Use the key prop when rendering lists**: This helps React identify which items have changed.
5. **Avoid using indexes as keys**: This can lead to issues with component identity.
6. **Use prop-types for type checking**: This helps catch bugs early.
7. **Use CSS-in-JS or CSS modules**: This helps avoid global CSS conflicts.

Common pitfalls to watch out for:

1. **Mutating state directly**: This can lead to unexpected behavior.
2. **Using `setState` in `render`**: This can cause infinite loops.
3. **Not understanding React''s lifecycle**: This can lead to memory leaks or unnecessary re-renders.
4. **Overusing state**: Not all data needs to be in state. Some can be derived from existing state or props.

## Conclusion

React has transformed the way we build user interfaces, offering a powerful and flexible approach to web development. This guide has covered the fundamental concepts you need to get started with React, from setting up your environment to understanding key concepts like components, props, state, and hooks.

As you continue your React journey, remember that practice is key. Build small projects, experiment with different features, and don''t be afraid to dive into the React documentation for more advanced topics. With time and experience, you''ll be building complex, efficient React applications in no time.

Happy coding, and welcome to the world of React!', NULL, '2024-09-14 15:40:48.760124+00'),
	(2, 'Advanced TypeScript Techniques', 'Dive deep into TypeScript and learn advanced concepts.', 'draft', '# Dive Deep Into TypeScript: Advanced Concepts

TypeScript is a powerful superset of JavaScript that adds static typing and other advanced features to the language. While the basics of TypeScript are fairly straightforward, the language has many advanced concepts that can help you write more robust, maintainable, and expressive code. In this article, we''ll dive deep into some of these advanced TypeScript techniques.

## 1. Intersection Types

Intersection types allow you to combine multiple types into one. This is useful when you want to create a new type that has all the properties of several other types. The syntax for intersection types uses the `&` operator. 

```typescript
type A = { a: string };
type B = { b: number };

type AandB = A & B;

let x: AandB = {
    a: "hello",
    b: 42
};
```

## 2. Union Types

Union types are the opposite of intersection types. They allow a value to be one of several types. The syntax for union types uses the `|` operator.

```typescript
type StringOrNumber = string | number;

let x: StringOrNumber = "hello";
x = 42; // also valid
```

## 3. Type Guards

Type guards are expressions that perform a runtime check to narrow down the type of a variable within a conditional block. There are several ways to define type guards in TypeScript.

### `typeof` Type Guard

```typescript
function printLength(x: string | number) {
  if (typeof x === "string") {
    console.log(x.length);
  } else {
    console.log(x.toFixed(2)); 
  }
}
```

### `instanceof` Type Guard

```typescript
class Cat {
  meow() {
    console.log("Meow!");
  }
}

class Dog {
  bark() {
    console.log("Woof!");
  }
}

function makeSound(animal: Cat | Dog) {
  if (animal instanceof Cat) {
    animal.meow();
  } else {
    animal.bark(); 
  }
}
```

### Custom Type Guards

```typescript
interface Square {
  kind: "square";
  size: number;
}

interface Rectangle {
  kind: "rectangle";
  width: number;
  height: number;
}

type Shape = Square | Rectangle;

function isSquare(shape: Shape): shape is Square {
  return shape.kind === "square";
}

function getArea(shape: Shape) {
  if (isSquare(shape)) {
    return shape.size * shape.size;
  } else {
    return shape.width * shape.height;
  }
}
```

## 4. Conditional Types

Conditional types allow types to be selected based on a condition that''s evaluated at compile time. They use the `extends` keyword to check if one type can be assigned to another.

```typescript
type NonNullable<T> = T extends null | undefined ? never : T;

type A = NonNullable<string | null>; // string
type B = NonNullable<null | undefined>; // never
```

## 5. Mapped Types

Mapped types allow you to create new types based on old ones by applying a transformation to each property. They use the `in` keyword to iterate over the keys of a type, and can optionally add a `readonly` or `?` modifier to the properties.

```typescript
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

type Partial<T> = {
  [P in keyof T]?: T[P];
};

type Person = {
  name: string;
  age: number;
};

type ReadonlyPerson = Readonly<Person>;
type PartialPerson = Partial<Person>;
```

## 6. Infer Keyword

The `infer` keyword is used in conditional types to infer a type from another type. This is often used with generic types to extract a type from a more complex type.

```typescript
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : any;

function getUser(id: number) {
  return {
    id,
    name: "John",
    email: "john@example.com",
  };
}

type User = ReturnType<typeof getUser>;
// {
//   id: number;
//   name: string; 
//   email: string;
// }
```

## 7. Template Literal Types

Template literal types allow you to create string literal types that can expand into many strings. They use the `${T}` syntax in type positions.

```typescript
type Vertical = "top" | "middle" | "bottom";
type Horizontal = "left" | "center" | "right";

type Alignment = `${Vertical}-${Horizontal}`;

let a: Alignment = "top-left"; // valid
let b: Alignment = "top-pot"; // invalid
```

These are just a few of the many advanced concepts in TypeScript. By mastering these techniques, you can write TypeScript code that is more expressive, safer, and easier to maintain. However, it''s important to not overuse these features, as they can also make your code harder to understand. Use them judiciously and in situations where they truly improve the clarity and robustness of your code.

TypeScript''s advanced types are a powerful tool in creating a more strongly typed codebase. They allow you to express complex relationships between types, create more flexible and reusable types, and catch potential errors at compile time. By leveraging these advanced concepts, you can take full advantage of TypeScript''s type system and create more reliable and maintainable JavaScript code.', NULL, '2024-09-04 15:41:20+00'),
	(3, 'The Future of Web Development', 'Explore upcoming trends and technologies in web development.
', 'published', '# The Future of Web Development

The world of web development is constantly evolving, with new technologies, frameworks, and paradigms emerging all the time. As we look towards the future, there are several key trends that are likely to shape the way we build web applications.

## Serverless Architecture

Serverless architecture is becoming increasingly popular, allowing developers to focus on writing code without worrying about managing servers. With serverless, the cloud provider dynamically manages the allocation of machine resources, charging only for the actual amount of resources consumed by an application. This can lead to significant cost savings and increased scalability.

## Progressive Web Apps (PWAs)

Progressive Web Apps are web applications that use modern web capabilities to deliver an app-like experience to users. PWAs are fast, reliable, and engaging, and they work on any device with a web browser. As mobile usage continues to grow, PWAs will become an increasingly important way to deliver mobile experiences without the need for a separate native app.

## Web Assembly

Web Assembly is a low-level bytecode format that can be run in web browsers at near-native speeds. This opens up the possibility of running high-performance applications, such as games and virtual machines, directly in the browser. As Web Assembly matures and gains wider adoption, it could significantly expand the capabilities of web applications.

## AI and Machine Learning

Artificial Intelligence and Machine Learning are starting to make their way into web development, enabling new types of applications and user experiences. From chatbots and recommendation engines to intelligent UI components, AI will play an increasingly important role in the future of web development.

## Continuous Integration and Deployment

As web applications become more complex, the need for robust Continuous Integration and Deployment (CI/CD) practices becomes more critical. Automating the process of testing, building, and deploying web applications can significantly improve the speed and reliability of development. Tools like Git, Jenkins, CircleCI, and Azure DevOps will become essential parts of the modern web application development process.

These are just a few of the trends that are likely to shape the future of web development. As the web continues to evolve, staying aware of these trends and in command of the latest technologies becomes key part of being a successful web developer. So, continuous learning is vital in future as a web developer.', NULL, '2024-08-27 15:44:25+00');


--
-- Data for Name: workflows; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."workflows" ("id", "created_at", "workflow", "enabled") VALUES
	(2, '2024-09-14 20:19:41.892865+00', '{"edges": [{"to": "1", "from": "$source"}, {"to": "2", "from": "1"}], "actions": [{"id": "1", "kind": "add_ToC"}, {"id": "2", "kind": "apply_changes"}]}', false),
	(3, '2024-09-14 20:19:50.146892+00', '{"edges": [{"to": "1", "from": "$source"}, {"to": "2", "from": "1"}], "actions": [{"id": "1", "kind": "add_ToC"}, {"id": "2", "kind": "apply_changes"}]}', false),
	(4, '2024-09-14 20:19:53.320413+00', '{"edges": [{"to": "1", "from": "$source"}, {"to": "2", "from": "1"}], "actions": [{"id": "1", "kind": "add_ToC"}, {"id": "2", "kind": "apply_changes"}]}', false),
	(1, '2024-09-14 15:46:53.822922+00', '{"edges": [{"to": "1", "from": "$source"}, {"to": "2", "from": "1"}], "actions": [{"id": "1", "kind": "grammar_review", "name": "Perform a grammar review", "description": "Perform a grammar review"}, {"id": "2", "kind": "wait_for_approval"}]}', false);


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: secrets; Type: TABLE DATA; Schema: vault; Owner: supabase_admin
--



--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 1, false);


--
-- Name: key_key_id_seq; Type: SEQUENCE SET; Schema: pgsodium; Owner: supabase_admin
--

SELECT pg_catalog.setval('"pgsodium"."key_key_id_seq"', 1, false);


--
-- Name: blog_posts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."blog_posts_id_seq"', 3, true);


--
-- Name: workflows_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."workflows_id_seq"', 4, true);


--
-- PostgreSQL database dump complete
--

RESET ALL;
