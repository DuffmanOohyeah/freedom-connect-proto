'use client';
import PolicySearch from './components/search/PolicySearch';

const Page = (): JSX.Element => (
	<div className='p-12'>
		<h1 className='text-2xl font-bold flex items-center'>Policies</h1>
		<PolicySearch />
	</div>
);

export default Page;
