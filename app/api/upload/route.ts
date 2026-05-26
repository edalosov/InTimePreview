import { NextRequest, NextResponse } from 'next/server';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { isAuthenticated } from '@/lib/auth';

export async function POST(request: NextRequest): Promise<Response> {
  const sessionToken = request.cookies.get('admin_session')?.value;
  const body = (await request.json()) as HandleUploadBody;

  // Token-generation requests come from the browser with our session cookie.
  // Upload-completed callbacks come from Vercel's servers without it.
  if (body.type === 'blob.generate-client-token' && !isAuthenticated(sessionToken)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: [
          'image/jpeg',
          'image/png',
          'image/webp',
          'image/gif',
          'image/avif',
          'image/tiff',
          'image/heic',
        ],
        maximumSizeInBytes: 50 * 1024 * 1024, // 50 MB
      }),
      onUploadCompleted: async () => {},
    });
    return Response.json(jsonResponse);
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 400 });
  }
}
