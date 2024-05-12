/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config) => {
        config.module.rules.push({
            test: /\.riv$/,
            use: [
                {
                    loader: 'file-loader',
                    options: {
                        outputPath: 'static',
                    },
                },
            ],
        })

        return config
    }
};

export default nextConfig;
