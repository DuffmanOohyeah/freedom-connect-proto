'use client';
import '../globals.css';
import Image from 'next/image';
import { useState, useEffect, ReactNode } from 'react';
import Logo from '../../public/fc_logo.png';
import Link from 'next/link';
import Provider from './provider';
import MainNav from './components/MainNav';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import BusinessUnitProvider from './components/providers/BusinessUnitProvider';
import RecentPolicies from './components/RecentPolicies';

const queryClient = new QueryClient();

const RootLayout = ({ children }: { children: ReactNode }): JSX.Element => {
	const [open, setOpen] = useState(true);

	useEffect(() => {
		const handleResize = () => {
			if (window.innerWidth < 1170 && open) setOpen(false);
			else if (window.innerWidth >= 1170 && !open) setOpen(true);
		};
		window.addEventListener('resize', handleResize);

		return () => {
			window.removeEventListener('resize', handleResize);
		};
	}, []);

	return (
		<QueryClientProvider client={queryClient}>
			<Provider>
				<BusinessUnitProvider>
					<div className='flex'>
						<RecentPolicies />
						<div
							className={` ${
								open ? 'w-60 px-5' : 'px-3 w-[75px]'
							} min-h-screen py-5 relative duration-500 bg-shark flex flex-col shadow-main-menu shadow-shark`}
						>
							<span
								className={`
									absolute cursor-pointer -right-[9px] top-[8rem] text-center w-5
									h-5 text-black leading-[20px] font-semibold bg-white border-shark
									shadow-main-menu shadow-shark-50 rounded-full duration-500
									${!open && 'rotate-180'}`}
								onClick={() => setOpen(!open)}
							>
								&lt;
							</span>
							<Link
								href='/'
								className='flex flex-col items-center gap-2 cursor-pointer'
							>
								<div className='h-[60px] w-[60px]'>
									<Image src={Logo} alt='Logo' />
								</div>
								<h1
									className={`text-white text-xl duration-500 ${
										!open && 'opacity-0 overflow-hidden'
									}`}
								>
									<span className='font-semibold ml-[10px] mr-1'>
										Freedom
									</span>
									<span className='font-thin mr-[10px]'>
										Connect
									</span>
								</h1>
							</Link>
							<MainNav open={open} />
						</div>
						<div className='flex-1 bg-aqua-haze'>{children}</div>
					</div>
				</BusinessUnitProvider>
			</Provider>
		</QueryClientProvider>
	);
};

export default RootLayout;
