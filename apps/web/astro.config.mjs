import { defineConfig } from 'astro/config'; import react from '@astrojs/react';
const repo=process.env.GITHUB_REPOSITORY?.split('/')[1]; const custom=Boolean(process.env.PUBLIC_CUSTOM_DOMAIN);
export default defineConfig({output:'static',site:process.env.PUBLIC_SITE_URL??'http://localhost:4321',base:custom||!process.env.GITHUB_ACTIONS?'/':`/${repo}`,integrations:[react()],build:{format:'directory'}});
