/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        // Merchants can paste arbitrary image URLs (see the "Image URLs" field
        // on Create Product), and product photos are also served from
        // Cloudinary. Rather than hardcoding a domain allowlist that breaks
        // the moment a merchant pastes an image from somewhere new, allow any
        // HTTPS host through the optimizer.
        remotePatterns: [
            { protocol: "https", hostname: "**" },
        ],
    },
};

module.exports = nextConfig;
