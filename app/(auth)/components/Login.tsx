'use client';
import LoadingSpinner from '@/app/(site)/components/LoadingSpinner';
import { Auth } from '@/types/api';
import { useContext, useEffect, useState } from 'react';
import { HiFingerPrint, HiOutlineUserCircle } from 'react-icons/hi';
import { AuthContext, AuthContextInterface } from './AuthContext';
import { debounce } from 'debounce';

type LoginProps = {
	hasStartedVerification: boolean;
	startVerification: (credentials: Auth) => void;
};

const Login = ({
	hasStartedVerification,
	startVerification,
}: LoginProps): JSX.Element => {
	const [username, setUsername] = useState<string>('');
	const [password, setPassword] = useState<string>('');
	const [showPass, setShowPass] = useState<boolean>(false);
	const [loginDisabled, setLoginDisabled] = useState<boolean>(true);

	const clickLogin = async (): Promise<boolean> => {
		setLoginDisabled(true);
		if (loginDisabled === false) {
			startVerification({ username, password });
			return true;
		} else return false;
	};

	const debouncedClick = debounce(clickLogin, 300);

	const { error } = useContext<AuthContextInterface>(AuthContext);

	useEffect(() => {
		setLoginDisabled(!hasStartedVerification);
	}, [hasStartedVerification]);

	useEffect(() => {
		if (username && username.length > 0 && password && password.length > 0)
			setLoginDisabled(false);
	}, [username, password]);

	return (
		<div className='flex flex-col gap-5'>
			<h4 className='text-xs font-medium text-red-500'>{error}</h4>

			<div className='flex relative border rounded-full mt-12'>
				<input
					className='border-0 focus:ring-0 no-autofill'
					type='text'
					placeholder='Username'
					value={username}
					onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
						setUsername(e.target.value)
					}
					disabled={hasStartedVerification}
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
					value={password}
					onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
						setPassword(e.target.value)
					}
					disabled={hasStartedVerification}
				/>
				<span className='flex items-center px-4'>
					<HiFingerPrint
						className={`${
							showPass ? 'text-jagged-ice-800' : 'text-shark-50'
						}  cursor-pointer`}
						onClick={(e: any) => setShowPass(!showPass)}
					/>
				</span>
			</div>

			<button
				onClick={debouncedClick}
				disabled={loginDisabled}
				type='button'
				className={`text-xs px-4 py-3 rounded-full ${
					loginDisabled
						? 'bg-shark-50/20 hover:bg-shark-50/20 text-shark/50'
						: 'bg-jagged-ice hover:bg-jagged-ice-550 text-shark'
				}`}
			>
				<div className='flex flex-row justify-center gap-2 items-center w-full'>
					<div
						className={`${
							hasStartedVerification ? 'visible' : 'hidden'
						}`}
					>
						<LoadingSpinner />
					</div>
					<span>Login</span>
				</div>
			</button>
		</div>
	);
};

export default Login;
