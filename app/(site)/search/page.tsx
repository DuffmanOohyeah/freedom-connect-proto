'use client';
import PolicySearch from '../components/search/PolicySearch';
import { useSearchParams } from 'next/navigation';
import PolicySearchResults from '../components/search/PolicySearchResults';

const Policies = (): JSX.Element => {
	const searchParams = useSearchParams();
	const policyNumber = searchParams.get('policyNumber');
	const forename = searchParams.get('forename');
	const surname = searchParams.get('surname');
	const phoneNumber = searchParams.get('phoneNumber');
	const postcode = searchParams.get('postcode');
	const vrn = searchParams.get('vrn');
	const email = searchParams.get('email');

	return (
		<div className='p-12'>
			<h1 className='text-2xl font-bold flex items-center'>Policies</h1>
			<PolicySearch />
			<PolicySearchResults
				policyNumber={policyNumber}
				forename={forename}
				surname={surname}
				phoneNumber={phoneNumber}
				postcode={postcode}
				vrn={vrn}
				email={email}
			/>
		</div>
	);
};

export default Policies;
