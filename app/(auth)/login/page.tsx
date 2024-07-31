'use client';
import { useEffect, useState } from 'react';
import { ApplicationId, BaseUrl } from '@/app/utils';
import { Auth } from '@/types/api';
import { AuthContext } from '../components/AuthContext';
import Login from '../components/Login';
import OTP from '../components/OTP';
import { useSearchParams } from 'next/navigation';
import ForgotPassword from '../components/ForgotPassword';
import ForgotUsername from '../components/ForgotUsername';

enum Screen {
	Login = 'login',
	ForgotPassword = 'forgotPassword',
	ForgotUsername = 'forgotUsername',
}

const LoginPage = (): JSX.Element => {
	const searchParams = useSearchParams();
	const callbackUrl = searchParams.get('callbackUrl');
	const [credentials, setCredentials] = useState<Auth | null>(null);
	const [error, setError] = useState<string>('');
	const [hasStartedVerification, setHasStartedVerification] =
		useState<boolean>(false);
	const [showOTP, setShowOTP] = useState<boolean>(false);
	const [screen, setScreen] = useState<Screen>(Screen.Login);

	useEffect(() => {
		const reset = () => {
			if (error) {
				setHasStartedVerification(false);
				setShowOTP(false);
			}
		};
		reset();
	}, [error]);

	const startVerification = async ({ username, password }: Auth) => {
		setHasStartedVerification(true);
		setError('');

		const initialAuth = await fetch(`${BaseUrl}/user/session`, {
			method: 'POST',
			body: JSON.stringify({ username, password }),
			headers: {
				'Content-Type': 'application/json',
				'x-application-id': `${ApplicationId}`,
			},
		});

		const status: number = initialAuth.status;
		switch (status) {
			case 425:
				setCredentials({ username, password });
				setShowOTP(true);
				break;
			case 401:
				setError('Invalid username or password');
				setHasStartedVerification(false);
				break;
			case 423:
				setError('Account locked');
				setHasStartedVerification(false);
				break;
			default:
				setError('An error occured');
				setHasStartedVerification(false);
				break;
		}
	};

	return (
		<>
			{screen === Screen.Login && (
				<AuthContext.Provider
					value={{
						credentials: credentials,
						error: error,
						setCredentials: setCredentials,
						setError: setError,
					}}
				>
					<div className='flex flex-col px-16 h-full justify-between'>
						<div>
							<h1 className='font-semibold text-shark'>
								Welcome to the Freedom Connect Administration
								Portal{' '}
								{process.env.NEXT_PUBLIC_UAT_ENV === 'true' && (
									<span className='text-red-500'>(UAT)</span>
								)}
							</h1>
							<p className='text-shark-50 text-xs mt-6'>
								{showOTP
									? 'Please check your email for your access code and enter below.'
									: 'Please login with your username and password below.'}
							</p>
						</div>

						{showOTP ? (
							<OTP callbackUrl={callbackUrl} />
						) : (
							<Login
								hasStartedVerification={hasStartedVerification}
								startVerification={startVerification}
							/>
						)}

						<div className='flex flex-row gap-2 justify-center items-center'>
							<button
								onClick={() => setScreen(Screen.ForgotPassword)}
								className='text-xs text-shark-50 underline mt-2'
							>
								Forgot password?
							</button>
							<button
								onClick={() => setScreen(Screen.ForgotUsername)}
								className='text-xs text-shark-50 underline mt-2'
							>
								Forgot username?
							</button>
						</div>
					</div>
				</AuthContext.Provider>
			)}
			{screen === Screen.ForgotPassword && (
				<ForgotPassword
					cancelForgotPassword={() => setScreen(Screen.Login)}
				/>
			)}
			{screen === Screen.ForgotUsername && (
				<ForgotUsername
					cancelForgotUsername={() => setScreen(Screen.Login)}
				/>
			)}
		</>
	);
};

export default LoginPage;
