import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
	screens: {
		'xs': '300px',
		'sm': '768px',
		'md': '991px',
		'lg': '1200px',
		'xl': '1500px'
	},
  	extend: {
		animation: {
			equilizer: 'equilizer 2s linear infinite'
		},
		keyframes: {
			equilizer: {
				'0%': {
					height: '20%',
				},
				'10%': {
					height: '10%',
				},
				'20%': {
					height: '30%',
				},
				'30%': {
					height: '50%',
				},
				'40%': {
					height: '20%',
				},
				'50%': {
					height: '10%',
				},
				'60%': {
					height: '80%',
				},
				'70%': {
					height: '30%',
				},
				'80%': {
					height: '60%',
				},
				'90%': {
					height: '80%',
				},
				'100%': {
					height: '100%',
				}
			}
		},
		fontFamily: {
			sans: ['var(--font-geist-sans)'],
			mono: ['var(--font-geist-mono)'],
		},
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: 
  	[
		require("tailwindcss-animate"),
		require('tailwind-scrollbar'),
	],
};
export default config;
