'use client';
import PolicySearch from '../components/search/PolicySearch';

const Policies = (): JSX.Element => (
	<div className='p-12'>
		<h1 className='text-2xl font-bold flex items-center'>Policies</h1>
		<PolicySearch />
	</div>
);

export default Policies;
