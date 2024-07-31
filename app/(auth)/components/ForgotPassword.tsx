import LoadingSpinner from '@/app/(site)/components/LoadingSpinner';
import { BaseUrl, getApiHeaders } from '@/app/utils';
import { useState } from 'react';
import { HiFingerPrint, HiOutlineUserCircle } from 'react-icons/hi';
import OtpInput from './otpinput';

enum Screen {
	Initial,
	Loading,
	Code,
	Success,
}

const ForgotUsername = ({
	cancelForgotPassword,
}: {
	cancelForgotPassword: () => void;
}): JSX.Element => {
	const [username, setUsername] = useState<string>('');
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [screen, setScreen] = useState<Screen>(Screen.Initial);
	const [code, setCode] = useState<string>('');
	const [newPassword, setNewPassword] = useState<string>('');
	const [showPass, setShowPass] = useState<boolean>(false);

	const requestForgotPassword = async (): Promise<boolean> => {
		setScreen(Screen.Loading);
		setErrorMessage(null);
		const response = await fetch(`${BaseUrl}/user/credentials`, {
			method: 'POST',
			headers: await getApiHeaders(),
			body: JSON.stringify({
				username: username,
			}),
		});
		const body = await response.json();
		if (response.status === 200) {
			setScreen(Screen.Code);
			return true;
		} else {
			const errorMessage = body.errorMessage ?? 'Sorry an error occurred';
			setScreen(Screen.Initial);
			setErrorMessage(errorMessage);
			return false;
		}
	};

	const sendNewPassword = async (): Promise<boolean> => {
		setScreen(Screen.Loading);
		setErrorMessage(null);
		const response = await fetch(`${BaseUrl}/user/credentials`, {
			method: 'PUT',
			headers: await getApiHeaders(),
			body: JSON.stringify({
				username: username,
				code: code,
				password: newPassword,
			}),
		});
		const body = await response.json();
		if (response.status === 200) {
			setScreen(Screen.Success);
			return true;
		} else {
			const errorMessage = body.errorMessage ?? 'Sorry an error occurred';
			setScreen(Screen.Initial);
			setErrorMessage(errorMessage);
			return false;
		}
	};

	return (
		<div className='flex flex-col px-16 h-full justify-between gap-5'>
			<h1 className='font-semibold text-shark'>Forgot Password</h1>

			{screen === Screen.Loading && (
				<div className='flex flex-col justify-center items-center'>
					<LoadingSpinner />
				</div>
			)}

			{screen === Screen.Initial && (
				<>
					<p className='text-shark-50 text-xs mt-6'>
						Please enter your username below and an email will be
						sent to your email address with a code.
					</p>
					<div className='flex relative border rounded-full mt-12'>
						<input
							className='border-0 focus:ring-0 no-autofill'
							type='text'
							placeholder='Username'
							value={username}
							onChange={(
								e: React.ChangeEvent<HTMLInputElement>
							) => setUsername(e.target.value)}
						/>
						<span className='flex items-center px-4'>
							<HiOutlineUserCircle className='text-shark-50' />
						</span>
					</div>
					<button
						onClick={() => {
							requestForgotPassword();
						}}
						disabled={username.length === 0}
						type='button'
						className={`text-xs px-4 py-3 rounded-full ${
							username.length === 0
								? 'bg-shark-50/20 hover:bg-shark-50/20 text-shark/50'
								: 'bg-jagged-ice hover:bg-jagged-ice-550 text-shark'
						}`}
					>
						<div className='flex flex-row justify-center gap-2 items-center w-full'>
							<span>Send Forgot Password Email</span>
						</div>
					</button>
				</>
			)}

			{screen === Screen.Code && (
				<>
					<p className='text-xs font-bold mt-6'>
						Please enter the code sent to your email and your new
						password.
					</p>
					<OtpInput value={code} valueLength={6} onChange={setCode} />
					<div className='flex relative border rounded-full'>
						<input
							className='border-0 focus:ring-0 no-autofill'
							type={showPass ? 'text' : 'password'}
							placeholder='New Password'
							value={newPassword}
							onChange={(
								e: React.ChangeEvent<HTMLInputElement>
							) => setNewPassword(e.target.value)}
						/>
						<span className='flex items-center px-4'>
							<HiFingerPrint
								className={`${
									showPass
										? 'text-jagged-ice-800'
										: 'text-shark-50'
								}  cursor-pointer`}
								onClick={(e: any) => setShowPass(!showPass)}
							/>
						</span>
					</div>
					<button
						onClick={() => {
							sendNewPassword();
						}}
						disabled={newPassword.length === 0 || code.length === 0}
						type='button'
						className={`text-xs px-4 py-3 rounded-full disabled:bg-shark-50/20 disabled:hover:bg-shark-50/20 disabled:text-shark/50 bg-jagged-ice hover:bg-jagged-ice-550 text-shark`}
					>
						<div className='flex flex-row justify-center gap-2 items-center w-full'>
							<span>Set new password</span>
						</div>
					</button>
				</>
			)}

			{screen === Screen.Success && (
				<>
					<p className='text-xs font-semibold mt-6'>
						Your password has been updated. Please log on using your
						new password.
					</p>
				</>
			)}

			{errorMessage && (
				<p className='text-red-500 text-xs'>{errorMessage}</p>
			)}

			<button
				onClick={() => cancelForgotPassword()}
				className='text-xs text-shark-50 underline mt-2'
			>
				Back to Login
			</button>
		</div>
	);
};

export default ForgotUsername;
