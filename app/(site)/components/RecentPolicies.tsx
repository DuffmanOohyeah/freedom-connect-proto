import { getRecentPolicies } from '@/app/(site)/hooks/useLocalStorage';
import { PolicyProps } from '@/types/api/policyProps';
import Link from 'next/link';
import { useState } from 'react';
import {
	BarsArrowDownIcon,
	BarsArrowUpIcon,
} from '@heroicons/react/24/outline';
import { SessionType } from '@/types/api';
import { useSession } from 'next-auth/react';

const RecentPolicies = (): JSX.Element => {
	const policyArr: PolicyProps[] = getRecentPolicies();
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const { data: session } = useSession();
	const userSession: SessionType | null = session;
	const isMaster: string =
		userSession?.user?.masterUser?.toString() || 'false';

	return (
		<>
			{isMaster === 'true' && policyArr.length > 0 && (
				<div
					className={`flex flex-col absolute top-2 right-2 bg-jagged-ice-400
					text-xs rounded-lg duration-500 z-10 shadow-md ${isOpen && 'p-3'}`}
				>
					{isOpen && (
						<ul className='list-decimal pl-3'>
							{policyArr.map((row) => (
								<li>
									<Link
										href={`/policies/${row.opid}/policyholderdetails`}
										className={`hover:underline`}
										onClick={() => {
											setIsOpen(false);
										}}
									>
										{row.policyNo} (Ref: {row.policyRef})
									</Link>
								</li>
							))}
						</ul>
					)}

					<Link
						href={`#`}
						className={`font-medium flex justify-end space-x-2 p-2 rounded-lg action-btn ${
							isOpen && 'mt-2'
						}`}
						onClick={(evt) => {
							evt.preventDefault();
							setIsOpen(!isOpen);
						}}
					>
						{isOpen ? (
							<BarsArrowUpIcon className='h-[20px] w-[20px] flex-none' />
						) : (
							<BarsArrowDownIcon className='h-[20px] w-[20px] flex-none' />
						)}

						<h2>Recent Policies</h2>
					</Link>
				</div>
			)}
		</>
	);
};

export default RecentPolicies;
