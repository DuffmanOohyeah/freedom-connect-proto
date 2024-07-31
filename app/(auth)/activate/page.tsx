'use client';
import { useEffect, useState } from 'react';
import LoadingSpinner from '@/app/(site)/components/LoadingSpinner';
import { useSearchParams } from 'next/navigation';
import { HiFingerPrint, HiOutlineUserCircle } from 'react-icons/hi';
import { useMutation } from '@tanstack/react-query';
import { BaseUrl, getApiHeaders } from '@/app/utils';
import Link from 'next/link';

const Activate = (): JSX.Element => {
	const searchParams = useSearchParams();
	const [hasStartedActivation, setHasStartedActivation] =
		useState<boolean>(false);
	const email = searchParams.get('e');
	const uuid = searchParams.get('t');
	const [username, setUsername] = useState<string>('');
	const [password, setPassword] = useState<string>('');
	const [confirmPassword, setConfirmPassword] = useState<string>('');
	const [showPass, setShowPass] = useState<boolean>(false);
	const [passwordError, setPasswordError] = useState<null | string>(null);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [activated, setActivated] = useState<boolean>(false);
	const [btnEnabled, setBtnEnabled] = useState<boolean>(false);

	useEffect(() => {
		// password
		if (confirmPassword.length > 4) {
			if (password === confirmPassword) setPasswordError(null);
			else setPasswordError('Passwords do not match');
		} else setPasswordError(null);
	}, [password, confirmPassword]);

	useEffect(() => {
		if (passwordError) setBtnEnabled(false);
		else setBtnEnabled(true);
	}, [passwordError, btnEnabled]);

	const activate = useMutation(['activateAccount'], {
		mutationFn: async (): Promise<boolean> => {
			setPasswordError(null);
			setErrorMessage(null);
			const response = await fetch(`${BaseUrl}/user/activation`, {
				method: 'PUT',
				body: JSON.stringify({
					email: email,
					username: username,
					token: uuid,
					password: password,
				}),
				headers: await getApiHeaders(),
			});
			const body = await response.json();
			if (response.status === 200) setActivated(true);
			else {
				const errorMessage =
					body.errorMessage ?? 'Sorry an error occurred';
				setErrorMessage(errorMessage);
			}
			return true;
		},
	});

	return (
		<div className='flex flex-col px-16 h-full justify-between'>
			<div>
				<h1 className='font-semibold text-shark'>
					Welcome to the Freedom Connect Administration Portal
				</h1>
				<h2 className='text-shark-50 text-xs mt-4'>
					Please activate your account by setting a username and
					password.
				</h2>
				{/* <h4 className='text-xs font-medium text-red-500'>{error}</h4> */}
			</div>

			<div className='flex flex-col gap-5'>
				<div className='flex relative border rounded-full mt-6'>
					<input
						className='border-0 focus:ring-0 no-autofill'
						type='text'
						placeholder='Username'
						autoComplete='new-password'
						value={username}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
							setUsername(e.target.value)
						}
						disabled={hasStartedActivation}
					/>
					<span className='flex items-center px-4'>
						<HiOutlineUserCircle className='text-shark-50' />
					</span>
				</div>

				<div className='flex relative border rounded-full'>
					<input
						className='border-0 focus:ring-0 no-autofill'
						type={showPass ? 'text' : 'password'}
						placeholder='Password'
						autoComplete='new-password'
						value={password}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
							setPassword(e.target.value)
						}
						disabled={hasStartedActivation}
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

				<div className='flex relative border rounded-full'>
					<input
						className='border-0 focus:ring-0 no-autofill'
						type={showPass ? 'text' : 'password'}
						placeholder='Confirm Password'
						autoComplete='new-password'
						value={confirmPassword}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
							setConfirmPassword(e.target.value)
						}
						disabled={hasStartedActivation}
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

				{passwordError && (
					<p className='text-red-500 text-xs'>{passwordError}</p>
				)}

				{activated && (
					<>
						<p className='text-xs'>
							Account has been activated, you can now log into
							your account using the credential you just set.
						</p>
						<Link className='text-xs underline' href={'/login'}>
							Go to Login Page
						</Link>
					</>
				)}

				<button
					onClick={async () => {
						activate.mutate();
					}}
					type='button'
					className={`w-full text-xs px-4 py-3 disabled:bg-shark-50/20 rounded-full ${
						hasStartedActivation
							? 'bg-shark-50/20 hover:bg-shark-50/20 text-shark/50'
							: 'bg-jagged-ice hover:bg-jagged-ice-550 text-shark '
					}`}
					disabled={!btnEnabled || activate.isLoading}
				>
					<div className='flex flex-row justify-center gap-2 items-center w-full'>
						<div
							className={`${
								hasStartedActivation ? 'visible' : 'hidden'
							}`}
						>
							<LoadingSpinner />
						</div>
						<span>Activate My Account</span>
					</div>
				</button>

				{errorMessage && (
					<p className='text-red-500 text-xs'>{errorMessage}</p>
				)}
			</div>
		</div>
	);
};

export default Activate;
