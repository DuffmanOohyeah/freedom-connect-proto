import { ImSpinner } from 'react-icons/im';

const LoadingSpinner = (): JSX.Element => (
	<div className='w-full h-full flex flex-row justify-center items-center'>
		<ImSpinner className='animate-spin' />
	</div>
);

export default LoadingSpinner;
