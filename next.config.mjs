/** @type {import('next').NextConfig} */
import { createCivicAuthPlugin } from "@civic/auth-web3/nextjs"

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

const withCivicAuth = createCivicAuthPlugin({
  clientId: process.env.CIVIC_CLIENT_ID,
});

export default withCivicAuth(nextConfig)
