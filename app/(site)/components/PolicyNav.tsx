'use client';
import { useContext } from 'react';
import {
	FireIcon,
	UserIcon,
	UsersIcon,
	TruckIcon,
	DocumentIcon,
	HandThumbUpIcon,
	PencilSquareIcon,
	WifiIcon,
	MapPinIcon,
	RocketLaunchIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useSelectedLayoutSegment } from 'next/navigation';
import { PolicyContext, PolicyContextInterface } from './PolicyContext';
import { SessionType } from '@/types/api';
import { useSession } from 'next-auth/react';
import LoadingSpinner from './LoadingSpinner';

const PolicyNav = ({ policyId }: { policyId: number }): JSX.Element => {
	const segments: string | null = useSelectedLayoutSegment();
	const policyCtx: PolicyContextInterface = useContext(PolicyContext);
	const { policy: policyObj, isLoading }: PolicyContextInterface = policyCtx;
	const { policyHolder, vehicle } = policyObj || {};
	const { data: session } = useSession();
	const userSession: SessionType | null = session;
	const isMaster: string =
		userSession?.user?.masterUser?.toString() || 'false';

	return (
		<div className='flex flex-col px-8 py-5 bg-jagged-ice w-60'>
			{isLoading ? (
				<LoadingSpinner />
			) : (
				<>
					{policyHolder && (
						<h1 className='mt-9 font-bold text-2xl'>
							{policyHolder.forename}
							<br />
							{policyHolder.surname}
						</h1>
					)}
					{vehicle && (
						<span className='mt-2 text-xs font-semibold'>
							{vehicle.vrm}
						</span>
					)}
				</>
			)}
			<div className='grow mt-8'>
				<div className='flex flex-col relative'>
					<Link
						href={`/policies/${policyId}/policyholderdetails`}
						className={`sub-menu-item ${
							segments === 'policyholderdetails' &&
							'bg-jagged-ice-550'
						}`}
					>
						<UserIcon className='h-[20px] w-[20px] flex-none' />
						<h2 className='whitespace-pre'>Policyholder</h2>
					</Link>

					<Link
						href={`/policies/${policyId}/users`}
						className={`sub-menu-item ${
							segments === 'users' && 'bg-jagged-ice-550'
						}`}
					>
						<UsersIcon className='h-[20px] w-[20px] flex-none' />
						<h2 className='whitespace-pre'>User Logins</h2>
					</Link>

					<Link
						href={`/policies/${policyId}/vehicledetails`}
						className={`sub-menu-item ${
							segments === 'vehicledetails' && 'bg-jagged-ice-550'
						}`}
					>
						<TruckIcon className='h-[20px] w-[20px] flex-none' />
						<h2 className='whitespace-pre'>Vehicle Details</h2>
					</Link>

					<Link
						href={`/policies/${policyId}/policydetails`}
						className={`sub-menu-item ${
							segments === 'policydetails' && 'bg-jagged-ice-550'
						}`}
					>
						<DocumentIcon className='h-[20px] w-[20px] flex-none' />
						<h2 className='whitespace-pre'>Policy Details</h2>
					</Link>

					<Link
						href={`/policies/${policyId}/devicedetails`}
						className={`sub-menu-item ${
							segments === 'devicedetails' && 'bg-jagged-ice-550'
						}`}
					>
						<WifiIcon className='h-[20px] w-[20px] flex-none' />
						<h2 className='whitespace-pre'>Device Details</h2>
					</Link>

					<Link
						href={`/policies/${policyId}/scores`}
						className={`sub-menu-item ${
							segments === 'scores' && 'bg-jagged-ice-550'
						}`}
					>
						<HandThumbUpIcon className='h-[20px] w-[20px] flex-none' />
						<h2 className='whitespace-pre'>Scores</h2>
					</Link>

					<Link
						href={`/policies/${policyId}/notes`}
						className={`sub-menu-item ${
							segments === 'notes' && 'bg-jagged-ice-550'
						}`}
					>
						<PencilSquareIcon className='h-[20px] w-[20px] flex-none' />
						<h2 className='whitespace-pre'>Notes</h2>
					</Link>

					<Link
						href={`/policies/${policyId}/crashreports`}
						className={`sub-menu-item ${
							segments?.includes('crashreports', 0) &&
							'bg-jagged-ice-550'
						}`}
					>
						<FireIcon className='h-[20px] w-[20px] flex-none' />
						<h2 className='whitespace-pre'>Crash Reports</h2>
					</Link>

					<Link
						href={`/policies/${policyId}/trips`}
						className={`sub-menu-item ${
							segments === 'trips' && 'bg-jagged-ice-550'
						}`}
					>
						<MapPinIcon className='h-[20px] w-[20px] flex-none' />
						<h2 className='whitespace-pre'>Trips</h2>
					</Link>

					{isMaster === 'true' && (
						<Link
							href={`/policies/${policyId}/telematicsReferrals`}
							className={`sub-menu-item ${
								segments === 'telematicsReferrals' &&
								'bg-jagged-ice-550'
							}`}
						>
							<RocketLaunchIcon className='h-[20px] w-[20px] flex-none' />
							<h2>Telematics Referrals</h2>
						</Link>
					)}
				</div>
			</div>
		</div>
	);
};

export default PolicyNav;
