'use client';
import './globals.css';
import { Poppins } from '@next/font/google';

const poppins = Poppins({
	weight: ['100', '200', '400', '500', '600', '700'],
	subsets: ['latin'],
	display: 'swap',
});

const LoginLayout = ({
	children,
}: {
	children: React.ReactNode;
}): JSX.Element => {
	return (
		<html lang='en' className={poppins.className}>
			<head />
			<body>{children}</body>
		</html>
	);
};

export default LoginLayout;
