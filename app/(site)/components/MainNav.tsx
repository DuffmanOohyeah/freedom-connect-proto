import Link from 'next/link';
import { SessionType } from '@/types/api';
import {
	ShieldCheckIcon,
	FireIcon,
	ChartBarSquareIcon,
	ArrowLeftEndOnRectangleIcon,
	UserGroupIcon,
	LockClosedIcon,
} from '@heroicons/react/24/outline';
import { useSelectedLayoutSegments, usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';

type MainNavProps = {
	open: boolean;
};

const MainNav = ({ open }: MainNavProps): JSX.Element => {
	const segments: string[] = useSelectedLayoutSegments();
	const pathname: string | null = usePathname();
	const { data: session } = useSession();
	const userSession: SessionType | null = session;

	return (
		<>
			<div className='mt-8 overflow-hidden'>
				<div className='flex flex-col relative'>
					{/* <Link
					href='/'
					className={`main-menu-item ${
						segments?.length === 0 && 'bg-shark-450'
					}`}
					>
					<HomeIcon className='h-[20px] w-[20px] flex-none' />
					<h2
						className={`whitespace-pre duration-500 ${
						open.toString() == 'false' && 'opacity-0 translate-x-28'
						}`}
					>
						Home
					</h2>
					</Link> */}
					<Link
						href='/'
						className={`main-menu-item ${
							segments.includes('policies') ||
							(segments?.length === 0 && 'bg-shark-450')
						}`}
					>
						<ShieldCheckIcon className='h-[20px] w-[20px] flex-none' />
						<h2
							className={`whitespace-pre duration-500 ${
								open.toString() == 'false' &&
								'opacity-0 translate-x-28'
							}`}
						>
							Policies
						</h2>
					</Link>
					{/* <div
					className={`main-menu-item ${
						segments.includes('tickets') && 'bg-shark-450'
					}`}
					>
					<TicketIcon className='h-[20px] w-[20px] flex-none' />
					<h2
						className={`whitespace-pre duration-500 ${
						open.toString() == 'false' && 'opacity-0 translate-x-28'
						}`}
					>
						Tickets
					</h2>
					</div> */}
					<Link
						href='/crashreports'
						className={`main-menu-item ${
							pathname === '/crashreports' && 'bg-shark-450'
						}`}
					>
						<FireIcon className='h-[20px] w-[20px] flex-none' />
						<h2
							className={`whitespace-pre duration-500 ${
								open.toString() == 'false' &&
								'opacity-0 translate-x-28'
							}`}
						>
							Crash Reporting
						</h2>
					</Link>
					{/*<span
						// href='/thefttracking'
						// className={`main-menu-item ${
						//   segments.includes('thefttracking') && 'bg-shark-450'
						// }`}
						className='main-menu-item hover:bg-shark cursor-not-allowed text-shark-450'
					>
						<ViewfinderCircleIcon className='h-[20px] w-[20px] flex-none' />
						<h2
							className={`whitespace-pre duration-500 ${
								open.toString() == 'false' && 'opacity-0 translate-x-28'
							}`}
						>
							Theft Tracking
						</h2>
						</span>*/}
					<Link
						href='/reporting'
						className={`main-menu-item ${
							segments.includes('reporting') && 'bg-shark-450'
						}`}
					>
						<ChartBarSquareIcon className='h-[20px] w-[20px] flex-none' />
						<h2
							className={`whitespace-pre duration-500 ${
								open.toString() == 'false' &&
								'opacity-0 translate-x-28'
							}`}
						>
							Reporting
						</h2>
					</Link>
				</div>
			</div>

			{userSession?.user?.masterUser && (
				<>
					<Link
						href='/dataSensitiveReports'
						className={`main-menu-item ${
							segments.includes('dataSensitiveReports') &&
							'bg-shark-450'
						}`}
					>
						<LockClosedIcon className='h-[20px] w-[20px] flex-none' />
						<h2
							className={`duration-500 ${
								open.toString() == 'false' &&
								'opacity-0 translate-x-28'
							}`}
						>
							Data Sensitive Reports
						</h2>
					</Link>
					<Link
						href='/usermanagement'
						className={`main-menu-item ${
							segments.includes('usermanagement') &&
							'bg-shark-450'
						}`}
					>
						<UserGroupIcon className='h-[20px] w-[20px] flex-none' />
						<h2
							className={`whitespace-pre duration-500 ${
								open.toString() == 'false' &&
								'opacity-0 translate-x-28'
							}`}
						>
							User Management
						</h2>
					</Link>
				</>
			)}

			<button
				onClick={() => signOut({ callbackUrl: '/login' })}
				className='main-menu-item'
			>
				<ArrowLeftEndOnRectangleIcon className='h-[20px] w-[20px] flex-none' />
				<h2
					className={`whitespace-pre duration-500 ${
						open.toString() == 'false' && 'opacity-0 translate-x-28'
					}`}
				>
					Logout
				</h2>
			</button>

			{userSession?.user?.surname && (
				<div
					className={`whitespace-pre duration-500 ${
						open.toString() == 'false'
							? 'opacity-0 translate-x-28'
							: 'pl-5 pt-10 text-xs flex flex-col text-teal-600'
					}`}
				>
					<div className='fixed bottom-0 flex flex-col pb-3'>
						<span className='pb-0.5'>Logged in as:</span>
						<span className='pl-3 pt-1'>{`${userSession?.user?.forename} ${userSession?.user?.surname}`}</span>
						<span className='pl-3 pt-1'>{`${userSession?.user?.unit}`}</span>
					</div>
				</div>
			)}
		</>
	);
};

export default MainNav;
