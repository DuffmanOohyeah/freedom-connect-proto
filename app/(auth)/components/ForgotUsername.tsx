import LoadingSpinner from '@/app/(site)/components/LoadingSpinner';
import { BaseUrl, getApiHeaders } from '@/app/utils';
import { useState } from 'react';
import { HiOutlineUserCircle } from 'react-icons/hi';

enum Screen {
	Initial,
	Loading,
	Success,
}

const ForgotUsername = ({
	cancelForgotUsername,
}: {
	cancelForgotUsername: () => void;
}): JSX.Element => {
	const [email, setEmail] = useState<string>('');
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [screen, setScreen] = useState<Screen>(Screen.Initial);

	const requestForgotPassword = async (): Promise<boolean> => {
		setScreen(Screen.Loading);
		setErrorMessage(null);
		const response = await fetch(`${BaseUrl}/user/credentials/username`, {
			method: 'POST',
			headers: await getApiHeaders(),
			body: JSON.stringify({
				email: email,
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
			<h1 className='font-semibold text-shark'>Forgot Username</h1>

			{screen === Screen.Loading && (
				<div className='flex flex-col justify-center items-center'>
					<LoadingSpinner />
				</div>
			)}

			{screen === Screen.Initial && (
				<>
					<p className='text-shark-50 text-xs mt-6'>
						Please enter your email address below and you will be
						sent an email with username.
					</p>
					<div className='flex relative border rounded-full mt-12'>
						<input
							className='border-0 focus:ring-0 no-autofill'
							type='text'
							placeholder='Email'
							value={email}
							onChange={(
								e: React.ChangeEvent<HTMLInputElement>
							) => setEmail(e.target.value)}
						/>
						<span className='flex items-center px-4'>
							<HiOutlineUserCircle className='text-shark-50' />
						</span>
					</div>
					<button
						onClick={() => {
							requestForgotPassword();
						}}
						disabled={email.length === 0}
						type='button'
						className={`text-xs px-4 py-3 rounded-full ${
							email.length === 0
								? 'bg-shark-50/20 hover:bg-shark-50/20 text-shark/50'
								: 'bg-jagged-ice hover:bg-jagged-ice-550 text-shark'
						}`}
					>
						<div className='flex flex-row justify-center gap-2 items-center w-full'>
							<span>Send Forgot Username Email</span>
						</div>
					</button>
				</>
			)}

			{screen === Screen.Success && (
				<p className='text-xs font-semibold mt-6'>
					An email has been sent to your email address with your
					username.
				</p>
			)}

			{errorMessage && (
				<p className='text-red-500 text-xs'>{errorMessage}</p>
			)}

			<button
				onClick={() => cancelForgotUsername()}
				className='text-xs text-shark-50 underline mt-2'
			>
				Back to Login
			</button>
		</div>
	);
};

export default ForgotUsername;
