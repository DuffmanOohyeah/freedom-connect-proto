import React, { ChangeEvent, useState } from 'react';

interface EmailBrokerProps {
	policyRef: string;
}

const EmailBroker = ({ policyRef }: EmailBrokerProps): JSX.Element => {
	const [subject, setSubject] = useState<string>(`Policy Ref: ${policyRef}`);
	const [body, setBody] = useState<string>('');
	const [toAddresses, setToAddresses] = useState<string[]>([
		'broker@email.com',
	]);
	const [addToAddress, setAddToAddress] = useState<string>('');
	const [toAddressError, setToAddressError] = useState<string | null>(null);

	const addAddressToAddresses = (): void => {
		const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
		const emailValid = regex.test(addToAddress);
		if (emailValid) {
			const newAddresses = [...toAddresses, addToAddress];
			setToAddresses(newAddresses);
			setAddToAddress('');
		} else setToAddressError('Email is not valid');
	};

	return (
		<div className='flex flex-col justify-between h-full'>
			<div className='flex flex-col gap-4'>
				<div>
					<h4 className='text-sm font-medium px-1'>To</h4>
					<input
						name='toAddress'
						type='text'
						className='mt-4 px-4 border-0 bg-shark-400 placeholder:text-white/50 placeholder:font-medium focus:ring-0 shadow-none'
						placeholder='Add additional recipients'
						autoComplete='new-password'
						value={addToAddress}
						onChange={(e: ChangeEvent<HTMLInputElement>) => {
							setToAddressError(null);
							setAddToAddress(e.target.value);
						}}
						onKeyDown={(e: any) => {
							if (e.code === 'Enter') addAddressToAddresses();
						}}
					/>
					{toAddressError && (
						<p className='text-red-700 text-xs my-2'>
							{toAddressError}
						</p>
					)}
					<div className='flex flex-row gap-2 mt-4'>
						{toAddresses.map((to, index) => {
							return (
								<span
									key={index}
									className='rounded-full text-xs bg-jagged-ice-800  px-4 py-2'
								>
									{to}
								</span>
							);
						})}
					</div>
				</div>
				<div>
					<h4 className='text-sm font-medium px-1'>Subject</h4>
					<input
						name='newuser-firstname'
						type='text'
						className='mt-4 px-4 border-0 bg-shark-400 placeholder:text-white/50 placeholder:font-medium focus:ring-0 shadow-none'
						placeholder='Enter...'
						autoComplete='new-password'
						value={subject}
						onChange={(e: ChangeEvent<HTMLInputElement>) =>
							setSubject(e.target.value)
						}
					/>
				</div>
				<div className='mt-6'>
					<h4 className='text-sm font-medium px-1'>Body</h4>
					<textarea
						name='body'
						className='mt-4 h-32 rounded px-4 border-0 bg-shark-400 placeholder:text-white/50 placeholder:font-medium focus:ring-0 shadow-none'
						placeholder='Enter body...'
						rows={3}
						value={body}
						onInput={(e: ChangeEvent<HTMLTextAreaElement>) =>
							setBody(e.target.value)
						}
					/>
				</div>
			</div>
			<button className='action-btn'>Send</button>
		</div>
	);
};

export default EmailBroker;
