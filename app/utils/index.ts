import { getSession, signOut } from 'next-auth/react';
import { SessionType } from '@/types/api';

const getToken = async (): Promise<string | undefined> => {
	const session: SessionType | null = await getSession();
	const token = session?.user?.token;
	const now = new Date();
	const expiryDate = new Date(
		session?.user?.exp ? session?.user?.exp * 1000 : ''
	);
	if (now >= expiryDate) console.error('Expired token');
	else return token;
};

const getApiHeaders = async (): Promise<Headers> => {
	const token = await getToken();
	const headers = new Headers({
		'Content-Type': 'application/json',
		'x-application-id': ApplicationId ?? '',
		Authorization: token || '',
	});
	return headers;
};

const BaseUrl: string | undefined = process.env.NEXT_PUBLIC_API_URL;
const ApplicationId: string | undefined = process.env.NEXT_PUBLIC_APP_ID;

const fullSignOut = async (): Promise<boolean> => {
	const response = await fetch(`${BaseUrl}/user/session`, {
		method: 'DELETE',
		headers: await getApiHeaders(),
	});
	const res = await response.json();
	if (!response.ok) console.error(res);
	else return true;
	signOut({ callbackUrl: '/login' });
	return true;
};

export { getToken, getApiHeaders, BaseUrl, ApplicationId, fullSignOut };
