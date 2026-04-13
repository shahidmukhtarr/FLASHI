const nextConfig = {
  reactStrictMode: true,
  serverRuntimeConfig: {
    // Will only be available on the server side
  },
  publicRuntimeConfig: {
    // Will be available on both server and client
  },
  // Allow importing from server directory in API routes
  webpack: (config, { isServer }) => {
    return config;
  },
};

export default nextConfig;
