'use client';
import { useContext, useState } from 'react';
import { signIn } from 'next-auth/react';
import OtpInput from './otpinput';
import LoadingSpinner from '@/app/(site)/components/LoadingSpinner';
import { AuthContext, AuthContextInterface } from '../components/AuthContext';
import { useRouter } from 'next/navigation';

type OtpProps = {
	callbackUrl: string | null;
};

const OTP = ({ callbackUrl }: OtpProps): JSX.Element => {
	const router = useRouter();
	const [otp, setOtp] = useState<string>('');
	const [hasStartedOTP, setHasStartedOTP] = useState<boolean>(false);
	const { error, credentials, setError } =
		useContext<AuthContextInterface>(AuthContext);

	const onChange = (value: string) => setOtp(value);

	return (
		<div>
			<h4 className='text-xs font-medium text-red-500'>{error}</h4>
			<OtpInput value={otp} valueLength={6} onChange={onChange} />

			<button
				onClick={async () => {
					setHasStartedOTP(true);
					try {
						const signInResult = await signIn('credentials', {
							...credentials,
							accessCode: otp,
							redirect: false,
						});
						if (!signInResult?.ok) {
							setOtp('');
							setHasStartedOTP(false);
							setError('You entered an invalid passcode.');
						} else {
							if (callbackUrl) router.push(callbackUrl);
							else router.push('/');
						}
					} catch (error) {
						setHasStartedOTP(false);
					}
				}}
				type='button'
				className={`w-full mt-6 text-xs px-4 py-3 rounded-full ${
					hasStartedOTP
						? 'bg-shark-50/20 hover:bg-shark-50/20 text-shark/50'
						: 'bg-jagged-ice hover:bg-jagged-ice-550 text-shark '
				}`}
				disabled={otp.trim().length < 6}
			>
				<div className='flex flex-row justify-center gap-2 items-center w-full'>
					<div className={`${hasStartedOTP ? 'visible' : 'hidden'}`}>
						<LoadingSpinner />
					</div>
					<span>Verify</span>
				</div>
			</button>
		</div>
	);
};

export default OTP;
