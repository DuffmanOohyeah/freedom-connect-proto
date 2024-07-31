'use client';
import { Policy, PolicyHolder, RelatedPolicies, Score } from '@/types/api';
import { useContext, useEffect, useState } from 'react';
import {
	PolicyContext,
	PolicyContextInterface,
} from '@/app/(site)/components/PolicyContext';
import { format, parse } from 'date-fns';

const PolicyDetails = (): JSX.Element => {
	const [policyDetails, setPolicyDetails] = useState<Policy>();
	const [relatedPolicies, setRelatedPolicies] = useState<RelatedPolicies[]>(
		[]
	);
	const [policyHolder, setPolicyHolder] = useState<PolicyHolder>();
	const [score, setScore] = useState<Score>();
	const { policy } = useContext<PolicyContextInterface>(PolicyContext);

	useEffect(() => {
		if (policy) {
			const {
				policy: childPolicy,
				relatedPolicies,
				score,
				policyHolder,
			} = policy;

			if (childPolicy) setPolicyDetails(childPolicy);
			if (relatedPolicies && relatedPolicies.length)
				setRelatedPolicies(relatedPolicies);
			if (score) setScore(score);
			if (policyHolder) setPolicyHolder(policyHolder);
		}
	}, [policy]);

	return (
		<div className='px-4 p-7'>
			<div className='flex flex-col xl:flex-row gap-12 mt-16 whitespace-pre'>
				<div className='basis-1/2 flex flex-col gap-8'>
					{/* start: Policy Details */}
					{policyDetails && (
						<div className='bg-white rounded-2xl shadow-tile-shadow px-8 py-6 w-full'>
							<h1 className='text-lg font-semibold mb-10'>
								Policy Details
							</h1>
							<div className='flex gap-2 justify-between w-full mb-8'>
								<span className='text-xs text-shark'>
									Policy Number
								</span>
								<span className='text-xs text-shark font-semibold'>
									{policyDetails.policyNo}
								</span>
							</div>
							<div className='flex gap-2 justify-between w-full mb-8'>
								<span className='text-xs text-shark'>
									Underwriter
								</span>
								<span className='text-xs text-shark font-semibold'>
									{policyDetails.underwriter}
								</span>
							</div>
							<div className='flex gap-2 justify-between w-full mb-8'>
								<span className='text-xs text-shark'>
									Organisation
								</span>
								<span className='text-xs text-shark font-semibold'>
									{policyDetails.businessUnit}
								</span>
							</div>
							<div className='flex gap-2 justify-between w-full mb-8'>
								<span className='text-xs text-shark'>
									Purchase Date
								</span>
								<span className='text-xs text-shark font-semibold'>
									{policyDetails.purchased}
								</span>
							</div>
							<div className='flex gap-2 justify-between w-full mb-8'>
								<span className='text-xs text-shark'>
									Cancellation Sent Date
								</span>
								<span className='text-xs text-shark font-semibold'>
									{policyDetails.cancellationDate}
								</span>
							</div>
							<div className='flex gap-2 justify-between w-full mb-8'>
								<span className='text-xs text-shark'>OPID</span>
								<span className='text-xs text-shark font-semibold'>
									{policyDetails.opid}
								</span>
							</div>
							<div className='flex gap-2 justify-between w-full mb-8'>
								<span className='text-xs text-shark'>
									Policy Reference
								</span>
								<span className='text-xs text-shark font-semibold'>
									{policyDetails.policyRef}
								</span>
							</div>
							<div className='flex gap-2 justify-between w-full mb-8'>
								<span className='text-xs text-shark'>
									Policy Status
								</span>
								<span className='text-xs text-shark font-semibold'>
									{policyDetails.status}
								</span>
							</div>
							<div className='flex gap-2 justify-between w-full mb-8'>
								<span className='text-xs text-shark'>
									Risk Address
								</span>
								<span className='text-xs text-right text-shark font-semibold'>
									{policyDetails.riskAddress?.address1 && (
										<>
											{policyDetails.riskAddress.address1}
										</>
									)}
									{policyDetails.riskAddress?.address2 && (
										<>
											<br />
											{policyDetails.riskAddress.address2}
										</>
									)}
									{policyDetails.riskAddress?.address3 && (
										<>
											<br />
											{policyDetails.riskAddress.address3}
										</>
									)}
									{policyDetails.riskAddress?.postcode && (
										<>
											<br />
											{policyDetails.riskAddress.postcode}
										</>
									)}
								</span>
							</div>

							{/* <div className='flex gap-2 justify-between w-full mb-8'>
							<span className='text-xs text-shark'>Risk Ratio</span>
							<span className='text-xs text-shark font-semibold'>TODO</span>
							</div> */}

							{score && (
								<div className='flex gap-2 justify-between w-full mb-8'>
									<span className='text-xs text-shark'>
										Driving Days
									</span>
									<span className='text-xs text-shark font-semibold'>
										{score.uniqueDrivingDays || 0} days
									</span>
								</div>
							)}

							<div className='flex gap-2 justify-between w-full mb-8'>
								<span className='text-xs text-shark'>
									Years No Claims (NCD)
								</span>
								<span className='text-xs text-shark font-semibold'>
									{policyDetails.ncd} Years
								</span>
							</div>
							<div className='flex gap-2 justify-between w-full mb-8'>
								<span className='text-xs text-shark'>
									Declared Mileage
								</span>
								<span className='text-xs text-shark font-semibold'>
									{policyDetails.mileageDeclared} miles
								</span>
							</div>
							<div className='flex gap-2 justify-between w-full mb-8'>
								<span className='text-xs text-shark'>
									Current Mileage
								</span>
								<span className='text-xs text-shark font-semibold'>
									{policyDetails.mileageActual} miles
								</span>
							</div>
							<div className='flex gap-2 justify-between w-full mb-8'>
								<span className='text-xs text-shark'>
									Percentage Used
								</span>
								<span className='text-xs text-shark font-semibold'>
									{policyDetails.mileagePercentageUsed}%
								</span>
							</div>
						</div>
					)}
					{/* end: Policy Details */}
				</div>

				<div className='basis-1/2 flex flex-col gap-8'>
					{/* start: Policy Overview */}
					{policyDetails && (
						<div className='bg-white rounded-2xl shadow-tile-shadow px-8 py-6 w-full'>
							<h1 className='text-lg font-semibold mb-10'>
								Policy Overview
							</h1>
							<div className='flex gap-2 justify-between w-full mb-8'>
								<span className='text-xs text-shark'>
									Policy Number
								</span>
								<span className='text-xs text-shark font-semibold'>
									{policyDetails.policyNo}
								</span>
							</div>
							<div className='flex gap-2 justify-between w-full mb-8'>
								<span className='text-xs text-shark'>
									Policy Status
								</span>
								<span className='text-xs text-shark font-semibold'>
									{policyDetails.status}
								</span>
							</div>
							<div className='flex gap-2 justify-between w-full mb-8'>
								<span className='text-xs text-shark'>
									Inception Date
								</span>
								<span className='text-xs text-shark font-semibold'>
									{policyDetails.inceptionDate}
								</span>
							</div>
							<div className='flex gap-2 justify-between w-full mb-8'>
								<span className='text-xs text-shark'>
									Cancellation Date
								</span>
								<span className='text-xs text-shark font-semibold'>
									{policyDetails.cancellationDate}
								</span>
							</div>
							<div className='flex gap-2 justify-between w-full mb-8'>
								<span className='text-xs text-shark'>
									Class of Use
								</span>
								<span className='text-xs text-shark font-semibold'>
									{policyDetails.classOfUse}
								</span>
							</div>

							{policyHolder && (
								<div className='flex gap-2 justify-between w-full'>
									<span className='text-xs text-shark'>
										Occupation
									</span>
									<div className='text-xs text-shark font-semibold flex flex-col'>
										{policyHolder.occupation.jobTitle && (
											<>
												{
													policyHolder.occupation
														.jobTitle
												}
												<br />
											</>
										)}
										{policyHolder.occupation.industry && (
											<>
												{
													policyHolder.occupation
														.industry
												}
												<br />
											</>
										)}
										{policyHolder.occupation.hours && (
											<>
												{policyHolder.occupation.hours}
												<br />
											</>
										)}
										{policyHolder.occupation.status}
									</div>
								</div>
							)}
						</div>
					)}
					{/* end: Policy Overview */}

					{/* start: Related Policies */}
					<div className='bg-white rounded-2xl shadow-tile-shadow px-8 py-6 w-full'>
						<h1 className='text-lg font-semibold mb-10'>
							Related Policies
						</h1>

						{relatedPolicies?.length > 0 ? (
							<table className='table-auto text-left text-xs w-full'>
								<thead>
									<tr>
										<th className='py-3'>Policy Number</th>
										<th className='py-3'>Policy Ref</th>
										<th className='py-3'>
											Cancellation Date
										</th>
									</tr>
								</thead>
								<tbody>
									{relatedPolicies?.map((relatedPolicy) => {
										const {
											opid,
											policyNo,
											policyRef,
											cancelledDTM,
										} = relatedPolicy;

										return (
											<tr key={opid}>
												<td className='py-3'>
													{policyNo}
												</td>
												<td className='py-3'>
													{policyRef}
												</td>
												<td className='py-3'>
													{cancelledDTM &&
														format(
															parse(
																cancelledDTM.substring(
																	0,
																	10
																),
																'yyyy-MM-dd',
																new Date()
															),
															'PP'
														)}
												</td>
											</tr>
										);
									})}
								</tbody>
							</table>
						) : (
							<p className='text-xs'>No related policies</p>
						)}
					</div>
					{/* end: Related Policies */}
				</div>
			</div>
		</div>
	);
};

export default PolicyDetails;
