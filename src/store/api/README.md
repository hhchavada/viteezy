# 🚀 API Integration Guide - Simple & Easy

## 📖 What is This?

This folder contains all API configurations for the app. Think of it as a **central hub** that manages all communication with the backend server.

---

## 🏗️ File Structure

```
src/store/api/
├── baseApi.ts          ← Main API configuration (brain of the system)
├── authApi.ts          ← Login, Register, Logout endpoints
├── productApi.ts       ← Product list and details endpoints
├── types/              ← TypeScript types for API responses
└── README.md           ← You are here!
```

---

## 🧠 How It Works (Step by Step)

### 1️⃣ **baseApi.ts** - The Foundation

This file sets up the basic configuration that ALL API calls use:

```typescript
// What it does:
✅ Sets the API base URL (from .env file)
✅ Automatically adds auth token to every request
✅ Handles token expiration (auto-refresh)
✅ Manages caching to avoid unnecessary API calls
```

**Key Concept**: Instead of writing API configuration for each endpoint, we write it ONCE here. This is called **DRY (Don't Repeat Yourself)**.

---

### 2️⃣ **authApi.ts** - Authentication Endpoints

This file adds login/register/logout endpoints to `baseApi`:

```typescript
// Example: Login endpoint
login: builder.mutation<LoginResponse, LoginRequest>({
    query: (credentials) => ({
        url: '/auth/login',          // API endpoint
        method: 'POST',              // HTTP method
        body: {
            ...credentials,          // email & password
            deviceInfo: 'Web',       // Track that it's from web
        },
    }),
})
```

**What happens after successful login?**
1. API returns token + user data
2. Automatically saved to `localStorage`
3. Token added to all future API calls
4. You're logged in! 🎉

---

### 3️⃣ **productApi.ts** - Product Endpoints

Similar pattern for products:

```typescript
getProducts: builder.query<GetProductsResponse, void>({
    query: () => '/products',
})
```

Simple! Just specify the URL, and RTK Query handles the rest.

---

## 🎯 How to Use in Components

### Example 1: Login Component

```tsx
import { useLoginMutation } from '@/store';

function LoginForm() {
    // Get the login function and loading state
    const [login, { isLoading, error }] = useLoginMutation();

    const handleSubmit = async (email, password) => {
        try {
            const result = await login({ email, password }).unwrap();
            console.log('Logged in!', result);
            // Redirect to dashboard
        } catch (err) {
            console.error('Login failed:', err);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input type="email" />
            <input type="password" />
            <button disabled={isLoading}>
                {isLoading ? 'Logging in...' : 'Login'}
            </button>
        </form>
    );
}
```

---

### Example 2: Product List Component

```tsx
import { useGetProductsQuery } from '@/store';

function ProductList() {
    // Automatically fetches products when component mounts
    const { data, isLoading, error } = useGetProductsQuery();

    if (isLoading) return <p>Loading products...</p>;
    if (error) return <p>Error loading products!</p>;

    return (
        <div>
            {data?.products.map(product => (
                <div key={product.id}>{product.name}</div>
            ))}
        </div>
    );
}
```

**That's it!** No `useEffect`, no `fetch`, no manual state management. RTK Query does it all! 🎉

---

## 🔑 Key Concepts Explained

### What are "Hooks"?

Hooks are auto-generated functions you use in components:

| Hook | Type | When it runs | Use Case |
|------|------|-------------|----------|
| `useLoginMutation` | Mutation | Manual (when you call it) | Login, Register, Update |
| `useGetProductsQuery` | Query | Auto (on mount) | Fetch data immediately |
| `useLazyGetProductsQuery` | Lazy Query | Manual (when you call it) | Fetch data on button click |

---

### What are "Tags"?

Tags are used for **automatic data refresh**:

```typescript
// When you login, invalidate these tags
invalidatesTags: ['Auth', 'User']

// Any query with these tags will automatically refetch
providesTags: ['User']
```

**Example**: After logout, cart and user data automatically refresh.

---

## 🛠️ Adding New Endpoints

Want to add a new API? Follow this pattern:

### Step 1: Create the API file

```typescript
// src/store/api/cartApi.ts
import { baseApi } from './baseApi';

export const cartApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        
        getCart: builder.query({
            query: () => '/cart',
            providesTags: ['Cart'],
        }),
        
        addToCart: builder.mutation({
            query: (productId) => ({
                url: '/cart/add',
                method: 'POST',
                body: { productId },
            }),
            invalidatesTags: ['Cart'], // Refresh cart after adding
        }),
        
    }),
});

export const { useGetCartQuery, useAddToCartMutation } = cartApi;
```

### Step 2: Use in component

```tsx
import { useGetCartQuery, useAddToCartMutation } from '@/store';

function CartButton({ productId }) {
    const { data: cart } = useGetCartQuery();
    const [addToCart, { isLoading }] = useAddToCartMutation();

    return (
        <button onClick={() => addToCart(productId)} disabled={isLoading}>
            Add to Cart ({cart?.items.length || 0})
        </button>
    );
}
```

---

## 🎨 Benefits of This Setup

✅ **No code duplication** - Write API config once  
✅ **Auto token management** - Never manually add auth headers  
✅ **Auto caching** - Don't refetch data unnecessarily  
✅ **Auto loading states** - `isLoading`, `error`, `data` built-in  
✅ **Type safety** - TypeScript catches errors before runtime  
✅ **Auto refetch** - When token expires, auto refresh & retry  

---

## 🔧 Common Tasks

### How to logout?

```tsx
const [logout] = useLogoutMutation();

const handleLogout = async () => {
    await logout();
    // Token and user data automatically cleared
    // Redirected to login page
};
```

### How to get current user?

```tsx
const { data: user } = useGetCurrentUserQuery();
console.log(user?.name); // User's name
```

### How to manually refetch?

```tsx
const { data, refetch } = useGetProductsQuery();

<button onClick={refetch}>Refresh Products</button>
```

---

## 🐛 Troubleshooting

### "Cannot find module '@/store'"
**Fix**: Run `pnpm add @reduxjs/toolkit react-redux`

### CORS errors
**Fix**: Backend needs to whitelist `http://localhost:8080`

### Token not being sent
**Fix**: Check `localStorage.getItem('authToken')` in console

### 401 Unauthorized
**Fix**: Token expired or invalid. Try logging in again.

---

## 📚 Learn More

- [RTK Query Docs](https://redux-toolkit.js.org/rtk-query/overview)
- [Redux Toolkit Docs](https://redux-toolkit.js.org/)

---

Made with ❤️ using Redux Toolkit Query
