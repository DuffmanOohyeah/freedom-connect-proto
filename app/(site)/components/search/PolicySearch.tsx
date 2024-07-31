'use client';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context';

const PolicySearch = (): JSX.Element => {
	const router: AppRouterInstance = useRouter();
	const searchParams = useSearchParams();
	const [policyNumber, setPolicyNumber] = useState<string>(
		searchParams.get('policyNumber') ?? ''
	);
	const [forename, setForename] = useState<string>(
		searchParams.get('forename') ?? ''
	);
	const [surname, setSurname] = useState<string>(
		searchParams.get('surname') ?? ''
	);
	const [phoneNumber, setPhoneNumber] = useState<string>(
		searchParams.get('phoneNumber') ?? ''
	);
	const [postcode, setPostcode] = useState<string>(
		searchParams.get('postcode') ?? ''
	);
	const [vrn, setVrn] = useState<string>(searchParams.get('vrn') ?? '');
	const [email, setEmail] = useState<string>('');
	const [newSearchParams, setNewSearchParams] = useState<string>('');
	const [errMsg, setErrMsg] = useState<string>('');

	useEffect(() => {
		const values = [
			{ key: 'policyNumber', value: policyNumber },
			{ key: 'forename', value: forename },
			{ key: 'surname', value: surname },
			{ key: 'phoneNumber', value: phoneNumber },
			{ key: 'postcode', value: postcode },
			{ key: 'vrn', value: vrn },
			{ key: 'email', value: email },
		];
		const newParams = values
			.filter((x) => x.value && x.value.length > 0)
			.map((x) => `${x.key}=${x.value}`)
			.join('&');

		setNewSearchParams(newParams);
	}, [policyNumber, forename, surname, phoneNumber, postcode, vrn, email]);

	const handleSubmit = (e: React.SyntheticEvent) => {
		e.preventDefault();
		setErrMsg(''); // reset to default
		let doRouterPush: boolean = true;
		let tmpErrMsg: string = '';

		if (policyNumber.trim().length > 0 && policyNumber.trim().length < 3) {
			tmpErrMsg += '\nPolicy number must be a minimum of 3 characters.';
			doRouterPush = false;
		}

		if (forename.trim().length === 1) {
			tmpErrMsg += '\nForename must be a minimum of 2 characters.';
			doRouterPush = false;
		}

		if (surname.trim().length === 1) {
			tmpErrMsg += '\nSurname must be a minimum of 2 characters.';
			doRouterPush = false;
		}

		if (phoneNumber.trim().length === 1) {
			tmpErrMsg += '\nPhone number must be a minimum of 2 characters.';
			doRouterPush = false;
		}

		if (postcode.trim().length === 1) {
			tmpErrMsg += '\nPostcode must be a minimum of 2 characters.';
			doRouterPush = false;
		}

		if (vrn.trim().length === 1) {
			tmpErrMsg += '\nVRN must be a minimum of 2 characters.';
			doRouterPush = false;
		}

		if (email.trim().length > 0 && email.trim().length < 6) {
			tmpErrMsg += '\nEmail must be a minimum of 6 characters.';
			doRouterPush = false;
		}

		if (tmpErrMsg.length) setErrMsg(tmpErrMsg);
		if (doRouterPush) router.push(`/search?${newSearchParams}`);
	};

	const inputClass: string =
		'px-4 mr-4 2xl:mr-14 border-0 bg-placeholder-bg placeholder:text-placeholder-text placeholder:font-medium focus:ring-0 shadow-none';

	return (
		<div className='flex flex-col bg-white rounded-2xl shadow-tile-shadow p-8 mt-16'>
			<h1 className='text-lg font-semibold whitespace-pre mb-8'>
				Policy Search
			</h1>
			<form
				className='justify-between grid grid-cols-3 2xl:grid-cols-7 gap-4'
				onSubmit={handleSubmit}
			>
				<input
					type='text'
					className={inputClass}
					placeholder='Policy Number'
					value={policyNumber}
					onChange={(e) => setPolicyNumber(e.target.value)}
				/>
				<input
					type='text'
					className={inputClass}
					placeholder='Forename'
					value={forename}
					onChange={(e) => setForename(e.target.value)}
				/>
				<input
					type='text'
					className={inputClass}
					placeholder='Surname'
					value={surname}
					onChange={(e) => setSurname(e.target.value)}
				/>
				<input
					type='text'
					className={inputClass}
					placeholder='Phone Number'
					value={phoneNumber}
					onChange={(e) => setPhoneNumber(e.target.value)}
				/>
				<input
					type='text'
					className={inputClass}
					placeholder='Postcode'
					value={postcode}
					onChange={(e) => setPostcode(e.target.value)}
				/>
				<input
					type='text'
					className={inputClass}
					placeholder='VRN'
					value={vrn}
					onChange={(e) => setVrn(e.target.value)}
				/>
				<input
					type='text'
					className={inputClass}
					placeholder='Email'
					value={email}
					onChange={(e) => setEmail(e.target.value)}
				/>
				<button
					type='submit'
					className='col-span-3 2xl:col-auto text-xs text-white font-medium bg-shark hover:bg-shark-450 shadow-tile-shadow px-4 py-2 rounded-full flex items-center justify-center cursor-pointer'
				>
					<MagnifyingGlassIcon className='h-[20px] mr-2' />
					<span>Search</span>
				</button>
			</form>
			{errMsg && (
				<span className='text-sm text-red-500 whitespace-pre-wrap'>
					{errMsg}
				</span>
			)}
		</div>
	);
};

export default PolicySearch;
