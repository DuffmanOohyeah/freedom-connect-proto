'use client';
import '../globals.css';
import styles from './Layout.module.css';
import Image from 'next/image';
import Logo from '../../public/fc_logo.png';
import CityScape from '../../public/backdrop.png';
import Road from '../../public/road.png';
import Car from '../../public/cartoon_car_grey.png';
import Wheel from '../../public/wheel_grey.png';
import Marker from '../../public/marker.png';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient: QueryClient = new QueryClient();

const LoginLayout = ({
	children,
}: {
	children: React.ReactNode;
}): JSX.Element => {
	return (
		<QueryClientProvider client={queryClient}>
			<div className='flex h-screen bg-aqua-haze'>
				<div className='m-auto bg-white rounded-md w-[800px] h-[500px] min-w-[800px] overflow-hidden grid grid-cols-2 shadow-xl'>
					<div className='bg-shark flex flex-col items-center overflow-hidden'>
						<div className='flex flex-col items-center justify-around gap-2'>
							<div className='h-[60px] w-[60px] mt-16'>
								<Image src={Logo} alt='Logo' />
							</div>

							<h1 className='text-white text-xl duration-500'>
								<span className='font-semibold ml-[10px] mr-1'>
									Freedom
								</span>
								<span className='font-thin mr-[10px]'>
									Connect
								</span>
							</h1>
						</div>

						<div className='grow'></div>

						<div className='relative'>
							<div className={styles.cloud_one}></div>
							<div className={styles.cloud_two}></div>
							<div
								className={`${styles.car} absolute h-[100px] w-[100px] bottom-[72px] right-[60px] z-[4]`}
							>
								<Image src={Car} alt='Car' />
								<div className='absolute h-[80px] w-[80px] bottom-[44px] right-0'>
									<Image src={Marker} alt='Marker' />
								</div>
								<div
									className={`${styles.wheel} absolute h-[19px] w-[19px] bottom-[22.5px] right-[68.3px]`}
								>
									<Image src={Wheel} alt='Front Wheel' />
								</div>
								<div
									className={`${styles.wheel} absolute h-[19px] w-[19px] bottom-[22.5px] right-[16px]`}
								>
									<Image src={Wheel} alt='Back Wheel' />
								</div>
							</div>
							<div className='absolute h-[100px] bottom-[258px]'>
								<Image src={CityScape} alt='City Scape' />
							</div>
							<div className='mb-16'>
								<Image
									src={Road}
									alt='Road'
									className='opacity-80'
								/>
							</div>
						</div>
					</div>

					<div className='right flex flex-col justify-between'>
						<div className='text-center py-20 flex-1'>
							{children}
						</div>
					</div>
				</div>
			</div>
		</QueryClientProvider>
	);
};

export default LoginLayout;
