const configuredBase = import.meta.env.PUBLIC_API_BASE_URL?.replace(/\/$/, '') ?? '';

export const apiRoot = configuredBase
  ? configuredBase.endsWith('/api/v1') ? configuredBase : `${configuredBase}/api/v1`
  : '';

export const mediaUrl = (path: string, localFallback: string) =>
  apiRoot ? `${apiRoot}/media/${path.replace(/^\/+/, '')}` : localFallback;

export const apiUrl = (path: string) => apiRoot ? `${apiRoot}/${path.replace(/^\/+/, '')}` : '';
