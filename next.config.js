import classnamesMinifier from '@nimpl/classnames-minifier';
const withClassnamesMinifier = classnamesMinifier.default;
/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import('./src/env.js');

/** @type {import("next").NextConfig} */
const nextConfig = {
    webpack: (config) => {
		// camel-case style names from css modules
		config.module.rules
			.find(({oneOf}) => !!oneOf).oneOf
			.filter(({use}) => JSON.stringify(use)?.includes('css-loader'))
			.reduce((acc, {use}) => acc.concat(use), [])
			.forEach(({options}) => {
				if (options.modules) {
					options.modules.exportLocalsConvention = 'camelCase';
				}
			});

		return config;
	},
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'avatars.githubusercontent.com',
                port: '',
                pathname: '**',
            },
            {
                protocol: 'https',
                hostname: 'picsum.photos',
                port: '',
                pathname: '**',
            },
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
                port: '',
                pathname: '**',
            }
        ],
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
};

export default withClassnamesMinifier({
    reservedNames: ['_en', '_de'],
    disabled: process.env.NODE_ENV === 'development',
  })(nextConfig);
