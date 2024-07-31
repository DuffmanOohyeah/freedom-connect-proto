export {default} from 'next-auth/middleware';

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|login|otp|activate|cloud_1.png|cloud_2.png).*)',
  ],
};
