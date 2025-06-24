// src/lib/clear-session.ts
export function clearAuthCookies() {
    // Clear all auth-related cookies
    const cookiesToClear = [
      'next-auth.session-token',
      'next-auth.csrf-token',
      '__Secure-next-auth.session-token',
      '__Host-next-auth.csrf-token',
    ];
  
    cookiesToClear.forEach(cookieName => {
      // Clear for current domain
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      // Clear for current domain with secure flag
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; secure;`;
      // Clear for localhost
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=localhost;`;
    });
  
    // Redirect to login after clearing cookies
    window.location.href = '/login';
  }
  
  // Add this to your app layout or a button component:
  // <button onClick={clearAuthCookies}>Clear Session & Re-login</button>