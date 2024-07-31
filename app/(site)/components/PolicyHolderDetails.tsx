import { GetPolicyRes, Policy, PolicyHolder, User } from '@/types/api';
import React, { useEffect, useState } from 'react';
import { find } from 'lodash';
import { format } from 'date-fns';

const getGenderLabel = (gender: string): string => {
	let rtnLabel: string = '';
	if (gender === 'F') rtnLabel = 'Female';
	else if (gender === 'M') rtnLabel = 'Male';
	return rtnLabel;
};

interface PolicyHolderDetailsProps {
	policy: GetPolicyRes | any;
	isLoading: boolean;
}

const PolicyHolderDetails = ({
	policy,
	isLoading,
}: PolicyHolderDetailsProps): JSX.Element => {
	const [user, setUser] = useState<User>();
	const [policyHolder, setPolicyHolder] = useState<PolicyHolder>();
	const [policyDetails, setPolicyDetails] = useState<Policy>();
	const dtMask: string = 'd-MMM-yyyy, HH:mm';

	useEffect(() => {
		if (policy) {
			const { policyHolder, policy: childPolicy, users } = policy;
			if (childPolicy) setPolicyDetails(childPolicy);
			if (policyHolder) {
				setPolicyHolder(policyHolder);
				const { forename, surname } = policyHolder;

				if (users && forename && surname) {
					const userObj: User = find(users, {
						forename: forename,
						surname: surname,
					});
					if (userObj) setUser(userObj);
				}
			}
		}
	}, [policy]);

	return (
		<div
			className={`bg-white rounded-2xl shadow-tile-shadow px-8 py-6 basis-11/12 min-w-[400px] ${
				isLoading && 'animate-pulse'
			}`}
		>
			{isLoading ? (
				<div className='bg-gray-200 w-32 h-8 animate-pulse rounded-sm' />
			) : (
				<>
					<h1 className='text-lg font-semibold mb-8'>
						Policyholder Details
					</h1>

					{policyDetails && (
						<div className='flex justify-between w-full mb-8'>
							<span className='text-xs text-shark'>Status</span>
							<span className='text-xs text-shark font-semibold'>
								{policyDetails.status}
							</span>
						</div>
					)}

					{policyHolder && (
						<>
							<div className='flex justify-between w-full mb-8'>
								<span className='text-xs text-shark'>
									Title
								</span>
								<span className='text-xs text-shark font-semibold'>
									{policyHolder.title}
								</span>
							</div>
							<div className='flex justify-between w-full mb-8'>
								<span className='text-xs text-shark'>
									Forename
								</span>
								<span className='text-xs text-shark font-semibold'>
									{policyHolder.forename}
								</span>
							</div>
							<div className='flex justify-between w-full mb-8'>
								<span className='text-xs text-shark'>
									Surname
								</span>
								<span className='text-xs text-shark font-semibold'>
									{policyHolder.surname}
								</span>
							</div>
							<div className='flex justify-between w-full mb-8'>
								<span className='text-xs text-shark'>
									Gender
								</span>
								<span className='text-xs text-shark font-semibold'>
									{getGenderLabel(policyHolder.gender)}
								</span>
							</div>
							<div className='flex justify-between w-full mb-8'>
								<span className='text-xs text-shark'>
									Date of Birth
								</span>
								<span className='text-xs text-shark font-semibold'>
									{policyHolder.dob}
								</span>
							</div>

							<div className='flex justify-between w-full mb-8'>
								<span className='text-xs text-shark'>
									Correspondence Address
								</span>
								<span className='text-xs text-shark font-semibold text-right'>
									{
										policyHolder.correspondenceAddress
											?.address1
									}
									{policyHolder.correspondenceAddress
										?.address2 && (
										<>
											<br />
											{
												policyHolder
													.correspondenceAddress
													.address2
											}
										</>
									)}
									{policyHolder.correspondenceAddress
										?.address3 && (
										<>
											<br />
											{
												policyHolder
													.correspondenceAddress
													.address3
											}
										</>
									)}
									{policyHolder.correspondenceAddress
										?.postcode && (
										<>
											<br />
											{
												policyHolder
													.correspondenceAddress
													.postcode
											}
										</>
									)}
								</span>
							</div>
							<div className='flex justify-between w-full mb-8'>
								<span className='text-xs text-shark'>
									Mobile Tel.
								</span>
								<span className='text-xs text-shark font-semibold'>
									{policyHolder.mobilePhone}
								</span>
							</div>
							<div className='flex justify-between w-full mb-8'>
								<span className='text-xs text-shark'>
									Home Tel.
								</span>
								<span className='text-xs text-shark font-semibold'>
									{policyHolder.homePhone}
								</span>
							</div>
							<div className='flex justify-between w-full mb-8'>
								<span className='text-xs text-shark'>
									Work Tel.
								</span>
								<span className='text-xs text-shark font-semibold'>
									{policyHolder.workPhone}
								</span>
							</div>
							<div className='flex justify-between w-full mb-8'>
								<span className='text-xs text-shark'>
									Occupation
								</span>
								<span className='text-xs text-shark font-semibold'>
									{policyHolder.occupation.jobTitle}
								</span>
							</div>
						</>
					)}

					{user && (
						<>
							<div className='flex justify-between w-full mb-8'>
								<span className='text-xs text-shark'>
									Email Address
								</span>
								<span className='text-xs text-shark font-semibold'>
									{user.email}
								</span>
							</div>
							<div className='flex justify-between w-full mb-8'>
								<span className='text-xs text-shark'>
									Activated Account
								</span>
								<span className='text-xs text-shark font-semibold'>
									{user.activatedDTM
										? format(
												new Date(user.activatedDTM),
												dtMask
										  )
										: 'Not Activated'}
								</span>
							</div>
						</>
					)}
				</>
			)}
		</div>
	);
};

export default PolicyHolderDetails;
