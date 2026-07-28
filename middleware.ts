import { withAuth } from 'next-auth/middleware';

export default withAuth({
  pages: { signIn: '/?auth=1' },
});

export const config = {
  matcher: ['/dashboard/:path*', '/api/jobs/:path*', '/api/upload'],
};
